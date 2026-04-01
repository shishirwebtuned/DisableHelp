'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft, Briefcase, Clock, CheckCircle2, XCircle,
    Loader2, CalendarDays, ChevronLeft, ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { fetchApplicationsByApplicantId } from '@/redux/slices/applicationsSlice';

const APP_STATUS: Record<string, { label: string; icon: any; badge: string; card: string }> = {
    pending: {
        label: 'Pending',
        icon: Clock,
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        card: 'border-l-amber-400',
    },
    accepted: {
        label: 'Accepted',
        icon: CheckCircle2,
        badge: 'bg-green-100 text-green-700 border-green-200',
        card: 'border-l-green-500',
    },
    rejected: {
        label: 'Rejected',
        icon: XCircle,
        badge: 'bg-red-100 text-red-700 border-red-200',
        card: 'border-l-red-400',
    },
};

function formatDate(iso: string) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

const LIMIT = 10;

export default function MyJobsPage() {
    const dispatch = useAppDispatch();
    const {
        myItems: applications,
        myLoading,
        myTotal,
        myTotalPages,
        myTotalPending,
        myTotalAccepted,
        myTotalRejected,
    } = useAppSelector((state) => state.applications);
    const mee = useAppSelector((state) => state.auth.mee.user);
    console.log(mee._id)
    const [page, setPage] = useState(1);

    useEffect(() => {
        dispatch(fetchApplicationsByApplicantId({ userID: mee?._id, page, limit: LIMIT }));
    }, [dispatch, page, mee]);

    return (
        <div className="flex flex-col min-h-[calc(100vh-6rem)]">
            <div className="flex items-center gap-3 mb-6">
                <Link href="/worker/jobs" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Back to jobs
                </Link>
            </div>

            <div className="mb-6">
                <h1 className="text-xl font-bold tracking-tight">My Applications</h1>
                <p className="text-sm text-muted-foreground mt-1">Track the status of every job you have applied for</p>
            </div>

            <div className="flex flex-wrap gap-3 mb-8">
                <div className={cn('flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium', APP_STATUS.pending.badge)}>
                    <Clock className="h-4 w-4" />
                    {myTotalPending} Pending
                </div>
                <div className={cn('flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium', APP_STATUS.accepted.badge)}>
                    <CheckCircle2 className="h-4 w-4" />
                    {myTotalAccepted} Accepted
                </div>
                <div className={cn('flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium', APP_STATUS.rejected.badge)}>
                    <XCircle className="h-4 w-4" />
                    {myTotalRejected} Rejected
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium bg-muted text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    {myTotal} Total
                </div>
            </div>

            {myLoading && (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
                </div>
            )}

            {!myLoading && applications.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground bg-muted/20 rounded-2xl border border-dashed">
                    <Briefcase className="h-12 w-12 mb-3 opacity-20" />
                    <p className="text-sm font-medium text-foreground">No applications yet</p>
                    <p className="text-xs mt-1">Apply for jobs to see your status here</p>
                    <Link href="/worker/jobs" className="mt-4 text-xs text-primary underline-offset-2 hover:underline">Browse jobs</Link>
                </div>
            )}

            {!myLoading && applications.length > 0 && (
                <div className="space-y-4">
                    {applications.map((app) => {
                        const cfg = APP_STATUS[app.status] ?? APP_STATUS['pending'];
                        const Icon = cfg.icon;
                        return (
                            <Card key={app._id} className={cn('border-l-4 transition-shadow hover:shadow-md', cfg.card)}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-base leading-tight truncate">
                                                {app.job?.title ?? (
                                                    <span className="text-muted-foreground italic text-sm">Job no longer available</span>
                                                )}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                <CalendarDays className="h-3 w-3" />
                                                Applied {formatDate(app.createdAt)}
                                            </p>
                                        </div>
                                        <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border shrink-0', cfg.badge)}>
                                            <Icon className="h-3.5 w-3.5" />
                                            {cfg.label}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0 space-y-3">
                                    {app.introduction && (
                                        <>
                                            <Separator />
                                            <div>
                                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Introduction</p>
                                                <p className="text-sm text-foreground leading-relaxed line-clamp-3">{app.introduction}</p>
                                            </div>
                                        </>
                                    )}
                                    {app.skills && (
                                        <div>
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Skills</p>
                                            <p className="text-sm">{app.skills}</p>
                                        </div>
                                    )}
                                    {(app.availability ?? []).length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Availability</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {app.availability.map((a, i) => (
                                                    <Badge key={i} variant="outline" className="text-xs capitalize font-normal">
                                                        {a.day}{a.period?.length > 0 ? `: ${a.period.map((p) => `${p.startTime}-${p.endTime}`).join(', ')}` : ''}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}

                    {myTotalPages > 1 && (
                        <div className="flex items-center justify-center gap-3 pt-4 pb-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page <= 1 || myLoading}
                                onClick={() => setPage((p) => p - 1)}
                                className="gap-1"
                            >
                                <ChevronLeft className="h-4 w-4" /> Prev
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                Page {page} of {myTotalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page >= myTotalPages || myLoading}
                                onClick={() => setPage((p) => p + 1)}
                                className="gap-1"
                            >
                                Next <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
