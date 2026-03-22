'use client';

import { useParams, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import {
    Clock,
    CheckCircle,
    ArrowLeft,
    Car,
    Users,
    Check,
    ShieldCheck,
    Activity
} from 'lucide-react';

import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

import { getuserbyid, fetchUsers } from '@/redux/slices/usersSlice';
import { useAppDispatch } from '@/hooks/redux';

import { useEffect } from 'react';

const getUserId = (user: any): string =>
    user?.id ?? user?._id ?? '';

export default function PublicProfilePage() {

    const params = useParams();
    const router = useRouter();
    const dispatch = useAppDispatch();

    const id = params?.id as string;

    const {
        selectedUser,
        loading: isUserLoading,
        error,
        items: allUsers
    } = useSelector(
        (state: RootState) => state.users
    );

    /* ---------------- FETCH ---------------- */

    useEffect(() => {

        if (id) {

            dispatch(getuserbyid(id));

        }

    }, [dispatch, id]);

    useEffect(() => {

        if (allUsers.length === 0) {

            dispatch(fetchUsers(undefined));

        }

    }, [dispatch, allUsers.length]);

    /* ---------------- SAFE DATA ---------------- */

    const user =
        selectedUser?.user ??
        selectedUser ??
        null;

    const profile =
        selectedUser?.profile ??
        null;

    const isWorker =
        user?.role === 'worker';

    const firstName =
        user?.firstName ?? '';

    const lastName =
        user?.lastName ?? '';

    const fullName =
        `${firstName} ${lastName}`.trim() ||
        'Unknown user';

    const bio =
        profile?.personalDetails?.bio ?? '';

    const services =
        profile?.services ?? [];

    const rates =
        profile?.rates ?? [];

    const availability =
        profile?.availability ?? {};

    const workHistory =
        profile?.workHistory ?? [];

    const education =
        profile?.educationAndTraining ?? [];

    const experience =
        profile?.experienceSummary ?? {};

    /* ---------------- HELPERS ---------------- */

    const formatTime = (time: string) => {

        if (!time) return '';

        const [h, m] =
            time.split(':').map(Number);

        const ampm =
            h >= 12 ? 'pm' : 'am';

        const h12 =
            h % 12 || 12;

        return `${h12}${ampm}`;

    };

    const days = [

        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'

    ];

    /* ---------------- STATES ---------------- */

    if (isUserLoading)

        return (

            <div className="p-8 text-center min-h-screen flex items-center justify-center">

                <p className="text-muted-foreground">

                    Loading profile...

                </p>

            </div>

        );

    if (error)

        return (

            <div className="p-8 text-center min-h-screen">

                <p className="text-destructive mb-4">

                    {error}

                </p>

                <Button
                    onClick={() => router.back()}
                >

                    Back

                </Button>

            </div>

        );

    if (!user)

        return (

            <div className="p-8 text-center min-h-screen">

                <p className="text-muted-foreground mb-4">

                    Profile not found

                </p>

                <Button
                    onClick={() => router.push('/admin/users')}
                >

                    Back

                </Button>

            </div>

        );

    /* ---------------- UI ---------------- */

    return (

        <div className="min-h-screen bg-background">

            {/* TOP */}

            <div className="border-b px-6 py-4 flex items-center">

                <p
                    onClick={() => router.back()}
                    className="flex items-center text-sm font-medium cursor-pointer"
                >

                    <ArrowLeft className="h-4 w-4 mr-2" />

                    Back

                </p>

            </div>

            {/* HEADER */}

            <div className="border-b pt-8 pb-8 px-6">

                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8">

                    <Avatar className="h-32 w-32">

                        <AvatarImage
                            src={
                                profile?.personalDetails?.avatar?.url ??
                                user?.avatar ??
                                ''
                            }
                        />

                        <AvatarFallback>

                            {firstName?.[0] ?? '?'}
                            {lastName?.[0] ?? ''}

                        </AvatarFallback>

                    </Avatar>

                    <div className="flex-1 text-center md:text-left space-y-3">

                        <div className="flex flex-wrap gap-3">

                            <h1 className="text-3xl font-bold">

                                {fullName}

                            </h1>

                            {user?.approved && (

                                <Badge className="bg-green-100 text-green-700">

                                    <CheckCircle className="h-3 w-3 mr-1" />

                                    Verified

                                </Badge>

                            )}

                        </div>

                        {experience?.disability?.description && (

                            <p className="text-muted-foreground">

                                {experience.disability.description}

                            </p>

                        )}

                    </div>

                </div>

            </div>

            {/* BODY */}

            <div className="max-w-7xl mx-auto">

                {/* ABOUT */}

                <div className="p-6 border-b">

                    <h2 className="text-xl font-semibold mb-3">

                        About {firstName || 'worker'}

                    </h2>

                    {bio && (

                        <p className="text-sm text-muted-foreground">

                            {bio}

                        </p>

                    )}

                </div>

                <div className="grid lg:grid-cols-2">

                    {/* LEFT */}

                    <div className="p-6 border-r">

                        {/* AVAILABILITY */}

                        {isWorker && (

                            <section>

                                <h3 className="text-lg font-semibold mb-4">

                                    Preferred hours

                                </h3>

                                <div className="space-y-4">

                                    {days.map(day => {

                                        const dayData =
                                            availability?.[day.toLowerCase()] ?? {
                                                available: false,
                                                times: []
                                            };

                                        return (

                                            <div key={day}>

                                                <div className="text-sm font-medium">

                                                    {day}

                                                </div>

                                                <div className="flex gap-2 flex-wrap">

                                                    {dayData?.times?.length ?

                                                        dayData.times.map(
                                                            (t: any, i: number) => (

                                                                <Badge
                                                                    key={i}
                                                                    variant="secondary"
                                                                >

                                                                    <Check className="h-3 w-3 mr-1" />

                                                                    {formatTime(t.startTime)}-
                                                                    {formatTime(t.endTime)}

                                                                </Badge>

                                                            ))

                                                        :

                                                        <span className="text-xs text-muted-foreground">

                                                            No availability

                                                        </span>

                                                    }

                                                </div>

                                                <Separator className="mt-2" />

                                            </div>

                                        );

                                    })}

                                </div>

                            </section>

                        )}

                        {/* RATES */}

                        {isWorker && (

                            <section className="mt-8">

                                <h3 className="text-lg font-semibold mb-4">

                                    Indicative rates

                                </h3>

                                {rates.length ?

                                    rates.map((r: any) => (

                                        <div
                                            key={r._id}
                                            className="flex justify-between p-3 border rounded mb-2"
                                        >

                                            <span>

                                                {r.name ?? 'Rate'}

                                            </span>

                                            <span>

                                                ${r.rate ?? 0}

                                            </span>

                                        </div>

                                    ))

                                    :

                                    <p className="text-sm text-muted-foreground">

                                        No rates

                                    </p>

                                }

                            </section>

                        )}

                        {/* VERIFICATION */}

                        {isWorker && (

                            <section className="mt-8">

                                <h3 className="text-lg font-semibold mb-4">

                                    Verification

                                </h3>

                                <div className="space-y-3">

                                    {[
                                        {
                                            label: 'First aid',
                                            file: profile?.personalDetails?.
                                                additionalTraining?.
                                                firstAid?.file?.url
                                        },

                                        {
                                            label: 'Driver license',
                                            file: profile?.personalDetails?.
                                                additionalTraining?.
                                                driverLicense?.file?.url
                                        },

                                        {
                                            label: 'WWCC',
                                            file: profile?.personalDetails?.
                                                wwcc?.file?.url
                                        }

                                    ].map((item, i) => (

                                        <div
                                            key={i}
                                            className="flex justify-between border p-3 rounded"
                                        >

                                            <span>

                                                {item.label}

                                            </span>

                                            {item.file ?

                                                <a
                                                    href={item.file}
                                                    target="_blank"
                                                    className="text-blue-600 text-xs"
                                                >

                                                    View

                                                </a>

                                                :

                                                <span className="text-xs text-muted-foreground">

                                                    Missing

                                                </span>

                                            }

                                        </div>

                                    ))}

                                </div>

                            </section>

                        )}

                    </div>

                    {/* RIGHT */}

                    <div className="p-6">

                        {/* SERVICES */}

                        {isWorker && (

                            <section>

                                <h3 className="text-lg font-semibold mb-4">

                                    Services

                                </h3>

                                {services.length ?

                                    <div className="grid sm:grid-cols-2 gap-2">

                                        {services.map(
                                            (service: string, i: number) => (

                                                <div
                                                    key={i}
                                                    className="border p-3 rounded"
                                                >

                                                    {service}

                                                </div>

                                            ))

                                        }

                                    </div>

                                    :

                                    <p className="text-muted-foreground">

                                        No services

                                    </p>

                                }

                            </section>

                        )}

                        {/* EXPERIENCE */}

                        {isWorker && (

                            <section className="mt-8">

                                <h3 className="text-lg font-semibold mb-4">

                                    Experience

                                </h3>

                                {experience?.disability?.knowledge?.length ?

                                    <div className="flex flex-wrap gap-2">

                                        {experience.disability.knowledge.map(
                                            (item: string, i: number) => (

                                                <Badge key={i}>

                                                    {item}

                                                </Badge>

                                            ))

                                        }

                                    </div>

                                    :

                                    <p className="text-muted-foreground">

                                        No experience listed

                                    </p>

                                }

                            </section>

                        )}

                        {/* WORK */}

                        {isWorker && (

                            <section className="mt-8">

                                <h3 className="text-lg font-semibold mb-4">

                                    Work history

                                </h3>

                                {workHistory.length ?

                                    workHistory.map((w: any) => (

                                        <div
                                            key={w._id}
                                            className="border p-3 mb-2 rounded"
                                        >

                                            <div>

                                                {w.jobTitle ?? 'Job'}

                                            </div>

                                            <div className="text-sm text-muted-foreground">

                                                {w.organisation ?? ''}

                                            </div>

                                        </div>

                                    ))

                                    :

                                    <p className="text-muted-foreground">

                                        No work history

                                    </p>

                                }

                            </section>

                        )}

                        {/* EDUCATION */}

                        {isWorker && (

                            <section className="mt-8">

                                <h3 className="text-lg font-semibold mb-4">

                                    Education

                                </h3>

                                {education.length ?

                                    education.map((e: any) => (

                                        <div
                                            key={e._id}
                                            className="border p-3 mb-2 rounded"
                                        >

                                            <div>

                                                {e.institution ?? ''}

                                            </div>

                                            <div className="text-sm text-muted-foreground">

                                                {e.course ?? ''}

                                            </div>

                                        </div>

                                    ))

                                    :

                                    <p className="text-muted-foreground">

                                        No education

                                    </p>

                                }

                            </section>

                        )}

                    </div>

                </div>

            </div>

        </div>

    );
}