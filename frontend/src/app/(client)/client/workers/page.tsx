'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/redux/store';
import { fetchUsers } from '@/redux/slices/usersSlice';

import dynamic from 'next/dynamic';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Avatar,
    AvatarFallback,
    AvatarImage
} from '@/components/ui/avatar';
import { Users, Map as MapIcon, List as ListIcon, MapPin } from 'lucide-react';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MarkerClusterGroup = dynamic(
    () => import('react-leaflet-markercluster').then(mod => mod.default ?? mod),
    { ssr: false }
) as React.ComponentType<{
    children?: React.ReactNode;
    iconCreateFunction?: (cluster: any) => L.DivIcon;
}>;

import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { useRouter } from 'next/navigation';

// Fix Leaflet default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/marker-icon-2x.png',
    iconUrl: '/marker-icon.png',
    shadowUrl: '/marker-shadow.png',
});

// Haversine distance formula
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

// Component to auto-fit map to all markers
function FitBounds({ markers }: { markers: [number, number][] }) {
    const map = useMap();
    if (!markers || markers.length === 0) return null;
    const bounds = L.latLngBounds(markers);
    map.fitBounds(bounds, { padding: [50, 50] });
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

export default function ClientWorkersPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { items: workers, loading } = useSelector((state: RootState) => state.users);

    const [view, setView] = useState<'map' | 'list'>('list');
    const [workersWithCoords, setWorkersWithCoords] = useState<any[]>([]);
    const [isClient, setIsClient] = useState(false);
    const [clientCoords, setClientCoords] = useState<[number, number] | null>(null);

    const router = useRouter();

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Get client's location
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => setClientCoords([pos.coords.latitude, pos.coords.longitude]),
            () => setClientCoords(null)
        );
    }, []);

    // Fetch workers
    useEffect(() => {
        dispatch(fetchUsers({
            role: 'worker',
            page: 1,
            limit: 20
        }));
    }, [dispatch]);

    // Fetch coordinates for workers
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

    return (
        <div className="space-y-5">

            <div>
                <h1 className="text-xl font-bold tracking-tight">Support Workers</h1>
                <p className="text-muted-foreground">View all the support workers.</p>
            </div>

            <Tabs defaultValue="find">
                <TabsList>
                    <TabsTrigger value="find">Find Workers</TabsTrigger>
                    <TabsTrigger value="past">My Workers (0)</TabsTrigger>
                </TabsList>

                {/* FIND WORKERS */}
                <TabsContent value="find">
                    <div className="space-y-3">
                        <div className="flex justify-end items-center">
                            <div className="flex gap-2">
                                <Button
                                    variant={view === "list" ? "default" : "outline"}
                                    onClick={() => setView('list')}
                                    size="sm"
                                >
                                    <ListIcon className="h-4 w-4 mr-1" /> List
                                </Button>
                                <Button
                                    variant={view === "map" ? "default" : "outline"}
                                    onClick={() => setView('map')}
                                    size="sm"
                                >
                                    <MapIcon className="h-4 w-4 mr-1" /> Map
                                </Button>
                            </div>
                        </div>

                        {/* MAP VIEW */}
                        {view === "map" && isClient && (
                            <Card>
                                <CardContent className="p-0">
                                    <div className="w-full h-[300px] md:h-[350px] lg:h-[400px]">
                                        <MapContainer
                                            center={[-25.2744, 133.7751]}
                                            zoom={4}
                                            className="w-full h-full"
                                        >
                                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                                            <MarkerClusterGroup iconCreateFunction={createCustomClusterIcon}>
                                                {workersWithCoords
                                                    .filter(w => Array.isArray(w.coords) && w.coords.length === 2)
                                                    .map(worker => (
                                                        <Marker
                                                            key={worker._id}
                                                            position={worker.coords as [number, number]}
                                                        >
                                                            <Popup>
                                                                <div className='flex flex-row items-center gap-3'>
                                                                    <Avatar className="h-10 w-10">
                                                                        <AvatarImage src={worker.avatar} />
                                                                        <AvatarFallback>{worker.firstName?.[0]}{worker.lastName?.[0]}</AvatarFallback>
                                                                    </Avatar>
                                                                    <div>
                                                                        <strong>{worker.firstName} {worker.lastName}</strong>
                                                                        <br />
                                                                        <span className="text-xs text-gray-500">
                                                                            {worker.address?.line1}, {worker.address?.state}, {worker.address?.postalCode}
                                                                        </span>
                                                                        {clientCoords && worker.coords && (
                                                                            <div className="text-xs text-blue-500 mt-0.5">
                                                                                {formatDistance(getDistanceKm(
                                                                                    clientCoords[0], clientCoords[1],
                                                                                    worker.coords[0], worker.coords[1]
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </Popup>
                                                        </Marker>
                                                    ))}
                                            </MarkerClusterGroup>

                                            <FitBounds
                                                markers={workersWithCoords
                                                    .filter(w => w.coords)
                                                    .map(w => w.coords as [number, number])}
                                            />
                                        </MapContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* LIST VIEW */}
                        {view === "list" && (
                            <div className="grid md:grid-cols-2 gap-4">
                                {loading && <div>Loading workers...</div>}
                                {!loading && workers.length === 0 && (
                                    <div className="text-muted-foreground">No workers found</div>
                                )}

                                {workers.map(worker => {
                                    const age = worker.dateOfBirth ? (() => {
                                        const dob = new Date(worker.dateOfBirth);
                                        const today = new Date();
                                        let years = today.getFullYear() - dob.getFullYear();
                                        const monthDiff = today.getMonth() - dob.getMonth();
                                        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) years--;
                                        return years > 0 ? years : null;
                                    })() : null;

                                    const joinedDate = worker.createdAt
                                        ? new Date(worker.createdAt).toLocaleDateString()
                                        : null;

                                    const location = worker.address?.state
                                        || worker.address?.line1
                                        || worker.timezone?.split('/')[1]
                                        || null;

                                    // Match worker to geocoded entry for distance
                                    const workerWithCoord = workersWithCoords.find(w => w._id === worker._id);
                                    const distance = clientCoords && workerWithCoord?.coords
                                        ? formatDistance(getDistanceKm(
                                            clientCoords[0], clientCoords[1],
                                            workerWithCoord.coords[0], workerWithCoord.coords[1]
                                        ))
                                        : null;

                                    return (
                                        <Card key={worker._id} className="hover:shadow-md transition-shadow">
                                            <CardHeader className="py-1">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex gap-3 items-center">
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarImage src={worker.avatar} />
                                                            <AvatarFallback>{worker.firstName?.[0]}{worker.lastName?.[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <CardTitle className="text-sm font-semibold">
                                                                {worker.firstName} {worker.lastName}
                                                            </CardTitle>
                                                            <CardDescription className="text-xs text-muted-foreground flex items-center gap-1">
                                                                {location && (
                                                                    <>
                                                                        <MapPin className="h-3 w-3" />
                                                                        <span>{location}</span>
                                                                    </>
                                                                )}
                                                                {distance && (
                                                                    <span className="text-blue-500 font-medium">
                                                                        {location ? ` · ${distance}` : distance}
                                                                    </span>
                                                                )}
                                                                {!location && !distance && null}
                                                            </CardDescription>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col items-center gap-2">
                                                        <Badge
                                                            className={`text-xs font-semibold px-2 py-1 rounded-full ${worker.approved
                                                                ? 'bg-green-100 text-green-600'
                                                                : 'bg-yellow-100 text-yellow-600'
                                                                }`}
                                                        >
                                                            {worker.approved ? "Approved" : "Pending"}
                                                        </Badge>
                                                        {worker.isVerified && (
                                                            <Badge variant="outline" className="text-xs px-2 py-0.5 border-green-500 text-green-600">
                                                                Verified
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardHeader>

                                            <CardContent className="pt-0 pb-2 space-y-1 text-xs text-muted-foreground">
                                                <div className="flex flex-wrap gap-x-3">
                                                    <span>Role: <span className="text-foreground">{worker.role}</span></span>
                                                    {age !== null && <span>Age: <span className="text-foreground">{age}</span></span>}
                                                    {joinedDate && <span>Joined: <span className="text-foreground">{joinedDate}</span></span>}
                                                </div>
                                                {worker.phoneNumber && (
                                                    <div className="mt-1">Phone: <span className="text-foreground">{worker.phoneNumber}</span></div>
                                                )}
                                                <div className="flex gap-2 pt-1 mt-2">
                                                    <Button
                                                        onClick={() => router.push(`/profile/${worker._id}`)}
                                                        size="sm"
                                                        className="h-8 text-xs flex-1"
                                                    >
                                                        View Profile
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* PAST WORKERS */}
                <TabsContent value="past">
                    <div className="text-center py-12 text-muted-foreground">
                        <Users className="h-10 w-10 mx-auto mb-3" />
                        No workers yet
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}