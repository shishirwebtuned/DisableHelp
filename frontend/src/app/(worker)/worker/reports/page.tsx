'use client';

import { useState } from 'react';
import { Star, MessageSquare, Download, Calendar, User, FileText, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';

export default function ServiceReportsPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const reports = [
        {
            id: 1,
            clientName: 'John Client',
            clientAvatar: 'https://ui.shadcn.com/avatars/01.png',
            date: '2026-01-27',
            sessionType: 'Personal Care',
            duration: '4 hours',
            rating: 5,
            feedback: 'Excellent service today. Very professional and caring as always.',
            highlights: ['Punctual', 'Professional', 'Helpful'],
            concerns: [],
            status: 'completed',
        },
        {
            id: 2,
            clientName: 'Emily Anderson',
            clientAvatar: 'https://ui.shadcn.com/avatars/02.png',
            date: '2026-01-26',
            sessionType: 'Community Access',
            duration: '5 hours',
            rating: 5,
            feedback: 'Great assistance with shopping and medical appointment. Very patient.',
            highlights: ['Patient', 'Reliable', 'Supportive'],
            concerns: [],
            status: 'completed',
        },
        {
            id: 3,
            clientName: 'Sarah Mitchell',
            clientAvatar: 'https://ui.shadcn.com/avatars/04.png',
            date: '2026-01-25',
            sessionType: 'Disability Support',
            duration: '6 hours',
            rating: 4,
            feedback: 'Good support overall. Would appreciate more communication during activities.',
            highlights: ['Skilled', 'Kind'],
            concerns: ['Communication'],
            status: 'review-required',
        },
    ];

    const overallStats = {
        totalReports: 42,
        averageRating: 4.8,
        positiveRate: 95,
        responseRate: 100,
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Service Reports</h1>
                    <p className="text-muted-foreground">Client feedback and session summaries</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Export Reports
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Export Service Reports</DialogTitle>
                            <DialogDescription>Download your service reports for records</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Date Range</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <DatePicker
                                        date={startDate ? new Date(startDate) : undefined}
                                        setDate={(date) => setStartDate(date ? format(date, 'yyyy-MM-dd') : '')}
                                        placeholder="Start date"
                                    />
                                    <DatePicker
                                        date={endDate ? new Date(endDate) : undefined}
                                        setDate={(date) => setEndDate(date ? format(date, 'yyyy-MM-dd') : '')}
                                        placeholder="End date"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Format</Label>
                                <select className="w-full border rounded px-3 py-2 text-sm">
                                    <option>PDF Document</option>
                                    <option>Excel Spreadsheet</option>
                                    <option>CSV File</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={() => setIsDialogOpen(false)}>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{overallStats.totalReports}</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{overallStats.averageRating}</div>
                        <p className="text-xs text-muted-foreground">Out of 5.0</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Positive Rate</CardTitle>
                        <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{overallStats.positiveRate}%</div>
                        <p className="text-xs text-muted-foreground">4+ star ratings</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{overallStats.responseRate}%</div>
                        <p className="text-xs text-muted-foreground">Responded to feedback</p>
                    </CardContent>
                </Card>
            </div>

            {/* Service Reports List */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Service Reports</CardTitle>
                    <CardDescription>Client feedback from your recent sessions</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="all">
                        <TabsList>
                            <TabsTrigger value="all">All Reports</TabsTrigger>
                            <TabsTrigger value="review">Needs Review</TabsTrigger>
                            <TabsTrigger value="positive">Positive</TabsTrigger>
                        </TabsList>
                        <TabsContent value="all" className="space-y-6 mt-6">
                            {reports.map((report) => (
                                <div key={report.id} className="border rounded-lg p-6">
                                    <div className="flex items-start gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={report.clientAvatar} />
                                            <AvatarFallback>
                                                {report.clientName
                                                    .split(' ')
                                                    .map((n) => n[0])
                                                    .join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="font-semibold text-lg">
                                                        {report.clientName}
                                                    </h3>
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(report.date).toLocaleDateString()}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <FileText className="h-3 w-3" />
                                                            {report.sessionType}
                                                        </span>
                                                        <span>{report.duration}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`h-5 w-5 ${
                                                                star <= report.rating
                                                                    ? 'fill-yellow-400 text-yellow-400'
                                                                    : 'text-gray-300'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="bg-muted/50 rounded-lg p-4 mb-4">
                                                <p className="text-sm">{report.feedback}</p>
                                            </div>

                                            <div className="flex items-start gap-6">
                                                {report.highlights.length > 0 && (
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <ThumbsUp className="h-4 w-4 text-green-600" />
                                                            <span className="text-sm font-medium">Highlights</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {report.highlights.map((highlight) => (
                                                                <Badge
                                                                    key={highlight}
                                                                    variant="outline"
                                                                    className="bg-green-50 text-green-700 border-green-200"
                                                                >
                                                                    {highlight}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {report.concerns.length > 0 && (
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <ThumbsDown className="h-4 w-4 text-orange-600" />
                                                            <span className="text-sm font-medium">
                                                                Areas for Improvement
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {report.concerns.map((concern) => (
                                                                <Badge
                                                                    key={concern}
                                                                    variant="outline"
                                                                    className="bg-orange-50 text-orange-700 border-orange-200"
                                                                >
                                                                    {concern}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {report.status === 'review-required' && (
                                                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                                                        This report requires your response
                                                    </p>
                                                    <Textarea
                                                        placeholder="Write your response to the client's feedback..."
                                                        rows={2}
                                                        className="mb-2"
                                                    />
                                                    <Button size="sm">Submit Response</Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
