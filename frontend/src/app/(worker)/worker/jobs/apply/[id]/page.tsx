'use client';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { useEffect, useState } from 'react';
import { fetchJobById, applyToJobThunk } from '@/redux/slices/jobsSlice';
import Loading from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle2, Circle, Info, ExternalLink, ArrowBigLeft, Sparkles, MapPin, Clock, Calendar, User, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

// ── Time options (every 30 min) ──────────────────────────────────────────────
const TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
  for (const m of ['00', '30']) {
    TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:${m}`);
  }
}
function fmt(t: string) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
type Day = (typeof DAYS)[number];
interface Period { startTime: string; endTime: string; }
interface AvailabilityDay { day: Day; period: Period[]; }

const STEPS = [
  { key: 'about', label: 'About you' },
  { key: 'skills', label: 'Skills' },
  { key: 'availability', label: 'Availability' },
  { key: 'review', label: 'Review and apply' },
] as const;
type StepKey = (typeof STEPS)[number]['key'];

export default function Page() {
  const { selectedJob, loading, error, applying } = useSelector((state: any) => state.jobs);
  const { mee } = useSelector((state: any) => state.auth);
  const params = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const id = params?.id;

  const bio = mee?.profile?.personalDetails?.bio ?? '';





  const [step, setStep] = useState<StepKey>('about');
  // start empty so the effect below will populate the introduction once data is ready
  const [introduction, setIntroduction] = useState('');
  const [skills, setSkills] = useState('');
  const [availability, setAvailability] = useState<AvailabilityDay[]>([]);
  const [hourlyRate, setHourlyRate] = useState('');

  // tracks which client-provided session slots the worker selects (key = `${session._id}_${periodIdx}`)
  const [selectedSessionKeys, setSelectedSessionKeys] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openDrawer, setOpenDrawer] = useState(false);


  useEffect(() => {
    if (id) dispatch(fetchJobById(id as string));
  }, [id, dispatch]);

  // Pre-fill introduction bio once job + worker data are loaded
  useEffect(() => {
    if (!selectedJob || !mee) return;
    const clientName = selectedJob?.client?.firstName ?? 'there';
    const workerGender = mee?.profile?.personalInfo?.gender ?? '';
    const workerDob = mee?.profile?.personalInfo?.dateOfBirth;
    const workerAge = workerDob
      ? Math.floor((Date.now() - new Date(workerDob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : null;
    // User requested greeting like: "hiii {clientname}" — keep lowercase and friendly
    const parts: string[] = [`hii ${clientName} ,`];
    // Do not include "My name is {worker}", only include age/gender descriptor if available
    const descriptorParts: string[] = [];
    // if (workerAge) descriptorParts.push(`${workerAge} year old`);
    // if (workerGender) descriptorParts.push(workerGender);
    if (descriptorParts.length > 0) {
      parts.push(` I am a ${descriptorParts.join(' ')} support worker.`);
    } else {
      // if no specific descriptor, keep a short friendly sentence
      parts.push(' I am a support worker.');
    }

    // append the worker bio (if present)
    const intro = parts.join('') + (bio ? ` ${bio}` : '');
    setIntroduction((prev) => (prev === '' ? intro : prev));
  }, [selectedJob, mee]);

  // (no pre-fill needed — worker selects from checkboxes)

  const stepIndex = STEPS.findIndex((s) => s.key === step);
  const progress = Math.round(((stepIndex + 1) / STEPS.length) * 100);

  // ── Day helpers ────────────────────────────────────────────────────────────
  const toggleDay = (day: Day, checked: boolean) => {
    if (checked) setAvailability([...availability, { day, period: [{ startTime: '', endTime: '' }] }]);
    else setAvailability(availability.filter((a) => a.day !== day));
  };
  const addPeriod = (day: Day) =>
    setAvailability(
      availability.map((a) =>
        a.day === day ? { ...a, period: [...a.period, { startTime: '', endTime: '' }] } : a
      )
    );
  const updatePeriod = (day: Day, idx: number, field: 'startTime' | 'endTime', value: string) =>
    setAvailability(
      availability.map((a) =>
        a.day === day
          ? { ...a, period: a.period.map((p, i) => (i === idx ? { ...p, [field]: value } : p)) }
          : a
      )
    );

  const toggleSessionKey = (key: string) =>
    setSelectedSessionKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (step === 'about' && !introduction.trim()) e.introduction = 'Introduction is required';
    if (step === 'skills' && !skills.trim()) e.skills = 'Skills are required';
    if (step === 'availability') {
      if (!hourlyRate || Number(hourlyRate) <= 0) {
        e.hourlyRate = 'Hourly rate required';
      }
      if (selectedJob?.jobSessions?.length > 0) {
        if (selectedSessionKeys.size === 0) e.availability = 'Select at least one session';
      } else {
        if (availability.length === 0) e.availability = 'Select at least one day';
        availability.forEach((a) =>
          a.period.forEach((p, i) => {
            if (!p.startTime) e[`${a.day}_${i}_start`] = 'Start time required';
            if (!p.endTime) e[`${a.day}_${i}_end`] = 'End time required';
          })
        );
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate()) return;
    const idx = STEPS.findIndex((s) => s.key === step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1].key);
  };
  const back = () => {
    const idx = STEPS.findIndex((s) => s.key === step);
    if (idx > 0) setStep(STEPS[idx - 1].key);
  };
  const handleSubmit = async () => {
    // When job has pre-defined sessions, build availability from the worker's checked keys
    let finalAvailability = availability;
    if (selectedJob?.jobSessions?.length > 0) {
      const map: Record<string, Period[]> = {};
      (selectedJob.jobSessions as any[]).forEach((s) => {
        s.period.forEach((p: any, i: number) => {
          const key = `${s.day}_${i}`;
          if (selectedSessionKeys.has(key)) {
            if (!map[s.day]) map[s.day] = [];
            map[s.day].push({ startTime: p.startTime, endTime: p.endTime });
          }
        });
      });
      finalAvailability = Object.entries(map).map(([day, period]) => ({ day: day as Day, period }));
    }
    const result = await dispatch(
      applyToJobThunk({ job: id as string, introduction, skills, hourlyRate: Number(hourlyRate), availability: finalAvailability })
    );
    if (applyToJobThunk.fulfilled.match(result)) router.back();
  };


  if (!selectedJob) return null;

  const { jobSessions, } = selectedJob;




  return (
    <div className=" bg-background flex flex-col">
      {
        loading && <Loading />

      }
      {/* ── Top header ── */}
      <Button onClick={() => router.back()} className="w-30 cursor-pointer ml-4 mt-4">
        <ArrowBigLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      <div className=" px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Job Application</h1>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* ── Left stepper sidebar ── */}
        <aside className="w-56 border-r bg-muted/30 p-6 hidden md:flex flex-col gap-1 shrink-0">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
            Your application
          </p>
          {STEPS.map((s, i) => {
            const done = i < stepIndex;
            const active = s.key === step;

            return (
              <button
                key={s.key}
                onClick={() => { if (done) setStep(s.key); }}
                className={[
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-left transition-colors',
                  active ? 'bg-gray-200/70 text-black ' : '',
                  done ? 'text-black cursor-pointer hover:bg-gray-100' : '',
                  !active && !done ? 'text-gray-500 cursor-default' : '',
                ].join(' ')}
              >
                {done ? (
                  <CheckCircle2
                    className="w-4 h-4 shrink-0"
                    style={{ color: active ? 'white' : '#22c55e' }} // green-500
                  />
                ) : (
                  <Circle
                    className={`w-4 h-4 shrink-0 ${active ? 'text-black' : 'text-gray-400'
                      }`}
                  />
                )}
                {s.label}
              </button>
            );
          })}
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-2xl mx-auto space-y-6">

            {/* Step: About you */}
            {step === 'about' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">About you</h2>
                <div className="space-y-1">
                  <Label htmlFor="introduction">
                    Why are you a good fit for this role?
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Introduce yourself to{' '}
                    <span className="font-medium text-foreground">
                      {selectedJob?.client?.firstName}
                    </span>
                    . We've started a message for you — feel free to personalise it.
                  </p>
                  <Textarea
                    id="introduction"
                    placeholder="Hi, I am an experienced support worker with..."
                    className={`mt-6 h-48 ${errors.introduction ? 'border-destructive' : ''}`}
                    value={introduction}
                    onChange={(e) => {
                      setIntroduction(e.target.value);
                      setErrors((p) => ({ ...p, introduction: '' }));
                    }}
                  />
                  {errors.introduction && (
                    <p className="text-xs text-destructive mt-1">{errors.introduction}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step: Skills */}
            {step === 'skills' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Skills</h2>
                <div className="space-y-1">
                  <Label htmlFor="skillsInput">Your relevant skills</Label>
                  <p className="text-sm text-muted-foreground">
                    List the skills that make you suitable for this job.
                  </p>
                  <Textarea
                    id="skillsInput"
                    placeholder="Personal care, Meal preparation, Community access..."
                    className={`mt-2 min-h-36 ${errors.skills ? 'border-destructive' : ''}`}
                    value={skills}
                    onChange={(e) => {
                      setSkills(e.target.value);
                      setErrors((p) => ({ ...p, skills: '' }));
                    }}
                  />
                  {errors.skills && (
                    <p className="text-xs text-destructive mt-1">{errors.skills}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step: Availability */}
            {step === 'availability' && (
              <div className="space-y-5">
                <h2 className="text-2xl font-bold">Availability and Rates</h2>

                {/* Session frequency info box */}
                <div className="flex gap-3 bg-muted rounded-lg p-4 text-sm">
                  <Info className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="font-semibold">Session Frequency</p>
                    <p className="text-muted-foreground">
                      {selectedJob.title} needs {selectedJob.duration?.session} session(s),{' '}
                      {selectedJob.duration?.hours} hours total, {selectedJob.frequency}.{' '}
                      Starting {new Date(selectedJob.startDate).toLocaleDateString()}.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Your hourly rate</Label>

                  <div className="relative w-60">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      $
                    </span>

                    <input
                      id="hourlyRate"
                      type="number"
                      min="1"
                      placeholder="Enter rate"
                      value={hourlyRate}
                      onChange={(e) => {
                        setHourlyRate(e.target.value);
                        setErrors((p) => ({ ...p, hourlyRate: '' }));
                      }}
                      className={`w-full pl-7 pr-3 py-2 border rounded-md text-sm bg-background 
      ${errors.hourlyRate ? 'border-destructive' : 'border-input'}`}
                    />
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Enter the amount you charge per hour.
                  </p>

                  {errors.hourlyRate && (
                    <p className="text-xs text-destructive">
                      {errors.hourlyRate}
                    </p>
                  )}
                </div>

                {jobSessions?.length > 0 ? (
                  /* Worker picks from the client's offered sessions */
                  <div className="space-y-4">
                    <div>
                      <p className="font-semibold">Your availability</p>
                      <p className="text-sm text-muted-foreground">
                        When can you assist {selectedJob?.client?.firstName}? Select from their preferred days and times.
                      </p>
                    </div>
                    {errors.availability && (
                      <p className="text-xs text-destructive">{errors.availability}</p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(jobSessions as any[]).flatMap((s: any) =>
                        s.period.map((p: any, i: number) => {
                          const key = `${s.day}_${i}`;
                          const dayAbbr = s.day.charAt(0).toUpperCase() + s.day.slice(1, 3);
                          return (
                            <div
                              key={key}
                              onClick={() => toggleSessionKey(key)}
                              className="flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
                            >
                              <Checkbox
                                id={key}
                                checked={selectedSessionKeys.has(key)}
                                onCheckedChange={() => toggleSessionKey(key)}
                              />
                              <label htmlFor={key} className="text-sm font-medium cursor-pointer select-none">
                                {dayAbbr} {fmt(p.startTime)} to {fmt(p.endTime)}
                              </label>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                ) : (
                  /* Worker selects own availability */
                  <div className="space-y-4">
                    <div>
                      <p className="font-semibold">Your availability</p>
                      <p className="text-sm text-muted-foreground">
                        When can you assist? They are flexible on days and times.
                      </p>
                    </div>
                    {errors.availability && (
                      <p className="text-xs text-destructive">{errors.availability}</p>
                    )}

                    <div className="space-y-4">
                      {DAYS.map((day) => {
                        const avail = availability.find((a) => a.day === day);
                        const checked = !!avail;
                        return (
                          <div key={day}>
                            <div className="flex items-center gap-2 py-2">
                              <Checkbox
                                id={day}
                                checked={checked}
                                onCheckedChange={(v) => toggleDay(day, !!v)}
                              />
                              <label
                                htmlFor={day}
                                className="text-sm font-medium capitalize cursor-pointer"
                              >
                                {day}
                              </label>
                            </div>

                            {checked && avail && (
                              <div className="ml-6 space-y-3 mb-2">
                                {avail.period.map((p, idx) => (
                                  <div key={idx} className="flex items-end gap-4 flex-wrap">
                                    <div className="space-y-1">
                                      <Label
                                        className={`text-xs ${errors[`${day}_${idx}_start`] ? 'text-destructive' : ''
                                          }`}
                                      >
                                        Start time
                                      </Label>
                                      <Select
                                        value={p.startTime}
                                        onValueChange={(v) => {
                                          updatePeriod(day, idx, 'startTime', v);
                                          setErrors((e) => ({
                                            ...e,
                                            [`${day}_${idx}_start`]: '',
                                          }));
                                        }}
                                      >
                                        <SelectTrigger
                                          className={`w-50 ${errors[`${day}_${idx}_start`]
                                            ? 'border-destructive'
                                            : ''
                                            }`}
                                        >
                                          <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent
                                          position="popper"
                                          className="max-h-80 overflow-y-auto"
                                        >
                                          {TIME_OPTIONS.map((t) => (
                                            <SelectItem key={t} value={t}>
                                              {fmt(t)}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      {errors[`${day}_${idx}_start`] && (
                                        <p className="text-xs text-destructive">
                                          {errors[`${day}_${idx}_start`]}
                                        </p>
                                      )}
                                    </div>

                                    <div className="space-y-1">
                                      <Label
                                        className={`text-xs ${errors[`${day}_${idx}_end`] ? 'text-destructive' : ''
                                          }`}
                                      >
                                        End time
                                      </Label>
                                      <Select
                                        value={p.endTime}
                                        onValueChange={(v) => {
                                          updatePeriod(day, idx, 'endTime', v);
                                          setErrors((e) => ({
                                            ...e,
                                            [`${day}_${idx}_end`]: '',
                                          }));
                                        }}
                                      >
                                        <SelectTrigger
                                          className={`w-50 ${errors[`${day}_${idx}_end`]
                                            ? 'border-destructive'
                                            : ''
                                            }`}
                                        >
                                          <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent
                                          position="popper"
                                          className="max-h-80 overflow-y-auto"
                                        >
                                          {TIME_OPTIONS.map((t) => (
                                            <SelectItem key={t} value={t}>
                                              {fmt(t)}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      {errors[`${day}_${idx}_end`] && (
                                        <p className="text-xs text-destructive">
                                          {errors[`${day}_${idx}_end`]}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                                <button
                                  onClick={() => addPeriod(day)}
                                  className="text-sm text-primary hover:underline"
                                >
                                  + Add another time
                                </button>
                              </div>
                            )}
                            <hr className="border-border" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step: Review and apply */}
            {step === 'review' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Review and apply</h2>

                <div className="border rounded-lg divide-y">
                  <div className="p-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm">About you</p>
                      <button
                        onClick={() => setStep('about')}
                        className="text-xs text-primary hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {introduction}
                    </p>
                  </div>

                  <div className="p-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm">Skills</p>
                      <button
                        onClick={() => setStep('skills')}
                        className="text-xs text-primary hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{skills}</p>
                  </div>

                  <div className="p-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm">Hourly Rate</p>
                      <button
                        onClick={() => setStep('availability')}
                        className="text-xs text-primary hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">$ {hourlyRate}</p>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm">Availability</p>
                      <button
                        onClick={() => setStep('availability')}
                        className="text-xs text-primary hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                    {jobSessions?.length > 0 ? (
                      // Show selected session slots
                      (jobSessions as any[]).flatMap((s: any) =>
                        s.period.map((p: any, i: number) => {
                          const key = `${s.day}_${i}`;
                          if (!selectedSessionKeys.has(key)) return null;
                          const dayAbbr = s.day.charAt(0).toUpperCase() + s.day.slice(1, 3);
                          return (
                            <p key={key} className="text-sm text-muted-foreground">
                              {dayAbbr} {fmt(p.startTime)} – {fmt(p.endTime)}
                            </p>
                          );
                        })
                      )
                    ) : (
                      availability.map((a) => (
                        <div key={a.day} className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground capitalize">{a.day}:</span>{' '}
                          {a.period
                            .map((p) => `${fmt(p.startTime)} – ${fmt(p.endTime)}`)
                            .join(', ')}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* ── Right job summary sidebar ── */}
        <aside className="w-44 md:w-52 lg:w-64 p-6 flex flex-col gap-3 shrink-0">
          <p className="font-semibold text-xs md:text-[13px] lg:text-sm">Apply to support</p>
          <div>
            <p className="text-[15px] md:text-base lg:text-lg font-bold">{selectedJob.title}</p>
            <div className="flex flex-wrap gap-1 mt-2">
            </div>
          </div>
          <button
            onClick={() => {
              if (!selectedJob && id) {
                dispatch(fetchJobById(id as string));
              }
              setOpenDrawer(true);
            }}
            className="flex items-center gap-1 md:text-[13px] text-xs lg:text-sm text-primary hover:underline mt-auto"
          >
            View full job details <ExternalLink className="w-3 h-3" />
          </button>
        </aside>
      </div>
      {/* ── Bottom navigation ── */}
      <div className="border-t px-6 py-4 flex items-center justify-between bg-background">
        <Button variant="outline" onClick={back} disabled={stepIndex === 0}>
          Back
        </Button>

        <div className="flex flex-col items-center gap-1">
          <div className="w-48 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{progress}% complete</span>
        </div>

        {step !== 'review' ? (
          <Button onClick={next}>Next</Button>
        ) : (
          <Button onClick={handleSubmit} disabled={applying}>
            {applying ? 'Submitting...' : 'Apply'}
          </Button>
        )}
      </div>

      <Sheet open={openDrawer} onOpenChange={setOpenDrawer}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg p-0 overflow-y-auto bg-background flex flex-col"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600&display=swap');
        `}</style>

          {/* Header */}
          <div className="sticky top-0 z-20 bg-background border-b px-5 py-4 flex items-center justify-between">
            <SheetTitle className="text-[15px] font-semibold tracking-tight">
              Job Details
            </SheetTitle>
            <button
              onClick={() => setOpenDrawer(false)}
              className="w-7 h-7 rounded-full border border-border/40 bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <p className="p-6 text-sm text-muted-foreground">Loading...</p>
          ) : selectedJob ? (
            <div className="flex-1 overflow-y-auto">

              {/* Hero Card */}
              <div
                className="m-4 rounded-2xl overflow-hidden relative"
                style={{ background: "linear-gradient(135deg, #378ADD 0%, #185FA5 60%, #0C447C 100%)" }}
              >
                <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
                <div className="absolute -bottom-5 right-5 w-16 h-16 rounded-full bg-white/4 pointer-events-none" />

                <div className="relative p-5">
                  <div className="inline-flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-full px-3 py-1 mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#85B7EB]" />
                    <span className="text-[11px] font-medium text-white/90">Open Position</span>
                  </div>

                  <h2
                    className="text-[21px] leading-snug text-white mb-3"
                  >
                    {selectedJob.title}
                  </h2>

                  <div className="flex items-center gap-2 text-[12px] text-white/75">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-semibold text-white">
                      {selectedJob.client?.firstName?.[0]}
                      {selectedJob.client?.lastName?.[0]}
                    </div>
                    Posted by {selectedJob.client?.firstName} {selectedJob.client?.lastName}
                  </div>
                </div>
              </div>

              <div className="px-4 pb-6 space-y-5">

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      label: "Start Date",
                      value: new Date(selectedJob.startDate).toLocaleDateString("en-AU", {
                        day: "numeric", month: "short", year: "numeric",
                      }),
                      icon: <Calendar className="w-3 h-3" style={{ color: "#378ADD" }} />,
                    },
                    {
                      label: "Frequency",
                      value: selectedJob.frequency,
                      icon: <Clock className="w-3 h-3" style={{ color: "#378ADD" }} />,
                    },
                    { label: "Sessions", value: selectedJob.duration?.session, icon: null },
                    { label: "Hours", value: selectedJob.duration?.hours, icon: null },
                  ].map((stat, i) => (
                    <div key={i} className="bg-muted/50 border border-border/30 rounded-xl px-3.5 py-3">
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium mb-1">
                        {stat.icon}
                        {stat.label}
                      </div>
                      <p className="text-[14px] font-semibold text-foreground capitalize">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Location */}
                <div>
                  <SectionTitle>Location</SectionTitle>
                  <div className="bg-muted/50 border border-border/30 rounded-xl p-3.5 flex gap-3 items-start">
                    <div
                      className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
                      style={{ background: "#E6F1FB" }}
                    >
                      <MapPin className="w-4 h-4" style={{ color: "#185FA5" }} />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-foreground leading-snug">
                        {selectedJob.location?.suburb && ` ${selectedJob.location.suburb}`}
                      </p>
                      <p className="text-[12px] text-muted-foreground mt-0.5">
                        {selectedJob.location?.state} , {selectedJob.location?.postalCode}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Support Required */}
                <div>
                  <SectionTitle icon={<Sparkles className="w-3 h-3" style={{ color: "#378ADD" }} />}>
                    Support Required
                  </SectionTitle>
                  <div className="space-y-2">
                    {selectedJob.supportDetails?.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-background border border-border/30 rounded-xl p-3.5 flex gap-3 items-start hover:bg-muted/30 transition"
                      >
                        <span
                          className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
                          style={{
                            background: idx === 0 ? "#378ADD" : idx === 1 ? "#85B7EB" : "#B5D4F4",
                          }}
                        />
                        <div>
                          <p className="text-[13px] font-semibold text-foreground capitalize">{item.name}</p>
                          <p className="text-[12px] text-muted-foreground mt-0.5 leading-relaxed">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sessions */}
                <div>
                  <SectionTitle>Sessions</SectionTitle>
                  <div className="space-y-2">
                    {selectedJob.jobSessions?.map((s: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-muted/50 border border-border/30 rounded-xl px-3.5 py-2.5 flex justify-between items-center hover:bg-muted/70 transition"
                      >
                        <p className="text-[13px] font-semibold text-foreground capitalize">{s.day}</p>
                        <div className="flex flex-col items-end gap-0.5">
                          {s.period.map((p: any, i: number) => (
                            <span
                              key={i}
                              className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md"
                              style={{ background: "#E6F1FB", color: "#185FA5" }}
                            >
                              {p.startTime} – {p.endTime}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preferences */}
                <div>
                  <SectionTitle>Preferences</SectionTitle>
                  <div className="bg-muted/50 border border-border/30 rounded-xl p-3.5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[12px] text-muted-foreground">Preferred gender</span>
                      <span className="text-[13px] font-semibold text-foreground capitalize">
                        {selectedJob.preference?.gender}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.preference?.others?.map((item: string, i: number) => (
                        <span
                          key={i}
                          className="text-[11px] font-semibold px-3 py-1 rounded-full"
                          style={{ background: "#E6F1FB", color: "#185FA5" }}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <p className="p-6 text-sm text-muted-foreground">No data found</p>
          )}

        </SheetContent>
      </Sheet>
    </div>
  );
}

function SectionTitle({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      {icon}
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">{children}</p>
      <div className="flex-1 h-px bg-border/40" />
    </div>
  );
}