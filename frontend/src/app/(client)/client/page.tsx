'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Briefcase, Calendar, MessageSquare, Plus, FileText } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchMyWorkers } from '@/redux/slices/usersSlice';
import { fetchApplicationsByApplicantId } from '@/redux/slices/applicationsSlice';
import { fetchSessionsByUser } from '@/redux/slices/sessionsSlice';
import { getAgreementsByClient } from '@/redux/slices/agreementsSlice';
import { fetchMyInvoicesAsClient } from '@/redux/slices/invoiceSlice';

export default function ClientDashboard() {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const userId = user?._id;

    // Agreements
    const { items: agreements } = useAppSelector((state) => state.agreements);

    // Sessions
    const sessions = useAppSelector((state) => state.sessions.items);
    const sessionsLoading = useAppSelector((state) => state.sessions.loading);

    // Invoices
    const { items: invoices } = useAppSelector((state) => state.invoices);

    // Counts
    const activeWorkers = useAppSelector((state) => state.users.myWorkers.length);

    const activeAgreements = agreements?.length || 0;

    const pendingInvoices = invoices?.filter(
        (inv: any) => inv.status === 'pending'
    ).length;


    const upcomingSessions = sessions
        .filter((s) => s.status === 'scheduled')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3)
        .map((s) => ({
            id: s._id,
            worker: s.worker?.firstName ? `${s.worker.firstName} ${s.worker.lastName || ''}` : 'Worker',
            date: `${new Date(s.date).toLocaleDateString()} ${s.startTime || ''}`,
            status: s.status,
            type: s.job?.title || 'Session',
        }));

    useEffect(() => {
        dispatch(fetchMyWorkers());
        dispatch(getAgreementsByClient({}));
        dispatch(fetchSessionsByUser());
        dispatch(fetchMyInvoicesAsClient({}));

    }, [dispatch]);

    const stats = {
        activeWorkers,
        activeAgreements,
        upcomingSessions: sessions.filter((s) => s.status === 'scheduled').length,
        pendingInvoices,
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.firstName?.split(' ')[0] || 'Client'}!</h1>
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
                            View Sessions
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
                        <CardTitle className="text-sm font-medium">Active Agreements</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeAgreements}</div>
                        <p className="text-xs text-muted-foreground">Ongoing </p>
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
                        <CardTitle className="text-sm font-medium">Invoices</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingInvoices}</div>
                        <p className="text-xs text-muted-foreground">Pending</p>
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
                        {sessionsLoading ? (
                            <div>Loading...</div>
                        ) : upcomingSessions.length === 0 ? (
                            <div className="text-muted-foreground">No upcoming sessions.</div>
                        ) : (
                            upcomingSessions.map((session) => (
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
                                        <Badge variant="outline" className="mt-1">{session?.status}</Badge>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            {/* <div className="grid gap-4 md:grid-cols-3">
                <div className="hover:shadow-lg transition-shadow cursor-pointer">
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
                </div>
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
            </div> */}
        </div>
    );
}
