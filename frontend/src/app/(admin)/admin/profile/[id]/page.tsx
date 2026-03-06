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
    Activity,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import Link from 'next/link';
import { getuserbyid, approveUser, fetchUsers } from '@/redux/slices/usersSlice';
import { useAppDispatch } from '@/hooks/redux';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const getUserId = (user: any): string => user?.id || user?._id || '';

export default function PublicProfilePage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const { selectedUser, loading: isUserLoading, error, items: allUsers } = useSelector((state: RootState) => state.users);
    const dispatch = useAppDispatch();
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(getuserbyid(id));
        }
    }, [dispatch, id]);

    // Ensure users list is loaded for prev/next navigation
    useEffect(() => {
        if (allUsers.length === 0) {
            dispatch(fetchUsers(undefined));
        }
    }, [dispatch, allUsers.length]);

    // Find current user index and navigation (handle both id and _id from MongoDB)
    const currentUserIndex = allUsers.findIndex(u => getUserId(u) === id);
    const canGoPrevious = currentUserIndex > 0;
    const canGoNext = currentUserIndex >= 0 && currentUserIndex < allUsers.length - 1;
    const previousUserId = canGoPrevious ? getUserId(allUsers[currentUserIndex - 1]) : null;
    const nextUserId = canGoNext ? getUserId(allUsers[currentUserIndex + 1]) : null;

    const handleVerifyUser = async () => {
        if (!user) return;
        setIsVerifying(true);
        try {
            const result = await dispatch(approveUser({ 
                userId: id, 
                approved: !user.approved 
            })).unwrap();
            dispatch(getuserbyid(id));
        } catch (error: any) {
        } finally {
            setIsVerifying(false);
        }
    };

    if (isUserLoading) return (
        <div className="p-8 text-center bg-background min-h-screen flex flex-col items-center justify-center">
            <p className="text-muted-foreground mb-4">Loading profile...</p>
        </div>
    );

    if (error) return (
        <div className="p-8 text-center bg-background min-h-screen flex flex-col items-center justify-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => router.push('/admin/users')}>Back to Users</Button>
        </div>
    );

    if (!selectedUser) return (
        <div className="p-8 text-center bg-background min-h-screen flex flex-col items-center justify-center">
            <p className="text-muted-foreground mb-4">Profile not found</p>
            <Button onClick={() => router.push('/admin/users')}>Back to Users</Button>
        </div>
    );

    const user = selectedUser.user || selectedUser;
    const profile = (selectedUser as any).profile || null;

    const formatTime = (time: string) => {
        if (!time) return '';
        const [h, m] = time.split(':').map(Number);
        const ampm = h >= 12 ? 'pm' : 'am';
        const h12 = h % 12 || 12;
        return `${h12}${ampm}`;
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
        <div className="min-h-screen bg-background">
            {/* Top Navigation Bar */}
            <div className="border-b border-border px-6 py-4 flex items-center justify-between">
                <Link href="/admin/users" className="flex items-center text-sm font-medium text-foreground hover:text-muted-foreground transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to users
                </Link>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">Admin Profile View</span>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => previousUserId && router.push(`/admin/profile/${previousUserId}`)}
                            disabled={!canGoPrevious}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => nextUserId && router.push(`/admin/profile/${nextUserId}`)}
                            disabled={!canGoNext}
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Clean Header */}
            <div className="border-b border-border pt-8 pb-8 px-6 sm:px-12">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8">
                    <div className="relative">
                        <Avatar className="h-32 w-32 border-2 border-border">
                            <AvatarImage src={profile?.personalDetails?.avatar?.url || user?.avatar || ''} />
                            <AvatarFallback className="text-3xl font-semibold bg-muted text-muted-foreground">
                                {user?.firstName?.[0] || (user?.name?.[0] ?? '?')}{user?.lastName?.[0] ?? ''}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-3">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            <h1 className="text-3xl font-bold text-foreground">{user?.firstName} {user?.lastName ?? ''}</h1>
                            <div className="flex gap-2">
                                {user?.approved && (
                                    <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Verified
                                    </Badge>
                                )}
                            </div>
                        </div>
                        {profile?.experienceSummary?.disability?.description ? (
                            <p className="text-lg text-muted-foreground">
                                {profile.experienceSummary.disability.description}
                            </p>
                        ) : null}
                    </div>
                </div>
            </div>

            {/* Page Body */}
            <div className="max-w-7xl mx-auto">
                <div className="">

                    {/* About Section */}
                    <div className="p-6 md:p-8 border-b border-border">
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-foreground">About {user?.firstName || user?.name || 'the worker'}</h2>
                            {profile?.personalDetails?.bio ? (
                                <p className="text-sm text-muted-foreground leading-relaxed max-w-4xl">
                                    {profile.personalDetails.bio}
                                </p>
                            ) : null}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Left Column */}
                        <div className="p-6 md:p-8 border-r border-border">

                            {/* Preferred Hours */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-foreground">Preferred hours</h3>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                                    Support sessions don't need to fill each time slot completely.
                                </p>
                                {(profile?.updatedAt || user?.updatedAt) && (
                                    <Badge variant="outline" className="mb-6 text-xs">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {new Date(profile?.updatedAt || user?.updatedAt).toLocaleDateString()}
                                    </Badge>
                                )}

                                <div className="space-y-4">
                                    {days.map((day) => {
                                        const dayData = profile?.availability?.[day.toLowerCase()];
                                        return (
                                            <div key={day} className="flex flex-col gap-2">
                                                <span className="text-sm font-medium text-foreground">{day}</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {dayData?.available && dayData.times?.length > 0 ? (
                                                        dayData.times.map((t: any, i: number) => (
                                                            <Badge key={i} variant="secondary" className="text-xs font-normal">
                                                                <Check className="h-3 w-3 mr-1" />
                                                                {formatTime(t.startTime)}-{formatTime(t.endTime)}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">No availability set</span>
                                                    )}
                                                </div>
                                                <Separator className="my-1" />
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>

                            {/* Indicative Rates */}
                            <section className="space-y-4 mt-8">
                                <h3 className="text-lg font-semibold text-foreground">Indicative rates</h3>
                                <div className="space-y-4">
                                    {profile?.freeMeetAndGreet ? (
                                        <div className="flex items-center justify-between py-2">
                                            <span className="text-sm font-medium text-foreground">Meet & greet</span>
                                            <span className="text-lg font-semibold text-green-600 dark:text-green-400">Free</span>
                                        </div>
                                    ) : null}
                                    <div className="space-y-2">
                                        {profile?.rates && profile.rates.length > 0 ? (
                                            <div className="grid grid-cols-1 gap-2">
                                                {profile.rates.map((r: any) => (
                                                    <div key={r._id} className="flex items-center justify-between rounded-md p-3 border border-border bg-muted">
                                                        <div className="text-sm font-medium text-foreground">{r.name}</div>
                                                        <div className="text-base font-semibold text-foreground">${r.rate}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-sm text-muted-foreground">No rates provided</div>
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* Verification List */}
                            <section className="mt-8">
                                <h3 className="text-lg font-semibold text-foreground mb-3">Verification and safeguards</h3>
                                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                                    We ensure every support worker is checked and verified to provide a trusted and safe experience.
                                </p>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Working with Children Check (WA)', icon: Users, status: profile?.personalDetails?.wwcc?.file?.url ? 'check' : 'pending', sub: profile?.personalDetails?.wwcc?.expiryDate ? `Expires on ${new Date(profile.personalDetails.wwcc?.expiryDate).toLocaleDateString()}` : undefined, fileUrl: profile?.personalDetails?.wwcc?.file?.url },
                                        { label: 'First aid certificate', icon: Activity, status: profile?.personalDetails?.additionalTraining?.firstAid?.file?.url ? 'check' : 'pending', fileUrl: profile?.personalDetails?.additionalTraining?.firstAid?.file?.url },
                                        { label: 'Driver\'s license (Australia)', icon: Car, status: profile?.personalDetails?.additionalTraining?.driverLicense?.file?.url ? 'check' : 'pending', fileUrl: profile?.personalDetails?.additionalTraining?.driverLicense?.file?.url },
                                   
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start gap-3 p-3 rounded-md border border-border">
                                            <div className="mt-1">
                                                {item.status === 'check' ? (
                                                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                ) : item.status === 'info' ? (
                                                    <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                ) : (
                                                    <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                                                )}
                                            </div>
                                            <div className="space-y-1 w-full">
                                                <div className="flex items-center gap-3">
                                                    <item.icon className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                                                    {item.fileUrl && (
                                                        <div className="ml-auto flex items-center gap-2">
                                                            {item.fileUrl.endsWith('.pdf') ? (
                                                                <a href={item.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">View PDF</a>
                                                            ) : (
                                                                <img src={item.fileUrl} alt={item.label} className="h-12 w-12 rounded object-cover border" />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                {item.sub && <p className="text-xs text-muted-foreground ml-7">{item.sub}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Right Column */}
                        <div className="p-6 md:p-8 space-y-8">

                            {/* Services Offered */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-foreground">Services offered</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {profile?.services && profile.services.length > 0 ? (
                                        profile.services.map((service: string, i: number) => (
                                            <div key={i} className="flex items-center gap-2 p-3 border border-border rounded-md bg-muted">
                                                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-400" />
                                                <span className="text-sm font-medium text-foreground">{service}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-sm text-muted-foreground">No services listed</div>
                                    )}
                                </div>
                            </section>

                            {/* Immunisation Section */}
                            <section>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-semibold text-foreground">Immunisation</h3>
                                </div>
                                <div className="space-y-1 p-3 border border-border rounded-md bg-muted">
                                    <p className="text-sm font-medium text-foreground">COVID-19 vaccine – Self-declared</p>
                                    {profile?.immunisation?.statusConfirmed ? (
                                        <p className="text-xs text-muted-foreground">{profile.immunisation.covidVaccineStatus || 'Declared'}</p>
                                    ) : null}
                                </div>
                            </section>

                            {/* Experience Section */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-foreground">Experience</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Self-declared</p>
{(profile?.experienceSummary?.disability?.experience?.length || profile?.experienceSummary?.disability?.description) && (
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {user?.firstName || user?.name}
                                                {profile.experienceSummary.disability.experience?.length ? ` has experience: ${profile.experienceSummary.disability.experience.join(', ')}` : ''}
                                                {profile.experienceSummary.disability.description ? (profile.experienceSummary.disability.experience?.length ? ' — ' : ' ') + profile.experienceSummary.disability.description : ''}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-3 p-4 border border-border rounded-md">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-semibold text-foreground">Disability</span>
                                        </div>
                                        <div className="pl-6 space-y-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground uppercase tracking-wide">Personal experience</span>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Main experience:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {profile?.experienceSummary?.disability?.knowledge?.map((item: string, i: number) => (
                                                        <Badge key={i} variant="secondary" className="text-xs font-normal">{item}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Work and Education History Section */}
                            <section>
                                <h3 className="text-lg font-semibold text-foreground mb-4">Work and education history</h3>
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-sm font-semibold text-foreground mb-3">Work History</h4>
                                        {profile?.workHistory && profile.workHistory.length > 0 ? (
                                            <div className="space-y-2">
                                                {profile.workHistory.map((w: any) => (
                                                    <div key={w._id} className="p-3 border border-border rounded-md bg-muted">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div>
                                                                <div className="font-medium text-foreground">{w.jobTitle}</div>
                                                                <div className="text-sm text-muted-foreground">{w.organisation}</div>
                                                            </div>
                                                            <div className="text-xs text-muted-foreground text-right">
                                                                {w.startDate ? new Date(w.startDate).toLocaleDateString() : ''} {w.currentlyWorkingHere ? '– Present' : (w.endDate ? `– ${new Date(w.endDate).toLocaleDateString()}` : '')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-sm text-muted-foreground">No work history provided</div>
                                        )}
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-semibold text-foreground mb-3">Education & Training</h4>
                                        {profile?.educationAndTraining && profile.educationAndTraining.length > 0 ? (
                                            <div className="space-y-2">
                                                {profile.educationAndTraining.map((e: any) => (
                                                    <div key={e._id} className="p-3 border border-border rounded-md bg-muted">
                                                        <div className="font-medium text-foreground">{e.institution}</div>
                                                        <div className="text-sm text-muted-foreground">{e.course}</div>
                                                        <div className="text-xs text-muted-foreground mt-1">{e.startDate ? new Date(e.startDate).toLocaleDateString() : ''} {e.currentlyStudyingHere ? '– Present' : (e.endDate ? `– ${new Date(e.endDate).toLocaleDateString()}` : '')}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-sm text-muted-foreground">No education/training records</div>
                                        )}
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>

            {/* Verify User Button Section */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-foreground mb-1">User Verification</h3>
                            <p className="text-sm text-muted-foreground">Verify this user to grant them approved status</p>
                        </div>
                        <Button
                            onClick={handleVerifyUser}
                            disabled={isVerifying}
                            variant={user?.approved ? "outline" : "default"}
                            className={user?.approved ? "" : "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"}
                        >
                            {isVerifying ? "Processing..." : (user?.approved ? "Remove Verification" : "Verify User")}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
