'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { deleteJobThunk, getJobByClient } from '@/redux/slices/jobsSlice';
import { fetchApplications, acceptApplication, rejectApplication } from '@/redux/slices/applicationsSlice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    Drawer, DrawerClose, DrawerContent, DrawerDescription,
    DrawerFooter, DrawerHeader, DrawerTitle,
} from '@/components/ui/drawer';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { DeleteConfirmation } from '@/components/common/DeleteConfirmation';
import {
    Plus, Edit, Trash2, MapPin, Calendar, Clock, Repeat,
    Users, Check, X, Mail, Phone, CalendarDays, UserCheck,
    Briefcase, Timer, Layers, Search,
    Currency,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { Job } from '@/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';

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
    pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
    published: { label: 'Published', cls: 'bg-green-100 text-green-700 border-green-200' },
    active: { label: 'Active', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
    draft: { label: 'Draft', cls: 'bg-muted text-muted-foreground border-border' },
    closed: { label: 'Closed', cls: 'bg-red-100 text-red-700 border-red-200' },
};

function StatusBadge({ status }: { status: string }) {
    const s = STATUS_MAP[status] ?? STATUS_MAP['pending'];
    return (
        <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full border capitalize ${s.cls}`}>
            {s.label}
        </span>
    );
}

function JobDetailPanel({ job, onEdit, onApplicants }: {
    job: any;
    onEdit: () => void;
    onApplicants: () => void;
}) {
    const loc = formatLocation(job.location);
    const dur = job.duration;
    return (
        <div className="h-full overflow-y-auto">
            <div className="pb-5 mb-5 border-b">
                <h2 className="text-2xl font-bold leading-snug mb-3">{job.title}</h2>
                <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="default" className="gap-1.5 cursor-pointer" onClick={onEdit}>
                        <Edit className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5 cursor-pointer" onClick={onApplicants}>
                        <Users className="h-3.5 w-3.5" />  View Applicants
                    </Button>
                </div>
            </div>

            <div className="rounded-xl p-4 mb-5">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#8ac6dd] text-white flex items-center justify-center text-sm font-bold shrink-0">
                        {job.title.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="font-semibold leading-none mb-4 ">{job.title}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            {job.frequency && (
                                <span className="flex items-center gap-1 capitalize"><Repeat className="h-3.5 w-3.5" />{job.frequency}</span>
                            )}
                            {dur && (
                                <span className="flex items-center gap-1"><Timer className="h-3.5 w-3.5" />{dur.hours} hrs, {dur.session} session{dur.session !== 1 ? 's' : ''}</span>
                            )}
                            {job.startDate && (
                                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Starting {formatDate(job.startDate)}</span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Currency className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium">${(job as any).hourlyRate ?? job.rate}/hr</span>
                    </div>
                    <StatusBadge status={job.status || 'pending'} />
                </div>
            </div>

            <h3 className="text-base font-bold mb-3">Support details</h3>
            <div className="rounded-xl border  p-4 space-y-4">
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
    );
}

export default function ClientJobsPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const myJobs = useAppSelector((state) => state.jobs.jobs);
    const jobsLoading = useAppSelector((state) => state.jobs.loading);
    const applications = useAppSelector((state) => state.applications.items);
    const applicationsLoading = useAppSelector((state) => state.applications.loading);

    const [selectedJob, setSelectedJob] = useState<any>(null);
    const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
    const [isApplicantsDrawerOpen, setIsApplicantsDrawerOpen] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; _id: string | null; title: string }>({
        isOpen: false, _id: null, title: '',
    });

    useEffect(() => {
        dispatch(getJobByClient({ page: 1, limit: 1 }));
        dispatch(fetchApplications());
    }, [dispatch]);

    // Auto-select the first job when jobs are loaded
    useEffect(() => {
        if (!selectedJob && myJobs.length > 0) {
            setSelectedJob(myJobs[0]);
        }
    }, [myJobs]);

    const handleDeleteJob = () => {
        if (deleteConfirmation._id) {
            dispatch(deleteJobThunk(deleteConfirmation._id));
            if (selectedJob?._id === deleteConfirmation._id) setSelectedJob(null);
            setDeleteConfirmation({ isOpen: false, _id: null, title: '' });
        }
    };

    const viewApplicants = (jobId: string) => {
        setSelectedJobId(jobId);
        dispatch(fetchApplications(jobId));
        setIsApplicantsDrawerOpen(true);
    };

    const selectedJobApplications = selectedJobId
        ? applications.filter((app) => app.job?._id === selectedJobId || (app as any).jobId === selectedJobId)
        : [];

    const filtered = myJobs.filter((j) =>
        j.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 shrink-0">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Job Postings</h1>
                    <p className="text-sm text-muted-foreground">Manage your support-worker listings</p>
                </div>
                <Button onClick={() => router.push('/client/jobs/new')} className="gap-2 cursor-pointer shrink-0">
                    <Plus className="h-4 w-4" /> Create Job
                </Button>
            </div>

            <div className="flex flex-1 min-h-0 rounded-xl border overflow-hidden bg-background">
                {/* LEFT: job list */}
                <div className="w-full sm:w-[340px] lg:w-[380px] shrink-0 border-r flex flex-col">
                    <div className="p-3 border-b">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                placeholder="Search jobs..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-8 h-8 text-sm"
                            />
                        </div>
                    </div>
                    <div className="overflow-y-auto flex-1">
                        {jobsLoading && filtered.length === 0 ? (
                            <div className="flex justify-center py-10">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-16 text-muted-foreground px-4">
                                <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">No job postings yet</p>
                                <Button size="sm" className="mt-3 gap-1" onClick={() => router.push('/client/jobs/new')}>
                                    <Plus className="h-3.5 w-3.5" /> Create Job
                                </Button>
                            </div>
                        ) : (
                            filtered.map((job) => {
                                const jb = job as any;
                                const dur = jb.duration;
                                const appCount = applications.filter((a) => a.job?._id === job._id).length;
                                const isSelected = selectedJob?._id === job._id;
                                return (
                                    <div
                                        key={job._id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => {
                                            setSelectedJob(job);
                                            // Only open the modal on mobile (< 640px)
                                            if (window.innerWidth < 640) {
                                                setIsMobileDetailOpen(true);
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                setSelectedJob(job);
                                                if (window.innerWidth < 640) setIsMobileDetailOpen(true);
                                            }
                                        }}
                                        className={cn(
                                            'w-full text-left px-6 py-2 border-b transition-colors cursor-pointer',
                                            isSelected
                                                ? 'border-l-4 border-l-[#8ac6dd] rounded-2xl'
                                                : 'hover:bg-muted/40 border-l-4 border-l-transparent'
                                        )}
                                    >
                                        <p className="font-semibold text-sm leading-snug mb-2">{job.title}</p>
                                        <div className="space-y-0.5 text-xs text-muted-foreground">
                                            {(jb.frequency || dur) && (
                                                <p className="flex items-center gap-1.5 flex-wrap">
                                                    <Repeat className="h-3 w-3 shrink-0" />
                                                    {[
                                                        jb.frequency,
                                                        dur ? `${dur.hours} hour${dur.hours !== 1 ? 's' : ''}, ${dur.session} session${dur.session !== 1 ? 's' : ''}` : null,
                                                        jb.startDate ? 'Starting ' + formatDate(jb.startDate) : null,
                                                    ].filter(Boolean).join(' · ')}
                                                </p>
                                            )}
                                            {formatLocation(job.location) && (
                                                <p className="flex items-center gap-1.5">
                                                    <MapPin className="h-3 w-3 shrink-0" />
                                                    {formatLocation(job.location)}
                                                </p>



                                            )}
                                            <p className="flex items-center gap-1.5">
                                                <Currency className="h-3 w-3 shrink-0" />
                                                ${job.hourlyRate ?? job.rate}/hr
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between mt-2.5">
                                            <p className="text-xs text-muted-foreground">
                                                {appCount > 0
                                                    ? <span className="font-medium text-foreground">{appCount}+ application{appCount !== 1 ? 's' : ''}</span>
                                                    : 'No applications yet'}
                                            </p>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); router.push(`/client/jobs/${job._id}/edit`); }}
                                                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                                                >
                                                    <Edit className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setDeleteConfirmation({ isOpen: true, _id: job._id, title: job.title }); }}
                                                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive cursor-pointer"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* RIGHT: detail */}
                <div className="flex-1 min-w-0 p-6 overflow-y-auto hidden sm:block">
                    {selectedJob ? (
                        <JobDetailPanel
                            job={selectedJob}
                            onEdit={() => router.push(`/client/jobs/${selectedJob._id}/edit`)}
                            onApplicants={() => viewApplicants(selectedJob._id)}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                            <Briefcase className="h-12 w-12 mb-3 opacity-20" />
                            <p className="text-sm font-medium">Select a job to view details</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Detail Modal */}
            <Dialog open={isMobileDetailOpen} onOpenChange={setIsMobileDetailOpen}>
                <DialogContent className="sm:hidden max-w-[95vw] max-h-[85vh] overflow-y-auto rounded-2xl p-0">
                    <DialogHeader className="px-6 pt-6 pb-2">
                        <DialogTitle>Job Details</DialogTitle>
                        <DialogDescription>Full details for this job posting</DialogDescription>
                    </DialogHeader>
                    <div className="px-6 pb-6">
                        {selectedJob && (
                            <JobDetailPanel
                                job={selectedJob}
                                onEdit={() => { setIsMobileDetailOpen(false); router.push(`/client/jobs/${selectedJob._id}/edit`); }}
                                onApplicants={() => { setIsMobileDetailOpen(false); viewApplicants(selectedJob._id); }}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Applicants Drawer */}
            <Drawer open={isApplicantsDrawerOpen} onOpenChange={setIsApplicantsDrawerOpen} direction="right">
                <DrawerContent className="max-w-2xl">
                    <DrawerHeader>
                        <DrawerTitle>Job Applicants</DrawerTitle>
                        <DrawerDescription>Review and manage applications for this position</DrawerDescription>
                    </DrawerHeader>
                    <div className="overflow-y-auto px-6 pb-6">
                        {applicationsLoading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                            </div>
                        ) : selectedJobApplications.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                                No applications yet for this job
                            </div>
                        ) : (
                            <div className="space-y-4 mt-2">
                                {selectedJobApplications.map((application) => (
                                    <Card key={application._id} className="hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between flex-wrap-reverse gap-3">
                                                <div className="flex gap-3 min-w-0">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                                                            {`${application.applicant?.firstName ?? ''} ${application.applicant?.lastName ?? ''}`
                                                                .trim()
                                                                .split(' ')
                                                                .map((n) => n[0])
                                                                .join('')}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-sm truncate">
                                                            {`${application.applicant?.firstName ?? ''} ${application.applicant?.lastName ?? ''}`.trim() || 'Unknown'}
                                                        </p>
                                                        <div className="text-xs text-muted-foreground mt-0.5 space-y-0.5">
                                                            <div className="flex items-center gap-1">
                                                                <Mail className="h-3 w-3" />
                                                                <span className="truncate max-w-[180px] sm:max-w-[300px] block">{application.applicant?.email}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Users className="h-3 w-3" />
                                                                <Link href={`/profile/${application.applicant?._id}`} className="text-blue-500 hover:underline">
                                                                    <span className="truncate max-w-[180px] sm:max-w-[300px] block">View Worker Profile</span>
                                                                </Link>
                                                            </div>
                                                            {application.applicant?.phoneNumber && (
                                                                <div className="flex items-center gap-1">
                                                                    <Phone className="h-3 w-3" />
                                                                    <span className="truncate max-w-[140px] sm:max-w-[220px] block">{application.applicant.phoneNumber}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Badge variant={application.status === 'accepted' ? 'default' : application.status === 'rejected' ? 'destructive' : 'secondary'} className="capitalize shrink-0">
                                                    {application.status}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-0 space-y-3">
                                            {application.introduction && (
                                                <div>
                                                    <p className="text-xs font-semibold text-muted-foreground mb-1">Introduction</p>
                                                    <p className="text-sm">{application.introduction}</p>
                                                </div>
                                            )}
                                            {application.skills && (
                                                <div>
                                                    <p className="text-xs font-semibold text-muted-foreground mb-1">Skills</p>
                                                    <p className="text-sm">{application.skills}</p>
                                                </div>
                                            )}
                                            {(application.availability ?? []).length > 0 && (
                                                <div>
                                                    <p className="text-xs font-semibold text-muted-foreground mb-1">Availability</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {application.availability.map((a, i) => (
                                                            <Badge key={i} variant="outline" className="text-xs capitalize">
                                                                {a.day}{a.period?.length > 0 ? `: ${a.period.map(p => `${p.startTime}–${p.endTime}`).join(', ')}` : ''}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <p className="text-xs text-muted-foreground">Applied {new Date(application.createdAt).toLocaleDateString()}</p>
                                            {application.status === 'pending' && (
                                                <div className="flex gap-2 pt-1">
                                                    <Button variant="default" size="sm" className="flex-1 gap-1.5 cursor-pointer" onClick={() => dispatch(acceptApplication(application._id))}>
                                                        <Check className="h-3.5 w-3.5" /> Accept
                                                    </Button>
                                                    <Button variant="destructive" size="sm" className="flex-1 gap-1.5" onClick={() => dispatch(rejectApplication(application._id))}>
                                                        <X className="h-3.5 w-3.5" /> Reject
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                    <DrawerFooter>
                        <DrawerClose asChild><Button variant="outline">Close</Button></DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>

            <DeleteConfirmation
                isOpen={deleteConfirmation.isOpen}
                onClose={() => setDeleteConfirmation({ isOpen: false, _id: null, title: '' })}
                onConfirm={handleDeleteJob}
                title="Delete Job Posting"
                itemName={deleteConfirmation.title}
                description="This will permanently delete this job posting. This action cannot be undone."
            />
        </div>
    );
}
