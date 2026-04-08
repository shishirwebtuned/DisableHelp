'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchJobById, updateJobThunk, setSelectedJob } from '@/redux/slices/jobsSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, ChevronLeft, Loader2, Clock, MapPin, CalendarDays, LayoutList, ShieldCheck } from 'lucide-react';
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
const PREFERENCE_OPTIONS = ['non-smoker', 'experienced', 'has-car', 'pet-friendly', 'bilingual'];

type Period = { startTime: string; endTime: string };
type SessionDay = { day: string; period: Period[] };
interface SupportDetail { name: string; description: string; }
interface FormState {
    title: string;
    startDate: Date | undefined;
    frequency: string;
    location: { line1: string; line2: string; state: string; postalCode: string };
    duration: { session: number; hours: number };
    supportDetails: SupportDetail[];
    jobSessions: SessionDay[];
    preference: { gender: string; others: string[] };
    jobSessionByClient: boolean;
    preferredWorkerType?: string;
    // hourlyRate: number;
}

export default function EditJobPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { id } = useParams<{ id: string }>();
    const { user } = useAppSelector((s) => s.auth);
    const { selectedJob, loading } = useAppSelector((s) => s.jobs);

    const [form, setForm] = useState<FormState>({
        title: '',
        startDate: undefined,
        frequency: 'weekly',
        location: { line1: '', line2: '', state: '', postalCode: '' },
        duration: { session: 1, hours: 2 },
        supportDetails: [],
        jobSessions: [],
        preference: { gender: '', others: [] },
        jobSessionByClient: false,
        preferredWorkerType: undefined,
        // hourlyRate: 0
    });
    const [enableJobSessions, setEnableJobSessions] = useState(false);
    const [otherInput, setOtherInput] = useState('');
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [prefilled, setPrefilled] = useState(false);

    useEffect(() => {
        setPrefilled(false);
        dispatch(setSelectedJob(null));
        if (id) {
            dispatch(fetchJobById(id));
        }
        return () => {
            dispatch(setSelectedJob(null));
        };
    }, [dispatch, id]);

    useEffect(() => {
        if (!selectedJob || prefilled) return;
        const job = selectedJob as any;
        const rawLoc = job.location;
        const loc = rawLoc && typeof rawLoc === 'object' && 'line1' in rawLoc
            ? rawLoc
            : { line1: '', line2: '', state: '', postalCode: '' };
        const jobSessions = job.jobSessions ?? [];
        setForm({
            title: job.title ?? '',
            startDate: job.startDate ? new Date(job.startDate) : undefined,
            frequency: job.frequency ?? 'weekly',
            location: loc,
            duration: job.duration ?? { session: 1, hours: 2 },
            supportDetails: job.supportDetails ?? [],
            jobSessions,
            preference: job.preference ?? { gender: '', others: [] },
            jobSessionByClient: job.jobSessionByClient ?? false,
            preferredWorkerType: job.preferredWorkerType ?? undefined,
            // hourlyRate: job.hourlyRate ?? 0
        });
        setEnableJobSessions(job.jobSessionByClient ?? (jobSessions.length > 0));
        setPrefilled(true);
    }, [selectedJob, prefilled]);

    const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
        setForm((p) => ({ ...p, [key]: value }));
    const setLocation = (k: keyof FormState['location'], v: string) =>
        setForm((p) => ({ ...p, location: { ...p.location, [k]: v } }));
    const setDuration = (k: keyof FormState['duration'], v: number) =>
        setForm((p) => ({ ...p, duration: { ...p.duration, [k]: v } }));

    const toggleDay = (day: string) => {
        const exists = form.jobSessions.find((s) => s.day === day);
        if (exists) {
            setField('jobSessions', form.jobSessions.filter((s) => s.day !== day));
        } else {
            setField('jobSessions', [...form.jobSessions, { day, period: [{ startTime: '09:00', endTime: '11:00' }] }]);
        }
    };
    const addPeriod = (day: string) =>
        setField('jobSessions', form.jobSessions.map((s) =>
            s.day === day ? { ...s, period: [...s.period, { startTime: '09:00', endTime: '11:00' }] } : s));
    const removePeriod = (day: string, pIdx: number) =>
        setField('jobSessions', form.jobSessions.map((s) =>
            s.day === day ? { ...s, period: s.period.filter((_, i) => i !== pIdx) } : s));
    const updatePeriod = (day: string, pIdx: number, field: 'startTime' | 'endTime', val: string) =>
        setField('jobSessions', form.jobSessions.map((s) =>
            s.day === day
                ? { ...s, period: s.period.map((p, i) => i === pIdx ? { ...p, [field]: val } : p) }
                : s));

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


    const handleSubmit = async () => {
        setSubmitError(null);
        if (!form.title.trim()) { setSubmitError('Job title is required.'); return; }
        if (!form.startDate) { setSubmitError('Start date is required.'); return; }
        if (form.supportDetails.length === 0) { setSubmitError('Add at least one support service.'); return; }
        // Only require jobSessions if schedule is enabled
        if (enableJobSessions && form.jobSessions.length === 0) {
            setSubmitError('Add at least one job session day.');
            return;
        }

        const clientId = (user as any)?._id ?? (user as any)?.id ?? '';
        const jobSessionByClient = enableJobSessions;
        const payload = {
            title: form.title.trim(),
            startDate: form.startDate.toISOString(),
            frequency: form.frequency,
            location: form.location,
            duration: form.duration,
            client: clientId,
            supportDetails: form.supportDetails,
            jobSessions: enableJobSessions ? form.jobSessions : [],
            preference: { gender: form.preference.gender || undefined, others: form.preference.others },
            jobSessionByClient,
            preferredWorkerType: form.preferredWorkerType,
            // hourlyRate: form.hourlyRate,
        };

        const result = await dispatch(updateJobThunk({ id, jobData: payload }));
        if (updateJobThunk.fulfilled.match(result)) {
            // Refetch the updated job to ensure state is fresh
            await dispatch(fetchJobById(id));
            router.push('/client/jobs');
        } else {
            setSubmitError((result.payload as string) || 'Failed to update job. Please try again.');
        }
    };

    if (loading && !prefilled) {
        return (
            <div className="flex items-center justify-center min-h-[40vh]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-0 pb-20">
            <div className="flex items-center gap-3 py-6">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1 -ml-2 cursor-pointer">
                    <ChevronLeft className="h-4 w-4" /> Back
                </Button>
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Edit Job Posting</h1>
                    <p className="text-sm text-muted-foreground">Update the details for this listing</p>
                </div>
            </div>

            {submitError && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md font-medium mb-4">{submitError}</div>
            )}

            <Section icon={<LayoutList className="h-4 w-4" />} title="Basic Information">
                <div className="space-y-4">
                    <div>
                        <Label>Job Title <span className="text-destructive">*</span></Label>
                        <Textarea className="mt-1.5 resize-none" rows={2} value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="e.g. Personal Support Worker Needed" />
                    </div>
                    {/* hourly Rate */}
                    {/* <div>
                        <Label>Hourly Rate</Label>
                        <Input type="number" className="mt-1.5" value={form.hourlyRate} onChange={(e) => setField('hourlyRate', Number(e.target.value))} placeholder="e.g. 25.00" />
                    </div> */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label>Start Date <span className="text-destructive">*</span></Label>
                            <DatePicker className="w-full mt-1.5" value={form.startDate ? form.startDate.toISOString().split('T')[0] : ''} onChange={(d) => setField('startDate', d ?? undefined)} />
                        </div>
                        <div>
                            <Label>Frequency</Label>
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
                            <Label>Sessions per period</Label>
                            <Select value={String(form.duration.session)} onValueChange={(v) => setDuration('session', Number(v))}>
                                <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {SESSION_OPTIONS.map((n) => (<SelectItem key={n} value={String(n)}>{n} session{n > 1 ? 's' : ''}</SelectItem>))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Total hours per period</Label>
                            <Select value={String(form.duration.hours)} onValueChange={(v) => setDuration('hours', Number(v))}>
                                <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {HOURS_OPTIONS.map((n) => (<SelectItem key={n} value={String(n)}>{n} hr{n > 1 ? 's' : ''}</SelectItem>))}
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
                                    <SelectItem value="ndisProvider">Ndis Provider</SelectItem>
                                    <SelectItem value="individualSupportWorker">Individual Support Worker</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </Section>

            <Section icon={<MapPin className="h-4 w-4" />} title="Location">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                        <Label>Address Line 1</Label>
                        <Input className="mt-1.5" value={form.location.line1} onChange={(e) => setLocation('line1', e.target.value)} placeholder="123 Main Street" />
                    </div>
                    <div className="sm:col-span-2">
                        <Label>Address Line 2</Label>
                        <Input className="mt-1.5" value={form.location.line2} onChange={(e) => setLocation('line2', e.target.value)} placeholder="Apartment 4B" />
                    </div>
                    <div>
                        <Label>State</Label>
                        <Input className="mt-1.5" value={form.location.state} onChange={(e) => setLocation('state', e.target.value)} placeholder="NSW" />
                    </div>
                    <div>
                        <Label>Postal Code</Label>
                        <Input className="mt-1.5" value={form.location.postalCode} onChange={(e) => setLocation('postalCode', e.target.value)} placeholder="2000" />
                    </div>
                </div>
            </Section>

            <Section
                icon={<ShieldCheck className="h-4 w-4" />}
                title="Support Services"
                description="Add services you need and provide details for each"
            >
                <div className="space-y-4">
                    {form.supportDetails.map((svc, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row gap-2 items-start">
                            <div className="flex-1">
                                <Label>Service Name <span className="text-destructive">*</span></Label>
                                <Input
                                    className="mt-1"
                                    value={svc.name}
                                    onChange={(e) =>
                                        setField('supportDetails', form.supportDetails.map((s, i) => i === idx ? { ...s, name: e.target.value } : s))
                                    }
                                    placeholder="e.g. Personal Care"
                                />
                            </div>
                            <div className="flex-1">
                                <Label>Service Description</Label>
                                <Textarea
                                    className="mt-1 resize-none"
                                    rows={2}
                                    value={svc.description}
                                    onChange={(e) =>
                                        setField('supportDetails', form.supportDetails.map((s, i) => i === idx ? { ...s, description: e.target.value } : s))
                                    }
                                    placeholder="Provide details for this service"
                                />
                            </div>
                            <button
                                type="button"
                                className="text-destructive mt-6 ml-2 hover:opacity-70"
                                onClick={() =>
                                    setField('supportDetails', form.supportDetails.filter((_, i) => i !== idx))
                                }
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>
                    ))}

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 mt-2"
                        onClick={() =>
                            setField('supportDetails', [...form.supportDetails, { name: '', description: '' }])
                        }
                    >
                        <Plus className="h-4 w-4" /> Add Service
                    </Button>
                </div>
            </Section>

            <Section icon={<CalendarDays className="h-4 w-4" />} title="Schedule" description="Pick days, then choose a time group or set custom times">
                <div className="flex items-center gap-3 mb-4">
                    <Switch checked={enableJobSessions} onCheckedChange={setEnableJobSessions} id="enable-job-sessions" />
                    <Label htmlFor="enable-job-sessions" className="text-sm">I want to specify job session times</Label>
                </div>
                {enableJobSessions && (
                    <>
                        <div className="flex flex-wrap gap-2 mb-5">
                            {DAYS.map((day) => {
                                const active = form.jobSessions.some((s) => s.day === day);
                                return (
                                    <button key={day} type="button" onClick={() => toggleDay(day)}
                                        className={cn('px-3 py-1.5 rounded-full text-sm border-2 capitalize transition-all cursor-pointer', active ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border bg-muted/30 text-muted-foreground hover:border-primary/50')}>
                                        {day.slice(0, 3)}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="space-y-4">
                            {form.jobSessions.map((session) => (
                                <div key={session.day} className="pb-4 border-b last:border-b-0">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-medium capitalize text-sm flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary" />{session.day}</span>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => addPeriod(session.day)} className="gap-1 text-xs h-7 px-2">
                                            <Plus className="h-3 w-3" /> Add Slot
                                        </Button>
                                    </div>
                                    {session.period.map((p, pIdx) => (
                                        <div key={pIdx} className="mb-3">
                                            <div className="flex flex-wrap gap-1.5 mb-2">
                                                {TIME_GROUPS.map((tg) => {
                                                    const active = p.startTime === tg.startTime && p.endTime === tg.endTime;
                                                    return (
                                                        <button key={tg.label} type="button"
                                                            onClick={() => { updatePeriod(session.day, pIdx, 'startTime', tg.startTime); updatePeriod(session.day, pIdx, 'endTime', tg.endTime); }}
                                                            className={cn('px-2.5 py-0.5 rounded text-xs border transition-all cursor-pointer', active ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border text-muted-foreground hover:border-primary/40')}>
                                                            {tg.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
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
                    </>
                )}
            </Section>

            <Section title="Worker Preferences" description="Optional preferences for the ideal support worker">
                <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label>Preferred Gender</Label>
                            <Select value={form.preference.gender || 'none'} onValueChange={(v) => setField('preference', { ...form.preference, gender: v === 'none' ? '' : v })}>
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
                            <Label>Add Custom Preference</Label>
                            <div className="flex gap-2 mt-1.5">
                                <Input placeholder="e.g. speaks Mandarin" value={otherInput} onChange={(e) => setOtherInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomPreference(); } }} className="text-sm" />
                                <Button type="button" variant="outline" size="sm" onClick={addCustomPreference} className="shrink-0"><Plus className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    </div>
                    <div>
                        <Label className="mb-2 block text-xs text-muted-foreground uppercase tracking-wide">Quick picks</Label>
                        <div className="flex flex-wrap gap-2">
                            {PREFERENCE_OPTIONS.map((opt) => {
                                const on = form.preference.others.includes(opt);
                                return (
                                    <button key={opt} type="button" onClick={() => togglePreference(opt)}
                                        className={cn('px-3 py-1 rounded-full text-sm border capitalize transition-all cursor-pointer select-none', on ? 'bg-primary/10 text-primary border-primary font-medium' : 'bg-transparent text-muted-foreground border-border hover:border-primary/50')}>
                                        {on && <span className="mr-1">&#10003;</span>}{opt}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    {form.preference.others.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {form.preference.others.map((o) => (
                                <Badge key={o} variant="secondary" className="gap-1 capitalize text-sm px-2.5 py-1">
                                    {o}<button type="button" onClick={() => togglePreference(o)} className="ml-1 hover:text-destructive leading-none">&#215;</button>
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            </Section>

            <div className="pt-6 flex justify-between items-center mt-2">
                <Button variant="ghost" onClick={() => router.back()} className="cursor-pointer text-muted-foreground">Cancel</Button>
                <Button onClick={handleSubmit} disabled={loading} className="gap-2 cursor-pointer px-8">
                    {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : 'Save Changes'}
                </Button>
            </div>
        </div>
    );
}

function Section({ icon, title, description, children }: {
    icon?: React.ReactNode; title: string; description?: string; children: React.ReactNode;
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