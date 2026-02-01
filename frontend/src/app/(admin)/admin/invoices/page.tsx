'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchInvoices, updateInvoiceStatus } from '@/redux/slices/invoiceSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FileText, Search, Filter, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

export default function AdminInvoicesPage() {
    const dispatch = useAppDispatch();
    const { items: invoices, loading } = useAppSelector((state) => state.invoices);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        dispatch(fetchInvoices());
    }, [dispatch]);

    const filteredInvoices = invoices.filter(inv => {
        const matchesSearch =
            inv.workerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inv.id.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleApprove = async (invoiceId: string) => {
        await dispatch(updateInvoiceStatus({
            invoiceId,
            status: 'approved',
            adminNotes,
        }));
        setSelectedInvoice(null);
        setAdminNotes('');
    };

    const handleReject = async (invoiceId: string) => {
        await dispatch(updateInvoiceStatus({
            invoiceId,
            status: 'rejected',
            adminNotes,
        }));
        setSelectedInvoice(null);
        setAdminNotes('');
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
            case 'paid':
                return <CheckCircle2 className="h-4 w-4" />;
            case 'rejected':
                return <XCircle className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (status) {
            case 'approved':
                return 'default';
            case 'paid':
                return 'secondary';
            case 'rejected':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const stats = {
        pending: invoices.filter(inv => inv.status === 'submitted').length,
        approved: invoices.filter(inv => inv.status === 'approved').length,
        rejected: invoices.filter(inv => inv.status === 'rejected').length,
        paid: invoices.filter(inv => inv.status === 'paid').length,
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Invoice Management</h1>
                    <p className="text-muted-foreground">Review and approve worker invoices</p>
                </div>
                <Button variant="outline">Export Report</Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pending}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Approved</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.approved}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Paid</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.paid}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                        <XCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.rejected}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by worker, client, or invoice ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="submitted">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Invoices Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Invoices</CardTitle>
                    <CardDescription>Review and manage platform invoices</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice ID</TableHead>
                                <TableHead>Worker</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Period</TableHead>
                                <TableHead>Hours</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Submitted</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredInvoices.map((invoice) => (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-medium">{invoice.id}</TableCell>
                                    <TableCell>{invoice.workerName}</TableCell>
                                    <TableCell>{invoice.clientName}</TableCell>
                                    <TableCell className="text-sm">
                                        {format(new Date(invoice.periodStart), 'dd MMM')} -{' '}
                                        {format(new Date(invoice.periodEnd), 'dd MMM')}
                                    </TableCell>
                                    <TableCell>{invoice.hours}h</TableCell>
                                    <TableCell className="font-semibold">${invoice.totalAmount.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(invoice.status)} className="flex items-center gap-1 w-fit">
                                            {getStatusIcon(invoice.status)}
                                            {invoice.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {format(new Date(invoice.submittedAt), 'dd MMM yyyy')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setSelectedInvoice(invoice)}
                                                >
                                                    Review
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl">
                                                <DialogHeader>
                                                    <DialogTitle>Invoice Review - {invoice.id}</DialogTitle>
                                                    <DialogDescription>
                                                        Review and approve or reject this invoice
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <Label className="text-sm text-muted-foreground">Worker</Label>
                                                            <p className="font-medium">{invoice.workerName}</p>
                                                        </div>
                                                        <div>
                                                            <Label className="text-sm text-muted-foreground">Client</Label>
                                                            <p className="font-medium">{invoice.clientName}</p>
                                                        </div>
                                                        <div>
                                                            <Label className="text-sm text-muted-foreground">Period</Label>
                                                            <p className="font-medium">
                                                                {format(new Date(invoice.periodStart), 'dd MMM yyyy')} -{' '}
                                                                {format(new Date(invoice.periodEnd), 'dd MMM yyyy')}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <Label className="text-sm text-muted-foreground">Frequency</Label>
                                                            <p className="font-medium capitalize">{invoice.frequency}</p>
                                                        </div>
                                                        <div>
                                                            <Label className="text-sm text-muted-foreground">Hours</Label>
                                                            <p className="font-medium">{invoice.hours} hours</p>
                                                        </div>
                                                        <div>
                                                            <Label className="text-sm text-muted-foreground">Rate</Label>
                                                            <p className="font-medium">${invoice.rate}/hour</p>
                                                        </div>
                                                    </div>

                                                    <div className="p-4 bg-muted rounded-lg">
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-medium">Total Amount:</span>
                                                            <span className="text-2xl font-bold">${invoice.totalAmount.toFixed(2)}</span>
                                                        </div>
                                                    </div>

                                                    {invoice.notes && (
                                                        <div>
                                                            <Label className="text-sm text-muted-foreground">Worker Notes</Label>
                                                            <p className="mt-1 text-sm">{invoice.notes}</p>
                                                        </div>
                                                    )}

                                                    <div className="space-y-2">
                                                        <Label htmlFor="adminNotes">Admin Notes</Label>
                                                        <Textarea
                                                            id="adminNotes"
                                                            value={adminNotes}
                                                            onChange={(e) => setAdminNotes(e.target.value)}
                                                            placeholder="Add notes about this invoice review..."
                                                            rows={3}
                                                        />
                                                    </div>
                                                </div>
                                                <DialogFooter className="gap-2">
                                                    {invoice.status === 'submitted' && (
                                                        <>
                                                            <Button
                                                                variant="destructive"
                                                                onClick={() => handleReject(invoice.id)}
                                                            >
                                                                <XCircle className="h-4 w-4 mr-2" />
                                                                Reject
                                                            </Button>
                                                            <Button
                                                                onClick={() => handleApprove(invoice.id)}
                                                            >
                                                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                                                Approve
                                                            </Button>
                                                        </>
                                                    )}
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {filteredInvoices.length === 0 && !loading && (
                        <div className="text-center py-12 text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No invoices found</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
