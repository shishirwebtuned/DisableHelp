'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/redux/store';
import { fetchWorkersWithProfile } from '@/redux/slices/usersSlice';
import dynamic from 'next/dynamic';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Languages, ChevronDown } from 'lucide-react';
import WorkerCard from '../workers/WorkerCard';
import { Input } from '@/components/ui/input';
import { getJobByClient } from '@/redux/slices/jobsSlice';
import { checkInvitation, sendInvite } from '@/redux/slices/inviteSlice';

const CALDMapDialog = dynamic(() => import('./CaldMapDialog'), {
    ssr: false,
    loading: () => null,
});

// ─── constants ────────────────────────────────────────────────────────────────

const LANGUAGE_OPTIONS = [
    'English', 'Mandarin', 'Cantonese', 'Hindi', 'Bengali', 'Spanish', 'French', 'Arabic', 'Portuguese', 'Russian',
    'Urdu', 'Indonesian', 'German', 'Japanese', 'Swahili', 'Marathi', 'Telugu', 'Turkish', 'Tamil', 'Yue Chinese',
    'Vietnamese', 'Korean', 'Italian', 'Thai', 'Gujarati', 'Javanese', 'Persian', 'Polish', 'Ukrainian', 'Malay',
    'Punjabi', 'Romanian', 'Dutch', 'Greek', 'Hungarian', 'Czech', 'Swedish', 'Finnish', 'Hebrew', 'Danish',
    'Norwegian', 'Slovak', 'Bulgarian', 'Serbian', 'Croatian', 'Sinhalese', 'Tagalog', 'Nepali', 'Burmese', 'Khmer',
    'Lao', 'Pashto', 'Somali', 'Amharic', 'Zulu', 'Xhosa', 'Afrikaans', 'Hausa', 'Igbo', 'Yoruba', 'Maori',
    'Samoan', 'Tongan', 'Fijian', 'Māori', 'Mongolian', 'Azerbaijani', 'Kazakh', 'Uzbek', 'Kurdish', 'Albanian',
    'Lithuanian', 'Latvian', 'Estonian', 'Slovenian', 'Macedonian', 'Georgian', 'Armenian', 'Bosnian', 'Montenegrin',
    'Basque', 'Galician', 'Catalan', 'Breton', 'Welsh', 'Irish', 'Scottish Gaelic', 'Icelandic', 'Greenlandic', 'Luxembourgish',
    'Malagasy', 'Haitian Creole', 'Creole', 'Other',
];

// ─── main component ───────────────────────────────────────────────────────────

export default function CALDSupportPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { items: workers, loading } = useSelector((state: RootState) => state.users);
    const { jobs, loading: jobsLoading } = useSelector((state: RootState) => state.jobs);

    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
    const [workerType, setWorkerType] = useState('all');
    const [clientCoords, setClientCoords] = useState<[number, number] | null>(null);
    const [workersWithCoords, setWorkersWithCoords] = useState<any[]>([]);
    const [isMobile, setIsMobile] = useState(false);
    const [languageSearch, setLanguageSearch] = useState('');

    const [inviteDialog, setInviteDialog] = useState(false);
    const [selectedWorker, setSelectedWorker] = useState<any>(null);
    const [selectedJob, setSelectedJob] = useState("");
    const [invitedJobIds, setInvitedJobIds] = useState<string[]>([]);
    const [mapDialogWorker, setMapDialogWorker] = useState<any>(null);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 900);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => setClientCoords([pos.coords.latitude, pos.coords.longitude]),
            () => setClientCoords(null)
        );
    }, []);

    useEffect(() => {
        dispatch(fetchWorkersWithProfile({
            page: 1,
            limit: 50,
            ...(selectedLanguages.length > 0 && { languages: selectedLanguages.join(',') }),
        }));
    }, [dispatch, selectedLanguages]);

    useEffect(() => {
        if (workers.length === 0) return;
        const fetchCoords = async () => {
            const updatedWorkers = await Promise.all(
                workers.map(async (worker) => {
                    if (!worker.address) return worker;
                    const fullAddress = `${worker.address.line1}, ${worker.address.suburb || ''}, ${worker.address.state} ${worker.address.postalCode}, Australia`;
                    const normalizedAddress = fullAddress.replace(/\s+/g, ' ').trim();
                    try {
                        const res = await fetch(
                            `${process.env.NEXT_PUBLIC_API_URL}location/geocode?address=${encodeURIComponent(normalizedAddress)}`
                        );
                        const coords = await res.json();
                        return {
                            ...worker,
                            coords: coords?.lat && coords?.lon
                                ? [Number(coords.lat), Number(coords.lon)]
                                : undefined,
                        };
                    } catch {
                        return worker;
                    }
                })
            );
            setWorkersWithCoords(updatedWorkers);
        };
        fetchCoords();
    }, [workers]);

    useEffect(() => {
        if (!mapDialogWorker) return;
        const updated = workersWithCoords.find(w => w._id === mapDialogWorker._id);
        if (updated?.coords && !mapDialogWorker.coords) {
            setMapDialogWorker(updated);
        }
    }, [workersWithCoords]);

    useEffect(() => {
        dispatch(getJobByClient({}));
    }, [dispatch]);

    const toggleLanguage = (lang: string) => {
        setSelectedLanguages(prev =>
            prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
        );
    };

    const filteredWorkers = workers.filter(worker => {
        if (workerType === 'ndis') return worker.isNdisProvider;
        if (workerType === 'individual') return !worker.isNdisProvider;
        return true;
    });

    const filteredLanguageOptions = useMemo(() => {
        if (!languageSearch.trim()) return LANGUAGE_OPTIONS;
        return LANGUAGE_OPTIONS.filter(lang =>
            lang.toLowerCase().includes(languageSearch.trim().toLowerCase())
        );
    }, [languageSearch]);

    const dialogWorker = mapDialogWorker
        ? (workersWithCoords.find(w => w._id === mapDialogWorker._id) ?? mapDialogWorker)
        : null;

    const handleViewMap = (worker: any) => {
        const geocoded = workersWithCoords.find(w => w._id === worker._id);
        setMapDialogWorker(geocoded ?? worker);
    };

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
    };

    return (
        <div className="space-y-5">
            <div>
                <h1 className="md:text-lg text-base lg:text-xl font-bold tracking-tight">CALD Support Workers</h1>
                <p className="text-muted-foreground lg:text-base md:text-sm text-xs">
                    Find support workers from culturally and linguistically diverse backgrounds.
                </p>
            </div>

            <div className="space-y-3">
                {/* Toolbar */}
                <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold text-black">Support Workers List</div>
                    <div className="flex sm:flex-row flex-col gap-4">
                        <Select value={workerType} onValueChange={setWorkerType}>
                            <SelectTrigger className="md:w-[150px] w-[115px] lg:w-[180px] h-8 text-xs">
                                <SelectValue placeholder="Filter workers" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Workers</SelectItem>
                                <SelectItem value="ndis">NDIS Providers</SelectItem>
                                <SelectItem value="individual">Individual Workers</SelectItem>
                            </SelectContent>
                        </Select>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-1">
                                    <Languages className="h-4 w-4" />
                                    Languages
                                    {selectedLanguages.length > 0 && (
                                        <Badge className="ml-1 h-5 px-1.5 text-xs bg-primary text-primary-foreground">
                                            {selectedLanguages.length}
                                        </Badge>
                                    )}
                                    <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52 max-h-72 overflow-y-auto">
                                <DropdownMenuLabel>Filter by language</DropdownMenuLabel>
                                <div className="px-2 py-1">
                                    <Input
                                        placeholder="Search language..."
                                        value={languageSearch}
                                        onChange={e => setLanguageSearch(e.target.value)}
                                        className="h-7 md:text-[13px] text-xs lg:text-sm px-2"
                                    />
                                </div>
                                <DropdownMenuSeparator />
                                {filteredLanguageOptions.length === 0 && (
                                    <div className="px-3 py-2 text-xs text-muted-foreground">No languages found</div>
                                )}
                                {filteredLanguageOptions.map(lang => (
                                    <DropdownMenuCheckboxItem
                                        key={lang}
                                        checked={selectedLanguages.includes(lang)}
                                        onCheckedChange={() => toggleLanguage(lang)}
                                    >
                                        {lang}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Result count */}
                {!loading && (
                    <p className="text-xs text-muted-foreground">
                        Showing {filteredWorkers.length} worker{filteredWorkers.length !== 1 ? 's' : ''}
                        {selectedLanguages.length > 0 && ` speaking ${selectedLanguages.join(', ')}`}
                    </p>
                )}

                {/* Worker cards */}
                <div className="grid md:grid-cols-2 gap-4">
                    {loading && <div>Loading workers...</div>}
                    {!loading && filteredWorkers.length === 0 && (
                        <div className="col-span-2 text-center py-10 text-muted-foreground">
                            <Languages className="h-8 w-8 mx-auto mb-2 opacity-40" />
                            <p>No workers found{selectedLanguages.length > 0 && ` speaking ${selectedLanguages.join(', ')}`}</p>
                        </div>
                    )}
                    {filteredWorkers.map(worker => {
                        const workerWithCoord = workersWithCoords.find(w => w._id === worker._id);
                        return (
                            <WorkerCard
                                key={worker._id}
                                worker={worker}
                                clientCoords={clientCoords}
                                workerCoords={workerWithCoord}
                                onViewMap={() => handleViewMap(worker)}
                                onInvite={handleInviteClick}
                                showLanguages={true}
                            />
                        );
                    })}
                </div>
            </div>

            {/* ─── Map Dialog (SSR-safe) ─────────────────────────────────── */}
            <CALDMapDialog
                dialogWorker={dialogWorker}
                clientCoords={clientCoords}
                isMobile={isMobile}
                onClose={() => setMapDialogWorker(null)}
            />

            {/* ─── Invite Dialog ────────────────────────────────────────── */}
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
                        {jobsLoading ? (
                            <p className="text-center text-sm text-muted-foreground">Loading jobs...</p>
                        ) : jobs?.filter((job: any) => !invitedJobIds.includes(job._id)).length > 0 ? (
                            <Select value={selectedJob} onValueChange={setSelectedJob}>
                                <SelectTrigger className="w-full text-sm">
                                    <SelectValue placeholder="Select job" />
                                </SelectTrigger>
                                <SelectContent>
                                    {jobs
                                        ?.filter((job: any) => !invitedJobIds.includes(job._id))
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
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setInviteDialog(false)} className="cursor-pointer">
                            Cancel
                        </Button>
                        <Button
                            disabled={
                                !selectedJob ||
                                jobs?.filter((job: any) => !invitedJobIds.includes(job._id)).length === 0
                            }
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
        </div>
    );
}