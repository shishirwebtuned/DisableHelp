'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Users,
    UserCheck,
    FileText,
    MessageSquare,
    Shield,
    TrendingUp,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
    const platformMetrics = {
        totalWorkers: 156,
        totalClients: 89,
        activeAgreements: 124,
        pendingInvoices: 23,
        totalRevenue: 45680,
        credentialIssues: 8,
    };

    const credentialStatus = {
        valid: 142,
        expiringSoon: 8,
        expired: 6,
    };

    const recentActivity = [
        { id: 1, type: 'invoice', message: 'New invoice submitted by Sarah Worker', time: '5 min ago' },
        { id: 2, type: 'agreement', message: 'Agreement activated: Alice Freeman & John Support', time: '1 hour ago' },
        { id: 3, type: 'credential', message: 'WWCC expiring soon for 3 workers', time: '2 hours ago' },
        { id: 4, type: 'user', message: 'New worker registration: Emma Care', time: '3 hours ago' },
    ];

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Platform Overview</h1>
                    <p className="text-muted-foreground">Monitor and manage the Disable Help Platform</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Export Report</Button>
                    <Button>Platform Settings</Button>
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
                        <div className="text-2xl font-bold">{platformMetrics.totalWorkers}</div>
                        <p className="text-xs text-muted-foreground">+12 this month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{platformMetrics.totalClients}</div>
                        <p className="text-xs text-muted-foreground">+8 this month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Agreements</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{platformMetrics.activeAgreements}</div>
                        <p className="text-xs text-muted-foreground">Worker-Client pairs</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{platformMetrics.pendingInvoices}</div>
                        <p className="text-xs text-muted-foreground">Awaiting approval</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${platformMetrics.totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">This month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Credential Issues</CardTitle>
                        <AlertCircle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{platformMetrics.credentialIssues}</div>
                        <p className="text-xs text-muted-foreground">Require attention</p>
                    </CardContent>
                </Card>
            </div>

            {/* Credential Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Credential Status Overview
                    </CardTitle>
                    <CardDescription>Worker certification and screening status</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                            <div>
                                <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                                    {credentialStatus.valid}
                                </div>
                                <div className="text-sm text-green-600 dark:text-green-500">Valid Credentials</div>
                            </div>
                            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-500" />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-amber-50 dark:bg-amber-950/20">
                            <div>
                                <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                                    {credentialStatus.expiringSoon}
                                </div>
                                <div className="text-sm text-amber-600 dark:text-amber-500">Expiring Soon</div>
                            </div>
                            <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-500" />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-red-50 dark:bg-red-950/20">
                            <div>
                                <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                                    {credentialStatus.expired}
                                </div>
                                <div className="text-sm text-red-600 dark:text-red-500">Expired</div>
                            </div>
                            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-500" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
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
            </Card>

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
                            <Badge variant="secondary">{platformMetrics.pendingInvoices} pending</Badge>
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
                            <Badge variant="secondary">{platformMetrics.activeAgreements} active</Badge>
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
                            <Badge variant="secondary">{platformMetrics.totalWorkers + platformMetrics.totalClients} total</Badge>
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
