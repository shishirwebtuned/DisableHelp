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
import { CheckCircle2, Circle, Info, ExternalLink, ArrowBigLeft } from 'lucide-react';

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
    if (workerAge) descriptorParts.push(`${workerAge} year old`);
    if (workerGender) descriptorParts.push(workerGender);
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
      <Button onClick={() => router.back()} className=" w-30 cursor-pointer ml-4 mt-4">
        <ArrowBigLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      <div className=" px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Job Application</h1>
      </div>

      <div className="flex flex-1 overflow-hidden">
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
        <aside className="w-64  p-6 hidden lg:flex flex-col gap-3 shrink-0">
          <p className="font-semibold text-sm">Apply to support</p>
          <div>
            <p className="text-lg font-bold">{selectedJob.title}</p>
            <div className="flex flex-wrap gap-1 mt-2">
            </div>
          </div>
          <button
            onClick={() => router.push(`/worker/jobs/${id}`)}
            className="flex items-center gap-1 text-sm text-primary hover:underline mt-auto"
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
    </div>
  );
}
