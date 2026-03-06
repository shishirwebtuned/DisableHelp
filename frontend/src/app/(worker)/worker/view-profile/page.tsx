'use client';
import { useRouter } from 'next/navigation';
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
    Globe,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import Loading from '@/components/ui/loading';
import Link from 'next/link';

export default function PublicProfilePage() {
    const router = useRouter();
    const { mee, isLoading: isAuthLoading } = useSelector((state: RootState) => state.auth);

    if (isAuthLoading) return <Loading />;
    if (!mee || !mee.user) return (
        <div className="p-8 text-center bg-background min-h-screen flex flex-col items-center justify-center">
            <p className="text-muted-foreground mb-4 font-medium">Profile not found</p>
            <Button onClick={() => router.push('/worker')} variant="outline">Back to Dashboard</Button>
        </div>
    );

    const { user, profile } = mee;

    const formatTime = (time: string) => {
        if (!time) return '';
        const [h] = time.split(':').map(Number);
        const ampm = h >= 12 ? 'pm' : 'am';
        const h12 = h % 12 || 12;
        return `${h12}${ampm}`;
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
        <div className="min-h-screen bg-background">
            {/* Top Navigation Bar */}
            <div className="border-b border-border px-6 py-4 flex items-center justify-between">
                <Link
                    href="/worker/profile"
                    className="flex items-center text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Edit Profile
                </Link>
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Globe className="h-3.5 w-3.5" />
                    Public Preview
                </div>
            </div>

            {/* Header */}
            <div className="border-b border-border pt-8 pb-8 px-6 sm:px-12">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8">
                    <Avatar className="h-32 w-32 border-2 border-border">
                        <AvatarImage src={profile?.personalDetails?.avatar?.url} />
                        <AvatarFallback className="text-3xl font-semibold bg-muted text-muted-foreground">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 text-center md:text-left space-y-3">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            <h1 className="text-3xl font-bold text-foreground">{user.firstName} {user.lastName}</h1>
                            <div className="flex gap-2">
                                {user.isVerified && (
                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200  dark:text-green-400 dark:border-green-800">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Verified
                                    </Badge>
                                )}
                                <Badge variant="outline">Worker</Badge>
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
                {/* About */}
                <div className="p-6 md:p-8 border-b border-border">
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground">About {user.firstName}</h2>
                        {profile?.personalDetails?.bio ? (
                            <p className="text-sm text-muted-foreground leading-relaxed max-w-4xl">
                                {profile.personalDetails.bio}
                            </p>
                        ) : (
                            <p className="text-sm text-muted-foreground">No bio provided.</p>
                        )}
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
                                Support sessions do not need to fill each time slot completely.
                            </p>
                            {profile?.updatedAt && (
                                <Badge variant="outline" className="mb-6 text-xs">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {new Date(profile.updatedAt).toLocaleDateString()}
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
                                        <span className="text-sm font-medium text-foreground">Meet and greet</span>
                                        <span className="text-lg font-semibold text-green-600 dark:text-green-400">Free</span>
                                    </div>
                                ) : null}
                                {profile?.rates && profile.rates.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-2">
                                        {profile.rates.map((r: any, i: number) => (
                                            <div key={r._id ?? i} className="flex items-center justify-between rounded-md p-3 border border-border bg-muted">
                                                <div className="text-sm font-medium text-foreground">{r.name}</div>
                                                <div className="text-base font-semibold text-foreground">${r.rate}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground">No rates provided</div>
                                )}
                            </div>
                        </section>

                        {/* Verification and Safeguards */}
                        <section className="mt-8">
                            <h3 className="text-lg font-semibold text-foreground mb-3">Verification and safeguards</h3>
                            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                                We ensure every support worker is checked and verified to provide a trusted and safe experience.
                            </p>
                            <div className="space-y-4">
                                {[
                                    {
                                        label: 'Working with Children Check (WA)',
                                        icon: Users,
                                        status: profile?.personalDetails?.wwcc?.file?.url ? 'check' : 'pending',
                                        sub: profile?.personalDetails?.wwcc?.expiryDate ? 'Expires on ' + new Date(profile.personalDetails.wwcc.expiryDate).toLocaleDateString() : undefined,
                                        fileUrl: profile?.personalDetails?.wwcc?.file?.url,
                                    },
                                    {
                                        label: 'First aid certificate',
                                        icon: Activity,
                                        status: profile?.personalDetails?.additionalTraining?.firstAid?.file?.url ? 'check' : 'pending',
                                        fileUrl: profile?.personalDetails?.additionalTraining?.firstAid?.file?.url,
                                    },
                                    {
                                        label: "Driver's license (Australia)",
                                        icon: Car,
                                        status: profile?.personalDetails?.additionalTraining?.driverLicense?.file?.url ? 'check' : 'pending',
                                        fileUrl: profile?.personalDetails?.additionalTraining?.driverLicense?.file?.url,
                                    },
                                    {
                                        label: 'NDIS Worker Screening',
                                        icon: ShieldCheck,
                                        status: profile?.ndisWorkerScreening?.status === 'active' ? 'check' : 'pending',
                                        fileUrl: undefined,
                                    },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-md border border-border">
                                        <div className="mt-1">
                                            {item.status === 'check' ? (
                                                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            ) : (
                                                <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                                            )}
                                        </div>
                                        <div className="space-y-1 w-full">
                                            <div className="flex items-center gap-3">
                                                <item.icon className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm font-medium text-foreground">{item.label}</span>
                                                {item.fileUrl && (
                                                    <div className="ml-auto">
                                                        {item.fileUrl.endsWith('.pdf') ? (
                                                            <a href={item.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">View PDF</a>
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
                        {/* Services */}
                        <section>
                            <h3 className="text-lg font-semibold text-foreground mb-4">Services offered</h3>
                            {profile?.services && profile.services.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {profile.services.map((service: string, i: number) => (
                                        <div key={i} className="flex items-center gap-2 p-3 border border-border rounded-md bg-muted">
                                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-400" />
                                            <span className="text-sm font-medium text-foreground">{service}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">No services listed</div>
                            )}
                        </section>

                        {/* Immunisation */}
                        <section>
                            <h3 className="text-lg font-semibold text-foreground mb-3">Immunisation</h3>
                            <div className="space-y-1 p-3 border border-border rounded-md bg-muted">
                                <p className="text-sm font-medium text-foreground">COVID-19 vaccine - Self-declared</p>
                                {profile?.immunisation?.statusConfirmed ? (
                                    <p className="text-xs text-muted-foreground">{profile.immunisation.covidVaccineStatus || 'Declared'}</p>
                                ) : null}
                            </div>
                        </section>

                        {/* Experience */}
                        <section>
                            <h3 className="text-lg font-semibold text-foreground mb-4">Experience</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Self-declared</p>
                                    {(profile?.experienceSummary?.disability?.experience?.length || profile?.experienceSummary?.disability?.description) && (
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {user.firstName}
                                            {profile.experienceSummary.disability.experience?.length
                                                ? ' has experience: ' + profile.experienceSummary.disability.experience.join(', ')
                                                : ''}
                                            {profile.experienceSummary.disability.description
                                                ? (profile.experienceSummary.disability.experience?.length ? ' - ' : ' ') + profile.experienceSummary.disability.description
                                                : ''}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-3 p-4 border border-border rounded-md">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-semibold text-foreground">Disability</span>
                                    </div>
                                    <div className="pl-6 space-y-3">
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

                        {/* Work and Education History */}
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
                                                            {w.startDate ? new Date(w.startDate).toLocaleDateString() : ''}
                                                            {w.currentlyWorkingHere ? ' - Present' : (w.endDate ? ' - ' + new Date(w.endDate).toLocaleDateString() : '')}
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
                                    <h4 className="text-sm font-semibold text-foreground mb-3">Education and Training</h4>
                                    {profile?.educationAndTraining && profile.educationAndTraining.length > 0 ? (
                                        <div className="space-y-2">
                                            {profile.educationAndTraining.map((e: any) => (
                                                <div key={e._id} className="p-3 border border-border rounded-md bg-muted">
                                                    <div className="font-medium text-foreground">{e.institution}</div>
                                                    <div className="text-sm text-muted-foreground">{e.course}</div>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {e.startDate ? new Date(e.startDate).toLocaleDateString() : ''}
                                                        {e.currentlyStudyingHere ? ' - Present' : (e.endDate ? ' - ' + new Date(e.endDate).toLocaleDateString() : '')}
                                                    </div>
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
    );
}