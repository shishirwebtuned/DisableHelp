'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Star, MessageSquare, FileText } from 'lucide-react';

export default function ClientWorkersPage() {
    const activeWorkers = [
        {
            id: 1,
            name: 'Sarah Worker',
            avatar: 'https://ui.shadcn.com/avatars/01.png',
            since: '2025-06-15',
            hours: 15,
            rate: 45,
            rating: 4.8,
            status: 'active',
        },
        {
            id: 2,
            name: 'John Support',
            avatar: 'https://ui.shadcn.com/avatars/02.png',
            since: '2025-09-01',
            hours: 10,
            rate: 48,
            rating: 4.9,
            status: 'active',
        },
    ];

    const pendingWorkers = [
        {
            id: 3,
            name: 'Emma Care',
            avatar: 'https://ui.shadcn.com/avatars/03.png',
            appliedDate: '2026-01-20',
            rate: 46,
            status: 'pending',
        },
    ];

    return (
        <div className="space-y-2">
            <div>
                <h1 className="text-xl font-bold tracking-tight">Support Workers</h1>
                <p className="text-muted-foreground">Manage your support worker relationships</p>
            </div>

            <Tabs defaultValue="active" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="active">
                        Active ({activeWorkers.length})
                    </TabsTrigger>
                    <TabsTrigger value="pending">
                        Pending ({pendingWorkers.length})
                    </TabsTrigger>
                    <TabsTrigger value="past">
                        Past (0)
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="space-y-4">
                    {activeWorkers.map((worker) => (
                        <Card key={worker.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-16 w-16">
                                            <AvatarImage src={worker.avatar} />
                                            <AvatarFallback>{worker.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                {worker.name}
                                                <Badge variant="default">Active</Badge>
                                            </CardTitle>
                                            <CardDescription>
                                                Working since {new Date(worker.since).toLocaleDateString()}
                                            </CardDescription>
                                            <div className="flex items-center gap-1 mt-1">
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <span className="text-sm font-medium">{worker.rating}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">
                                            <MessageSquare className="h-4 w-4 mr-2" />
                                            Message
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            <FileText className="h-4 w-4 mr-2" />
                                            Agreement
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-6 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Hours/Week:</span>
                                        <span className="ml-2 font-medium">{worker.hours}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Rate:</span>
                                        <span className="ml-2 font-medium">${worker.rate}/hour</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="pending" className="space-y-4">
                    {pendingWorkers.map((worker) => (
                        <Card key={worker.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-16 w-16">
                                            <AvatarImage src={worker.avatar} />
                                            <AvatarFallback>{worker.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                {worker.name}
                                                <Badge variant="secondary">Pending</Badge>
                                            </CardTitle>
                                            <CardDescription>
                                                Applied on {new Date(worker.appliedDate).toLocaleDateString()}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">View Profile</Button>
                                        <Button variant="destructive" size="sm">Reject</Button>
                                        <Button size="sm">Accept</Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Requested Rate:</span>
                                    <span className="ml-2 font-medium">${worker.rate}/hour</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="past" className="space-y-4">
                    <div className="text-center py-12 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No past workers</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
