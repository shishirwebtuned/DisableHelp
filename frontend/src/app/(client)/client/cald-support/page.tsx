'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/redux/store';
import { fetchWorkersWithProfile } from '@/redux/slices/usersSlice';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Languages, ChevronDown, BadgeCheck, MapPin } from 'lucide-react';
import WorkerCard from '../workers/WorkerCard';

import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Input } from '@/components/ui/input';

// ─── helpers ─────────────────────────────────────────────────────────────────

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

// ─── map sub-components ───────────────────────────────────────────────────────

function FocusWorker({ worker }: { worker: any }) {
    const map = useMap();
    useEffect(() => {
        if (worker?.coords) {
            map.flyTo(worker.coords as [number, number], 14, { duration: 1.2 });
        }
    }, [worker, map]);
    return null;
}

// ─── static pieces (outside component) ───────────────────────────────────────

const WorkerPopup = ({
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
                {worker.approved && (
                    <BadgeCheck className="md:h-3 md:w-3 h-2.5 w-2.5 lg:h-4 lg:w-4 text-green-500 ml-1" />
                )}
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

    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
    const [workerType, setWorkerType] = useState('all');
    const [clientCoords, setClientCoords] = useState<[number, number] | null>(null);
    const [workersWithCoords, setWorkersWithCoords] = useState<any[]>([]);
    const [isClient, setIsClient] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [languageSearch, setLanguageSearch] = useState('');

    // null = dialog closed; worker object = dialog open, focused on that worker
    const [mapDialogWorker, setMapDialogWorker] = useState<any>(null);

    useEffect(() => { setIsClient(true); }, []);

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

    // Geocode all worker addresses
    useEffect(() => {
        if (workers.length === 0) return;
        const fetchCoords = async () => {
            const updatedWorkers = await Promise.all(
                workers.map(async (worker) => {
                    if (!worker.address) return worker;
                    const fullAddress = `${worker.address.line1}, ${worker.address.line2 || ''}, ${worker.address.state} ${worker.address.postalCode}, Australia`;
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

    // If the dialog is open but geocoding wasn't done yet when it opened,
    // update the focused worker object once coords arrive
    useEffect(() => {
        if (!mapDialogWorker) return;
        const updated = workersWithCoords.find(w => w._id === mapDialogWorker._id);
        if (updated?.coords && !mapDialogWorker.coords) {
            setMapDialogWorker(updated);
        }
    }, [workersWithCoords]);

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

    // Filter language options based on search
    const filteredLanguageOptions = useMemo(() => {
        if (!languageSearch.trim()) return LANGUAGE_OPTIONS;
        return LANGUAGE_OPTIONS.filter(lang => lang.toLowerCase().includes(languageSearch.trim().toLowerCase()));
    }, [languageSearch]);

    // Always use the geocoded version for the dialog (has coords)
    const dialogWorker = mapDialogWorker
        ? (workersWithCoords.find(w => w._id === mapDialogWorker._id) ?? mapDialogWorker)
        : null;

    const handleViewMap = (worker: any) => {
        // Prefer the geocoded version immediately if available
        const geocoded = workersWithCoords.find(w => w._id === worker._id);
        setMapDialogWorker(geocoded ?? worker);
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
                    <div className="flex sm:flex-row flex-col  gap-4">
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
                            />
                        );
                    })}
                </div>
            </div>

            {/* ─── Map Dialog ───────────────────────────────────────────────── */}
            <Dialog
                open={!!mapDialogWorker}
                onOpenChange={(open) => { if (!open) setMapDialogWorker(null); }}
            >
                <DialogContent className="max-w-2xl w-full p-0 overflow-hidden gap-0">

                    {/* Header */}
                    <DialogHeader className="px-4 pt-4 pb-3 border-b">
                        <DialogTitle className="flex items-center gap-2 text-sm md:text-base">
                            <Avatar className="h-7 w-7 md:h-8 md:w-8">
                                <AvatarImage src={dialogWorker?.avatar} />
                                <AvatarFallback>
                                    {dialogWorker?.firstName?.[0]}{dialogWorker?.lastName?.[0]}
                                </AvatarFallback>
                            </Avatar>
                            <span>{dialogWorker?.firstName} {dialogWorker?.lastName}</span>
                            {dialogWorker?.approved && (
                                <BadgeCheck className="h-4 w-4 text-green-500 shrink-0" />
                            )}
                            {dialogWorker?.address && (
                                <span className="text-xs text-muted-foreground font-normal flex items-center gap-1 ml-1">
                                    <MapPin className="h-3 w-3 shrink-0" />
                                    {dialogWorker.address.state}, {dialogWorker.address.postalCode}
                                </span>
                            )}
                        </DialogTitle>
                    </DialogHeader>

                    {/* Map body */}
                    <div className="w-full h-[320px] md:h-[420px] relative">
                        {isClient && (
                            !dialogWorker?.coords ? (
                                // Geocoding still in progress
                                <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-sm">
                                    <div className="text-center space-y-1">
                                        <MapPin className="h-6 w-6 mx-auto animate-pulse" />
                                        <p>Locating worker on map…</p>
                                    </div>
                                </div>
                            ) : (
                                <MapContainer
                                    center={dialogWorker.coords as [number, number]}
                                    zoom={13}
                                    minZoom={12}
                                    maxZoom={14}
                                    scrollWheelZoom={false}
                                    doubleClickZoom={false}
                                    dragging={true}
                                    className="w-full h-full"
                                    key={dialogWorker._id}
                                >
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                                    {/* Show a circle for privacy */}
                                    <Circle
                                        center={dialogWorker.coords as [number, number]}
                                        radius={1000} // 1km radius, adjust as needed
                                        pathOptions={{ color: '#2563eb', fillColor: '#60a5fa', fillOpacity: 0.25 }}
                                    />
                                    {/* Show the icon in the middle, but no popup */}
                                    <Marker
                                        position={dialogWorker.coords as [number, number]}
                                        icon={dialogWorker.isNdisProvider ? ndisIcon : workerIcon}
                                        interactive={false}
                                    />

                                    {/* Fly to the focused worker */}
                                    <FocusWorker worker={dialogWorker} />
                                </MapContainer>
                            )
                        )}
                    </div>

                    {/* Footer distance strip */}
                    {dialogWorker?.coords && clientCoords && (
                        <div className="px-4 py-2 border-t bg-muted/40 text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-blue-500 shrink-0" />
                            <span className="text-blue-500 font-medium">
                                {formatDistance(getDistanceKm(
                                    clientCoords[0], clientCoords[1],
                                    dialogWorker.coords[0], dialogWorker.coords[1]
                                ))}
                            </span>
                            <span className="ml-1">from your location</span>
                        </div>
                    )}

                </DialogContent>
            </Dialog>
        </div>
    );
}