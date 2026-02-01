'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Shield,
    Search,
    Plus,
    FileText,
    ExternalLink,
    CheckCircle2,
    Clock,
    AlertCircle,
    Download,
    Eye
} from 'lucide-react';

// Mock agreements data
const mockAgreements = [
    {
        id: 'AGR-1001',
        workerName: 'Sarah Worker',
        clientName: 'Alice Freeman',
        type: 'Personal Care',
        status: 'active',
        startDate: '2025-12-01',
        expiryDate: '2026-11-30',
        value: 4500,
    },
    {
        id: 'AGR-1002',
        workerName: 'Sarah Worker',
        clientName: 'Bob Smith',
        type: 'Community Access',
        status: 'pending',
        startDate: '2026-02-01',
        expiryDate: '2027-01-31',
        value: 2800,
    },
    {
        id: 'AGR-998',
        workerName: 'John Smith',
        clientName: 'Charlie Brown',
        type: 'Nursing Support',
        status: 'expired',
        startDate: '2024-11-01',
        expiryDate: '2025-10-31',
        value: 6200,
    },
    {
        id: 'AGR-1003',
        workerName: 'Emma Wilson',
        clientName: 'David Jones',
        type: 'Domestic Assistance',
        status: 'active',
        startDate: '2026-01-10',
        expiryDate: '2027-01-09',
        value: 3500,
    }
];

export default function AdminAgreementsPage() {
    const [searchTerm, setSearchTerm] = useState('');

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'active': return 'default';
            case 'pending': return 'secondary';
            case 'expired': return 'destructive';
            default: return 'outline';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle2 className="h-4 w-4 mr-1 text-green-600" />;
            case 'pending': return <Clock className="h-4 w-4 mr-1 text-amber-600" />;
            case 'expired': return <AlertCircle className="h-4 w-4 mr-1 text-destructive" />;
            default: return null;
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Service Agreements</h1>
                    <p className="text-muted-foreground">Monitor and manage all service agreements on the platform</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    New Template
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Active Agreements</CardDescription>
                        <CardTitle className="text-2xl font-bold">128</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Pending Approval</CardDescription>
                        <CardTitle className="text-2xl font-bold text-amber-600 text-amber-700 dark:text-amber-400">12</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Expiring Soon (30 Days)</CardDescription>
                        <CardTitle className="text-2xl font-bold text-blue-600 text-blue-700 dark:text-blue-400">8</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Search and Filters */}
            <div className="border-none ">
                <div className="pt-3">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search by agreement ID, worker, or client..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline">
                            Advanced Filter
                        </Button>
                    </div>
                </div>
            </div>

            {/* Agreements Table */}
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Agreement ID</TableHead>
                            <TableHead>Parties</TableHead>
                            <TableHead>Service Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Period</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockAgreements.map((agreement) => (
                            <TableRow key={agreement.id}>
                                <TableCell className="font-medium">{agreement.id}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">Worker: {agreement.workerName}</span>
                                        <span className="text-xs text-muted-foreground">Client: {agreement.clientName}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{agreement.type}</Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center">
                                        {getStatusIcon(agreement.status)}
                                        <Badge variant={getStatusVariant(agreement.status)} className="capitalize">
                                            {agreement.status}
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-xs">
                                        <div>{new Date(agreement.startDate).toLocaleDateString()}</div>
                                        <div className="text-muted-foreground">to</div>
                                        <div>{new Date(agreement.expiryDate).toLocaleDateString()}</div>
                                    </div>
                                </TableCell>
                                <TableCell className="font-semibold">
                                    ${agreement.value.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
