'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Briefcase, Calendar, FileText, Search, Users } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useEffect } from 'react';
import { getAgreementsByWorker } from '@/redux/slices/agreementsSlice';
import { fetchSessionsByUser } from '@/redux/slices/sessionsSlice';
import { fetchMyInvoicesAsWorker } from '@/redux/slices/invoiceSlice';
import { fetchMyClients } from '@/redux/slices/usersSlice';

export default function WorkerOverview() {
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
    const activeClients = useAppSelector((state) => state.users.myClients.length);

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
            client: s.client?.firstName ? `${s.client.firstName} ${s.client.lastName || ''}` : 'Client',
            date: `${new Date(s.date).toLocaleDateString()} ${s.startTime || ''}`,
            status: s.status,
            type: s.job?.title || 'Session',
        }));

    useEffect(() => {
        dispatch(fetchMyClients());
        dispatch(getAgreementsByWorker({}));
        dispatch(fetchSessionsByUser());
        dispatch(fetchMyInvoicesAsWorker({}));

    }, [dispatch]);

    const stats = {
        activeClients,
        activeAgreements,
        upcomingSessions: sessions.filter((s) => s.status === 'scheduled').length,
        pendingInvoices,
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Welcome back, {user?.firstName?.split(' ')[0] || 'Worker'}!</h1>
                    <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your account today.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Link href="/worker/jobs">
                        <Button>
                            <Search className="h-4 w-4 mr-2" />Find Jobs
                        </Button>
                    </Link>
                    <Link href="/worker/sessions">
                        <Button variant="outline">
                            <Calendar className="h-4 w-4 mr-2" />
                            View Sessions
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Profile Completion Card */}
            {/* <Card>
                <CardHeader>
                    <CardTitle>Profile Completion</CardTitle>
                    <CardDescription>Your profile is {completion}% complete</CardDescription>
                </CardHeader>
                <CardContent>
                    <Progress value={completion} className="w-full" />
                </CardContent>
            </Card> */}

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeClients}</div>
                        <p className="text-xs text-muted-foreground">Currently Engaged</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Agreements</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />

                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeAgreements}</div>
                        <p className="text-xs text-muted-foreground">Ongoing</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming Session</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.upcomingSessions}
                        </div>
                        <p className="text-xs text-muted-foreground">Next 7 days</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Invoices</CardTitle>

                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.pendingInvoices}
                        </div>
                        <p className="text-xs text-muted-foreground">Pending</p>
                    </CardContent>
                </Card>
            </div>
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
                                            <div className="font-medium">{session.client}</div>
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
        </div>
    );
}