'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import RichTextEditor from '@/components/ui/rich-text-editor2';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';
import { Plus, Briefcase, MapPin, DollarSign, Calendar, Clock, Users, Edit, Trash2, Eye, TrendingUp, Check, X, Mail, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchApplications, acceptApplication, rejectApplication } from '@/redux/slices/applicationsSlice';
import { fetchJobs, createJob, updateJobThunk, deleteJobThunk } from '@/redux/slices/jobsSlice';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { DeleteConfirmation } from '@/components/common/DeleteConfirmation';

export default function ClientJobsPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const applications = useAppSelector((state) => state.applications.items);
    const applicationsLoading = useAppSelector((state) => state.applications.loading);
    const myJobs = useAppSelector((state) => state.jobs.jobs);
    const jobsLoading = useAppSelector((state) => state.jobs.loading);
    
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isApplicantsDrawerOpen, setIsApplicantsDrawerOpen] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [editingJob, setEditingJob] = useState<any>(null);
    const [jobStartDate, setJobStartDate] = useState<Date>();
    const [description, setDescription] = useState('');
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; id: string | null; title: string }>({ isOpen: false, id: null, title: '' });

    useEffect(() => {
        dispatch(fetchJobs());
        dispatch(fetchApplications()); // Fetch all applications
    }, [dispatch]);

    const openForNew = () => {
        setEditingJob(null);
        setDescription('');
        setJobStartDate(undefined);
        setIsDrawerOpen(true);
    };

    const openForEdit = (job: any) => {
        setEditingJob(job);
        setDescription(job.description);
        setJobStartDate(job.startDate ? new Date(job.startDate) : undefined);
        setIsDrawerOpen(true);
    };

    const handleDeleteJob = () => {
        if (deleteConfirmation.id) {
            dispatch(deleteJobThunk(deleteConfirmation.id));
            setDeleteConfirmation({ isOpen: false, id: null, title: '' });
        }
    };

    const viewApplicants = (jobId: string) => {
        setSelectedJobId(jobId);
        dispatch(fetchApplications(jobId));
        setIsApplicantsDrawerOpen(true);
    };

    const handleAcceptApplication = (applicationId: string) => {
        dispatch(acceptApplication(applicationId));
    };

    const handleRejectApplication = (applicationId: string) => {
        dispatch(rejectApplication(applicationId));
    };

    const totalApplicants = applications.length;
    const publishedJobs = myJobs.filter(job => job.status === 'published').length;

    const selectedJobApplications = selectedJobId 
        ? applications.filter(app => app.jobId === selectedJobId)
        : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Job Postings</h1>
                    <p className="text-muted-foreground">Create and manage your job listings to find the perfect support worker</p>
                </div>
                <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} direction="right">
                    <DrawerTrigger asChild>
                        <Button onClick={openForNew} size="lg" className="gap-2">
                            <Plus className="h-5 w-5" />
                            Create Job
                        </Button>
                    </DrawerTrigger>
                    <DrawerContent className="">
                        <DrawerHeader>
                            <DrawerTitle>{editingJob ? 'Edit Job Posting' : 'Create New Job Posting'}</DrawerTitle>
                            <DrawerDescription>
                                {editingJob ? 'Update your job details below' : 'Fill in the details for your job listing'}
                            </DrawerDescription>
                        </DrawerHeader>
                        <div className="overflow-y-auto px-6 pb-6">
                            <JobForm 
                                job={editingJob}
                                description={description}
                                setDescription={setDescription}
                                jobStartDate={jobStartDate}
                                setJobStartDate={setJobStartDate}
                                onClose={() => setIsDrawerOpen(false)}
                            />
                        </div>
                    </DrawerContent>
                </Drawer>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{myJobs.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {publishedJobs} published, {myJobs.length - publishedJobs} draft
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalApplicants}</div>
                        <p className="text-xs text-muted-foreground">
                            Across all job postings
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Postings</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{publishedJobs}</div>
                        <p className="text-xs text-muted-foreground">
                            Currently accepting applications
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Existing Jobs */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">My Job Postings</h2>
                    <div className="flex gap-2">
                        <Select defaultValue="all">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Jobs</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="draft">Drafts</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {myJobs.map((job) => (
                    <Card key={job.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-3">
                                        <CardTitle className="text-xl">{job.title}</CardTitle>
                                        <Badge 
                                            variant={job.status === 'published' ? 'default' : 'secondary'}
                                            className="capitalize"
                                        >
                                            {job.status}
                                        </Badge>
                                    </div>
                                    <CardDescription className="flex items-center gap-4">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            Posted {new Date(job.createdAt).toLocaleDateString()}
                                        </span>
                                        {applications.filter(app => app.jobId === job.id).length > 0 && (
                                            <span className="flex items-center gap-1 text-primary font-medium">
                                                <Users className="h-3 w-3" />
                                                {applications.filter(app => app.jobId === job.id).length} new {applications.filter(app => app.jobId === job.id).length === 1 ? 'applicant' : 'applicants'}
                                            </span>
                                        )}
                                    </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => openForEdit(job)}
                                        className="gap-2"
                                    >
                                        <Edit className="h-4 w-4" />
                                        Edit
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="gap-2"
                                        onClick={() => viewApplicants(job.id)}
                                    >
                                        <Eye className="h-4 w-4" />
                                        View Applicants ({applications.filter(app => app.jobId === job.id).length})
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => setDeleteConfirmation({ isOpen: true, id: job.id, title: job.title })}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                                <Separator />
                                <div className="flex items-center gap-6 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        <span>{job.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <DollarSign className="h-4 w-4" />
                                        <span className="font-medium text-foreground">${job.rate}/hour</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        <span>{job.hoursPerWeek} hours/week</span>
                                    </div>
                                </div>
                                {job.requirements && job.requirements.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {job.requirements.map((req, idx) => (
                                            <Badge key={idx} variant="outline" className="text-xs">
                                                {req}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Applicants Drawer */}
            <Drawer open={isApplicantsDrawerOpen} onOpenChange={setIsApplicantsDrawerOpen} direction="right">
                <DrawerContent className="max-w-2xl">
                    <DrawerHeader>
                        <DrawerTitle>Job Applicants</DrawerTitle>
                        <DrawerDescription>
                            Review and manage applications for this position
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="overflow-y-auto px-6 pb-6">
                        {applicationsLoading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : selectedJobApplications.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No applications yet for this job
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {selectedJobApplications.map((application) => (
                                    <Card key={application.id} className="hover:shadow-md transition-shadow">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex gap-4">
                                                    <Avatar className="h-12 w-12">
                                                        <AvatarFallback className="bg-primary text-primary-foreground">
                                                            {application.workerName.split(' ').map(n => n[0]).join('')}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="space-y-1">
                                                        <CardTitle 
                                                            className="text-lg cursor-pointer hover:text-primary transition-colors"
                                                            onClick={() => router.push(`/profile/${application.workerId}`)}
                                                        >
                                                            {application.workerName}
                                                        </CardTitle>
                                                        <CardDescription className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <Mail className="h-3 w-3" />
                                                                <span>{application.workerEmail}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Phone className="h-3 w-3" />
                                                                <span>{application.workerPhone}</span>
                                                            </div>
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                                <Badge 
                                                    variant={
                                                        application.status === 'accepted' ? 'default' : 
                                                        application.status === 'rejected' ? 'destructive' : 
                                                        'secondary'
                                                    }
                                                    className="capitalize"
                                                >
                                                    {application.status}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <h4 className="text-sm font-semibold mb-2">Experience</h4>
                                                <p className="text-sm text-muted-foreground">{application.workerExperience}</p>
                                            </div>
                                            
                                            <div>
                                                <h4 className="text-sm font-semibold mb-2">Cover Letter</h4>
                                                <p className="text-sm text-muted-foreground">{application.coverLetter}</p>
                                            </div>

                                            {application.skills && application.skills.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-semibold mb-2">Skills</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {application.skills.map((skill, idx) => (
                                                            <Badge key={idx} variant="outline">
                                                                {skill}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div>
                                                <h4 className="text-sm font-semibold mb-2">Availability</h4>
                                                <p className="text-sm text-muted-foreground">{application.availability}</p>
                                            </div>

                                            <div className="text-xs text-muted-foreground">
                                                Applied on {new Date(application.appliedAt).toLocaleDateString()}
                                            </div>

                                            {application.status === 'pending' && (
                                                <div className="flex gap-2 pt-2">
                                                    <Button 
                                                        variant="default" 
                                                        className="flex-1 gap-2"
                                                        onClick={() => handleAcceptApplication(application.id)}
                                                    >
                                                        <Check className="h-4 w-4" />
                                                        Accept Application
                                                    </Button>
                                                    <Button 
                                                        variant="destructive" 
                                                        className="flex-1 gap-2"
                                                        onClick={() => handleRejectApplication(application.id)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                        Reject
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
                        <DrawerClose asChild>
                            <Button variant="outline">Close</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>

            {/* Delete Confirmation */}
            <DeleteConfirmation
                isOpen={deleteConfirmation.isOpen}
                onClose={() => setDeleteConfirmation({ isOpen: false, id: null, title: '' })}
                onConfirm={handleDeleteJob}
                title="Delete Job Posting"
                itemName={deleteConfirmation.title}
                description="This will permanently delete this job posting and all associated applications. This action cannot be undone."
            />
        </div>
    );
}

function JobForm({ 
    job, 
    description, 
    setDescription, 
    jobStartDate, 
    setJobStartDate,
    onClose 
}: { 
    job?: any; 
    description: string;
    setDescription: (val: string) => void;
    jobStartDate?: Date;
    setJobStartDate: (date: Date | undefined) => void;
    onClose: () => void;
}) {
    const dispatch = useAppDispatch();
    const [formData, setFormData] = useState({
        title: job?.title || '',
        location: job?.location || '',
        rate: job?.rate?.toString() || '',
        hours: job?.hours?.toString() || '',
        requirements: job?.requirements?.join('\n') || '',
    });

    const handleSubmit = (isDraft: boolean) => {
        const jobData = {
            title: formData.title,
            description: description,
            location: formData.location,
            rate: parseFloat(formData.rate),
            hoursPerWeek: parseFloat(formData.hours),
            requirements: formData.requirements.split('\n').filter((r: string) => r.trim()),
            startDate: jobStartDate ? jobStartDate.toISOString() : '',
            status: isDraft ? 'draft' as const : 'published' as const,
            tags: [],
        };

        if (job) {
            dispatch(updateJobThunk({ id: job.id, jobData }));
        } else {
            dispatch(createJob(jobData));
        }
        onClose();
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input 
                    id="title" 
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Personal Care Support Worker" 
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Job Description *</Label>
                <RichTextEditor
                    value={description}
                    onChange={setDescription}
                    placeholder="Describe the role, responsibilities, and what you're looking for..."
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input 
                        id="location" 
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Sydney, NSW" 
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="rate">Hourly Rate ($) *</Label>
                    <Input 
                        id="rate" 
                        type="number" 
                        value={formData.rate}
                        onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                        placeholder="45" 
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="hours">Hours per Week *</Label>
                    <Input 
                        id="hours" 
                        type="number" 
                        value={formData.hours}
                        onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                        placeholder="15" 
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <DatePicker
                        date={jobStartDate}
                        setDate={setJobStartDate}
                        placeholder="Select a start date"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="requirements">Requirements (one per line)</Label>
                <Textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    placeholder="NDIS Worker Screening&#10;First Aid Certificate&#10;Experience with elderly care"
                    rows={4}
                />
            </div>

            <DrawerFooter className="px-0 pt-4">
                <div className="flex gap-2 w-full">
                    <Button 
                        variant="outline" 
                        className="flex-1" 
                        onClick={() => handleSubmit(true)}
                    >
                        Save as Draft
                    </Button>
                    <Button 
                        className="flex-1" 
                        onClick={() => handleSubmit(false)}
                    >
                        {job ? 'Update Job' : 'Publish Job'}
                    </Button>
                </div>
                <DrawerClose asChild>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                </DrawerClose>
            </DrawerFooter>
        </div>
    );
}
