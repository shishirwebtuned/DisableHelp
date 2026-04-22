'use client';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Activity, Car, Check, CheckCircle, FileText, MapPinCheckInside, ShieldCheck, Users } from 'lucide-react';

interface WorkerProfileProps {
    user: any;
    profile: any;
}

const formatTime = (time: string) => {
    if (!time) return '';
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'pm' : 'am';
    const h12 = h % 12 || 12;
    return `${h12}${ampm}`;
};

const DAYS = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday',
    'Friday', 'Saturday', 'Sunday',
];

export default function WorkerProfile({ user, profile }: WorkerProfileProps) {

    const firstName = user?.firstName ?? '';

    const bio = profile?.personalDetails?.bio ?? '';
    const services = profile?.services ?? [];
    const rates = profile?.rates ?? [];
    const availability = profile?.availability ?? {};
    const workHistory = profile?.workHistory ?? [];
    const education = profile?.educationAndTraining ?? [];
    const experience = profile?.experienceSummary ?? {};
    const languages = [
        ...(profile?.languages?.firstLanguages ?? []),
        ...(profile?.languages?.secondLanguages ?? []),
    ];
    const aboutMe = profile?.aboutMe ?? {};
    const interests = profile?.interests ?? [];

    // const address = user?.address
    //     ? `${user.address.line1}, ${user.address.suburb ? `${user.address.suburb}, ` : ''}${user.address.state}, ${user.address.postalCode}`
    //     : null;

    return (
        <>
            {/* ── ABOUT ── */}
            <div className="p-6 border-b">
                <h2 className="md:text-lg text-[17px] lg:text-xl font-semibold mb-2">
                    About {firstName || 'worker'}
                </h2>

                {bio && (
                    <p className="lg:text-sm md:text-[13px] text-xs text-muted-foreground">
                        {bio}
                    </p>
                )}

                {/* {address && (
                    <div className="flex items-center gap-2 mt-1">
                        <MapPinCheckInside className="h-3 w-3 md:h-3.5 md:w-3.5 lg:h-4.5 lg:w-4.5 text-green-500" />
                        <p className="lg:text-sm md:text-[13px] text-xs text-gray-600">{address}</p>
                    </div>
                )} */}

                {/* Languages */}
                <div className="mt-4">
                    <h3 className="md:text-[15px] text-sm lg:text-base font-semibold mb-2">Languages</h3>
                    {languages.length ? (
                        <div className="flex flex-wrap gap-2">
                            {languages.map((lang: string, i: number) => (
                                <Badge key={i} className="border-2 border-blue-500 text-blue-500">{lang}</Badge>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm">No languages listed</p>
                    )}
                </div>

                {/* About Me */}
                <section className="mt-4">
                    <h3 className="md:text-[15px] text-sm lg:text-base font-semibold mb-2">About Me</h3>
                    {aboutMe?.nonSmoker || aboutMe?.petFriendly || aboutMe?.personality ? (
                        <div className="flex flex-wrap gap-2">
                            {aboutMe.nonSmoker && (
                                <Badge className="border-2 border-red-500 text-red-600">Non-smoker</Badge>
                            )}
                            {aboutMe.petFriendly && (
                                <Badge className="border-2 border-green-500 text-green-600">Pet friendly</Badge>
                            )}
                            {aboutMe.personality && (
                                <Badge className="border-2 border-cyan-500 text-cyan-600">
                                    {aboutMe.personality.replace(/^./, (c: string) => c.toUpperCase())}
                                </Badge>
                            )}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm">No details provided</p>
                    )}
                </section>

                {/* Services summary */}
                <div className="mt-4">
                    <h3 className="md:text-[15px] text-sm lg:text-base font-semibold mb-2">Services</h3>
                    {services.length ? (
                        <div className="flex flex-wrap gap-2">
                            {services.map((service: string, i: number) => (
                                <Badge key={i} className="bg-gray-200 py-1 px-2 rounded-sm shadow-md text-gray-700">
                                    {service}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm">No services listed</p>
                    )}
                </div>

                {/* Interests */}
                <div className="mt-4">
                    <h3 className="md:text-[15px] text-sm lg:text-base font-semibold mb-2">Interests</h3>
                    {interests.length ? (
                        <div className="flex flex-wrap gap-2">
                            {interests.map((interest: string, i: number) => (
                                <Badge key={i} className="bg-gray-200 py-1 px-2 rounded-sm shadow-md text-gray-700">
                                    {interest}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm">No interests listed</p>
                    )}
                </div>
            </div>

            {/* ── GRID ── */}
            <div className="grid lg:grid-cols-2">

                {/* LEFT col */}
                <div className="p-6 border-r">

                    {/* Availability */}
                    <section>
                        <h3 className="lg:text-lg md:text-[17px] text-base font-semibold mb-4">
                            Preferred hours
                        </h3>
                        <div className="space-y-4">
                            {DAYS.map(day => {
                                const dayData = availability?.[day.toLowerCase()] ?? { available: false, times: [] };
                                return (
                                    <div key={day}>
                                        <div className="lg:text-sm md:text-[13px] text-xs mb-1 font-medium">{day}</div>
                                        <div className="flex gap-2 flex-wrap">
                                            {dayData?.times?.length ? (
                                                dayData.times.map((t: any, i: number) => (
                                                    <Badge key={i} variant="secondary">
                                                        <Check className="h-3 w-3 mr-1" />
                                                        {formatTime(t.startTime)}-{formatTime(t.endTime)}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-xs text-muted-foreground">No availability</span>
                                            )}
                                        </div>
                                        <Separator className="mt-2" />
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Rates */}
                    <section className="mt-6">
                        <h3 className="lg:text-lg md:text-[17px] text-base font-semibold mb-2">
                            Indicative rates
                        </h3>
                        {rates.length ? (
                            rates.map((r: any) => (
                                <div
                                    key={r._id}
                                    className="flex justify-between lg:text-base md:text-[13px] text-xs md:p-2.5 p-2 lg:p-3 border rounded mb-2"
                                >
                                    <span>{r.name ?? 'Rate'}</span>
                                    <span>${r.rate ?? 0}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs md:text-sm text-muted-foreground">No rates</p>
                        )}
                    </section>

                    {/* Verification */}
                    <section className="mt-4">
                        <h3 className="md:text-[17px] text-base lg:text-lg font-semibold mb-2">Verification</h3>
                        <div className="space-y-3">
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
                                ...(profile?.personalDetails?.additionalDocuments?.map((doc: any) => ({
                                    label: doc.name,
                                    icon: FileText,
                                    status: doc.file?.url ? 'check' : 'pending',
                                    sub: doc.expiryDate ? 'Expires on ' + new Date(doc.expiryDate).toLocaleDateString() : undefined,
                                    fileUrl: doc.file?.url,
                                })) ?? []),
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-3 md:p-2.5 p-2 lg:p-3 rounded-md border border-border">
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
                                            <span className="lg:text-sm md:text-xs text-xs font-medium text-foreground">{item.label}</span>
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

                {/* RIGHT col */}
                <div className="px-6 mt-2">

                    {/* Services detail */}
                    <section>
                        <h3 className="md:text-[17px] text-base lg:text-lg font-semibold mb-2">Services</h3>
                        {services.length ? (
                            <div className="grid sm:grid-cols-2 gap-2">
                                {services.map((service: string, i: number) => (
                                    <div
                                        key={i}
                                        className="border lg:text-sm md:text-[13px] text-xs md:p-2.5 p-2 lg:p-3 rounded"
                                    >
                                        {service}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">No services</p>
                        )}
                    </section>

                    {/* Experience */}
                    <section className="mt-4">
                        <h3 className="md:text-[17px] text-base lg:text-lg font-semibold mb-2">Experience</h3>
                        {Object.entries(experience ?? {}).length ? (
                            Object.entries(experience ?? {}).map(([category, data]: any) => {
                                if (!data?.description && !data?.experience?.length && !data?.knowledge?.length)
                                    return null;
                                return (
                                    <div key={category} className="border p-3 rounded mb-2">
                                        <div className="font-medium lg:text-base md:text-[15px] text-sm capitalize mb-2">
                                            {category}
                                        </div>
                                        {data?.description && (
                                            <p className="md:text-[13px] text-xs lg:text-sm text-muted-foreground mb-2">
                                                {data.description}
                                            </p>
                                        )}
                                        {data?.experience?.length > 0 && (
                                            <div className="mb-2">
                                                <div className="text-xs text-muted-foreground mb-1">Experience</div>
                                                <div className="flex gap-2 flex-wrap">
                                                    {data.experience.map((exp: string, i: number) => (
                                                        <Badge key={i} variant="secondary">{exp}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {data?.knowledge?.length > 0 && (
                                            <div>
                                                <div className="text-xs text-muted-foreground mb-1">Knowledge</div>
                                                <div className="flex gap-2 flex-wrap">
                                                    {data.knowledge.map((item: string, i: number) => (
                                                        <Badge key={i}>{item}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-muted-foreground">No experience listed</p>
                        )}
                    </section>

                    {/* Work history */}
                    <section className="mt-4">
                        <h3 className="md:text-[17px] text-base lg:text-lg font-semibold mb-2">Work history</h3>
                        {workHistory.length ? (
                            workHistory.map((w: any) => (
                                <div key={w._id} className="border lg:text-base md:text-[15px] text-sm p-3 mb-2 rounded">
                                    <div>{w.jobTitle ?? 'Job'}</div>
                                    <div className="lg:text-sm md:text-[13px] text-xs text-muted-foreground">
                                        {w.organisation ?? ''}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground lg:text-base md:text-[15px] text-sm">No work history</p>
                        )}
                    </section>

                    {/* Education */}
                    <section className="mt-4 pb-4">
                        <h3 className="md:text-[17px] text-base lg:text-lg font-semibold mb-2">Education</h3>
                        {education.length ? (
                            education.map((e: any) => (
                                <div key={e._id} className="border lg:text-base md:text-[15px] text-sm p-3 mb-2 rounded">
                                    <div>{e.institution ?? ''}</div>
                                    <div className="lg:text-sm md:text-[13px] text-xs text-muted-foreground">
                                        {e.course ?? ''}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground lg:text-base md:text-[15px] text-sm">No education</p>
                        )}
                    </section>
                </div>
            </div>
        </>
    );
}