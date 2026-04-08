'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';

import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft, Mail, Phone } from 'lucide-react';

import { RootState } from '@/redux/store';
import { getuserbyid } from '@/redux/slices/usersSlice';
import { useAppDispatch } from '@/hooks/redux';
import WorkerProfile from './WorkerProfile';
import ClientProfile from './ClientProfile';

export default function PublicProfilePage() {
    const params = useParams();
    const router = useRouter();
    const dispatch = useAppDispatch();

    const id = params?.id as string;

    const { selectedUser, loading: isUserLoading, error } = useSelector(
        (state: RootState) => state.users
    );

    useEffect(() => {
        if (id) dispatch(getuserbyid(id));
    }, [dispatch, id]);

    // ── normalise the two possible shapes the slice can return ──
    const user = selectedUser?.user ?? selectedUser ?? null;
    const profile = selectedUser?.profile ?? null;

    // ── shared derived values ──
    const firstName = user?.firstName ?? '';
    const lastName = user?.lastName ?? '';
    const fullName = `${firstName} ${lastName}`.trim() || 'Unknown user';
    const role = user?.role ?? '';

    /* ── loading / error / not-found guards ── */

    if (isUserLoading)
        return (
            <div className="p-8 text-center min-h-screen flex items-center justify-center">
                <p className="text-muted-foreground">Loading profile...</p>
            </div>
        );

    if (error)
        return (
            <div className="p-8 text-center min-h-screen">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={() => router.back()}>Back</Button>
            </div>
        );

    if (!user)
        return (
            <div className="p-8 text-center min-h-screen">
                <p className="text-muted-foreground mb-4">Profile not found</p>
                <Button onClick={() => router.back()}>Back</Button>
            </div>
        );

    /* ── role → component map ──
       Add a new entry here whenever you create a new role component.      */
    const renderRoleBody = () => {
        switch (role) {
            case 'worker':
                return <WorkerProfile user={user} profile={profile} />;

            case 'client':
                return <ClientProfile user={user} profile={profile} />;

            default:
                return (
                    <div className="p-6 text-muted-foreground text-sm">
                        No profile view available for role: <span className="font-medium">{role || 'unknown'}</span>
                    </div>
                );
        }
    };

    /* ── UI ── */

    return (
        <div className="min-h-screen bg-background">

            {/* Back nav */}
            <div className="border-b px-6 py-4 flex items-center">
                <p
                    onClick={() => router.back()}
                    className="flex items-center text-sm font-medium cursor-pointer"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </p>
            </div>

            {/* ── Shared header (same for every role) ── */}
            <div className="border-b pt-8 pb-8 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8">

                    <Avatar className="h-24 w-24 md:h-28 md:w-28 lg:h-32 lg:w-32">
                        {role === 'worker' ? (<AvatarImage
                            src={
                                profile?.personalDetails?.avatar?.url ??
                                user?.avatar ??
                                ''
                            }
                        />
                        ) : (
                            <AvatarImage
                                src={
                                    profile?.avatar?.url ??
                                    user?.avatar ??
                                    ''
                                }
                            />
                        )}
                        <AvatarImage
                            src={
                                profile?.personalDetails?.avatar?.url ??
                                user?.avatar ??
                                ''
                            }
                        />
                        <AvatarFallback className="lg:text-3xl md:text-2xl text-xl">
                            {firstName?.[0] ?? '?'}
                            {lastName?.[0] ?? ''}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 text-center md:text-left space-y-2">

                        {/* Name + approval badges */}
                        <div className="flex flex-wrap gap-3 items-center">
                            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">{fullName}</h1>

                            {user?.approved && (
                                <Badge className="bg-green-100 border-2 border-green-100 text-green-700">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Approved
                                </Badge>
                            )}

                            {user?.isVerified && (
                                <Badge className="border-2 border-green-600 text-green-600">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Verified
                                </Badge>
                            )}
                        </div>

                        {/* Contact */}
                        <div className="flex items-center gap-2 md:text-[13px] text-xs lg:text-sm text-muted-foreground">
                            <Mail className="h-3.5 w-3.5 md:w-4 md:h-4 lg:w-4.5 lg:h-4.5" />
                            {user?.email}
                        </div>
                        {/* <div className="flex items-center gap-2 md:text-[13px] text-xs lg:text-sm text-muted-foreground">
                            <Phone className="h-3.5 w-3.5 md:w-4 md:h-4 lg:w-4.5 lg:h-4.5" />
                            {user?.phoneNumber || 'No phone number provided'}
                        </div> */}

                        {/* Gender */}
                        <div className="flex flex-row items-center gap-1 md:text-[13px] text-xs lg:text-sm text-muted-foreground">
                            <h2>Gender:</h2>
                            <p className="text-gray-600 capitalize">{profile?.gender ?? '—'}</p>
                        </div>

                        {/* Role + provider type badges */}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            {/* <Badge className="bg-blue-100 px-2 py-1 shadow-sm text-blue-700 capitalize">
                                Role: {role}
                            </Badge> */}

                            {/* Only show provider badge for roles that have it */}
                            {(role === 'worker') && (
                                <Badge className="bg-indigo-100 px-2 py-1 shadow-sm text-indigo-700">
                                    {user?.isNdisProvider ? 'NDIS Provider' : 'Individual Worker'}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Role-specific body ── */}
            <div className="max-w-7xl mx-auto">
                {renderRoleBody()}
            </div>
        </div>
    );
}