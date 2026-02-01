'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, UserCheck, UserX, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WorkerClientsPage() {
    const router = useRouter();
    const activeClients = [
        { id: 1, name: 'Alice Freeman', since: '2025-06-15', hours: 15, status: 'active', agreementId: 'agr-1' },
        { id: 2, name: 'Bob Smith', since: '2025-09-01', hours: 10, status: 'active', agreementId: 'agr-2' },
    ];

    const pendingClients = [
        { id: 3, name: 'Carol Johnson', appliedDate: '2026-01-20', status: 'pending' },
    ];

    const pastClients = [
        { id: 4, name: 'David Lee', period: '2024-01-01 to 2025-05-31', reason: 'Client relocated' },
    ];

    return (
        <div className="space-y-2">
            <div>
                <h1 className="text-xl font-bold tracking-tight">My Clients</h1>
                <p className="text-muted-foreground">Manage your client relationships</p>
            </div>

            <Tabs defaultValue="active" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="active" className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        Active ({activeClients.length})
                    </TabsTrigger>
                    <TabsTrigger value="pending" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Pending ({pendingClients.length})
                    </TabsTrigger>
                    <TabsTrigger value="past" className="flex items-center gap-2">
                        <UserX className="h-4 w-4" />
                        Past ({pastClients.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="space-y-4">
                    {activeClients.map((client) => (
                        <Card key={client.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>{client.name}</CardTitle>
                                        <CardDescription>
                                            Client since {new Date(client.since).toLocaleDateString()}
                                        </CardDescription>
                                    </div>
                                    <Badge variant="default">Active</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        {client.hours} hours/week
                                    </div>
                                    <div className="flex gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => router.push(`/worker/agreements/${client.agreementId}`)}
                                        >
                                            View Agreement
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => router.push(`/worker/inbox/${client.id}`)}
                                        >
                                            Message
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="pending" className="space-y-4">
                    {pendingClients.map((client) => (
                        <Card key={client.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>{client.name}</CardTitle>
                                        <CardDescription>
                                            Applied on {new Date(client.appliedDate).toLocaleDateString()}
                                        </CardDescription>
                                    </div>
                                    <Badge variant="secondary">Pending Approval</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Awaiting client's decision on your application
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="past" className="space-y-4">
                    {pastClients.map((client) => (
                        <Card key={client.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>{client.name}</CardTitle>
                                        <CardDescription>{client.period}</CardDescription>
                                    </div>
                                    <Badge variant="outline">Terminated</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Reason: {client.reason}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>
            </Tabs>
        </div>
    );
}
