'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchJobs } from '@/redux/slices/jobsSlice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    MapPin, Calendar, Clock, Repeat,
    UserCheck, Briefcase, Timer, Layers, Search,
    CalendarDays, Send, CheckCircle2, Loader2,
    ArrowLeft, X,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

import type { Job } from '@/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';

import { motion, AnimatePresence } from 'framer-motion';
import { DatePicker } from '@/components/ui/date-picker';
/* ──────────────────────── helpers ──────────────────────── */

function formatLocation(loc: Job['location']): string {
    if (!loc) return '';
    if (typeof loc === 'string') return loc;
    return [loc.line1, loc.line2, loc.state, loc.postalCode].filter(Boolean).join(', ');
}

function formatDate(iso: string) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
    pending: { label: 'Pending', cls: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    published: { label: 'Published', cls: 'bg-green-500/10 text-green-600 border-green-500/20' },
    active: { label: 'Active', cls: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
    draft: { label: 'Draft', cls: 'bg-muted text-muted-foreground border-border' },
    closed: { label: 'Closed', cls: 'bg-red-500/10 text-red-600 border-red-500/20' },
};

function StatusBadge({ status }: { status: string }) {
    const s = STATUS_MAP[status] ?? STATUS_MAP['pending'];
    return (
        <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full border capitalize ${s.cls}`}>
            {s.label}
        </span>
    );
}

/* ──────────────────── Job Card (grid view) ──────────────────── */

function JobCard({ job, hasApplied, onClick }: {
    job: any;
    hasApplied: boolean;
    onClick: () => void;
}) {
    const loc = formatLocation(job.location);
    const dur = job.duration;

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'group w-full text-left rounded-xl border bg-background p-5 transition-all duration-200 cursor-pointer',
                'hover:shadow-md hover:border-[#8ac6dd]/50 hover:-translate-y-0.5',
                hasApplied && 'border-green-200 bg-green-50/30'
            )}
        >
            {/* Top: avatar + title + status */}
            <div className="flex items-start gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-[#8ac6dd] text-white flex items-center justify-center text-sm font-bold shrink-0">
                    {job.title?.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[#11px] leading-snug line-clamp-2">{job.title}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    {hasApplied && (
                        <Badge variant="default" className="bg-green-100 text-green-700 border-green-200 text-[10px]">
                            <CheckCircle2 className="h-3 w-3 mr-0.5" /> Applied
                        </Badge>
                    )}
                </div>
            </div>

            {/* Meta info */}
            <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
                {loc && (
                    <p className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                        <span className="truncate">{loc}</span>
                    </p>
                )}
                {(job.frequency || dur) && (
                    <p className="flex items-center gap-1.5 flex-wrap">
                        <Repeat className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                        {[
                            job.frequency,
                            dur ? `${dur.hours} hr${dur.hours !== 1 ? 's' : ''}, ${dur.session} session${dur.session !== 1 ? 's' : ''}` : null,
                        ].filter(Boolean).join(' · ')}
                    </p>
                )}
                {job.startDate && (
                    <p className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                        Starting {formatDate(job.startDate)}
                    </p>
                )}
            </div>

            {/* Support detail tags preview */}
            {(job.supportDetails ?? []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {(job.supportDetails ?? []).slice(0, 3).map((sd: any, i: number) => (
                        <Badge key={i} variant="outline" className="text-[11px] font-normal">
                            {sd.name}
                        </Badge>
                    ))}
                    {(job.supportDetails ?? []).length > 3 && (
                        <Badge variant="outline" className="text-[11px] font-normal text-muted-foreground">
                            +{(job.supportDetails ?? []).length - 3} more
                        </Badge>
                    )}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-2.5 border-t">
                <span className="text-[11px] text-muted-foreground">
                    {job.createdAt ? `Posted ${formatDate(job.createdAt)}` : 'Recently posted'}
                </span>
                <span className="text-[11px] font-medium text-[#8ac6dd] group-hover:underline">
                    View Details →
                </span>

            </div>
            <div className="text-xs text-muted-foreground mt-1">Application  <span className=' font-bold text-[#8ac6dd]'>{job.applicationCount}</span></div>
        </button>
    );
}

/* ──────────────────── Job Detail View ──────────────────── */

function JobDetailView({ job, onBack, onApply, appliedJobs, applyingJobId }: {
    job: any;
    onBack: () => void;
    onApply: (jobId: string) => void;
    appliedJobs: Set<string>;
    applyingJobId: string | null;
}) {
    const loc = formatLocation(job.location);
    const dur = job.duration;
    const hasApplied = appliedJobs.has(job._id);
    const isApplying = applyingJobId === job._id;

    return (
        <div className="w-full">
            {/* Back button */}
            <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 cursor-pointer"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to all jobs
            </button>

            <div className="rounded-xl border bg-background overflow-hidden">
                {/* Header */}
                <div className="p-6 pb-5 border-b">
                    <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-full bg-[#8ac6dd] text-white flex items-center justify-center text-base font-bold shrink-0">
                            {job.title?.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h2 className="text-xl font-bold leading-snug mb-2">{job.title}</h2>
                            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                                {job.frequency && (
                                    <span className="flex items-center gap-1 capitalize">
                                        <Repeat className="h-3.5 w-3.5" />{job.frequency}
                                    </span>
                                )}
                                {dur && (
                                    <span className="flex items-center gap-1">
                                        <Timer className="h-3.5 w-3.5" />{dur.hours} hrs, {dur.session} session{dur.session !== 1 ? 's' : ''}
                                    </span>
                                )}
                                {job.startDate && (
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3.5 w-3.5" />Starting {formatDate(job.startDate)}
                                    </span>
                                )}
                                {loc && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-3.5 w-3.5" />{loc}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Support Details */}
                    <div>
                        <h3 className="text-base font-bold mb-3">Support Details</h3>
                        <div className="rounded-xl border p-4 space-y-4">
                            {loc && (
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span>{loc}</span>
                                </div>
                            )}

                            {(job.supportDetails ?? []).map((sd: any, i: number) => (
                                <div key={i}>
                                    {(i > 0 || loc) && <Separator className="mb-4" />}
                                    <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                                        <Layers className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <span>{sd.name}</span>
                                    </div>
                                    {sd.description && (
                                        <p className="ml-6 text-sm text-muted-foreground">
                                            {sd.description}
                                        </p>
                                    )}
                                </div>
                            ))}

                            {(job.jobSessions ?? []).length > 0 && (
                                <>
                                    {((job.supportDetails ?? []).length > 0 || loc) && <Separator />}
                                    <div>
                                        <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                                            <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
                                            <span>Schedule</span>
                                        </div>
                                        <div className="space-y-1 ml-6">
                                            {(job.jobSessions ?? []).map((s: any, i: number) => (
                                                <div key={i} className="flex items-center gap-3 text-sm">
                                                    <span className="capitalize font-medium w-24 shrink-0">{s.day}</span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {(s.period ?? []).map((p: any, j: number) => (
                                                            <Badge key={j} variant="outline" className="text-xs font-normal">
                                                                <Clock className="h-3 w-3 mr-1" />{p.startTime} – {p.endTime}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {job.preference && (job.preference.gender || (job.preference.others ?? []).length > 0) && (
                                <>
                                    <Separator />
                                    <div>
                                        <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                                            <UserCheck className="h-4 w-4 text-muted-foreground shrink-0" />
                                            <span>Worker Preferences</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 ml-6">
                                            {job.preference.gender && (
                                                <Badge variant="secondary" className="capitalize">{job.preference.gender}</Badge>
                                            )}
                                            {(job.preference.others ?? []).map((o: string, i: number) => (
                                                <Badge key={i} variant="secondary" className="capitalize">{o}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Apply Button */}
                    <div className="pt-2">
                        <Link href={`/worker/jobs/apply/${job._id}`}>
                            <Button
                                onClick={() => onApply(job._id)}
                                className="w-full gap-2 bg-[#8ac6dd] hover:bg-[#72b5ce] text-white cursor-pointer"
                                size="lg"
                            >
                                <Send className="h-4.5 w-4.5" />
                                Apply for this Job
                            </Button>
                        </Link>

                    </div>
                </div>
            </div>
        </div>
    );
}

/* ──────────────────── Main Page ──────────────────── */

export default function WorkerJobsPage() {
    const dispatch = useAppDispatch();
    const myJobs = useAppSelector((state) => state.jobs.jobs);
    const jobsLoading = useAppSelector((state) => state.jobs.loading);

    const [selectedJob, setSelectedJob] = useState<any>(null);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Filters
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [hourlyRate, setHourlyRate] = useState<string>('');
    const [startDateFilter, setStartDateFilter] = useState<Date | null>(null);

    // Debounce search input → debouncedSearch after 450 ms
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search.trim()), 450);
        return () => clearTimeout(t);
    }, [search]);

    // Apply dialog state
    const [applyDialogOpen, setApplyDialogOpen] = useState(false);
    const [applyJobId, setApplyJobId] = useState<string | null>(null);
    const [coverLetter, setCoverLetter] = useState('');
    const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
    const [applyingJobId, setApplyingJobId] = useState<string | null>(null);

    // Infinite scroll
    const PAGE_SIZE = 10;
    const [page, setPage] = useState(1);
    const totalPages = useAppSelector((state) => state.jobs.totalPages);
    const hasMore = page < totalPages;
    const sentinelRef = useRef<HTMLDivElement>(null);
    const isFetchingMore = useRef(false);

    const buildFilterParams = useCallback((pg: number) => ({
        page: pg,
        limit: PAGE_SIZE,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(hourlyRate && { hourlyRate: Number(hourlyRate) }),
        ...(startDateFilter && { startDate: startDateFilter.toISOString() }),
    }), [debouncedSearch, statusFilter, hourlyRate, startDateFilter]);

    // Initial fetch
    useEffect(() => {
        dispatch(fetchJobs({ page: 1, limit: PAGE_SIZE }));
    }, [dispatch]);

    // Re-fetch when filters or debounced search change (reset to page 1)
    useEffect(() => {
        setPage(1);
        setSelectedJob(null);
        dispatch(fetchJobs({ ...buildFilterParams(1) }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch, statusFilter, hourlyRate, startDateFilter]);

    // IntersectionObserver: load next page when sentinel enters view
    const loadMore = useCallback(() => {
        if (isFetchingMore.current || !hasMore || jobsLoading) return;
        isFetchingMore.current = true;
        const nextPage = page + 1;
        dispatch(fetchJobs({ ...buildFilterParams(nextPage), append: true }))
            .finally(() => { isFetchingMore.current = false; });
        setPage(nextPage);
    }, [dispatch, hasMore, jobsLoading, page, buildFilterParams]);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;
        const observer = new IntersectionObserver(
            (entries) => { if (entries[0].isIntersecting) loadMore(); },
            { threshold: 0.1 }
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [loadMore]);

    const openApplyDialog = (jobId: string) => {
        setApplyJobId(jobId);
        setCoverLetter('');
        setApplyDialogOpen(true);
    };

    const filtered = myJobs;

    const hasActiveFilters = statusFilter !== 'all' || !!hourlyRate || !!startDateFilter;

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)]">
            {/* ── Row 1: Title + CTA ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-xl font-bold tracking-tight">Find Jobs</h1>
                        <Link href="/worker/jobs/my-jobs">
                            <Button size="sm" className="cursor-pointer h-8 text-xs">View My Job Status</Button>
                        </Link>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">Browse and apply for jobs that match your skills</p>
                </div>
            </div>

            {/* ── Row 2: Search + Filters ── */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
                {/* Search */}
                <div className="relative flex-1 min-w-[180px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                        placeholder="Search jobs…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-9 text-sm"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                {/* Hourly Rate */}
                <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">$</span>
                    <Input
                        type="number"
                        min={0}
                        placeholder="Rate/hr"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        className="h-9 w-[110px] text-sm pl-6"
                    />
                </div>

                {/* Start Date */}
                <DatePicker
                    value={startDateFilter ?? undefined}
                    onChange={(d) => setStartDateFilter(d ?? null)}
                    className="h-9 w-[200px] text-sm"
                    placeholder="Start date"
                />

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={() => { setStatusFilter('all'); setHourlyRate(''); setStartDateFilter(null); }}
                        className="flex items-center gap-1 h-9 px-2.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors border border-dashed"
                    >
                        <X className="h-3.5 w-3.5" /> Clear filters
                    </button>
                )}
            </div>

            {/* Content area */}
            <div className="flex-1 min-h-0 overflow-hidden relative">
                <AnimatePresence mode="wait">
                    {!selectedJob ? (
                        /* ─── Cards Grid View (Initial UI) ─── */
                        <motion.div
                            key="grid-view"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="h-full overflow-y-auto pr-2 custom-scrollbar"
                        >
                            {/* Search bar */}


                            {jobsLoading && filtered.length === 0 ? (
                                <div className="flex justify-center py-20">
                                    <Loader2 className="h-8 w-8 animate-spin text-[#8ac6dd]" />
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border">
                                    <Briefcase className="h-12 w-12 mb-3 opacity-20" />
                                    <p className="text-sm font-medium text-foreground">No jobs available at the moment</p>
                                    <p className="text-xs mt-1">Check back later for new opportunities</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
                                    {filtered.map((job) => (
                                        <JobCard
                                            key={job._id}
                                            job={job}
                                            hasApplied={appliedJobs.has(job._id)}
                                            onClick={() => setSelectedJob(job)}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Infinite scroll sentinel */}
                            <div ref={sentinelRef} className="flex justify-center py-6">
                                {jobsLoading && myJobs.length > 0 && (
                                    <Loader2 className="h-6 w-6 animate-spin text-[#8ac6dd]" />
                                )}
                                {!hasMore && myJobs.length > 0 && (
                                    <p className="text-xs text-muted-foreground">All jobs loaded</p>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        /* ─── Two-Column Master-Detail View ─── */
                        <motion.div
                            key="detail-view"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.5, ease: "anticipate" }}
                            className="flex h-full gap-8"
                        >
                            {/* Left Master List: Sticky Sidebar */}
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1, duration: 0.5 }}
                                className="hidden lg:flex flex-col w-[380px] shrink-0 border-r  pl-2 pr-6 overflow-y-auto space-y-4 pb-20 custom-scrollbar"
                            >
                                <div className="sticky top-0 z-10 pt-1 pb-4">

                                </div>

                                {filtered.length === 0 ? (
                                    <p className="text-center text-xs text-muted-foreground py-10">No matching jobs</p>
                                ) : (
                                    filtered.map((job) => (
                                        <div
                                            key={job._id}
                                            className={cn(
                                                "transition-all duration-300",
                                                selectedJob._id === job._id ? "ring-2 ring-blue-500 ring-offset-2 rounded-xl shadow-md scale-[1.02]" : "opacity-80 hover:opacity-100"
                                            )}
                                        >
                                            <JobCard
                                                job={job}
                                                hasApplied={appliedJobs.has(job._id)}
                                                onClick={() => setSelectedJob(job)}
                                            />
                                        </div>
                                    ))
                                )}
                            </motion.div>

                            {/* Right Detail Content */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                                className="flex-1 overflow-y-auto pl-2 pr-8 pb-20 custom-scrollbar"
                            >
                                <div className="max-w-4xl">
                                    <JobDetailView
                                        job={selectedJob}
                                        onBack={() => setSelectedJob(null)}
                                        onApply={openApplyDialog}
                                        appliedJobs={appliedJobs}
                                        applyingJobId={applyingJobId}
                                    />
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

        </div>
    );
}
