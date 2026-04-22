'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';

import {
    Avatar,
    AvatarFallback,
    AvatarImage
} from '@/components/ui/avatar';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import {
    MapPin,
    BadgeCheck
} from 'lucide-react';

import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { checkInvitation } from '@/redux/slices/inviteSlice';

type WorkerCardProps = {

    worker: any
    clientCoords?: [number, number] | null
    workerCoords?: any
    onViewMap: (worker: any) => void
    onInvite?: (worker: any) => void
    showLanguages?: boolean

}

function getDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
) {

    const R = 6371;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;

    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =

        Math.sin(dLat / 2) ** 2 +

        Math.cos((lat1 * Math.PI) / 180) *

        Math.cos((lat2 * Math.PI) / 180) *

        Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
    );

}

function formatDistance(km: number) {

    if (km < 1)
        return `${Math.round(km * 1000)}m away`;

    if (km < 10)
        return `${km.toFixed(1)}km away`;

    return `${Math.round(km)}km away`;

}

export default function WorkerCard({
    worker,
    clientCoords,
    workerCoords,
    onViewMap,
    onInvite,
    showLanguages = false
}: WorkerCardProps) {


    const router = useRouter();

    const badgeColors = [
        "bg-blue-50 text-blue-700 border-blue-200",
        "bg-purple-50 text-purple-700 border-purple-200",
        "bg-green-50 text-green-700 border-green-200",
        "bg-amber-50 text-amber-700 border-amber-200",
        "bg-rose-50 text-rose-700 border-rose-200"
    ];

    const age = useMemo(() => {
        if (!worker.dateOfBirth)
            return null;
        const dob = new Date(worker.dateOfBirth);
        const today = new Date();

        let years =
            today.getFullYear() -
            dob.getFullYear();

        const monthDiff =
            today.getMonth() -
            dob.getMonth();

        if (
            monthDiff < 0 ||
            (monthDiff === 0 &&
                today.getDate() < dob.getDate())
        ) {
            years--;
        }

        return years > 0 ? years : null;

    }, [worker]);

    const joinedDate = worker.createdAt
        ? new Date(worker.createdAt)
            .toLocaleDateString()
        : null;

    const location = `
    ${worker.address?.suburb}, 
    ${worker.address?.state}
    `;

    const address = `
${worker?.address?.line1 || ''}
${worker?.address?.suburb || ''},
${worker?.address?.state || ''},
${worker?.address?.postalCode || ''}
`;

    const languages = useMemo(() => {

        return [
            ...(worker?.profile?.languages?.firstLanguages || []),
            ...(worker?.profile?.languages?.secondLanguages || [])
        ].filter(Boolean);

    }, [worker]);

    const services =
        worker?.profile?.services || [];

    const distance =

        clientCoords &&
            workerCoords?.coords

            ? formatDistance(

                getDistanceKm(

                    clientCoords[0],

                    clientCoords[1],

                    workerCoords.coords[0],

                    workerCoords.coords[1]

                ))

            : null;

    return (

        <Card className="hover:shadow-md transition-shadow">

            <CardHeader className="py-1">

                <div className="flex flex-wrap justify-between items-start gap-y-2">

                    <div className="flex gap-3 items-center">

                        <Avatar className="lg:h-10 lg:w-10 md:h-9 md:w-9 h-8 w-8">

                            <AvatarImage src={worker?.profile?.avatar?.url} />

                            <AvatarFallback>

                                {worker?.firstName?.[0]}
                                {worker?.lastName?.[0]}

                            </AvatarFallback>

                        </Avatar>

                        <div>

                            <CardTitle className="text-xs md:text-[13px] lg:text-sm font-semibold flex items-center">

                                {worker?.firstName} {worker?.lastName}

                                {worker?.approved && (

                                    <BadgeCheck className="h-3 w-3 text-green-500 ml-1 inline" />

                                )}

                            </CardTitle>

                            <CardDescription
                                className="md:text-[11px] text-[10px] lg:text-xs text-muted-foreground flex items-center gap-1"
                            >

                                {location && (

                                    <>

                                        <MapPin className="h-3 w-3" />

                                        <span>{location}</span>

                                    </>

                                )}

                                {distance && (

                                    <span className="text-blue-500 font-medium">

                                        {location
                                            ? ` · ${distance}`
                                            : distance}

                                    </span>

                                )}

                            </CardDescription>

                        </div>

                    </div>

                    <div className="flex flex-col items-center gap-2">

                        <Badge

                            className={`

text-[10px]

md:text-[11px]

lg:text-xs

font-semibold

px-2

py-1

rounded-full

${worker.approved

                                    ? 'bg-green-100 text-green-600'

                                    : 'bg-yellow-100 text-yellow-600'

                                }

`}

                        >

                            {worker.approved
                                ? "Approved"
                                : "Pending"}

                        </Badge>

                        {worker.isVerified && (

                            <Badge
                                variant="outline"
                                className="text-[10px] md:text-[11px] lg:text-xs px-2 py-0.5 border-green-500 text-green-600"
                            >

                                Verified

                            </Badge>

                        )}

                    </div>

                </div>

            </CardHeader>

            <CardContent className="pt-0 pb-2 space-y-1 text-[10px] md:text-[11px] lg:text-xs text-muted-foreground">

                <div className="flex flex-wrap gap-x-3">

                    {/* <span>

                        Role:

                        <span className="text-foreground ml-1">

                            {worker.role}

                        </span>

                    </span> */}

                    {/* {age !== null && (

                        <span>

                            Age:

                            <span className="text-foreground ml-1">

                                {age}

                            </span>

                        </span>

                    )} */}

                    {joinedDate && (

                        <span>

                            Joined:

                            <span className="text-foreground ml-1">

                                {joinedDate}

                            </span>

                        </span>

                    )}

                </div>

                {/* {worker.phoneNumber && (

                    <div className="mt-1">

                        Phone:

                        <span className="text-foreground ml-1">

                            {worker.phoneNumber}

                        </span>

                    </div>

                )} */}

                {worker?.profile?.gender && (

                    <div className="mt-1">

                        Gender:

                        <span className="text-foreground ml-1">

                            {worker.profile.gender}

                        </span>

                    </div>

                )}

                {showLanguages && languages.length > 0 && (

                    <div className="flex flex-row gap-1 mt-1 items-center">

                        <p>Speaks:</p>

                        <div className="flex flex-wrap gap-1.5">

                            {languages
                                .slice(0, 5)
                                .map((lang, index) => (

                                    <span

                                        key={index}

                                        className={`

text-[10px] md:text-[11px] lg:text-xs

border

px-2 md:px-2.5

py-[1px] md:py-[3px]

rounded-full

font-medium
transition-colors 
${badgeColors[
                                            index %
                                            badgeColors.length
                                            ]}

`}

                                    >

                                        {lang}

                                    </span>

                                ))}

                            {languages.length > 5 && (

                                <span className="text-[10px] md:text-xs text-gray-500 px-2">

                                    +{languages.length - 5}

                                </span>

                            )}

                        </div>

                    </div>

                )}

                {/* {worker.address && (

                    <div className="mt-1">

                        Address:

                        <span className="text-foreground ml-1">

                            {address}

                        </span>

                    </div>

                )} */}

                {services.length > 0 && (

                    <div className="mt-1 pb-1 flex gap-1">

                        <p>Services:</p>

                        <div className="flex flex-wrap md:gap-1.5 gap-1 lg:gap-2 items-center justify-start">

                            {services.map((s: any, index: number) => (

                                <span

                                    key={index}

                                    className="text-[10px] md:text-[11px] lg:text-xs border md:px-2 px-1.5 lg:px-2.5 py-[1px] md:py-[2px] lg:py-[3px] rounded-full bg-gray-50 border-gray-500 text-gray-600"

                                >

                                    {s}

                                </span>

                            ))}

                        </div>

                    </div>

                )}

                <div className="w-full flex text-[10px] md:text-[11px] lg:text-xs justify-start md:justify-start items-center">

                    Role:

                    <p className="border-2 border-blue-300 text-blue-400 rounded-full px-2 py-[1px] md:py-0.5 ml-2">

                        {worker.isNdisProvider

                            ? "NDIS Provider"

                            : "Individual Worker"}

                    </p>

                </div>

                <div className="flex gap-2 pt-1 mt-2">

                    <Button

                        onClick={() =>
                            router.push(
                                `/profile/${worker._id}`
                            )
                        }

                        size="sm"

                        className="h-6.5 md:h-7 lg:h-8 text-[10px] md:text-[11px] lg:text-xs flex-1 cursor-pointer"
                    >

                        View Profile

                    </Button>

                    <Button
                        onClick={() => onInvite?.(worker)}
                        size="sm"

                        className="h-6.5 md:h-7 lg:h-8 text-[10px] md:text-[11px] lg:text-xs flex-1 cursor-pointer"
                    >
                        Invite to Apply


                    </Button>

                    <Button

                        onClick={() => onViewMap(worker)}

                        size="sm"

                        variant="outline"

                        className="h-6.5 md:h-7 lg:h-8 text-[10px] md:text-[11px] lg:text-xs flex-1 cursor-pointer"
                    >

                        View on Map

                    </Button>

                </div>

            </CardContent>

        </Card>

    );

}