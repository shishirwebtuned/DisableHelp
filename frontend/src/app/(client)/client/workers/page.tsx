'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/redux/store';
import { fetchWorkersWithProfile, fetchMyWorkers } from '@/redux/slices/usersSlice';

import dynamic from 'next/dynamic';

import {
    Card,
    CardContent,
} from '@/components/ui/card';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
    Avatar,
    AvatarFallback,
    AvatarImage
} from '@/components/ui/avatar';
import { Users, Map as MapIcon, List as ListIcon, BadgeCheck } from 'lucide-react';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";

import { checkInvitation, sendInvite } from "@/redux/slices/inviteSlice";

const MarkerClusterGroup = dynamic(
    () => import('react-leaflet-markercluster').then(mod => mod.default ?? mod),
    { ssr: false }
) as React.ComponentType<{
    children?: React.ReactNode;
    iconCreateFunction?: (cluster: any) => L.DivIcon;
}>;

import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import WorkerCard from './WorkerCard';
import { CircleWithPopup } from './CircleWithPopup';
import { getJobByClient } from "@/redux/slices/jobsSlice";

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km: number): string {
    if (km < 1) return `${Math.round(km * 1000)}m away`;
    if (km < 10) return `${km.toFixed(1)}km away`;
    return `${Math.round(km)}km away`;
}

function FitBounds({ markers }: { markers: [number, number][] }) {
    const map = useMap();

    useEffect(() => {
        if (!markers || markers.length === 0) return;
        const bounds = L.latLngBounds(markers);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
    }, [markers.length]);

    return null;
}

function ZoomLimiter({ active }: { active: boolean }) {
    const map = useMap();
    useEffect(() => {
        if (active) {
            map.setMinZoom(12);
            map.setMaxZoom(14);
        } else {
            map.setMinZoom(2);
            map.setMaxZoom(18);
        }
    }, [active, map]);
    return null;
}

const createCustomClusterIcon = (cluster: any) => {
    const count = cluster.getChildCount();
    const size =
        count < 10 ? "small" :
            count < 50 ? "medium" : "large";

    const html = `
        <div class="custom-marker-cluster ${size}">
            ${count}
        </div>
    `;

    return L.divIcon({
        html,
        className: '',
        iconSize: L.point(40, 40, true),
    });
};

function FocusWorker({ worker }: { worker: any }) {
    const map = useMap();

    useEffect(() => {
        if (worker?.coords) {
            map.flyTo(worker.coords as [number, number], 14, { duration: 1.2 });
        }
    }, [worker]);

    return null;
}

const MapLegend = () => (
    <div className="absolute top-3 right-3 z-[1000] bg-white border rounded-lg shadow-md px-2 md:px-3 py-1.5 md:py-2 md:text-[11px] text-[10px] lg:text-xs">
        <div className="font-semibold mb-1">Worker Type</div>
        <div className="flex items-center gap-2 mb-0.5 md:mb-1">
            <img src="/marker-icon-2xa.png" className="h-5 md:h-6 lg:h-7 w-auto" />
            <span>Individual Worker</span>
        </div>
        <div className="flex items-center gap-2">
            <img src="/marker-icon-2xb.png" className="h-5 md:h-6 lg:h-7 w-auto" />
            <span>NDIS Provider</span>
        </div>
    </div>
);

export const WorkerPopup = ({
    worker,
    clientCoords,
}: {
    worker: any;
    clientCoords: [number, number] | null;
}) => (
    <div className="flex flex-row items-center gap-2 md:gap-3">
        <Avatar className="h-8 w-8 md:h-9 md:w-9 lg:h-10 lg:w-10">
            <AvatarImage src={worker.avatar} />
            <AvatarFallback>{worker.firstName?.[0]}{worker.lastName?.[0]}</AvatarFallback>
        </Avatar>
        <div>
            <strong className="flex flex-row mb-0.5 items-center">
                {worker.firstName} {worker.lastName}
                {worker.approved ? <BadgeCheck className="md:h-3 md:w-3 h-2.5 w-2.5 lg:h-4 lg:w-4 text-green-500 ml-1" /> : ""}
            </strong>
            <span className="text-[10px] md:text-[11px] lg:text-xs text-gray-500">
                {worker.address?.state}, {worker.address?.postalCode}
            </span>
            {clientCoords && worker.coords && (
                <div className="text-[10px] md:text-[11px] lg:text-xs text-blue-500 mt-0.5">
                    {formatDistance(getDistanceKm(
                        clientCoords[0], clientCoords[1],
                        worker.coords[0], worker.coords[1]
                    ))}
                </div>
            )}
        </div>
    </div>
);

export default function ClientWorkersPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { items: workers, myWorkers, loading } = useSelector((state: RootState) => state.users);

    const { jobs, loading: jobsLoading } = useSelector(
        (state: RootState) => state.jobs
    );

    const [view, setView] = useState<'map' | 'list'>('list');
    const [workerType, setWorkerType] = useState("all");

    const [myView, setMyView] = useState<'map' | 'list'>('list');
    const [myWorkerType, setMyWorkerType] = useState("all");

    const [workersWithCoords, setWorkersWithCoords] = useState<any[]>([]);
    const [isClient, setIsClient] = useState(false);
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

    useEffect(() => { setIsClient(true); }, []);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => setClientCoords([pos.coords.latitude, pos.coords.longitude]),
            () => setClientCoords(null)
        );
    }, []);

    useEffect(() => {
        dispatch(fetchWorkersWithProfile({ page: 1, limit: 20 }));
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchMyWorkers({ page: 1, limit: 20 }));
    }, [dispatch]);

    useEffect(() => {
        const fetchCoords = async () => {
            const updatedWorkers = await Promise.all(
                workers.map(async (worker) => {
                    if (!worker.address) return worker;
                    const fullAddress = `${worker.address.line1}, ${worker.address.line2 || ''}, ${worker.address.state} ${worker.address.postalCode}, Australia`;
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

    // Sync focusedWorker with coords once geocoding finishes
    useEffect(() => {
        if (!focusedWorker) return;
        const geocoded = workersWithCoords.find(w => w._id === focusedWorker._id);
        if (geocoded?.coords && !focusedWorker.coords) {
            setFocusedWorker(geocoded);
        }
    }, [workersWithCoords]);

    useEffect(() => {
        if (!focusWorkerParam || workersWithCoords.length === 0) return;
        const target = workersWithCoords.find(w => w._id === focusWorkerParam);
        if (target?.coords) {
            setFocusedWorker(target);
            const isMyWorker = myWorkers.some(w => w._id === target._id);
            if (isMyWorker) {
                setMyView('map');
            } else {
                setView('map');
            }
            router.replace(window.location.pathname, { scroll: false });
        }
    }, [focusWorkerParam, workersWithCoords]);

    useEffect(() => {
        const checkScreen = () => setIsMobile(window.innerWidth < 900);
        checkScreen();
        window.addEventListener("resize", checkScreen);
        return () => window.removeEventListener("resize", checkScreen);
    }, []);

    const workerIcon = useMemo(() => new L.Icon({
        iconUrl: '/marker-icon-2xa.png',
        iconRetinaUrl: '/marker-icon-2xa.png',
        shadowUrl: '/marker-shadow.png',
        iconSize: isMobile ? [22, 34] : [32, 48],
        iconAnchor: isMobile ? [11, 34] : [12, 41],
        popupAnchor: [1, -34],
        shadowSize: isMobile ? [30, 30] : [41, 41],
    }), [isMobile]);

    const ndisIcon = useMemo(() => new L.Icon({
        iconUrl: '/marker-icon-2xb.png',
        iconRetinaUrl: '/marker-icon-2xb.png',
        shadowUrl: '/marker-shadow.png',
        iconSize: isMobile ? [22, 34] : [31, 50],
        iconAnchor: isMobile ? [11, 34] : [12, 41],
        popupAnchor: [1, -34],
        shadowSize: isMobile ? [30, 30] : [41, 41],
    }), [isMobile]);

    const filteredWorkers = workers.filter(worker => {
        if (workerType === "all") return true;
        if (workerType === "ndis") return worker.isNdisProvider;
        if (workerType === "individual") return !worker.isNdisProvider;
        return true;
    });

    const filteredWorkersWithCoords = workersWithCoords.filter(worker => {
        if (workerType === "all") return true;
        if (workerType === "ndis") return worker.isNdisProvider;
        if (workerType === "individual") return !worker.isNdisProvider;
        return true;
    });

    const filteredMyWorkers = myWorkers.filter(worker => {
        if (myWorkerType === "all") return true;
        if (myWorkerType === "ndis") return worker.isNdisProvider;
        if (myWorkerType === "individual") return !worker.isNdisProvider;
        return true;
    });

    const filteredMyWorkersWithCoords = workersWithCoords.filter(worker => {
        if (!myWorkers.find(w => w._id === worker._id)) return false;
        if (myWorkerType === "all") return true;
        if (myWorkerType === "ndis") return worker.isNdisProvider;
        if (myWorkerType === "individual") return !worker.isNdisProvider;
        return true;
    });

    const hasFocusedCoords = focusedWorker && Array.isArray(focusedWorker.coords) && focusedWorker.coords.length === 2;

    useEffect(() => {
        dispatch(getJobByClient({}));
    }, [dispatch]);

    const handleInviteClick = async (worker: any) => {
        setSelectedWorker(worker);
        setInviteDialog(true);

        try {
            const result = await Promise.all(
                jobs.map(async (job: any) => {
                    const res = await dispatch(
                        checkInvitation({ jobId: job._id, receiverId: worker._id })
                    ).unwrap();
                    return res ? job._id : null;
                })
            );
            setInvitedJobIds(result.filter(Boolean) as string[]);
        } catch (err) {
            console.error("Error fetching invitations", err);
            setInvitedJobIds([]);
        }
    }

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
                                        <Button
                                            variant={view === "list" ? "default" : "outline"}
                                            onClick={() => { setView('list'); setFocusedWorker(null); }}
                                            size="sm"
                                        >
                                            <ListIcon className="h-4 w-4 mr-1" /> List
                                        </Button>
                                        <Button
                                            variant={view === "map" ? "default" : "outline"}
                                            onClick={() => { setView('map'); setFocusedWorker(null); }}
                                            size="sm"
                                        >
                                            <MapIcon className="h-4 w-4 mr-1" /> Map
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Map View */}
                            {view === "map" && isClient && (
                                <Card>
                                    <CardContent className="p-0">
                                        {focusedWorker && (
                                            <div className="px-3 py-2 border-b flex items-center justify-between">
                                                <span className="text-xs text-muted-foreground">
                                                    Showing: <span className="font-medium text-foreground">{focusedWorker.firstName} {focusedWorker.lastName}</span>
                                                </span>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-6 text-xs"
                                                    onClick={() => setFocusedWorker(null)}
                                                >
                                                    Show All
                                                </Button>
                                            </div>
                                        )}
                                        <div className="w-full h-[300px] md:h-[350px] lg:h-[400px] relative">
                                            <MapLegend />
                                            <MapContainer
                                                center={[-25.2744, 133.7751]}
                                                zoom={4}
                                                className="w-full h-full"
                                            >
                                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                                <ZoomLimiter active={!!hasFocusedCoords} />

                                                {hasFocusedCoords ? (
                                                    <>
                                                        <CircleWithPopup worker={focusedWorker} clientCoords={clientCoords} />
                                                        <Marker
                                                            position={focusedWorker.coords as [number, number]}
                                                            icon={focusedWorker.isNdisProvider ? ndisIcon : workerIcon}
                                                            interactive={false}
                                                        />
                                                        <FocusWorker worker={focusedWorker} />
                                                    </>
                                                ) : (
                                                    <>
                                                        <MarkerClusterGroup iconCreateFunction={createCustomClusterIcon}>
                                                            {filteredWorkersWithCoords
                                                                .filter(w => Array.isArray(w.coords) && w.coords.length === 2)
                                                                .map(worker => (
                                                                    <Marker
                                                                        key={worker._id}
                                                                        position={worker.coords as [number, number]}
                                                                        icon={worker.isNdisProvider ? ndisIcon : workerIcon}
                                                                    >
                                                                        <Popup>
                                                                            <WorkerPopup worker={worker} clientCoords={clientCoords} />
                                                                        </Popup>
                                                                    </Marker>
                                                                ))}
                                                        </MarkerClusterGroup>
                                                        <FitBounds
                                                            markers={filteredWorkersWithCoords
                                                                .filter(w => w.coords)
                                                                .map(w => w.coords as [number, number])}
                                                        />
                                                    </>
                                                )}
                                            </MapContainer>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* List View */}
                            {view === "list" && (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {loading && <div>Loading workers...</div>}
                                    {!loading && workers.length === 0 && (
                                        <div className="text-muted-foreground">No workers found</div>
                                    )}
                                    {filteredWorkers.map(worker => {
                                        const workerWithCoord = workersWithCoords.find(w => w._id === worker._id);
                                        return (
                                            <WorkerCard
                                                key={worker._id}
                                                worker={worker}
                                                clientCoords={clientCoords}
                                                workerCoords={workerWithCoord}
                                                onViewMap={(w) => {
                                                    const geocoded = workersWithCoords.find(wc => wc._id === w._id);
                                                    const resolved = geocoded?.coords ? geocoded : w;
                                                    setFocusedWorker(resolved);
                                                    setView("map");
                                                }}
                                                onInvite={handleInviteClick}
                                            />
                                        );
                                    })}
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
                                            <Button
                                                variant={myView === "list" ? "default" : "outline"}
                                                onClick={() => { setMyView('list'); setFocusedWorker(null); }}
                                                size="sm"
                                            >
                                                <ListIcon className="h-4 w-4 mr-1" /> List
                                            </Button>
                                            <Button
                                                variant={myView === "map" ? "default" : "outline"}
                                                onClick={() => { setMyView('map'); setFocusedWorker(null); }}
                                                size="sm"
                                            >
                                                <MapIcon className="h-4 w-4 mr-1" /> Map
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Map View */}
                                {myView === "map" && isClient && (
                                    <Card>
                                        <CardContent className="p-0">
                                            {focusedWorker && (
                                                <div className="px-3 py-2 border-b flex items-center justify-between">
                                                    <span className="text-xs text-muted-foreground">
                                                        Showing: <span className="font-medium text-foreground">{focusedWorker.firstName} {focusedWorker.lastName}</span>
                                                    </span>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-6 text-xs"
                                                        onClick={() => setFocusedWorker(null)}
                                                    >
                                                        Show All
                                                    </Button>
                                                </div>
                                            )}
                                            <div className="w-full h-[300px] md:h-[350px] lg:h-[400px] relative">
                                                <MapLegend />
                                                <MapContainer
                                                    center={[-25.2744, 133.7751]}
                                                    zoom={4}
                                                    className="w-full h-full"
                                                >
                                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                                    <ZoomLimiter active={!!hasFocusedCoords} />

                                                    {hasFocusedCoords ? (
                                                        <>
                                                            <CircleWithPopup worker={focusedWorker} clientCoords={clientCoords} />
                                                            <Marker
                                                                position={focusedWorker.coords as [number, number]}
                                                                icon={focusedWorker.isNdisProvider ? ndisIcon : workerIcon}
                                                                interactive={false}
                                                            />
                                                            <FocusWorker worker={focusedWorker} />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <MarkerClusterGroup iconCreateFunction={createCustomClusterIcon}>
                                                                {filteredMyWorkersWithCoords
                                                                    .filter(w => Array.isArray(w.coords) && w.coords.length === 2)
                                                                    .map(worker => (
                                                                        <Marker
                                                                            key={worker._id}
                                                                            position={worker.coords as [number, number]}
                                                                            icon={worker.isNdisProvider ? ndisIcon : workerIcon}
                                                                        >
                                                                            <Popup>
                                                                                <WorkerPopup worker={worker} clientCoords={clientCoords} />
                                                                            </Popup>
                                                                        </Marker>
                                                                    ))}
                                                            </MarkerClusterGroup>
                                                            <FitBounds
                                                                markers={filteredMyWorkersWithCoords
                                                                    .filter(w => w.coords)
                                                                    .map(w => w.coords as [number, number])}
                                                            />
                                                        </>
                                                    )}
                                                </MapContainer>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* List View */}
                                {myView === "list" && (
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {filteredMyWorkers.map(worker => {
                                            const workerWithCoord = workersWithCoords.find(w => w._id === worker._id);
                                            return (
                                                <WorkerCard
                                                    key={worker._id}
                                                    worker={worker}
                                                    clientCoords={clientCoords}
                                                    workerCoords={workerWithCoord}
                                                    onViewMap={(w) => {
                                                        const geocoded = workersWithCoords.find(wc => wc._id === w._id);
                                                        const resolved = geocoded?.coords ? geocoded : w;
                                                        setFocusedWorker(resolved);
                                                        setMyView("map");
                                                    }}
                                                    onInvite={handleInviteClick}

                                                />
                                            );
                                        })}
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
                            Select a job to invite{" "}
                            <b>{selectedWorker?.firstName} {selectedWorker?.lastName}</b>
                        </p>

                        {/* Loading state */}
                        {jobsLoading ? (
                            <p className="text-center text-sm text-muted-foreground">Loading jobs...</p>
                        ) : (
                            // Check if any jobs left to invite
                            jobs?.filter(job => !invitedJobIds.includes(job._id)).length > 0 ? (
                                <Select value={selectedJob} onValueChange={(val) => setSelectedJob(val)}>
                                    <SelectTrigger className="w-full text-sm">
                                        <SelectValue placeholder="Select job" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {jobs
                                            ?.filter(job => !invitedJobIds.includes(job._id))
                                            .map((job: any) => {
                                                const startDate = new Date(job.startDate).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    day: 'numeric',
                                                    month: 'short',
                                                });

                                                return (
                                                    <SelectItem
                                                        key={job._id}
                                                        value={job._id}
                                                        className="flex flex-col items-start gap-0.5 py-2"
                                                    >
                                                        <span className="font-medium text-sm">{job.title}</span>
                                                        <span className="text-xs text-muted-foreground">{startDate}</span>
                                                    </SelectItem>
                                                );
                                            })}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <p className="text-center text-sm lg:text-base font-medium pt-2 mb-2 text-red-500">
                                    No jobs left to invite this worker.
                                </p>
                            )
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setInviteDialog(false)} className='cursor-pointer'>
                            Cancel
                        </Button>

                        <Button
                            disabled={
                                !selectedJob ||
                                jobs?.filter(job => !invitedJobIds.includes(job._id)).length === 0
                            }
                            onClick={() => {
                                dispatch(
                                    sendInvite({
                                        jobId: selectedJob,
                                        receiverId: selectedWorker._id,
                                    })
                                );
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