// JobForm.tsx - shared create/update job form for /client/jobs
'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { Button } from '@/components/ui/button';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const SESSION_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 10, 14, 20, 30];
const HOURS_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 16, 20, 24, 30, 40];
const PREFERENCE_OPTIONS = ['non-smoker', 'experienced', 'has-car', 'pet-friendly', 'bilingual'];

export type JobFormData = {
  title: string;
  startDate: Date | undefined;
  frequency: string;
  location: { line1: string; suburb: string; state: string; postalCode: string };
  duration: { session: number; hours: number };
  supportDetails: { name: string; details: string[] }[];
  jobSessions: { day: string; period: { startTime: string; endTime: string }[] }[];
  preference: { gender: string; others: string[] };
};

export function JobForm({
  initial,
  onSubmit,
  loading,
  submitLabel = 'Save',
}: {
  initial?: Partial<JobFormData>;
  onSubmit: (data: JobFormData) => void;
  loading?: boolean;
  submitLabel?: string;
}) {
  const dispatch = useAppDispatch();
  const services = useAppSelector((s) => s.services.items);
  const [form, setForm] = useState<JobFormData>({
    title: initial?.title || '',
    startDate: initial?.startDate ? new Date(initial.startDate) : undefined,
    frequency: initial?.frequency || 'weekly',
    location: initial?.location || { line1: '', suburb: '', state: '', postalCode: '' },
    duration: initial?.duration || { session: 1, hours: 2 },
    supportDetails: initial?.supportDetails || [],
    jobSessions: initial?.jobSessions || [],
    preference: initial?.preference || { gender: '', others: [] },
  });
  const [newDetailInput, setNewDetailInput] = useState<Record<number, string>>({});
  const [otherInput, setOtherInput] = useState('');
  const [error, setError] = useState<string | null>(null);


  const setField = <K extends keyof JobFormData>(key: K, value: JobFormData[K]) => setForm((p) => ({ ...p, [key]: value }));
  const setLocation = (k: keyof JobFormData['location'], v: string) => setForm((p) => ({ ...p, location: { ...p.location, [k]: v } }));
  const setDuration = (k: keyof JobFormData['duration'], v: number) => setForm((p) => ({ ...p, duration: { ...p.duration, [k]: v } }));

  // ...support details, sessions, preferences helpers (same as new page)...
  const addSupportDetail = (serviceName: string) => {
    if (form.supportDetails.some((s) => s.name === serviceName)) return;
    setField('supportDetails', [...form.supportDetails, { name: serviceName, details: [] }]);
  };
  const removeSupportDetail = (idx: number) => setField('supportDetails', form.supportDetails.filter((_, i) => i !== idx));
  const addDetailItem = (idx: number) => {
    const text = (newDetailInput[idx] ?? '').trim();
    if (!text) return;
    const updated = [...form.supportDetails];
    updated[idx] = { ...updated[idx], details: [...updated[idx].details, text] };
    setField('supportDetails', updated);
    setNewDetailInput((p) => ({ ...p, [idx]: '' }));
  };
  const removeDetailItem = (sdIdx: number, dIdx: number) => {
    const updated = [...form.supportDetails];
    updated[sdIdx] = { ...updated[sdIdx], details: updated[sdIdx].details.filter((_, i) => i !== dIdx) };
    setField('supportDetails', updated);
  };
  const toggleDay = (day: string) => {
    const exists = form.jobSessions.find((s) => s.day === day);
    if (exists) {
      setField('jobSessions', form.jobSessions.filter((s) => s.day !== day));
    } else {
      setField('jobSessions', [...form.jobSessions, { day, period: [{ startTime: '09:00', endTime: '11:00' }] }]);
    }
  };
  const addPeriod = (day: string) => setField('jobSessions', form.jobSessions.map((s) => s.day === day ? { ...s, period: [...s.period, { startTime: '09:00', endTime: '11:00' }] } : s));
  const removePeriod = (day: string, pIdx: number) => setField('jobSessions', form.jobSessions.map((s) => s.day === day ? { ...s, period: s.period.filter((_, i) => i !== pIdx) } : s));
  const updatePeriod = (day: string, pIdx: number, field: 'startTime' | 'endTime', val: string) => setField('jobSessions', form.jobSessions.map((s) => s.day === day ? { ...s, period: s.period.map((p, i) => i === pIdx ? { ...p, [field]: val } : p) } : s));
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.title.trim()) { setError('Job title is required.'); return; }
    if (!form.startDate) { setError('Start date is required.'); return; }
    if (form.supportDetails.length === 0) { setError('Add at least one support service.'); return; }
    if (form.jobSessions.length === 0) { setError('Add at least one job session day.'); return; }
    onSubmit(form);
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      {error && <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md font-medium mb-4">{error}</div>}
      {/* ...copy the form UI from new page, but use form state above... */}
      {/* ...existing code... */}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : submitLabel}</Button>
      </div>
    </form>
  );
}

export default JobForm;
