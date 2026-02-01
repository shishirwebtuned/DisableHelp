'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Clock, Briefcase, Star, Calendar, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

export default function AnalyticsPage() {
    const monthlyStats = {
        totalHours: 132,
        totalEarnings: 6240,
        averageRate: 47.27,
        activeClients: 4,
        completedJobs: 18,
        averageRating: 4.8,
        responseTime: '2.5 hours',
        profileViews: 45,
    };

    const earningsTrend = [
        { month: 'Aug', amount: 4200 },
        { month: 'Sep', amount: 5100 },
        { month: 'Oct', amount: 5800 },
        { month: 'Nov', amount: 6100 },
        { month: 'Dec', amount: 5900 },
        { month: 'Jan', amount: 6240 },
    ];

    const serviceBreakdown = [
        { service: 'Personal Care', hours: 45, percentage: 34, color: 'bg-blue-500' },
        { service: 'Community Access', hours: 38, percentage: 29, color: 'bg-green-500' },
        { service: 'Disability Support', hours: 32, percentage: 24, color: 'bg-purple-500' },
        { service: 'Household Tasks', hours: 17, percentage: 13, color: 'bg-orange-500' },
    ];

    const clientRetention = {
        returning: 75,
        new: 25,
    };

    const performanceMetrics = [
        { label: 'On-Time Rate', value: 98, target: 95, status: 'excellent' },
        { label: 'Client Satisfaction', value: 96, target: 90, status: 'excellent' },
        { label: 'Response Time', value: 88, target: 85, status: 'good' },
        { label: 'Job Completion', value: 100, target: 95, status: 'excellent' },
    ];

    const maxEarnings = Math.max(...earningsTrend.map((e) => e.amount));

    return (
        <div className="space-y-2">
            <div>
                <h1 className="text-xl font-bold tracking-tight">Analytics Dashboard</h1>
                <p className="text-muted-foreground">Track your performance and earnings insights</p>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{monthlyStats.totalHours}</div>
                        <p className="text-xs text-muted-foreground">+12% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${monthlyStats.totalEarnings}</div>
                        <p className="text-xs text-muted-foreground">+8% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{monthlyStats.activeClients}</div>
                        <p className="text-xs text-muted-foreground">All relationships active</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{monthlyStats.averageRating}</div>
                        <p className="text-xs text-muted-foreground">Excellent performance</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Earnings Trend */}
                <Card>
                    <CardHeader>
                        <CardTitle>Earnings Trend</CardTitle>
                        <CardDescription>Last 6 months</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {earningsTrend.map((item) => (
                                <div key={item.month} className="flex items-center gap-4">
                                    <div className="w-12 text-sm font-medium text-muted-foreground">
                                        {item.month}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="h-6 bg-primary rounded"
                                                style={{
                                                    width: `${(item.amount / maxEarnings) * 100}%`,
                                                }}
                                            />
                                            <span className="text-sm font-semibold">${item.amount}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-2 text-sm">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                <span className="font-medium">Trending up</span>
                                <span className="text-muted-foreground">+8% growth this month</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Service Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Service Type Breakdown</CardTitle>
                        <CardDescription>Hours by service category</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {serviceBreakdown.map((service) => (
                                <div key={service.service}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">{service.service}</span>
                                        <span className="text-sm text-muted-foreground">
                                            {service.hours}h ({service.percentage}%)
                                        </span>
                                    </div>
                                    <Progress value={service.percentage} className="h-2" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Performance Metrics */}
            <Card>
                <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                    <CardDescription>Your key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {performanceMetrics.map((metric) => (
                            <div key={metric.label} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{metric.label}</span>
                                    <span className="text-2xl font-bold">{metric.value}%</span>
                                </div>
                                <Progress value={metric.value} className="h-2" />
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Target: {metric.target}%</span>
                                    <span
                                        className={
                                            metric.status === 'excellent'
                                                ? 'text-green-600 font-medium'
                                                : 'text-blue-600 font-medium'
                                        }
                                    >
                                        {metric.status === 'excellent' ? 'Excellent' : 'Good'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Additional Insights */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Client Retention</CardTitle>
                        <CardDescription>Returning vs new clients</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm">Returning Clients</span>
                                    <span className="text-sm font-bold">{clientRetention.returning}%</span>
                                </div>
                                <Progress value={clientRetention.returning} className="h-2" />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm">New Clients</span>
                                    <span className="text-sm font-bold">{clientRetention.new}%</span>
                                </div>
                                <Progress value={clientRetention.new} className="h-2" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Average Rate</CardTitle>
                        <CardDescription>Hourly earnings</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">${monthlyStats.averageRate}</div>
                        <p className="text-sm text-muted-foreground mt-2">per hour</p>
                        <div className="mt-4 p-2 bg-green-50 dark:bg-green-950 rounded text-sm text-green-700 dark:text-green-300">
                            Above platform average
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Response Time</CardTitle>
                        <CardDescription>Avg. time to respond</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{monthlyStats.responseTime}</div>
                        <p className="text-sm text-muted-foreground mt-2">average</p>
                        <div className="mt-4 p-2 bg-blue-50 dark:bg-blue-950 rounded text-sm text-blue-700 dark:text-blue-300">
                            Fast responder
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
