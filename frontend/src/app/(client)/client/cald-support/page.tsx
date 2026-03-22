'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/redux/store';
import { fetchUsers, fetchWorkersWithProfile } from '@/redux/slices/usersSlice';

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
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Users, MapPin, Languages, X, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

const LANGUAGE_OPTIONS = [
    'English', 'Mandarin', 'Arabic', 'Vietnamese', 'Cantonese',
    'Greek', 'Italian', 'Hindi', 'Punjabi', 'Spanish',
    'Tagalog', 'Korean', 'Japanese', 'Turkish', 'Persian',
    'Nepali', 'Tamil', 'Sinhalese', 'French', 'Portuguese',
];

export default function CALDSupportPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { items: workers, loading } = useSelector((state: RootState) => state.users);

    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

    const router = useRouter();



    useEffect(() => {
        dispatch(fetchWorkersWithProfile({
            page: 1,
            limit: 50,
            ...(selectedLanguages.length > 0 && {
                languages: selectedLanguages.join(","),
            }),
        }));
    }, [dispatch, selectedLanguages]);

    // Geocode worker addresses


    const toggleLanguage = (lang: string) => {
        setSelectedLanguages(prev =>
            prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
        );
    };

    const clearLanguages = () => setSelectedLanguages([]);


    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-xl font-bold tracking-tight">CALD Support Workers</h1>
                <p className="text-muted-foreground">
                    Find support workers from culturally and linguistically diverse backgrounds.
                </p>
            </div>



            <div className="space-y-3">

                {/* Language filter toolbar */}
                <div className="flex items-center justify-between gap-2">
                    <div className='font-semibold text-black'>Support Workers List</div>
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
                            <DropdownMenuSeparator />
                            {LANGUAGE_OPTIONS.map(lang => (
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

                {/* Result count */}
                {!loading && (
                    <p className="text-xs text-muted-foreground">
                        Showing {workers.length} worker{workers.length !== 1 ? 's' : ''}
                        {selectedLanguages.length > 0 && ` speaking ${selectedLanguages.join(', ')}`}
                    </p>
                )}

                {/* List */}
                <div className="grid md:grid-cols-2 gap-4">
                    {loading && <div>Loading workers...</div>}

                    {!loading && workers.length === 0 && (
                        <div className="col-span-2 text-center py-10 text-muted-foreground">
                            <Languages className="h-8 w-8 mx-auto mb-2 opacity-40" />
                            <p>No workers found{selectedLanguages.length > 0 && ` speaking ${selectedLanguages.join(', ')}`}</p>
                        </div>
                    )}

                    {workers.map(worker => {
                        const age = worker.dateOfBirth ? (() => {
                            const dob = new Date(worker.dateOfBirth);
                            const today = new Date();
                            let years = today.getFullYear() - dob.getFullYear();
                            const m = today.getMonth() - dob.getMonth();
                            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) years--;
                            return years > 0 ? years : null;
                        })() : null;

                        const joinedDate = worker.createdAt
                            ? new Date(worker.createdAt).toLocaleDateString()
                            : null;

                        const location = worker.address?.state
                            || worker.address?.line1
                            || worker.timezone?.split('/')[1]
                            || null;



                        return (
                            <Card key={worker._id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="py-1">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-3 items-center">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={worker.avatar} />
                                                <AvatarFallback>
                                                    {worker.firstName?.[0]}{worker.lastName?.[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <CardTitle className="text-sm font-semibold">
                                                    {worker.firstName} {worker.lastName}
                                                </CardTitle>
                                                <CardDescription className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
                                                    {location && (
                                                        <>
                                                            <MapPin className="h-3 w-3 shrink-0" />
                                                            <span>{location}</span>
                                                        </>
                                                    )}

                                                </CardDescription>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-1.5">
                                            <Badge
                                                className={`text-xs font-semibold px-2 py-1 rounded-full ${worker.approved
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-yellow-100 text-yellow-600'
                                                    }`}
                                            >
                                                {worker.approved ? 'Approved' : 'Pending'}
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

                                    {/* Languages spoken */}
                                    {Array.isArray(worker.languages) && worker.languages.length > 0 && (
                                        <div className="flex flex-wrap gap-1 pt-1">
                                            {worker.languages.map((lang: string) => (
                                                <Badge
                                                    key={lang}
                                                    variant="secondary"
                                                    className={`text-xs px-2 py-0 ${selectedLanguages.includes(lang)
                                                        ? 'bg-primary/10 text-primary border border-primary/20'
                                                        : ''
                                                        }`}
                                                >
                                                    {lang}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    {worker.phoneNumber && (
                                        <div className="mt-1">
                                            Phone: <span className="text-foreground">{worker.phoneNumber}</span>
                                        </div>
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
            </div>

            {/* <div className="text-center py-12 text-muted-foreground">
                        <Users className="h-10 w-10 mx-auto mb-3" />
                        No workers yet
                    </div> */}

        </div>
    );
}