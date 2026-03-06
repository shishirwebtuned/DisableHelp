'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchAgreements } from '@/redux/slices/agreementsSlice';
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
     Search,
    Plus,
    CheckCircle2,
    Clock,
    AlertCircle,
    Download,
    Eye,
    XCircle
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import Pagination from '@/components/ui/pagination';
import Loading from '@/components/ui/loading';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function AdminAgreementsPage() {
    const dispatch = useAppDispatch();
    const { items: agreements, loading, total, totalPages, page: currentPageFromStore } = useAppSelector((state) => state.agreements);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'expired' | 'rejected'>('all');
    const [currentPage, setCurrentPage] = useState<number>(currentPageFromStore || 1);
    const pageSize = 10;

    useEffect(() => {
        dispatch(fetchAgreements({ page: currentPage, limit: pageSize, status: statusFilter }));
    }, [dispatch, currentPage, statusFilter]);

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'active': return 'default';
            case 'pending': return 'secondary';
            case 'expired': return 'destructive';
            case 'rejected': return 'destructive';
            default: return 'outline';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle2 className="h-4 w-4 mr-1 text-green-600" />;
            case 'pending': return <Clock className="h-4 w-4 mr-1 text-amber-600" />;
            case 'expired': return <AlertCircle className="h-4 w-4 mr-1 text-destructive" />;
            case 'rejected': return <XCircle className="h-4 w-4 mr-1 text-destructive" />;
            default: return null;
        }
    };

    // Filter agreements based on search term
    const filteredAgreements = agreements.filter((agreement) => {
        const searchLower = searchTerm.toLowerCase();
        const workerName = typeof agreement.worker === 'string' ? '' : `${agreement.worker.firstName} ${agreement.worker.lastName}`.toLowerCase();
        const clientName = `${agreement.client.firstName} ${agreement.client.lastName}`.toLowerCase();
        const jobTitle = agreement.job?.title?.toLowerCase() || '';
        return (
            agreement._id.toLowerCase().includes(searchLower) ||
            workerName.includes(searchLower) ||
            clientName.includes(searchLower) ||
            jobTitle.includes(searchLower)
        );
    });

    // Calculate stats
    const activeCount = agreements.filter(a => a.status === 'active').length;
    const pendingCount = agreements.filter(a => a.status === 'pending').length;

    return (
        <>
            {loading && <Loading />}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Service Agreements</h1>
                        <p className="text-muted-foreground">Monitor and manage all service agreements on the platform</p>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Active Agreements</CardDescription>
                            <CardTitle className="text-2xl font-bold">{activeCount}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Pending Approval</CardDescription>
                            <CardTitle className="text-2xl font-bold text-amber-600 text-amber-700 dark:text-amber-400">{pendingCount}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total Agreements</CardDescription>
                            <CardTitle className="text-2xl font-bold text-blue-600 text-blue-700 dark:text-blue-400">{total}</CardTitle>
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
                            <Select value={statusFilter} onValueChange={(val) => {
                                const v = val as 'all' | 'pending' | 'active' | 'expired' | 'rejected';
                                setStatusFilter(v);
                                setCurrentPage(1);
                            }}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="expired">Expired</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                {/* Agreements Table */}
                <div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Agreement ID</TableHead>
                                <TableHead>Parties</TableHead>
                                <TableHead>Job Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>Hourly Rate</TableHead>
                                <TableHead>Terms Accepted</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAgreements.length > 0 ? (
                                filteredAgreements.map((agreement) => (
                                    <TableRow key={agreement._id}>
                                        <TableCell className="font-medium">{agreement._id.slice(-8).toUpperCase()}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">
                                                    Worker: {typeof agreement.worker === 'string' ? 'N/A' : `${agreement.worker.firstName} ${agreement.worker.lastName}`}
                                                </span>
                                                <span className="text-xs text-muted-foreground">Client: {agreement.client.firstName} {agreement.client.lastName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {agreement.job ? (
                                                <Badge variant="outline">{agreement.job.title}</Badge>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">No Job</span>
                                            )}
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
                                                {new Date(agreement.startDate).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-semibold">
                                            ${agreement.hourlyRate}/hr
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex items-center">
                                                <Checkbox
                                                    checked={agreement.termsAcceptedByWorker===true}
                                                    className="mr-2"
                                                    disabled
                                                />
                                             
                                            </div>
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
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                        No agreements found matching your criteria.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <Pagination
                    totalPages={totalPages || 1}
                    currentPage={currentPage}
                    onPageChange={(page) => {
                        setCurrentPage(page);
                    }}
                />
            </div>
        </>
    );
}
