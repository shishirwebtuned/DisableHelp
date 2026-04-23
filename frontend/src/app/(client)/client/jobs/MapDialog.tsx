'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MapPin, BadgeCheck } from 'lucide-react';


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
        if (worker?.coords) {
            map.flyTo(worker.coords as [number, number], 14, { duration: 1.2 });
        }
    }, [worker, map]);
    return null;
}

// ── props ──────────────────────────────────────────────────────────────────

interface ApplicantMapDialogProps {
    worker: any;                          // null/undefined = dialog closed
    clientCoords: [number, number] | null;
    onClose: () => void;
}

// ── component ──────────────────────────────────────────────────────────────

export default function ApplicantMapDialog({ worker, clientCoords, onClose }: ApplicantMapDialogProps) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 900);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
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

    return (
        <Dialog open={!!worker} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-2xl w-full p-0 overflow-hidden gap-0">

                {/* Header */}
                <DialogHeader className="px-4 pt-4 pb-3 border-b">
                    <DialogTitle className="flex items-center gap-2 text-sm md:text-base">
                        <Avatar className="h-7 w-7 md:h-8 md:w-8">
                            <AvatarFallback>
                                {worker?.firstName?.[0]}{worker?.lastName?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <span>{worker?.firstName} {worker?.lastName}</span>
                        {worker?.approved && (
                            <BadgeCheck className="h-4 w-4 text-green-500 shrink-0" />
                        )}
                        {worker?.address && (
                            <span className="text-xs text-muted-foreground font-normal flex items-center gap-1 ml-1">
                                <MapPin className="h-3 w-3 shrink-0" />
                                {worker.address.state}, {worker.address.postalCode}
                            </span>
                        )}
                    </DialogTitle>
                </DialogHeader>

                {/* Map body */}
                <div className="w-full h-[320px] md:h-[420px] relative">
                    {!worker?.coords ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-sm">
                            <div className="text-center space-y-1">
                                <MapPin className="h-6 w-6 mx-auto animate-pulse" />
                                <p>Locating worker on map…</p>
                            </div>
                        </div>
                    ) : (
                        <MapContainer
                            center={worker.coords as [number, number]}
                            zoom={13}
                            minZoom={12}
                            maxZoom={14}
                            scrollWheelZoom={false}
                            doubleClickZoom={false}
                            dragging={true}
                            className="w-full h-full"
                            key={worker._id}
                        >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Circle
                                center={worker.coords as [number, number]}
                                radius={1000}
                                pathOptions={{ color: '#2563eb', fillColor: '#60a5fa', fillOpacity: 0.25 }}
                            />
                            <Marker
                                position={worker.coords as [number, number]}
                                icon={workerIcon}
                                ref={(ref) => { if (ref) ref.openPopup(); }}
                            >
                                <Popup>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>
                                                {worker.firstName?.[0]}{worker.lastName?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <strong className="flex items-center text-sm">
                                                {worker.firstName} {worker.lastName}
                                                {worker.approved && (
                                                    <BadgeCheck className="h-3 w-3 text-green-500 ml-1" />
                                                )}
                                            </strong>
                                            <span className="text-[11px] text-gray-500">
                                                {worker.address?.line1}, {worker.address?.state}
                                            </span>
                                            {clientCoords && worker.coords && (
                                                <div className="text-[11px] text-blue-500 mt-0.5">
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
                            <FocusWorker worker={worker} />
                        </MapContainer>
                    )}
                </div>

                {/* Footer distance strip */}
                {worker?.coords && clientCoords && (
                    <div className="px-4 py-2 border-t bg-muted/40 text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-blue-500 shrink-0" />
                        <span className="text-blue-500 font-medium">
                            {formatDistance(getDistanceKm(
                                clientCoords[0], clientCoords[1],
                                worker.coords[0], worker.coords[1]
                            ))}
                        </span>
                        <span className="ml-1">from your location</span>
                    </div>
                )}

            </DialogContent>
        </Dialog>
    );
}