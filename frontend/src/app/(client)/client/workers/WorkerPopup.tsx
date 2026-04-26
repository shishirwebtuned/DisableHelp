// src/app/(client)/client/workers/WorkerPopup.tsx
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BadgeCheck } from 'lucide-react';

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

export function formatDistance(km: number): string {
    if (km < 1) return `${Math.round(km * 1000)}m away`;
    if (km < 10) return `${km.toFixed(1)}km away`;
    return `${Math.round(km)}km away`;
}

export function getDistanceKmExport(lat1: number, lon1: number, lat2: number, lon2: number) {
    return getDistanceKm(lat1, lon1, lat2, lon2);
}

export function WorkerPopup({
    worker,
    clientCoords,
}: {
    worker: any;
    clientCoords: [number, number] | null;
}) {
    return (
        <div className="flex flex-row items-center gap-2 md:gap-3">
            <Avatar className="h-8 w-8 md:h-9 md:w-9 lg:h-10 lg:w-10">
                <AvatarImage src={worker.avatar} />
                <AvatarFallback>{worker?.firstName?.[0]}{worker?.lastName?.[0]}</AvatarFallback>
            </Avatar>
            <div>
                <strong className="flex flex-row mb-0.5 items-center">
                    {worker?.firstName} {worker?.lastName}
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
}