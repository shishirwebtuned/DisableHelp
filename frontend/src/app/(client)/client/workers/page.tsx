'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/redux/store';
import { fetchWorkersWithProfile, fetchMyWorkers } from '@/redux/slices/usersSlice';
import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Users, Map as MapIcon, List as ListIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { checkInvitation, sendInvite } from "@/redux/slices/inviteSlice";
import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import WorkerCard from './WorkerCard';
import { getJobByClient } from "@/redux/slices/jobsSlice";

const WorkersMap = dynamic(() => import('./WorkersMap'), {
    ssr: false,
    loading: () => <div className="w-full h-[300px] md:h-[350px] lg:h-[400px] bg-muted animate-pulse rounded" />,
});

export default function ClientWorkersPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { items: workers, myWorkers, loading } = useSelector((state: RootState) => state.users);
    const { jobs, loading: jobsLoading } = useSelector((state: RootState) => state.jobs);

    const [view, setView] = useState<'map' | 'list'>('list');
    const [workerType, setWorkerType] = useState("all");
    const [myView, setMyView] = useState<'map' | 'list'>('list');
    const [myWorkerType, setMyWorkerType] = useState("all");
    const [workersWithCoords, setWorkersWithCoords] = useState<any[]>([]);
    const [clientCoords, setClientCoords] = useState<[number, number] | null>(null);
    const [focusedWorker, setFocusedWorker] = useState<any>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [inviteDialog, setInviteDialog] = useState(false);
    const [selectedWorker, setSelectedWorker] = useState<any>(null);
    const [selectedJob, setSelectedJob] = useState("");
    const [invitedJobIds, setInvitedJobIds] = useState<string[]>([]);

    const searchParams = useSearchParams();
    const focusWorkerParam = searchParams.get('focusWorker');
    const router = useRouter();

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => setClientCoords([pos.coords.latitude, pos.coords.longitude]),
            () => setClientCoords(null)
        );
    }, []);

    useEffect(() => { dispatch(fetchWorkersWithProfile({ page: 1, limit: 20 })); }, [dispatch]);
    useEffect(() => { dispatch(fetchMyWorkers({ page: 1, limit: 20 })); }, [dispatch]);
    useEffect(() => { dispatch(getJobByClient({})); }, [dispatch]);

    useEffect(() => {
        const fetchCoords = async () => {
            const updatedWorkers = await Promise.all(
                workers.map(async (worker) => {
                    if (!worker.address) return worker;
                    const fullAddress = `${worker.address.line1}, ${worker.address.suburb || ''}, ${worker.address.state} ${worker.address.postalCode}, Australia`;
                    const normalizedAddress = fullAddress.replace(/\s+/g, ' ').trim();
                    try {
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}location/geocode?address=${encodeURIComponent(normalizedAddress)}`);
                        const coords = await res.json();
                        return {
                            ...worker,
                            coords: coords?.lat && coords?.lon ? [Number(coords.lat), Number(coords.lon)] : undefined,
                        };
                    } catch (err) {
                        console.error("Failed to fetch coords for", worker.firstName, err);
                        return worker;
                    }
                })
            );
            setWorkersWithCoords(updatedWorkers);
        };
        if (workers.length > 0) fetchCoords();
    }, [workers]);

    useEffect(() => {
        if (!focusedWorker) return;
        const geocoded = workersWithCoords.find(w => w._id === focusedWorker._id);
        if (geocoded?.coords && !focusedWorker.coords) setFocusedWorker(geocoded);
    }, [workersWithCoords]);

    useEffect(() => {
        if (!focusWorkerParam || workersWithCoords.length === 0) return;
        const target = workersWithCoords.find(w => w._id === focusWorkerParam);
        if (target?.coords) {
            setFocusedWorker(target);
            myWorkers.some(w => w._id === target._id) ? setMyView('map') : setView('map');
            router.replace(window.location.pathname, { scroll: false });
        }
    }, [focusWorkerParam, workersWithCoords]);

    useEffect(() => {
        const checkScreen = () => setIsMobile(window.innerWidth < 900);
        checkScreen();
        window.addEventListener("resize", checkScreen);
        return () => window.removeEventListener("resize", checkScreen);
    }, []);

    const filteredWorkers = workers.filter(w =>
        workerType === "all" ? true : workerType === "ndis" ? w.isNdisProvider : !w.isNdisProvider
    );
    const filteredWorkersWithCoords = workersWithCoords.filter(w =>
        workerType === "all" ? true : workerType === "ndis" ? w.isNdisProvider : !w.isNdisProvider
    );
    const filteredMyWorkers = myWorkers.filter(w =>
        myWorkerType === "all" ? true : myWorkerType === "ndis" ? w.isNdisProvider : !w.isNdisProvider
    );
    const filteredMyWorkersWithCoords = workersWithCoords.filter(w => {
        if (!myWorkers.find(mw => mw._id === w._id)) return false;
        return myWorkerType === "all" ? true : myWorkerType === "ndis" ? w.isNdisProvider : !w.isNdisProvider;
    });

    const handleInviteClick = async (worker: any) => {
        setSelectedWorker(worker);
        setInviteDialog(true);
        try {
            const result = await Promise.all(
                jobs.map(async (job: any) => {
                    const res = await dispatch(checkInvitation({ jobId: job._id, receiverId: worker._id })).unwrap();
                    return res ? job._id : null;
                })
            );
            setInvitedJobIds(result.filter(Boolean) as string[]);
        } catch {
            setInvitedJobIds([]);
        }
    };

    const MapCard = ({ focusedWorker, onClear, workers, mapView, setMapView }: any) => (
        <Card>
            <CardContent className="p-0">
                {focusedWorker && (
                    <div className="px-3 py-2 border-b flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                            Showing: <span className="font-medium text-foreground">{focusedWorker.firstName} {focusedWorker.lastName}</span>
                        </span>
                        <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={onClear}>
                            Show All
                        </Button>
                    </div>
                )}
                <WorkersMap
                    focusedWorker={focusedWorker}
                    filteredWorkersWithCoords={workers}
                    clientCoords={clientCoords}
                    isMobile={isMobile}
                />
            </CardContent>
        </Card>
    );

    return (
        <>
            <div className="space-y-5">
                <div>
                    <h1 className="md:text-lg text-base lg:text-xl font-bold tracking-tight">Support Workers</h1>
                    <p className="text-muted-foreground lg:text-base md:text-sm text-xs">View all the support workers.</p>
                </div>

                <Tabs defaultValue="find" onValueChange={() => setFocusedWorker(null)}>
                    <TabsList>
                        <TabsTrigger value="find">Find Workers</TabsTrigger>
                        <TabsTrigger value="past">My Workers ({myWorkers.length})</TabsTrigger>
                    </TabsList>

                    {/* ─── FIND WORKERS TAB ─── */}
                    <TabsContent value="find">
                        <div className="space-y-3">
                            <div className="flex justify-end items-center">
                                <div className="flex flex-wrap gap-4 md:gap-8 items-center">
                                    <Select value={workerType} onValueChange={(val) => { setWorkerType(val); setFocusedWorker(null); }}>
                                        <SelectTrigger className="md:w-[150px] w-[115px] lg:w-[180px] h-8 text-xs">
                                            <SelectValue placeholder="Filter workers" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Workers</SelectItem>
                                            <SelectItem value="ndis">NDIS Providers</SelectItem>
                                            <SelectItem value="individual">Individual Workers</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <div className="flex gap-2">
                                        <Button variant={view === "list" ? "default" : "outline"} onClick={() => { setView('list'); setFocusedWorker(null); }} size="sm">
                                            <ListIcon className="h-4 w-4 mr-1" /> List
                                        </Button>
                                        <Button variant={view === "map" ? "default" : "outline"} onClick={() => { setView('map'); setFocusedWorker(null); }} size="sm">
                                            <MapIcon className="h-4 w-4 mr-1" /> Map
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {view === "map" && (
                                <MapCard
                                    focusedWorker={focusedWorker}
                                    onClear={() => setFocusedWorker(null)}
                                    workers={filteredWorkersWithCoords}
                                />
                            )}

                            {view === "list" && (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {loading && <div>Loading workers...</div>}
                                    {!loading && workers.length === 0 && <div className="text-muted-foreground">No workers found</div>}
                                    {filteredWorkers.map(worker => (
                                        <WorkerCard
                                            key={worker._id}
                                            worker={worker}
                                            clientCoords={clientCoords}
                                            workerCoords={workersWithCoords.find(w => w._id === worker._id)}
                                            onViewMap={(w) => {
                                                const geocoded = workersWithCoords.find(wc => wc._id === w._id);
                                                setFocusedWorker(geocoded?.coords ? geocoded : w);
                                                setView("map");
                                            }}
                                            onInvite={handleInviteClick}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* ─── MY WORKERS TAB ─── */}
                    <TabsContent value="past">
                        {myWorkers.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Users className="h-10 w-10 mx-auto mb-3" />
                                No workers yet
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex justify-end items-center">
                                    <div className="flex flex-wrap gap-4 md:gap-8 items-center">
                                        <Select value={myWorkerType} onValueChange={(val) => { setMyWorkerType(val); setFocusedWorker(null); }}>
                                            <SelectTrigger className="md:w-[150px] w-[115px] lg:w-[180px] h-8 text-xs">
                                                <SelectValue placeholder="Filter workers" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Workers</SelectItem>
                                                <SelectItem value="ndis">NDIS Providers</SelectItem>
                                                <SelectItem value="individual">Individual Workers</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <div className="flex gap-2">
                                            <Button variant={myView === "list" ? "default" : "outline"} onClick={() => { setMyView('list'); setFocusedWorker(null); }} size="sm">
                                                <ListIcon className="h-4 w-4 mr-1" /> List
                                            </Button>
                                            <Button variant={myView === "map" ? "default" : "outline"} onClick={() => { setMyView('map'); setFocusedWorker(null); }} size="sm">
                                                <MapIcon className="h-4 w-4 mr-1" /> Map
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {myView === "map" && (
                                    <MapCard
                                        focusedWorker={focusedWorker}
                                        onClear={() => setFocusedWorker(null)}
                                        workers={filteredMyWorkersWithCoords}
                                    />
                                )}

                                {myView === "list" && (
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {filteredMyWorkers.map(worker => (
                                            <WorkerCard
                                                key={worker._id}
                                                worker={worker}
                                                clientCoords={clientCoords}
                                                workerCoords={workersWithCoords.find(w => w._id === worker._id)}
                                                onViewMap={(w) => {
                                                    const geocoded = workersWithCoords.find(wc => wc._id === w._id);
                                                    setFocusedWorker(geocoded?.coords ? geocoded : w);
                                                    setMyView("map");
                                                }}
                                                onInvite={handleInviteClick}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            <Dialog open={inviteDialog} onOpenChange={setInviteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invite Worker to Apply</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            Select a job to invite <b>{selectedWorker?.firstName} {selectedWorker?.lastName}</b>
                        </p>
                        {jobsLoading ? (
                            <p className="text-center text-sm text-muted-foreground">Loading jobs...</p>
                        ) : jobs?.filter((job: any) => !invitedJobIds.includes(job._id)).length > 0 ? (
                            <Select value={selectedJob} onValueChange={setSelectedJob}>
                                <SelectTrigger className="w-full text-sm">
                                    <SelectValue placeholder="Select job" />
                                </SelectTrigger>
                                <SelectContent>
                                    {jobs?.filter((job: any) => !invitedJobIds.includes(job._id)).map((job: any) => (
                                        <SelectItem key={job._id} value={job._id} className="flex flex-col items-start gap-0.5 py-2">
                                            <span className="font-medium text-sm">{job.title}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(job.startDate).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <p className="text-center text-sm lg:text-base font-medium pt-2 mb-2 text-red-500">
                                No jobs left to invite this worker.
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setInviteDialog(false)} className="cursor-pointer">Cancel</Button>
                        <Button
                            disabled={!selectedJob || jobs?.filter((job: any) => !invitedJobIds.includes(job._id)).length === 0}
                            onClick={() => {
                                dispatch(sendInvite({ jobId: selectedJob, receiverId: selectedWorker._id }));
                                setInviteDialog(false);
                                setSelectedJob("");
                            }}
                            className="bg-[#96CCE1] hover:bg-[#96CCE1]/80 cursor-pointer"
                        >
                            Send Invite
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}