'use client';

import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { adminUpdateInvoiceStatus, fetchAllInvoices } from '@/redux/slices/invoiceSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
    FileText, Search, CheckCircle2, XCircle,
    Clock, Calendar, DollarSign, Eye,
} from 'lucide-react';
import { format } from 'date-fns';

const statusStyles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    approved: 'bg-green-100 text-green-700 border border-green-200',
    declined: 'bg-red-100 text-red-700 border border-red-200',
};

const statusIcons: Record<string, React.ReactNode> = {
    pending: <Clock className="h-3.5 w-3.5" />,
    approved: <CheckCircle2 className="h-3.5 w-3.5" />,
    declined: <XCircle className="h-3.5 w-3.5" />,
};

export default function AdminInvoicesPage() {
    const dispatch = useAppDispatch();
    const { items: invoices, loading, pagination } = useAppSelector((state) => state.invoices);

    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
    const [overwriteDialogOpen, setOverwriteDialogOpen] = useState(false);
    const [declineReason, setDeclineReason] = useState('');
    const [declineReasonError, setDeclineReasonError] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Track if decline was opened from overwrite flow
    const fromOverwrite = useRef(false);

    useEffect(() => {
        dispatch(fetchAllInvoices({}));
    }, [dispatch]);

    const filteredInvoices = invoices.filter(inv => {
        const workerName = `${inv.worker?.firstName} ${inv.worker?.lastName}`.toLowerCase();
        const clientName = `${inv.client?.firstName} ${inv.client?.lastName}`.toLowerCase();
        const invNumber = inv.invoiceNumber?.toLowerCase() ?? '';
        const query = searchQuery.toLowerCase();

        const matchesSearch =
            workerName.includes(query) ||
            clientName.includes(query) ||
            invNumber.includes(query);

        const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const stats = {
        pending: invoices.filter(i => i.status === 'pending').length,
        approved: invoices.filter(i => i.status === 'approved').length,
        declined: invoices.filter(i => i.status === 'declined').length,
        total: invoices.length,
    };

    const handleAdminApprove = async (invoice: any) => {
        setActionLoading(true);
        await dispatch(adminUpdateInvoiceStatus({
            invoiceId: invoice._id,
            status: 'approved',
        }));
        setActionLoading(false);
        setOverwriteDialogOpen(false);
        setSelectedInvoice(null);
    };

    const handleAdminDeclineConfirm = async () => {
        if (!selectedInvoice) return;
        if (!declineReason.trim()) {
            setDeclineReasonError(true);
            return;
        }
        setActionLoading(true);
        await dispatch(adminUpdateInvoiceStatus({
            invoiceId: selectedInvoice._id,
            status: 'declined',
            declineReason: declineReason.trim(),
        }));
        setActionLoading(false);
        setDeclineDialogOpen(false);
        setDeclineReason('');
        fromOverwrite.current = false;
        setSelectedInvoice(null);
    };

    const openDeclineFromPending = (invoice: any) => {
        fromOverwrite.current = false;
        setSelectedInvoice(invoice);
        setDeclineReason('');
        setDeclineReasonError(false);
        setDeclineDialogOpen(true);
    };

    const openDeclineFromOverwrite = () => {
        fromOverwrite.current = true;
        setOverwriteDialogOpen(false);
        setDeclineReason('');
        setDeclineReasonError(false);
        setDeclineDialogOpen(true);
    };

    const handleDeclineDialogClose = (open: boolean) => {
        if (!open) {
            setDeclineDialogOpen(false);
            setDeclineReason('');
            setDeclineReasonError(false);
            // Only clear selectedInvoice if NOT from overwrite
            if (!fromOverwrite.current) {
                setSelectedInvoice(null);
            }
            fromOverwrite.current = false;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Invoice Management</h1>
                    <p className="text-muted-foreground">Review all worker invoices on the platform</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-600" />
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
                        <CardTitle className="text-sm font-medium">Declined</CardTitle>
                        <XCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.declined}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by worker, client, or invoice number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="declined">Declined</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Invoices</CardTitle>
                    <CardDescription>
                        {pagination.total} invoice{pagination.total !== 1 ? 's' : ''} total
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice #</TableHead>
                                <TableHead>Worker</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Submitted</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredInvoices.map((invoice) => (
                                <TableRow key={invoice._id}>
                                    <TableCell className="font-mono text-xs">
                                        {invoice.invoiceNumber}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-7 w-7">
                                                <AvatarImage src={invoice.worker?.avatar} />
                                                <AvatarFallback className="text-[10px]">
                                                    {invoice.worker?.firstName?.[0]}{invoice.worker?.lastName?.[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm">
                                                {invoice.worker?.firstName} {invoice.worker?.lastName}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-7 w-7">
                                                <AvatarImage src={invoice.client?.avatar} />
                                                <AvatarFallback className="text-[10px]">
                                                    {invoice.client?.firstName?.[0]}{invoice.client?.lastName?.[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm">
                                                {invoice.client?.firstName} {invoice.client?.lastName}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {format(new Date(invoice.date), 'dd MMM yyyy')}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {invoice.startTime} – {invoice.endTime}
                                    </TableCell>
                                    <TableCell className="font-semibold">
                                        ${invoice.totalAmount.toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`text-xs flex items-center gap-1 w-fit px-2 py-0.5 ${statusStyles[invoice.status] ?? statusStyles.pending}`}>
                                            {statusIcons[invoice.status]}
                                            <span className="capitalize">{invoice.status}</span>
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {invoice.createdAt
                                            ? format(new Date(invoice.createdAt), 'dd MMM yyyy')
                                            : '—'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* View */}
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => {
                                                    setSelectedInvoice(invoice);
                                                    setViewDialogOpen(true);
                                                }}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>

                                            {/* Pending — approve + decline */}
                                            {invoice.status === 'pending' && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white"
                                                        disabled={actionLoading}
                                                        onClick={() => handleAdminApprove(invoice)}
                                                    >
                                                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 text-xs border-red-200 text-red-600 hover:bg-red-50"
                                                        onClick={() => openDeclineFromPending(invoice)}
                                                    >
                                                        <XCircle className="h-3.5 w-3.5 mr-1" />
                                                        Decline
                                                    </Button>
                                                </>
                                            )}

                                            {/* Not pending — overwrite */}
                                            {invoice.status !== 'pending' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 text-xs"
                                                    onClick={() => {
                                                        setSelectedInvoice(invoice);
                                                        setOverwriteDialogOpen(true);
                                                    }}
                                                >
                                                    Overwrite
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {!loading && filteredInvoices.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
                            <p className="text-sm">No invoices found</p>
                        </div>
                    )}

                    {loading && (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                            Loading invoices...
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Invoice Detail Dialog — controlled by viewDialogOpen */}
            <Dialog
                open={viewDialogOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setViewDialogOpen(false);
                        setSelectedInvoice(null);
                    }
                }}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Invoice {selectedInvoice?.invoiceNumber}</DialogTitle>
                        <DialogDescription>Invoice details</DialogDescription>
                    </DialogHeader>

                    {selectedInvoice && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Worker</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Avatar className="h-7 w-7">
                                            <AvatarImage src={selectedInvoice.worker?.avatar} />
                                            <AvatarFallback className="text-[10px]">
                                                {selectedInvoice.worker?.firstName?.[0]}{selectedInvoice.worker?.lastName?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium">
                                                {selectedInvoice.worker?.firstName} {selectedInvoice.worker?.lastName}
                                            </p>
                                            <p className="text-xs text-muted-foreground">{selectedInvoice.worker?.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Client</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Avatar className="h-7 w-7">
                                            <AvatarImage src={selectedInvoice.client?.avatar} />
                                            <AvatarFallback className="text-[10px]">
                                                {selectedInvoice.client?.firstName?.[0]}{selectedInvoice.client?.lastName?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium">
                                                {selectedInvoice.client?.firstName} {selectedInvoice.client?.lastName}
                                            </p>
                                            <p className="text-xs text-muted-foreground">{selectedInvoice.client?.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm border rounded-md p-3">
                                <div>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> Date
                                    </p>
                                    <p className="font-medium">
                                        {format(new Date(selectedInvoice.date), 'dd MMM yyyy')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> Time
                                    </p>
                                    <p className="font-medium">
                                        {selectedInvoice.startTime} – {selectedInvoice.endTime}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <DollarSign className="h-3 w-3" /> Amount
                                    </p>
                                    <p className="font-semibold text-base">
                                        ${selectedInvoice.totalAmount.toFixed(2)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Status</p>
                                    <Badge className={`text-xs mt-0.5 flex items-center gap-1 w-fit px-2 py-0.5 ${statusStyles[selectedInvoice.status]}`}>
                                        {statusIcons[selectedInvoice.status]}
                                        <span className="capitalize">{selectedInvoice.status}</span>
                                    </Badge>
                                </div>
                            </div>

                            {selectedInvoice.notes && (
                                <div>
                                    <Label className="text-xs text-muted-foreground">Notes</Label>
                                    <p className="text-sm mt-1 bg-muted/40 rounded px-3 py-2">
                                        {selectedInvoice.notes}
                                    </p>
                                </div>
                            )}

                            {selectedInvoice.status === 'declined' && selectedInvoice.declineReason && (
                                <div>
                                    <Label className="text-xs text-muted-foreground">Decline Reason</Label>
                                    <p className="text-sm mt-1 bg-red-50 text-red-700 rounded px-3 py-2">
                                        {selectedInvoice.declineReason}
                                    </p>
                                </div>
                            )}

                            {selectedInvoice.status === 'approved' && selectedInvoice.approvedAt && (
                                <p className="text-xs text-green-600">
                                    Approved on {format(new Date(selectedInvoice.approvedAt), 'dd MMM yyyy')}
                                </p>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Overwrite dialog */}
            <Dialog
                open={overwriteDialogOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setOverwriteDialogOpen(false);
                        setSelectedInvoice(null);
                    }
                }}
            >
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Overwrite Invoice Status</DialogTitle>
                        <DialogDescription>
                            This invoice is currently{' '}
                            <span className="font-medium capitalize">{selectedInvoice?.status}</span>.
                            Select a new status to override the client's decision.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-2 pt-1">
                        <Button
                            size="sm"
                            className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700 text-white"
                            disabled={actionLoading}
                            onClick={() => handleAdminApprove(selectedInvoice)}
                        >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            {actionLoading ? 'Processing...' : 'Approve'}
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-8 text-xs border-red-200 text-red-600 hover:bg-red-50"
                            disabled={actionLoading}
                            onClick={openDeclineFromOverwrite}
                        >
                            <XCircle className="h-3.5 w-3.5 mr-1" />
                            Decline
                        </Button>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setOverwriteDialogOpen(false);
                                setSelectedInvoice(null);
                            }}
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Decline reason dialog */}
            <Dialog open={declineDialogOpen} onOpenChange={handleDeclineDialogClose}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Decline Invoice</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for declining this invoice.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-1.5">
                        <Label className="text-xs">
                            Reason <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            placeholder="e.g. Incorrect hours recorded..."
                            value={declineReason}
                            onChange={(e) => {
                                setDeclineReason(e.target.value);
                                if (e.target.value.trim()) setDeclineReasonError(false);
                            }}
                            rows={3}
                            className={declineReasonError ? 'border-red-500 focus-visible:ring-red-500' : ''}
                        />
                        {declineReasonError && (
                            <p className="text-xs text-red-500">Reason is required.</p>
                        )}
                    </div>
                    <DialogFooter className="gap-2 pt-1">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeclineDialogClose(false)}
                            disabled={actionLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={handleAdminDeclineConfirm}
                            disabled={actionLoading}
                        >
                            <XCircle className="h-3.5 w-3.5 mr-1.5" />
                            {actionLoading ? 'Declining...' : 'Confirm Decline'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}