'use client';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    MapPinCheckInside,
    Phone,
    Users,
    Heart,
    Bell,
    BellOff,
    ShieldAlert,
} from 'lucide-react';

// ─── types ────────────────────────────────────────────────────────────────────

interface ClientProfileProps {
    user: any;
    profile: any; // IClientProfile shape
}

// ─── component ────────────────────────────────────────────────────────────────

export default function ClientProfile({ user, profile }: ClientProfileProps) {

    const firstName = user?.firstName ?? '';

    // IClientProfile fields
    const carePreferences: string[] = profile?.carePreferences ?? [];
    const participants: any[] = profile?.participants ?? [];
    const emergencyContact = profile?.emergencyContact ?? null;

    const receiveAgreementsEmails = profile?.receiveAgreementsEmails ?? false;
    const receiveEventDeliveriesEmails = profile?.receiveEventDeliveriesEmails ?? false;
    const receivePlannedSessionReminders = profile?.receivePlannedSessionReminderEmails ?? false;

    const address = user?.address
        ? `${user.address.line1}, ${user.address.suburb ? `${user.address.suburb}, ` : ''}${user.address.state}, ${user.address.postalCode}`
        : null;

    // ── notification rows ──
    const notificationRows = [
        { label: 'Agreements', enabled: receiveAgreementsEmails },
        { label: 'Event deliveries', enabled: receiveEventDeliveriesEmails },
        { label: 'Planned session reminders', enabled: receivePlannedSessionReminders },
    ];

    return (
        <>
            {/* ── ABOUT ── */}
            <div className="p-6 border-b">
                <h2 className="md:text-lg text-[17px] lg:text-xl font-semibold mb-2">
                    About {firstName || 'client'}
                </h2>

                {address && (
                    <div className="flex items-center gap-2 mt-1">
                        <MapPinCheckInside className="h-3 w-3 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4 text-green-500" />
                        <p className="lg:text-sm md:text-[13px] text-xs text-gray-600">{address}</p>
                    </div>
                )}

                {/* Care Preferences */}
                <div className="mt-4">
                    <h3 className="md:text-[15px] text-sm lg:text-base font-semibold mb-2">
                        Care Preferences
                    </h3>
                    {carePreferences.length ? (
                        <div className="flex flex-wrap gap-2">
                            {carePreferences.map((pref, i) => (
                                <Badge key={i} className="bg-purple-50 border-2 border-purple-300 text-purple-700 py-1 px-2">
                                    {pref}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm">No care preferences listed</p>
                    )}
                </div>
            </div>

            {/* ── GRID ── */}
            <div className="grid lg:grid-cols-2">

                {/* ── LEFT col ── */}
                <div className="p-6 border-r">

                    {/* Participants */}
                    <section>
                        <h3 className="lg:text-lg md:text-[17px] text-base font-semibold mb-3 flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            Participants
                        </h3>

                        {participants.length ? (
                            <div className="space-y-2">
                                {participants.map((p: any, i: number) => {
                                    // participant may be a populated user object or just an ObjectId string
                                    const name = p?.firstName
                                        ? `${p.firstName} ${p.lastName ?? ''}`.trim()
                                        : p?.toString?.() ?? `Participant ${i + 1}`;
                                    const email = p?.email ?? null;
                                    return (
                                        <div
                                            key={p?._id ?? i}
                                            className="flex justify-between items-center border lg:text-base md:text-[13px] text-xs md:p-2.5 p-2 lg:p-3 rounded"
                                        >
                                            <span className="font-medium">{name}</span>
                                            {email && (
                                                <span className="text-muted-foreground text-xs">{email}</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-xs md:text-sm text-muted-foreground">No participants linked</p>
                        )}
                    </section>

                    <Separator className="my-5" />

                    {/* Emergency Contact */}
                    <section>
                        <h3 className="lg:text-lg md:text-[17px] text-base font-semibold mb-3 flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                            Emergency Contact
                        </h3>

                        {emergencyContact?.name || emergencyContact?.phone || emergencyContact?.relationship ? (
                            <div className="border rounded md:p-2.5 p-2 lg:p-3 space-y-1.5">
                                {emergencyContact.name && (
                                    <div className="flex justify-between lg:text-base md:text-[13px] text-xs">
                                        <span className="text-muted-foreground">Name</span>
                                        <span className="font-medium">{emergencyContact.name}</span>
                                    </div>
                                )}
                                {emergencyContact.relationship && (
                                    <div className="flex justify-between lg:text-base md:text-[13px] text-xs">
                                        <span className="text-muted-foreground">Relationship</span>
                                        <span className="font-medium capitalize">{emergencyContact.relationship}</span>
                                    </div>
                                )}
                                {emergencyContact.phone && (
                                    <div className="flex justify-between lg:text-base md:text-[13px] text-xs">
                                        <span className="text-muted-foreground">Phone</span>
                                        <span className="font-medium flex items-center gap-1">
                                            <Phone className="h-3 w-3" />
                                            {emergencyContact.phone}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-xs md:text-sm text-muted-foreground">No emergency contact provided</p>
                        )}
                    </section>
                </div>

                {/* ── RIGHT col ── */}
                <div className="px-6 mt-2 pb-4">

                    {/* Email Notification Preferences */}
                    <section>
                        <h3 className="md:text-[17px] text-base lg:text-lg font-semibold mb-3 flex items-center gap-2">
                            <Bell className="h-4 w-4 text-muted-foreground" />
                            Email Notifications
                        </h3>

                        <div className="space-y-2">
                            {notificationRows.map(({ label, enabled }) => (
                                <div
                                    key={label}
                                    className="flex items-center justify-between border lg:text-base md:text-[13px] text-xs md:p-2.5 p-2 lg:p-3 rounded"
                                >
                                    <span>{label}</span>
                                    {enabled ? (
                                        <Badge className="bg-green-100 border-2 border-green-200 text-green-700 flex items-center gap-1 text-[10px] md:text-[11px] lg:text-xs">
                                            <Bell className="h-2.5 w-2.5" />
                                            Enabled
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-gray-100 border-2 border-gray-200 text-gray-500 flex items-center gap-1 text-[10px] md:text-[11px] lg:text-xs">
                                            <BellOff className="h-2.5 w-2.5" />
                                            Disabled
                                        </Badge>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                </div>
            </div>
        </>
    );
}