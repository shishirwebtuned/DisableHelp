'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Users,
    UserCheck,
    FileText,
    Shield,
    TrendingUp,
    AlertCircle,
    MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchUsers } from '@/redux/slices/usersSlice';
import { fetchAgreements } from '@/redux/slices/agreementsSlice';
import { fetchAllInvoices } from '@/redux/slices/invoiceSlice';
import { fetchAllPayments } from '@/redux/slices/paymentSlice';

export default function AdminDashboard() {
    const dispatch = useAppDispatch();
    const { items: users } = useAppSelector((state) => state.users);
    const { items: agreements } = useAppSelector((state) => state.agreements);
    const { items: invoices } = useAppSelector((state) => state.invoices);
    const { items: payments } = useAppSelector((state) => state.payments);

    useEffect(() => {
        dispatch(fetchUsers());
        dispatch(fetchAgreements({}));
        dispatch(fetchAllInvoices());
        dispatch(fetchAllPayments({}));
    }, [dispatch]);

    const totalWorkers = users.filter((u) => u.role === 'worker').length;
    const ndisProviders = users.filter((u) => u.role === 'worker' && u.isNdisProvider).length;
    const individualWorkers = totalWorkers - ndisProviders;
    const totalClients = users.filter((u) => u.role === 'client').length;
    const activeAgreements = agreements.filter((a) => a.status === 'active').length;
    const pendingInvoices = invoices.filter((inv) => inv.status === 'pending').length;
    const totalRevenue = payments.reduce((sum, p) => sum + (p.status === 'successful' ? p.totalAmount : 0), 0);
    // Placeholder for credential issues: count users with verification not 'verified'
    const credentialIssues = users.filter((u) => u.role === 'worker' && u.approved !== true).length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Platform Overview</h1>
                    <p className="text-muted-foreground">Monitor and manage the Disable Help Platform</p>
                </div>
                <div className="flex gap-2">
                    {/* <Button variant="outline">Export Report</Button>
                    <Button>Platform Settings</Button> */}
                </div>
            </div>

            {/* Platform Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalWorkers}</div>
                        <p className="text-xs text-muted-foreground">+12 this month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalClients}</div>
                        <p className="text-xs text-muted-foreground">+8 this month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Agreements</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeAgreements}</div>
                        <p className="text-xs text-muted-foreground">Worker-Client pairs</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingInvoices}</div>
                        <p className="text-xs text-muted-foreground">Awaiting approval</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">This month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Credential Issues</CardTitle>
                        <AlertCircle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{credentialIssues}</div>
                        <p className="text-xs text-muted-foreground">Require attention</p>
                    </CardContent>
                </Card>
            </div>

            {/* Credential Status */}


            {/* <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Latest platform events and actions</CardDescription>
                        </div>
                        <Button variant="outline" size="sm">View All</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentActivity.map((activity) => (
                            <div
                                key={activity.id}
                                className="flex items-start gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    {activity.type === 'invoice' && <FileText className="h-4 w-4 text-primary" />}
                                    {activity.type === 'agreement' && <FileText className="h-4 w-4 text-primary" />}
                                    {activity.type === 'credential' && <Shield className="h-4 w-4 text-primary" />}
                                    {activity.type === 'user' && <Users className="h-4 w-4 text-primary" />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{activity.message}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card> */}

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-4">
                <Link href="/admin/invoices">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Invoices
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Badge variant="secondary">{pendingInvoices} pending</Badge>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/admin/agreements">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Agreements
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Badge variant="secondary">{activeAgreements} active</Badge>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/admin/users">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Users
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Badge variant="secondary">{totalWorkers + totalClients} total</Badge>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/admin/users">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Ndis Providers
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Badge variant="secondary">{ndisProviders} total</Badge>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/admin/users">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Individual Workers
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Badge variant="secondary">{individualWorkers} total</Badge>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/admin/messages">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Messages
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Badge variant="secondary">Oversight</Badge>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
