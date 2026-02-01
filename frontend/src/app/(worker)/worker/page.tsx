'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, DollarSign, Clock } from 'lucide-react';

export default function WorkerOverview() {
    const { user } = useSelector((state: RootState) => state.auth);
    // Mock data for overview
    const completion: number = 45;
    const recentJobs = [
        { id: 1, title: 'Morning Support', client: 'Alice Freeman', date: 'Today, 9:00 AM', status: 'Upcoming' },
        { id: 2, title: 'Weekend Care', client: 'Bob Smith', date: 'Sat, 10:00 AM', status: 'Pending' },
    ];

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Welcome back, {user?.name?.split(' ')[0] || 'Worker'}!</h1>
                    <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your account today.</p>
                </div>
                <div className="flex items-center space-x-2">
                     <Link href="/worker/jobs"><Button>Find Jobs</Button></Link>
                    <Link href="/worker/schedule"><Button  variant="outline">View Calendar</Button></Link>
                </div>
            </div>

            {/* Profile Completion Card */}
            <Card className="border-l-4 border-l-blue-600">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold">Profile Completeness</CardTitle>
                        <Badge variant={completion === 100 ? "default" : "secondary"}>{completion}% Complete</Badge>
                    </div>
                    <CardDescription>Complete your profile to unlock job applications and invoicing.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Progress value={completion} className="h-2 mb-4" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-green-600"><CheckCircle2 className="h-4 w-4" /> Personal Info</div>
                        <div className="flex items-center gap-2 text-green-600"><CheckCircle2 className="h-4 w-4" /> Availability</div>
                        <div className="flex items-center gap-2 text-muted-foreground"><AlertCircle className="h-4 w-4" /> Bank Details</div>
                        <div className="flex items-center gap-2 text-muted-foreground"><AlertCircle className="h-4 w-4" /> Credentials</div>
                    </div>
                    <div className="mt-4">
                        <Link href="/worker/profile">
                            <Button variant="outline" size="sm">Continue Setup</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$1,240.50</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
                        <UsersIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground">2 pending requests</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Hours Worked</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">24.5h</div>
                        <p className="text-xs text-muted-foreground">This week</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Task Compliance</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">98%</div>
                        <p className="text-xs text-muted-foreground">On-time submissions</p>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}

function UsersIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}