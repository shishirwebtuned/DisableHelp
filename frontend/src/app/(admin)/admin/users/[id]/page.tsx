'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft, Mail, Phone, ChevronLeft, ChevronRight } from 'lucide-react';

import { RootState } from '@/redux/store';
import { getuserbyid, approveUser, fetchUsers } from '@/redux/slices/usersSlice';
import { useAppDispatch } from '@/hooks/redux';
import WorkerProfile from '@/app/profile/[id]/WorkerProfile';
import ClientProfile from '@/app/profile/[id]/ClientProfile';


const getUserId = (user: any): string => user?.id || user?._id || '';


// Helper to detect if navigation should scroll to bottom
function getScrollToBottomFlag() {
    if (typeof window === 'undefined') return false;
    return window.location.hash === '#scroll-bottom';
}

export default function AdminProfilePage() {
    const approvalSectionRef = useRef<HTMLDivElement>(null);
    const params = useParams();
    const router = useRouter();
    const dispatch = useAppDispatch();

    const id = params?.id as string;

    const {
        selectedUser,
        loading: isUserLoading,
        error,
        items: allUsers,
    } = useSelector((state: RootState) => state.users);

    const [isApproving, setIsApproving] = useState(false);


    // ── fetch current profile ────────────────────────────────────────────────
    useEffect(() => {
        if (id) dispatch(getuserbyid(id));
    }, [dispatch, id]);

    // Scroll to approval section if hash is #scroll-bottom
    useEffect(() => {
        if (getScrollToBottomFlag() && approvalSectionRef.current) {
            // Wait for render
            setTimeout(() => {
                approvalSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 350);
        }
    }, [selectedUser]);

    // ── ensure user list is loaded for prev / next navigation ───────────────
    useEffect(() => {
        if (allUsers.length === 0) dispatch(fetchUsers(undefined));
    }, [dispatch, allUsers.length]);

    // ── normalise the two possible shapes the slice can return ──────────────
    const user = selectedUser?.user ?? selectedUser ?? null;
    const profile = selectedUser?.profile ?? null;


    const navigableUsers = allUsers.filter(u => u.role === 'worker' || u.role === 'client');
    const currentIndex = navigableUsers.findIndex(u => getUserId(u) === id); const canGoPrev = currentIndex > 0;
    const canGoNext = currentIndex >= 0 && currentIndex < allUsers.length - 1;
    const prevId = canGoPrev ? getUserId(allUsers[currentIndex - 1]) : null;
    const nextId = canGoNext ? getUserId(allUsers[currentIndex + 1]) : null;

    // ── approve / unapprove ──────────────────────────────────────────────────
    const handleApprove = async () => {
        if (!user) return;
        setIsApproving(true);
        try {
            await dispatch(approveUser({ userId: id, approved: !user.approved })).unwrap();
            dispatch(getuserbyid(id)); // refresh badge in header
        } finally {
            setIsApproving(false);
        }
    };

    // ── shared derived values ────────────────────────────────────────────────
    const firstName = user?.firstName ?? '';
    const lastName = user?.lastName ?? '';
    const fullName = `${firstName} ${lastName}`.trim() || 'Unknown user';
    const role = user?.role ?? '';

    /* ── loading / error / not-found guards ─────────────────────────────── */

    if (isUserLoading)
        return (
            <div className="p-8 text-center min-h-screen flex items-center justify-center">
                <p className="text-muted-foreground">Loading profile...</p>
            </div>
        );

    if (error)
        return (
            <div className="p-8 text-center min-h-screen flex flex-col items-center justify-center">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={() => router.push('/admin/users')}>Back to Users</Button>
            </div>
        );

    if (!user)
        return (
            <div className="p-8 text-center min-h-screen flex flex-col items-center justify-center">
                <p className="text-muted-foreground mb-4">Profile not found</p>
                <Button onClick={() => router.push('/admin/users')}>Back to Users</Button>
            </div>
        );

    /* ── role → component map ────────────────────────────────────────────── */

    const renderRoleBody = () => {
        switch (role) {
            case 'worker':
                return <WorkerProfile user={user} profile={profile} />;
            case 'client':
                return <ClientProfile user={user} profile={profile} />;
            // case 'admin':
            //     return <AdminProfile user={user} profile={profile} />;
            default:
                return (
                    <div className="p-6 text-muted-foreground text-sm">
                        No profile view available for role:{' '}
                        <span className="font-medium">{role || 'unknown'}</span>
                    </div>
                );
        }
    };

    /* ── UI ─────────────────────────────────────────────────────────────── */

    return (
        <div className="min-h-screen bg-background">

            {/* ── Top nav: back + admin label + prev/next ── */}
            <div className="border-b px-6 py-4 flex items-center justify-between">
                <Link
                    href="/admin/users"
                    className="flex items-center text-sm font-medium hover:text-muted-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to users
                </Link>

                <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                        Admin Profile View
                    </span>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!canGoPrev}
                            onClick={() => prevId && router.push(`/admin/profile/${prevId}`)}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!canGoNext}
                            onClick={() => nextId && router.push(`/admin/profile/${nextId}`)}
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── Shared header (identical to PublicProfilePage) ── */}
            <div className="border-b pt-8 pb-8 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8">

                    <Avatar className="h-24 w-24 md:h-28 md:w-28 lg:h-32 lg:w-32">
                        <AvatarImage
                            src={
                                profile?.personalDetails?.avatar?.url ??
                                profile?.avatar?.url ??
                                ''
                            }
                        />
                        <AvatarFallback className="lg:text-3xl md:text-2xl text-xl">
                            {firstName?.[0] ?? '?'}
                            {lastName?.[0] ?? ''}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 text-center md:text-left space-y-2">

                        {/* Name + status badges */}
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
                            <Mail className="h-3.5 w-3.5 md:w-4 md:h-4" />
                            {user?.email}
                        </div>
                        <div className="flex items-center gap-2 md:text-[13px] text-xs lg:text-sm text-muted-foreground">
                            <Phone className="h-3.5 w-3.5 md:w-4 md:h-4" />
                            {user?.phoneNumber || 'No phone number provided'}
                        </div>

                        {/* Gender */}
                        <div className="flex flex-row items-center gap-1 md:text-[13px] text-xs lg:text-sm text-muted-foreground">
                            <span>Gender:</span>
                            <span className="text-gray-600 capitalize">{profile?.gender ?? '—'}</span>
                        </div>

                        {/* Role + provider type badges */}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge className="bg-blue-100 px-2 py-1 shadow-sm text-blue-700 capitalize">
                                Role: {role}
                            </Badge>

                            {role === 'worker' && (
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

            {/* ── Admin-only: Approve / Unapprove ── */}
            <div ref={approvalSectionRef} className="max-w-7xl mx-auto px-6 py-8">
                <div className="bg-card border rounded-lg p-6">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h3 className="text-base md:text-lg font-semibold mb-1">User Verification</h3>
                            <p className="text-xs md:text-sm text-muted-foreground">
                                {user?.approved
                                    ? 'This user is currently approved. You can revoke approval below.'
                                    : 'Approve this user to grant them full access.'}
                            </p>
                        </div>
                        <Button
                            onClick={handleApprove}
                            disabled={isApproving}
                            className={
                                user?.approved
                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                    : 'bg-green-600 hover:bg-green-700 text-white'
                            }
                        >
                            {isApproving
                                ? 'Processing…'
                                : user?.approved
                                    ? 'Remove Approval (suspend)'
                                    : 'Approve User'
                            }
                        </Button>
                    </div>
                </div>
            </div>

        </div>
    );
}