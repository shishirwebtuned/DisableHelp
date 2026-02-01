'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchJobs, applyToJob } from '@/redux/slices/jobsSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    MapPin,
    DollarSign,
    Clock,
    Calendar,
    Briefcase,
    CheckCircle2,
    ArrowLeft,
    Send
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function JobDetailPage() {
    const params = useParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { jobs, loading } = useAppSelector((state) => state.jobs);
    const { user } = useAppSelector((state) => state.auth);
    const { workerProfile } = useAppSelector((state) => state.profile);
    const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
    const [coverLetter, setCoverLetter] = useState('');

    const jobId = params.id as string;
    const job = jobs.find(j => j.id === jobId);

    useEffect(() => {
        if (jobs.length === 0) {
            dispatch(fetchJobs());
        }
    }, [dispatch, jobs.length]);

    if (loading && !job) {
        return <div>Loading...</div>;
    }

    if (!job) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4">Job not found</h2>
                <Link href="/worker/jobs">
                    <Button>Back to Jobs</Button>
                </Link>
            </div>
        );
    }

    const canApply = workerProfile && workerProfile.completeness === 100;

    const handleApply = async () => {
        if (!user?.id || !coverLetter.trim()) return;

        await dispatch(applyToJob({
            jobId: job.id,
            workerId: user.id,
            coverLetter,
        }));

        setIsApplyDialogOpen(false);
        setCoverLetter('');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/worker/jobs">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
                    <p className="text-muted-foreground">Posted by {job.clientName}</p>
                </div>
                <Badge variant={job.status === 'published' ? 'default' : 'secondary'}>
                    {job.status}
                </Badge>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Job Description</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground leading-relaxed">{job.description}</p>

                            <Separator />

                            <div>
                                <h3 className="font-semibold mb-3">Requirements</h3>
                                <ul className="space-y-2">
                                    {job.requirements.map((req, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-muted-foreground">{req}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <Separator />

                            <div>
                                <h3 className="font-semibold mb-3">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {job.tags.map((tag) => (
                                        <Badge key={tag} variant="outline">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Job Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <DollarSign className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Hourly Rate</div>
                                    <div className="font-semibold">${job.rate}/hour</div>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Hours per Week</div>
                                    <div className="font-semibold">{job.hoursPerWeek} hours</div>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <MapPin className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Location</div>
                                    <div className="font-semibold">{job.location}</div>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Calendar className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Start Date</div>
                                    <div className="font-semibold">
                                        {new Date(job.startDate).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Briefcase className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Posted</div>
                                    <div className="font-semibold">
                                        {new Date(job.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Apply for this Job</CardTitle>
                            <CardDescription>
                                {canApply
                                    ? 'Submit your application with a cover letter'
                                    : 'Complete your profile to apply'
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!canApply && (
                                <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                    <p className="text-sm text-amber-800 dark:text-amber-200">
                                        Your profile must be 100% complete to apply for jobs.
                                    </p>
                                    <Link href="/worker/profile">
                                        <Button variant="link" className="p-0 h-auto text-amber-900 dark:text-amber-100">
                                            Complete your profile →
                                        </Button>
                                    </Link>
                                </div>
                            )}

                            <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="w-full" disabled={!canApply}>
                                        <Send className="h-4 w-4 mr-2" />
                                        Apply Now
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Apply for {job.title}</DialogTitle>
                                        <DialogDescription>
                                            Write a cover letter to introduce yourself to the client
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="coverLetter">Cover Letter</Label>
                                            <Textarea
                                                id="coverLetter"
                                                value={coverLetter}
                                                onChange={(e) => setCoverLetter(e.target.value)}
                                                placeholder="Tell the client why you're a great fit for this position..."
                                                rows={8}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsApplyDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleApply} disabled={!coverLetter.trim()}>
                                            Submit Application
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
