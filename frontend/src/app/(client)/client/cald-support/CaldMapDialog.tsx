// src/app/(client)/client/cald-support/CALDMapDialog.tsx
'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, BadgeCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

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

function FocusWorker({ worker }: { worker: any }) {
    const map = useMap();
    useEffect(() => {
        if (worker?.coords) map.flyTo(worker.coords as [number, number], 14, { duration: 1.2 });
    }, [worker, map]);
    return null;
}

interface Props {
    dialogWorker: any;
    clientCoords: [number, number] | null;
    isMobile: boolean;
    onClose: () => void;
}

export default function CALDMapDialog({ dialogWorker, clientCoords, isMobile, onClose }: Props) {
    const workerIcon = new L.Icon({
        iconUrl: '/marker-icon-2xa.png',
        iconRetinaUrl: '/marker-icon-2xa.png',
        shadowUrl: '/marker-shadow.png',
        iconSize: isMobile ? [22, 34] : [32, 48],
        iconAnchor: isMobile ? [11, 34] : [12, 41],
        popupAnchor: [1, -34],
        shadowSize: isMobile ? [30, 30] : [41, 41],
    });

    const ndisIcon = new L.Icon({
        iconUrl: '/marker-icon-2xb.png',
        iconRetinaUrl: '/marker-icon-2xb.png',
        shadowUrl: '/marker-shadow.png',
        iconSize: isMobile ? [22, 34] : [31, 50],
        iconAnchor: isMobile ? [11, 34] : [12, 41],
        popupAnchor: [1, -34],
        shadowSize: isMobile ? [30, 30] : [41, 41],
    });

    return (
        <Dialog open={!!dialogWorker} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-2xl w-full p-0 overflow-hidden gap-0">
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

                <div className="w-full h-[320px] md:h-[420px] relative">
                    {!dialogWorker?.coords ? (
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
                            <Circle
                                center={dialogWorker.coords as [number, number]}
                                radius={1000}
                                pathOptions={{ color: '#2563eb', fillColor: '#60a5fa', fillOpacity: 0.25 }}
                            />
                            <Marker
                                position={dialogWorker.coords as [number, number]}
                                icon={dialogWorker.isNdisProvider ? ndisIcon : workerIcon}
                                interactive={false}
                            />
                            <FocusWorker worker={dialogWorker} />
                        </MapContainer>
                    )}
                </div>

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
    );
}