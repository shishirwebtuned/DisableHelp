'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchJobs, setViewMode } from '@/redux/slices/jobsSlice';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Search,
    LayoutGrid,
    LayoutList,
    MapPin,
    DollarSign,
    Clock,
    Filter,
    Briefcase
} from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export default function WorkerJobsPage() {
    const dispatch = useAppDispatch();
    const { jobs, loading, viewMode } = useAppSelector((state) => state.jobs);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        dispatch(fetchJobs());
    }, [dispatch]);

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Find Jobs</h1>
                    <p className="text-muted-foreground">Browse available support worker positions</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={viewMode === 'card' ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => dispatch(setViewMode('card'))}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'table' ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => dispatch(setViewMode('table'))}
                    >
                        <LayoutList className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search jobs by title, location, or keywords..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                </Button>
            </div>

            {/* Jobs Display */}
            {loading ? (
                <JobsSkeleton viewMode={viewMode} />
            ) : viewMode === 'card' ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredJobs.map((job) => (
                        <Card key={job.id} className="flex flex-col hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1 flex-1">
                                        <CardTitle className="text-lg line-clamp-2">{job.title}</CardTitle>
                                        <CardDescription className="flex items-center gap-1">
                                            <Briefcase className="h-3 w-3" />
                                            {job.clientName}
                                        </CardDescription>
                                    </div>
                                    <Badge variant={job.status === 'published' ? 'default' : 'secondary'}>
                                        {job.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-3">
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    {job.description}
                                </p>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        {job.location}
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <DollarSign className="h-4 w-4" />
                                        ${job.rate}/hour
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        {job.hoursPerWeek} hours/week
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {job.tags.slice(0, 3).map((tag) => (
                                        <Badge key={tag} variant="outline" className="text-xs">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter className="flex gap-2">
                                <Link href={`/worker/jobs/${job.id}`} className="flex-1">
                                    <Button className="w-full">View Details</Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Job Title</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Rate</TableHead>
                                <TableHead>Hours/Week</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredJobs.map((job) => (
                                <TableRow key={job.id}>
                                    <TableCell className="font-medium">{job.title}</TableCell>
                                    <TableCell>{job.clientName}</TableCell>
                                    <TableCell>{job.location}</TableCell>
                                    <TableCell>${job.rate}/hr</TableCell>
                                    <TableCell>{job.hoursPerWeek}</TableCell>
                                    <TableCell>
                                        <Badge variant={job.status === 'published' ? 'default' : 'secondary'}>
                                            {job.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/worker/jobs/${job.id}`}>
                                            <Button size="sm" variant="outline">View</Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}

            {filteredJobs.length === 0 && !loading && (
                <Card className="p-12">
                    <div className="text-center text-muted-foreground">
                        <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                        <p>Try adjusting your search criteria</p>
                    </div>
                </Card>
            )}
        </div>
    );
}

function JobsSkeleton({ viewMode }: { viewMode: 'card' | 'table' }) {
    if (viewMode === 'card') {
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <Card>
            <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                ))}
            </div>
        </Card>
    );
}
