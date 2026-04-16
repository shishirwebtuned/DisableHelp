'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchAgreements, getAgreementById } from '@/redux/slices/agreementsSlice';
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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import jsPDF from 'jspdf';
import { downloadAgreementPDF } from '@/lib/downloadAgreementPdf';

export default function AdminAgreementsPage() {
    const dispatch = useAppDispatch();
    const { items: agreements, loading, total, totalPages, page: currentPageFromStore } = useAppSelector((state) => state.agreements);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'expired' | 'rejected'>('all');
    const [currentPage, setCurrentPage] = useState<number>(currentPageFromStore || 1);

    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [selectedAgreementId, setSelectedAgreementId] = useState<string | null>(null);
    const agreement = agreements.find((a) => a._id === selectedAgreementId);

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

    useEffect(() => {
        if (detailsDialogOpen && selectedAgreementId) {
            dispatch(getAgreementById(selectedAgreementId));
        }
    }, [detailsDialogOpen, selectedAgreementId, dispatch]);

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

    const statusStyles: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
        active: 'bg-green-100 text-green-700 border border-green-200',
        completed: 'bg-blue-100 text-blue-700 border border-blue-200',
        terminated: 'bg-red-100 text-red-700 border border-red-200',
    };



    return (
        <>
            {loading && !detailsDialogOpen && <Loading />}
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
                                                    checked={agreement.termsAcceptedByWorker === true}
                                                    className="mr-2"
                                                    disabled
                                                />

                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer"
                                                    onClick={() => {
                                                        setSelectedAgreementId(agreement._id);
                                                        setDetailsDialogOpen(true);
                                                    }}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer"
                                                    onClick={() => downloadAgreementPDF(agreement)}>
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
            <Dialog
                open={detailsDialogOpen}
                onOpenChange={(open) => {
                    setDetailsDialogOpen(open);

                    if (!open) {
                        setSelectedAgreementId(null);
                    }
                }}
            >
                <DialogContent className="sm:max-w-2xl">

                    <DialogHeader className="pb-2">

                        <DialogTitle className="flex items-center mt-2 justify-between text-base">

                            Agreement Details



                        </DialogTitle>

                    </DialogHeader>


                    {loading && !agreement ? (

                        <div className="flex justify-center py-6">
                            <Loading />
                        </div>

                    ) : agreement ? (

                        <div className="space-y-4 text-sm">

                            {/* JOB */}
                            <div className='flex flex-row justify-between items-center'>
                                <div>
                                    <p className="font-medium">
                                        {agreement.job?.title}
                                    </p>

                                    <p className="text-xs text-muted-foreground">

                                        {agreement.job?.location?.line1}
                                        {" • "}
                                        {agreement.job?.location?.state}

                                    </p>
                                </div>

                                <Badge className={`text-xs font-medium capitalize px-2 py-0.5 ${statusStyles[agreement.status] ?? 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                                    {agreement?.status}
                                </Badge>
                            </div>


                            {/* BASIC INFO */}
                            <div className="grid grid-cols-3 gap-3 text-xs">

                                <div>

                                    <p className="text-muted-foreground">
                                        Rate
                                    </p>

                                    <p className="font-medium">
                                        ${agreement.hourlyRate}/hr
                                    </p>

                                </div>


                                <div>

                                    <p className="text-muted-foreground">
                                        Start
                                    </p>

                                    <p className="font-medium">

                                        {new Date(
                                            agreement.startDate
                                        ).toLocaleDateString()}

                                    </p>

                                </div>


                                <div>

                                    <p className="text-muted-foreground">
                                        Frequency
                                    </p>

                                    <p className="font-medium capitalize">
                                        {agreement.frequency}
                                    </p>

                                </div>

                            </div>


                            {/* CLIENT WORKER */}
                            <div className="flex flex-row flex-wrap justify-between gap-4 text-xs">

                                <div>

                                    <p className="text-muted-foreground mb-1">
                                        Client
                                    </p>

                                    <p className="font-medium">

                                        {agreement.client.firstName}
                                        {" "}
                                        {agreement.client.lastName}

                                    </p>

                                    <p className="text-muted-foreground">
                                        {agreement.client.email}
                                    </p>

                                </div>


                                {typeof agreement.worker !== "string" && (

                                    <div>

                                        <p className="text-muted-foreground mb-1">
                                            Worker
                                        </p>

                                        <p className="font-medium">

                                            {agreement.worker.firstName}
                                            {" "}
                                            {agreement.worker.lastName}

                                        </p>

                                        <p className="text-muted-foreground">
                                            {agreement.worker.email}
                                        </p>

                                    </div>

                                )}

                            </div>


                            {/* TERMS */}
                            <div className="flex items-center justify-between text-xs border-t pt-3">

                                <div>

                                    <p className="text-muted-foreground">
                                        Terms accepted
                                    </p>

                                    <p className="font-medium">

                                        {agreement.termsAcceptedAt
                                            ? new Date(
                                                agreement.termsAcceptedAt
                                            ).toLocaleDateString()
                                            : "Pending"}

                                    </p>

                                </div>


                                <Badge
                                    variant="outline"
                                    className={
                                        agreement.termsAcceptedByWorker
                                            ? "text-green-600"
                                            : "text-orange-600"
                                    }
                                >

                                    {agreement.termsAcceptedByWorker
                                        ? "Accepted"
                                        : "Pending"}

                                </Badge>

                            </div>


                            {/* SUPPORT */}
                            {(agreement.job?.supportDetails?.length ?? 0) > 0 && (

                                <div className="border-t pt-3">

                                    <p className="text-xs font-medium mb-2">
                                        Support
                                    </p>

                                    <div className="space-y-1 text-xs">

                                        {agreement.job?.supportDetails?.map(
                                            (sd: any, index: number) => (
                                                <div key={index}>

                                                    <span className="font-medium">
                                                        {sd.name}
                                                    </span>

                                                    <span className="text-muted-foreground">
                                                        {" — "}
                                                        {sd.description}
                                                    </span>

                                                </div>
                                            )
                                        )}

                                    </div>

                                </div>

                            )}


                            {/* SCHEDULE */}
                            {(agreement.schedule?.length ?? 0) > 0 && (

                                <div className="border-t pt-3">

                                    <p className="text-xs font-medium mb-2">
                                        Schedule
                                    </p>

                                    <div className="space-y-1">

                                        {agreement.schedule?.map(
                                            (day: any, index: number) => (
                                                <div
                                                    key={index}
                                                    className="flex justify-between text-xs"
                                                >

                                                    <span className="capitalize font-medium">
                                                        {day.day}
                                                    </span>

                                                    <span className="text-muted-foreground">

                                                        {day.period
                                                            ?.map(
                                                                (p: any) => `${p.startTime}-${p.endTime}`
                                                            )
                                                            .join(", ")}

                                                    </span>

                                                </div>
                                            )
                                        )}

                                    </div>

                                </div>

                            )}

                        </div>

                    ) : (

                        <div className="py-6 text-center text-muted-foreground text-sm">
                            Agreement not found
                        </div>

                    )}


                    <DialogFooter className="pt-3">

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                setDetailsDialogOpen(false);
                                setSelectedAgreementId(null);
                            }}
                        >

                            Close

                        </Button>

                    </DialogFooter>

                </DialogContent>
            </Dialog>
        </>
    );
}
