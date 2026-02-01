'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Briefcase, Calendar, MessageSquare, Plus } from 'lucide-react';
import Link from 'next/link';

export default function ClientDashboard() {
    const stats = {
        activeWorkers: 2,
        pendingApplications: 3,
        upcomingSessions: 5,
        unreadMessages: 4,
    };

    const upcomingSessions = [
        { id: 1, worker: 'Sarah Worker', date: 'Today, 2:00 PM', type: 'Personal Care' },
        { id: 2, worker: 'John Support', date: 'Tomorrow, 10:00 AM', type: 'Community Access' },
        { id: 3, worker: 'Sarah Worker', date: 'Wed, 2:00 PM', type: 'Personal Care' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Welcome back, John!</h1>
                    <p className="text-muted-foreground">Manage your support services and workers</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/client/jobs">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Post Job
                        </Button>
                    </Link>
                    <Link href="/client/sessions">
                        <Button variant="outline">
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule Session
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Workers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeWorkers}</div>
                        <p className="text-xs text-muted-foreground">Currently engaged</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingApplications}</div>
                        <p className="text-xs text-muted-foreground">Awaiting review</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.upcomingSessions}</div>
                        <p className="text-xs text-muted-foreground">Next 7 days</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Messages</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.unreadMessages}</div>
                        <p className="text-xs text-muted-foreground">Unread</p>
                    </CardContent>
                </Card>
            </div>

            {/* Upcoming Sessions */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Upcoming Sessions</CardTitle>
                            <CardDescription>Your scheduled support sessions</CardDescription>
                        </div>
                        <Link href="/client/sessions">
                            <Button variant="outline" size="sm">View All</Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {upcomingSessions.map((session) => (
                            <div
                                key={session.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Calendar className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <div className="font-medium">{session.worker}</div>
                                        <div className="text-sm text-muted-foreground">{session.type}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium">{session.date}</div>
                                    <Badge variant="outline" className="mt-1">Confirmed</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Manage Workers
                        </CardTitle>
                        <CardDescription>View and manage your support workers</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/client/workers">
                            <Button variant="outline" className="w-full">Go to Workers</Button>
                        </Link>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5" />
                            Job Postings
                        </CardTitle>
                        <CardDescription>Create and manage job listings</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/client/jobs">
                            <Button variant="outline" className="w-full">Manage Jobs</Button>
                        </Link>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Messages
                        </CardTitle>
                        <CardDescription>Communicate with your workers</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/client/inbox">
                            <Button variant="outline" className="w-full">Open Inbox</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
