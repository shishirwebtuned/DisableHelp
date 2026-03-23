'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/redux/store';
import {
    fetchMyInvoicesAsWorker,
    createInvoice,
    editInvoice,
    deleteInvoice,
} from '@/redux/slices/invoiceSlice';
import { fetchMyClients } from '@/redux/slices/activeConnectionsSlice';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DeleteConfirmation } from '@/components/common/DeleteConfirmation';
import {
    Plus, FileText, DollarSign, Clock,
    CheckCircle2, XCircle, Edit, Trash2,
} from 'lucide-react';
import { format } from 'date-fns';

const statusConfig: Record<string, {
    label: string;
    className: string;
    icon: React.ReactNode;
}> = {
    pending: {
        label: 'Pending',
        className: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
        icon: <Clock className="h-3.5 w-3.5" />,
    },
    approved: {
        label: 'Approved',
        className: 'bg-green-50 text-green-700 border border-green-200',
        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    },
    declined: {
        label: 'Declined',
        className: 'bg-red-50 text-red-700 border border-red-200',
        icon: <XCircle className="h-3.5 w-3.5" />,
    },
};

export default function WorkerInvoicesPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { items: invoices, loading } = useSelector((state: RootState) => state.invoices);
    const { clients } = useSelector((state: RootState) => state.activeConnections);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<any | null>(null);
    // const [invoiceFile, setInvoiceFile] = useState<File | null>(null);

    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        isOpen: boolean;
        id: string | null;
        name: string;
    }>({ isOpen: false, id: null, name: '' });

    useEffect(() => {
        dispatch(fetchMyInvoicesAsWorker({}));
        dispatch(fetchMyClients());
    }, [dispatch]);

    const totalApproved = invoices
        .filter(inv => inv.status === 'approved')
        .reduce((sum, inv) => sum + inv.totalAmount, 0);

    const pendingAmount = invoices
        .filter(inv => inv.status === 'pending')
        .reduce((sum, inv) => sum + inv.totalAmount, 0);

    const openForNew = () => {
        setEditingInvoice(null);
        setIsDialogOpen(true);
    };

    const openForEdit = (invoice: any) => {
        setEditingInvoice(invoice);
        setIsDialogOpen(true);
    };

    const handleDelete = async () => {
        if (deleteConfirmation.id) {
            await dispatch(deleteInvoice(deleteConfirmation.id));
            setDeleteConfirmation({ isOpen: false, id: null, name: '' });
        }
    };

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Invoices</h1>
                    <p className="text-muted-foreground text-sm">Manage and submit your invoices</p>
                </div>
                <Button onClick={openForNew} className="flex items-center gap-1.5">
                    <Plus className="h-4 w-4" />
                    New Invoice
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Approved Earnings</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalApproved.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">From approved invoices</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${pendingAmount.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Awaiting client approval</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{invoices.length}</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Invoice History</CardTitle>
                    <CardDescription>Track all your submitted invoices</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice #</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Attachment</TableHead>
                                <TableHead>Submitted</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.map(invoice => {
                                const status = statusConfig[invoice.status] ?? statusConfig.pending;
                                const canEdit = invoice.status === 'pending';

                                return (
                                    <TableRow key={invoice._id}>
                                        <TableCell className="font-medium text-xs">
                                            {invoice.invoiceNumber}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {invoice.client?.firstName} {invoice.client?.lastName}
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
                                            <Badge
                                                variant="secondary"
                                                className={`${status.className} flex items-center gap-1 w-fit text-xs`}
                                            >
                                                {status.icon}
                                                {status.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {(invoice as any).file?.url ? (
                                                <a
                                                    href={(invoice as any).file.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                                >
                                                    <FileText className="h-3.5 w-3.5" />
                                                    View
                                                </a>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {invoice.createdAt
                                                ? format(new Date(invoice.createdAt), 'dd MMM yyyy')
                                                : '—'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    disabled={!canEdit}
                                                    onClick={() => openForEdit(invoice)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    disabled={!canEdit}
                                                    onClick={() => setDeleteConfirmation({
                                                        isOpen: true,
                                                        id: invoice._id,
                                                        name: invoice.invoiceNumber,
                                                    })}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                    {!loading && invoices.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
                            <p className="text-sm">No invoices submitted yet</p>
                        </div>
                    )}

                    {loading && (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                            Loading invoices...
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create / Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[520px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingInvoice ? 'Edit Invoice' : 'New Invoice'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingInvoice
                                ? 'Update the invoice details. Only pending invoices can be edited.'
                                : 'Submit a new invoice for services provided to a client.'}
                        </DialogDescription>
                    </DialogHeader>
                    <InvoiceForm
                        invoice={editingInvoice}
                        clients={clients}
                        onClose={() => setIsDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete confirmation */}
            <DeleteConfirmation
                isOpen={deleteConfirmation.isOpen}
                onClose={() => setDeleteConfirmation({ isOpen: false, id: null, name: '' })}
                onConfirm={handleDelete}
                title="Delete Invoice"
                itemName={deleteConfirmation.name}
                description="This action cannot be undone. This will permanently delete this invoice."
            />
        </div>
    );
}

function InvoiceForm({
    invoice,
    clients,
    onClose,
}: {
    invoice?: any;
    clients: any[];
    onClose: () => void;
}) {
    const dispatch = useDispatch<AppDispatch>();
    const [submitting, setSubmitting] = useState(false);
    const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        client: invoice?.client?._id || '',
        totalAmount: invoice?.totalAmount?.toString() || '',
        date: invoice?.date ? format(new Date(invoice.date), 'yyyy-MM-dd') : '',
        startTime: invoice?.startTime || '',
        endTime: invoice?.endTime || '',
        notes: invoice?.notes || '',
    });

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        if (invoice) {
            await dispatch(editInvoice({
                invoiceId: invoice._id,
                data: {
                    totalAmount: parseFloat(formData.totalAmount),
                    date: formData.date,
                    startTime: formData.startTime,
                    endTime: formData.endTime,
                    notes: formData.notes,
                    file: invoiceFile ?? undefined,

                },
            }));
        } else {
            await dispatch(createInvoice({
                client: formData.client,
                totalAmount: parseFloat(formData.totalAmount),
                date: formData.date,
                startTime: formData.startTime,
                endTime: formData.endTime,
                notes: formData.notes,
                file: invoiceFile ?? undefined, // 👈 add

            }));
        }

        setSubmitting(false);
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">

            {/* Client select — only for new invoices */}
            {!invoice && (
                <div className="space-y-1.5 w-full">
                    <Label>Client</Label>
                    {clients.length === 0 ? (
                        <p className="text-xs text-muted-foreground border rounded-md px-3 py-2">
                            No active clients found. You need an active agreement to submit an invoice.
                        </p>
                    ) : (
                        <Select
                            value={formData.client}
                            onValueChange={val => handleChange('client', val)}
                            required
                        >
                            <SelectTrigger className='w-full'>
                                <SelectValue placeholder="Select a client" />
                            </SelectTrigger>
                            <SelectContent>
                                {clients.map(client => (
                                    <SelectItem key={client._id} value={client._id}>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={client.avatar} />
                                                <AvatarFallback className="text-xs">
                                                    {client.firstName?.[0]}{client.lastName?.[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">
                                                    {client.firstName} {client.lastName}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {client.email}
                                                </span>
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
            )}

            {/* Date */}
            <div className="space-y-1.5">
                <Label htmlFor="date">Service Date</Label>
                <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={e => handleChange('date', e.target.value)}
                    required
                />
            </div>

            {/* Start / End time */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                        id="startTime"
                        type="time"
                        value={formData.startTime}
                        onChange={e => handleChange('startTime', e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                        id="endTime"
                        type="time"
                        value={formData.endTime}
                        onChange={e => handleChange('endTime', e.target.value)}
                        required
                    />
                </div>
            </div>

            {/* Total Amount */}
            <div className="space-y-1.5">
                <Label htmlFor="totalAmount">Total Amount ($)</Label>
                <Input
                    id="totalAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.totalAmount}
                    onChange={e => handleChange('totalAmount', e.target.value)}
                    required
                />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
                <Label htmlFor="notes">
                    Notes <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                    id="notes"
                    rows={3}
                    placeholder="Any additional details about this invoice..."
                    value={formData.notes}
                    onChange={e => handleChange('notes', e.target.value)}
                />
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="invoiceFile">
                    Attachment <span className="text-muted-foreground">(optional)</span>
                </Label>
                {/* Show existing file if editing */}
                {invoice?.file?.url && !invoiceFile && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground border rounded-md px-3 py-2">
                        <FileText className="h-3.5 w-3.5 shrink-0" />
                        <a
                            href={invoice.file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline truncate"
                        >
                            {invoice.file.originalName ?? 'View current attachment'}
                        </a>
                        <span className="text-muted-foreground ml-auto shrink-0">
                            (replace by selecting new file)
                        </span>
                    </div>
                )}
                <Input
                    id="invoiceFile"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => setInvoiceFile(e.target.files?.[0] ?? null)}
                />
                {invoiceFile && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {invoiceFile.name}
                    </p>
                )}
            </div>

            <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={submitting || (!invoice && clients.length === 0)}
                >
                    {submitting
                        ? (invoice ? 'Saving...' : 'Submitting...')
                        : (invoice ? 'Save Changes' : 'Submit Invoice')}
                </Button>
            </DialogFooter>
        </form >
    );
}