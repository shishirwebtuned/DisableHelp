'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchInvoices, submitInvoice, updateInvoice, deleteInvoice } from '@/redux/slices/invoiceSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { parseISO, format } from 'date-fns';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, FileText, DollarSign, Clock, CheckCircle2, XCircle, AlertCircle, Edit, Trash2 } from 'lucide-react';import { DeleteConfirmation } from '@/components/common/DeleteConfirmation';
export default function WorkerInvoicesPage() {
    const dispatch = useAppDispatch();
    const { items: invoices, loading } = useAppSelector((state) => state.invoices);
    const { user } = useAppSelector((state) => state.auth);
    const { workerProfile } = useAppSelector((state) => state.profile);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; id: string | null; name: string }>({ isOpen: false, id: null, name: '' });

    useEffect(() => {
        dispatch(fetchInvoices(user?.id));
    }, [dispatch, user?.id]);

    const canSubmitInvoice = workerProfile && workerProfile.completeness === 100;

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

    const totalEarnings = invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.totalAmount, 0);

    const pendingAmount = invoices
        .filter(inv => inv.status === 'submitted' || inv.status === 'approved')
        .reduce((sum, inv) => sum + inv.totalAmount, 0);

    const openForNew = () => {
        setEditingInvoiceId(null);
        setIsDialogOpen(true);
    };

    const openForEdit = (invoice: any) => {
        setEditingInvoiceId(invoice.id);
        setIsDialogOpen(true);
    };

    const openDeleteConfirmation = (id: string, name: string) => {
        setDeleteConfirmation({ isOpen: true, id, name });
    };

    const handleDelete = () => {
        if (deleteConfirmation.id) {
            dispatch(deleteInvoice(deleteConfirmation.id));
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Invoices</h1>
                    <p className="text-muted-foreground">Manage and submit your invoices</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openForNew} disabled={!canSubmitInvoice} className="flex items-center">
                            <Plus className="h-4 w-4 mr-2" />
                            New Invoice
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>{editingInvoiceId ? 'Edit Invoice' : 'Submit New Invoice'}</DialogTitle>
                            <DialogDescription>
                                {editingInvoiceId ? 'Update the invoice details' : 'Create an invoice for services provided to a client'}
                            </DialogDescription>
                        </DialogHeader>
                        <InvoiceForm 
                            invoice={editingInvoiceId ? invoices.find(inv => inv.id === editingInvoiceId) : undefined}
                            onClose={() => setIsDialogOpen(false)} 
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {!canSubmitInvoice && (
                <Card className="border-l-4 border-l-amber-600 bg-amber-50 dark:bg-amber-950/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
                            <AlertCircle className="h-5 w-5" />
                            Profile Incomplete
                        </CardTitle>
                        <CardDescription className="text-amber-800 dark:text-amber-200">
                            Complete your profile to 100% before submitting invoices. This includes adding bank details.
                        </CardDescription>
                    </CardHeader>
                </Card>
            )}

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">From paid invoices</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Payment</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${pendingAmount.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Awaiting approval/payment</p>
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

            {/* Invoices Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Invoice History</CardTitle>
                    <CardDescription>View and track all your submitted invoices</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice ID</TableHead>
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
                            {invoices.map((invoice) => (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-medium">{invoice.id}</TableCell>
                                    <TableCell>{invoice.clientName}</TableCell>
                                    <TableCell className="text-sm">
                                        {format(new Date(invoice.periodStart), 'dd MMM')} -{' '}
                                        {format(new Date(invoice.periodEnd), 'dd MMM yyyy')}
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
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openForEdit(invoice)}
                                                disabled={invoice.status === 'paid' || invoice.status === 'approved'}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openDeleteConfirmation(invoice.id, invoice.id)}
                                                disabled={invoice.status === 'paid' || invoice.status === 'approved'}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {invoices.length === 0 && !loading && (
                        <div className="text-center py-12 text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No invoices submitted yet</p>
                        </div>
                    )}
                </CardContent>
            </Card>

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

function InvoiceForm({ invoice, onClose }: { invoice?: any; onClose: () => void }) {
    const dispatch = useAppDispatch();
    const [formData, setFormData] = useState({
        clientId: invoice?.clientId || '',
        clientName: invoice?.clientName || '',
        agreementId: invoice?.agreementId || '',
        periodStart: invoice?.periodStart || '',
        periodEnd: invoice?.periodEnd || '',
        hours: invoice?.hours?.toString() || '',
        rate: invoice?.rate?.toString() || '45',
        frequency: (invoice?.frequency || 'weekly') as 'weekly' | 'fortnightly' | 'monthly',
        notes: invoice?.notes || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const invoiceData = {
            ...formData,
            workerId: invoice?.workerId || 'u1',
            workerName: invoice?.workerName || 'Sarah Worker',
            hours: parseFloat(formData.hours),
            rate: parseFloat(formData.rate),
            totalAmount: parseFloat(formData.hours) * parseFloat(formData.rate),
        };

        if (invoice) {
            // Update existing invoice
            await dispatch(updateInvoice({
                ...invoice,
                ...invoiceData,
            }));
        } else {
            // Create new invoice
            await dispatch(submitInvoice(invoiceData));
        }
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="client">Client</Label>
                    <Select
                        value={formData.clientId}
                        onValueChange={(value) => {
                            setFormData({ ...formData, clientId: value, clientName: 'Alice Freeman' });
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="c1">Alice Freeman</SelectItem>
                            <SelectItem value="c2">Bob Smith</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select
                        value={formData.frequency}
                        onValueChange={(value: any) => setFormData({ ...formData, frequency: value })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="fortnightly">Fortnightly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="periodStart">Period Start</Label>
                    <DatePicker
                        date={formData.periodStart ? parseISO(formData.periodStart) : undefined}
                        setDate={(date) => setFormData({ ...formData, periodStart: date ? format(date, 'yyyy-MM-dd') : '' })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="periodEnd">Period End</Label>
                    <DatePicker
                        date={formData.periodEnd ? parseISO(formData.periodEnd) : undefined}
                        setDate={(date) => setFormData({ ...formData, periodEnd: date ? format(date, 'yyyy-MM-dd') : '' })}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="hours">Total Hours</Label>
                    <Input
                        id="hours"
                        type="number"
                        step="0.5"
                        value={formData.hours}
                        onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="rate">Hourly Rate ($)</Label>
                    <Input
                        id="rate"
                        type="number"
                        step="0.01"
                        value={formData.rate}
                        onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                        required
                    />
                </div>
            </div>

            {formData.hours && formData.rate && (
                <div className="p-4 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                        <span className="font-medium">Total Amount:</span>
                        <span className="text-2xl font-bold">
                            ${(parseFloat(formData.hours) * parseFloat(formData.rate)).toFixed(2)}
                        </span>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add any additional notes about this invoice..."
                    rows={3}
                />
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="submit">Submit Invoice</Button>
            </DialogFooter>
        </form>
    );
}
