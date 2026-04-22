'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { createJob } from '@/redux/slices/jobsSlice';
import { formatDateToInputValue, inputValueToISO } from '@/lib/dateHelpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
    Plus, Trash2, ChevronLeft, Loader2, Clock, MapPin, CalendarDays, LayoutList, ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const TIME_GROUPS = [
    { label: 'Morning', startTime: '07:00', endTime: '12:00' },
    { label: 'Afternoon', startTime: '12:00', endTime: '17:00' },
    { label: 'Evening', startTime: '17:00', endTime: '21:00' },
    { label: 'Night', startTime: '21:00', endTime: '23:00' },
];

const SESSION_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 10, 14, 20, 30];
const HOURS_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 16, 20, 24, 30, 40];

type Period = { startTime: string; endTime: string };
type SessionDay = { day: string; period: Period[] };

interface SupportDetail {
    name: string;
    description: string;
}

interface FormState {
    title: string;
    startDate: Date | undefined;
    frequency: string;
    location: { line1: string; suburb: string; state: string; postalCode: string };
    duration: { session: number; hours: number };
    supportDetails: SupportDetail[];
    jobSessions: SessionDay[];
    preference: { gender: string; others: string[] };
    jobSessionByClient: boolean;
    preferredWorkerType?: string;
    // hourlyRate: number;
}

const PREFERENCE_OPTIONS = ['non-smoker', 'experienced', 'has-car', 'pet-friendly', 'bilingual'];

export function RequiredLabel({ children }: { children: React.ReactNode }) {
    return (
        <Label className="flex items-center gap-1">
            {children}
            <span className="text-destructive font-semibold">*</span>
        </Label>
    );
}

export default function NewJobPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { user } = useAppSelector((s) => s.auth);
    const services = useAppSelector((s) => s.services.items).filter(svc => svc.status === true);
    const { loading, error } = useAppSelector((s) => s.jobs);



    const [form, setForm] = useState<FormState>({
        title: '',
        startDate: undefined,
        frequency: 'weekly',
        location: { line1: '', suburb: '', state: '', postalCode: '' },
        duration: { session: 1, hours: 2 },
        supportDetails: [],
        jobSessions: [],
        preference: { gender: '', others: [] },
        jobSessionByClient: false,
        preferredWorkerType: undefined,
        // hourlyRate: 0
    });

    // New: toggle for job sessions
    const [enableJobSessions, setEnableJobSessions] = useState(false);

    const [newDetailInput, setNewDetailInput] = useState<Record<number, string>>({});
    const [serviceInput, setServiceInput] = useState('');
    const [otherInput, setOtherInput] = useState('');
    const [submitError, setSubmitError] = useState<string | null>(null);

    /* ── helpers ── */
    const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
        setForm((p) => ({ ...p, [key]: value }));

    const setLocation = (k: keyof FormState['location'], v: string) =>
        setForm((p) => ({ ...p, location: { ...p.location, [k]: v } }));

    const setDuration = (k: keyof FormState['duration'], v: number) =>
        setForm((p) => ({ ...p, duration: { ...p.duration, [k]: v } }));

    /* ── support details ── */
    const addSupportDetail = (serviceName: string) => {
        if (!serviceName.trim()) return;
        if (form.supportDetails.some((s) => s.name === serviceName)) return;

        // Initialize with empty description
        setField('supportDetails', [
            ...form.supportDetails,
            { name: serviceName, description: '' }
        ]);
    };

    const removeSupportDetail = (idx: number) => {
        setField('supportDetails', form.supportDetails.filter((_, i) => i !== idx));
    };

    /* ── sessions ── */
    const toggleDay = (day: string) => {
        const exists = form.jobSessions.find((s) => s.day === day);
        if (exists) {
            setField('jobSessions', form.jobSessions.filter((s) => s.day !== day));
        } else {
            setField('jobSessions', [...form.jobSessions, { day, period: [{ startTime: '09:00', endTime: '11:00' }] }]);
        }
    };

    const addPeriod = (day: string) => {
        setField('jobSessions', form.jobSessions.map((s) =>
            s.day === day ? { ...s, period: [...s.period, { startTime: '09:00', endTime: '11:00' }] } : s
        ));
    };

    const removePeriod = (day: string, pIdx: number) => {
        setField('jobSessions', form.jobSessions.map((s) =>
            s.day === day ? { ...s, period: s.period.filter((_, i) => i !== pIdx) } : s
        ));
    };

    const updatePeriod = (day: string, pIdx: number, field: 'startTime' | 'endTime', val: string) => {
        setField('jobSessions', form.jobSessions.map((s) =>
            s.day === day
                ? { ...s, period: s.period.map((p, i) => i === pIdx ? { ...p, [field]: val } : p) }
                : s
        ));
    };

    /* ── preferences ── */
    const togglePreference = (opt: string) => {
        const others = form.preference.others.includes(opt)
            ? form.preference.others.filter((o) => o !== opt)
            : [...form.preference.others, opt];
        setField('preference', { ...form.preference, others });
    };

    const addCustomPreference = () => {
        const v = otherInput.trim();
        if (!v || form.preference.others.includes(v)) return;
        setField('preference', { ...form.preference, others: [...form.preference.others, v] });
        setOtherInput('');
    };

    /* ── submit ── */
    const handleSubmit = async () => {
        setSubmitError(null);
        if (!form.title.trim()) { setSubmitError('Job title is required.'); return; }
        if (!form.startDate) { setSubmitError('Start date is required.'); return; }
        if (!form.frequency) { setSubmitError('Frequency is required.'); return; }
        if (!form.supportDetails || form.supportDetails.length === 0) { setSubmitError('Add at least one support service.'); return; }
        // Only require jobSessions if schedule is enabled
        if (form.jobSessions.length === 0) {
            setSubmitError('Add at least one job session day.');
            return;
        }
        const clientId = (user as any)?._id ?? (user as any)?.id ?? '';

        // Set jobSessionByClient to true if enabled, else false
        const jobSessionByClient = true;

        const payload = {
            title: form.title.trim(),
            // hourlyRate: form.hourlyRate,
            startDate: inputValueToISO(form.startDate),
            frequency: form.frequency,
            location: form.location,
            duration: form.duration,
            client: clientId,
            supportDetails: form.supportDetails.map(s => ({
                name: s.name,
                description: s.description
            })),
            jobSessions: form.jobSessions,
            preference: {
                gender: form.preference.gender || undefined,
                others: form.preference.others,
            },
            jobSessionByClient,
            preferredWorkerType: form.preferredWorkerType,
        };

        const result = await dispatch(createJob(payload));
        if (createJob.fulfilled.match(result)) {
            router.push('/client/jobs');
        } else {
            setSubmitError((result.payload as string) || 'Failed to create job. Please try again.');
        }
        return;
    };

    return (
        <div className="max-w-2xl mx-auto space-y-0 pb-20">
            {/* Back + Title */}
            <div className="flex items-center gap-3 py-6">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1 -ml-2 cursor-pointer">
                    <ChevronLeft className="h-4 w-4" /> Back
                </Button>
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Create Job Posting</h1>
                    <p className="text-sm text-muted-foreground">Fill in the details to find the right support worker</p>
                </div>
            </div>

            {submitError && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md font-medium mb-4">{submitError}</div>
            )}

            {/* ── 1. Basic Info ── */}
            <Section icon={<LayoutList className="h-4 w-4" />} title="Basic Information">
                <div className="space-y-4">
                    <div>
                        <RequiredLabel>Job Title</RequiredLabel>
                        <Textarea
                            className="mt-1.5 resize-none"
                            rows={2}
                            value={form.title}
                            onChange={(e) => setField('title', e.target.value)}
                            placeholder="e.g. Personal Support Worker Needed — describe the role briefly"
                        />
                    </div>
                    {/* */}
                    {/* <div>
                        <Label>Hourly Rate ($)</Label>
                        <Input
                            type="number"
                            className="mt-1.5"
                            value={form.hourlyRate}
                            onChange={(e) => setField('hourlyRate', Number(e.target.value))}
                        />
                    </div> */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <RequiredLabel>Start Date</RequiredLabel>
                            <DatePicker
                                className="w-full mt-1.5"
                                value={formatDateToInputValue(form.startDate)}
                                onChange={(d) => setField('startDate', d ?? undefined)}
                            />
                        </div>
                        <div>
                            <RequiredLabel>Frequency</RequiredLabel>
                            <Select value={form.frequency} onValueChange={(v) => setField('frequency', v)}>
                                <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {/* <SelectItem value="daily">Daily</SelectItem> */}
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="fortnightly">Fortnightly</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="as-needed">As Needed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <RequiredLabel>Sessions per period</RequiredLabel>
                            <Select value={String(form.duration.session)} onValueChange={(v) => setDuration('session', Number(v))}>
                                <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {SESSION_OPTIONS.map((n) => (
                                        <SelectItem key={n} value={String(n)}>{n} session{n > 1 ? 's' : ''}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <RequiredLabel>Total hours per period</RequiredLabel>
                            <Select value={String(form.duration.hours)} onValueChange={(v) => setDuration('hours', Number(v))}>
                                <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {HOURS_OPTIONS.map((n) => (
                                        <SelectItem key={n} value={String(n)}>{n} hr{n > 1 ? 's' : ''}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label>Preferred Worker Type</Label>
                            <Select value={form.preferredWorkerType} onValueChange={(v) => setField('preferredWorkerType', v)}>
                                <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {/* <SelectItem value="daily">Daily</SelectItem> */}
                                    <SelectItem value="ndisProvider">Ndis Provider</SelectItem>
                                    <SelectItem value="individualSupportWorker">Individual Support Worker</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </Section>

            {/* ── 2. Location ── */}
            <Section icon={<MapPin className="h-4 w-4" />} title="Location">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                        <RequiredLabel>Address Line 1</RequiredLabel>
                        <Input className="mt-1.5" value={form.location.line1} onChange={(e) => setLocation('line1', e.target.value)} placeholder="123 Main Street" />
                    </div>
                    <div className="sm:col-span-2">
                        <Label>Suburb</Label>
                        <Input className="mt-1.5" value={form.location.suburb} onChange={(e) => setLocation('suburb', e.target.value)} placeholder="Sydney" />
                    </div>
                    <div>
                        <RequiredLabel>State</RequiredLabel>
                        <Input className="mt-1.5" value={form.location.state} onChange={(e) => setLocation('state', e.target.value)} placeholder="NSW" />
                    </div>
                    <div>
                        <RequiredLabel>Postal Code</RequiredLabel>
                        <Input className="mt-1.5" value={form.location.postalCode} onChange={(e) => setLocation('postalCode', e.target.value)} placeholder="2000" />
                    </div>
                </div>
            </Section>

            {/* ── 3. Support Services ── */}
            <Section
                icon={<ShieldCheck className="h-4 w-4" />}
                title="Add Service Details"
                description="Add services and a description for each"
            >
                {/* Add new service */}
                <div className="flex flex-col gap-2 mb-4">
                    <RequiredLabel>Service</RequiredLabel>
                    <div className='flex flex-row gap-2'>

                        <Input
                            placeholder="Service title…"
                            value={serviceInput}
                            onChange={(e) => setServiceInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (serviceInput.trim()) {
                                        addSupportDetail(serviceInput.trim());
                                        setServiceInput('');
                                    }
                                }
                            }}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                if (serviceInput.trim()) {
                                    addSupportDetail(serviceInput.trim());
                                    setServiceInput('');
                                }
                            }}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                </div>

                {form.supportDetails.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No services added yet.</p>
                ) : (
                    <div className="space-y-3">
                        {form.supportDetails.map((svc, svcIdx) => (
                            <div key={svcIdx} className="border rounded p-3">
                                {/* Service title + remove */}
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium lg:text-base md:text-[15px] text-sm">{svc.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeSupportDetail(svcIdx)}
                                        className="text-destructive hover:opacity-70"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Single description textarea */}
                                <div>
                                    <Label className="text-xs text-muted-foreground mb-1">Description</Label>
                                    <Textarea
                                        placeholder="Describe this service…"
                                        className='lg:text-sm md:text-[13px] text-xs'
                                        value={svc.description}
                                        onChange={(e) => {
                                            const updated = [...form.supportDetails];
                                            updated[svcIdx] = { ...updated[svcIdx], description: e.target.value };
                                            setField('supportDetails', updated);
                                        }}
                                        rows={3}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Section>

            {/* ── 4. Schedule ── */}
            <Section icon={<CalendarDays className="h-4 w-4" />} title="Schedule" description="Pick days, then choose a time group or set custom times">
                {/* <div className="flex items-center gap-3 mb-4">
                    <Switch checked={enableJobSessions} onCheckedChange={setEnableJobSessions} id="enable-job-sessions" />
                    <Label htmlFor="enable-job-sessions" className="text-sm">I want to specify job session times</Label>
                </div> */}
                {/* {enableJobSessions && (
                    <> */}
                <div className="flex flex-col gap-2 mb-5">
                    <RequiredLabel>Days</RequiredLabel>
                    <div className='flex flex-wrap gap-2'>
                        {DAYS.map((day) => {
                            const active = form.jobSessions.some((s) => s.day === day);
                            return (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => toggleDay(day)}
                                    className={cn(
                                        'px-3 py-1.5 rounded-full text-sm border-2 capitalize transition-all cursor-pointer',
                                        active
                                            ? 'border-[#6cc5e8] bg-primary/10 text-[#6cc5e8] font-medium'
                                            : 'border-2 border-gray-300 bg-muted/30 text-gray-400 hover:border-gray-400'
                                    )}
                                >
                                    {day.slice(0, 3)}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-4">
                    {form.jobSessions.map((session) => (
                        <div key={session.day} className="pb-4 border-b last:border-b-0">
                            {/* Day header */}
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-medium capitalize text-sm flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5 text-primary" />{session.day}
                                </span>
                                <Button type="button" variant="ghost" size="sm" onClick={() => addPeriod(session.day)} className="gap-1 text-xs h-7 px-2">
                                    <Plus className="h-3 w-3" /> Add Slot
                                </Button>
                            </div>

                            {session.period.map((p, pIdx) => (
                                <div key={pIdx} className="mb-3">
                                    {/* Quick time-group picker */}
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                        {TIME_GROUPS.map((tg) => {
                                            const active = p.startTime === tg.startTime && p.endTime === tg.endTime;
                                            return (
                                                <button
                                                    key={tg.label}
                                                    type="button"
                                                    onClick={() => {
                                                        updatePeriod(session.day, pIdx, 'startTime', tg.startTime);
                                                        updatePeriod(session.day, pIdx, 'endTime', tg.endTime);
                                                    }}
                                                    className={cn(
                                                        'px-2.5 py-0.5 rounded text-xs border transition-all cursor-pointer',
                                                        active
                                                            ? 'border-primary bg-primary/10 text-primary font-medium'
                                                            : 'border-border text-muted-foreground hover:border-primary/40'
                                                    )}
                                                >
                                                    {tg.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {/* Custom from/to in 2 columns */}
                                    <div className="grid grid-cols-2 gap-3 items-end">
                                        <div>
                                            <Label className="text-xs text-muted-foreground">From</Label>
                                            <Input type="time" value={p.startTime} onChange={(e) => updatePeriod(session.day, pIdx, 'startTime', e.target.value)} className="mt-1 text-sm" />
                                        </div>
                                        <div className="flex gap-2 items-end">
                                            <div className="flex-1">
                                                <Label className="text-xs text-muted-foreground">To</Label>
                                                <Input type="time" value={p.endTime} onChange={(e) => updatePeriod(session.day, pIdx, 'endTime', e.target.value)} className="mt-1 text-sm" />
                                            </div>
                                            {session.period.length > 1 && (
                                                <button type="button" onClick={() => removePeriod(session.day, pIdx)} className="mb-0.5 text-destructive hover:opacity-70">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                {/* </>
                )} */}
            </Section>

            {/* ── 5. Preferences ── */}
            <Section title="Worker Preferences" description="Optional preferences for the ideal support worker">
                <div className="space-y-5">
                    {/* Gender + Custom input side by side */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label>Preferred Gender</Label>
                            <Select
                                value={form.preference.gender || 'none'}
                                onValueChange={(v) => setField('preference', { ...form.preference, gender: v === 'none' ? '' : v })}
                            >
                                <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="No preference" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No preference</SelectItem>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Add Preference (languages, religion, etc)</Label>
                            <div className="flex gap-2 mt-1.5">
                                <Input
                                    placeholder="e.g. Mandarin, Buddhist, Hindi, "
                                    value={otherInput}
                                    onChange={(e) => setOtherInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomPreference(); } }}
                                    className="text-sm"
                                />
                                <Button type="button" variant="outline" size="sm" onClick={addCustomPreference} className="shrink-0">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Other preferences as chip toggles */}
                    <div>
                        <Label className="mb-2 block text-xs text-muted-foreground uppercase tracking-wide">Quick picks</Label>
                        <div className="flex flex-wrap gap-2">
                            {PREFERENCE_OPTIONS.map((opt) => {
                                const on = form.preference.others.includes(opt);
                                return (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => togglePreference(opt)}
                                        className={cn(
                                            'px-3 py-1 rounded-full text-sm border capitalize transition-all cursor-pointer select-none',
                                            on
                                                ? 'bg-primary/10 text-primary border-primary font-medium'
                                                : 'bg-transparent text-muted-foreground border-border hover:border-primary/50'
                                        )}
                                    >
                                        {on && <span className="mr-1">✓</span>}{opt}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Active preference tags */}
                    {form.preference.others.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {form.preference.others.map((o) => (
                                <Badge key={o} variant="secondary" className="gap-1 capitalize text-sm px-2.5 py-1">
                                    {o}
                                    <button type="button" onClick={() => togglePreference(o)} className="ml-1 hover:text-destructive leading-none">×</button>
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            </Section>

            {/* Submit */}
            <div className="pt-6 flex justify-between items-center mt-2">
                <Button variant="ghost" onClick={() => router.back()} className="cursor-pointer text-muted-foreground">Cancel</Button>
                <Button onClick={handleSubmit} disabled={loading} className="gap-2 cursor-pointer px-8">
                    {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Creating…</> : 'Post Job'}
                </Button>
            </div>
        </div>
    );
}

/* ── Section wrapper — flat, no card ── */
function Section({ icon, title, description, children }: {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="py-6 border-b last:border-b-0">
            <div className="flex items-center gap-2 mb-1">
                {icon && <span className="text-primary">{icon}</span>}
                <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            </div>
            {description && <p className="text-xs text-muted-foreground mb-4">{description}</p>}
            <div className="mt-3">{children}</div>
        </div>
    );
}
