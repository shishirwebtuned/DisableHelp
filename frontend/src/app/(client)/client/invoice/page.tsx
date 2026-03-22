'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/redux/store';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
    Clock, Calendar, DollarSign, FileText,
    CheckCircle, XCircle, AlertCircle,
} from 'lucide-react';
import { approveInvoice, declineInvoice, fetchMyInvoicesAsClient } from '@/redux/slices/invoiceSlice';

const statusConfig = {
    pending: {
        label: 'Pending',
        className: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
        icon: <AlertCircle className="h-3 w-3" />,
    },
    approved: {
        label: 'Approved',
        className: 'bg-green-50 text-green-700 border border-green-200',
        icon: <CheckCircle className="h-3 w-3" />,
    },
    declined: {
        label: 'Declined',
        className: 'bg-red-50 text-red-700 border border-red-200',
        icon: <XCircle className="h-3 w-3" />,
    },
};

export default function ClientInvoicePage() {
    const dispatch = useDispatch<AppDispatch>();
    const { items: invoices, loading } = useSelector((state: RootState) => state.invoices);

    const [activeTab, setActiveTab] = useState('all');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [selectedApproveId, setSelectedApproveId] = useState<string | null>(null);

    const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
    const [selectedDeclineId, setSelectedDeclineId] = useState<string | null>(null);
    const [declineReason, setDeclineReason] = useState('');
    const [declineReasonError, setDeclineReasonError] = useState(false);

    useEffect(() => {
        dispatch(fetchMyInvoicesAsClient({}));
    }, [dispatch]);

    const filteredInvoices = activeTab === 'all'
        ? invoices
        : invoices.filter(inv => inv.status === activeTab);

    const handleOpenApprove = (invoiceId: string) => {
        setSelectedApproveId(invoiceId);
        setApproveDialogOpen(true);
    };

    const handleApproveConfirm = async () => {
        if (!selectedApproveId) return;
        setActionLoading(selectedApproveId);
        await dispatch(approveInvoice(selectedApproveId));
        setActionLoading(null);
        setApproveDialogOpen(false);
        setSelectedApproveId(null);
    };

    const handleOpenDecline = (invoiceId: string) => {
        setSelectedDeclineId(invoiceId);
        setDeclineReason('');
        setDeclineReasonError(false);
        setDeclineDialogOpen(true);
    };

    const handleDeclineConfirm = async () => {
        if (!selectedDeclineId) return;
        if (!declineReason.trim()) {
            setDeclineReasonError(true);
            return;
        }
        setActionLoading(selectedDeclineId);
        await dispatch(declineInvoice({ invoiceId: selectedDeclineId, reason: declineReason.trim() }));
        setActionLoading(null);
        setDeclineDialogOpen(false);
        setSelectedDeclineId(null);
        setDeclineReason('');
    };

    const counts = {
        all: invoices.length,
        pending: invoices.filter(i => i.status === 'pending').length,
        approved: invoices.filter(i => i.status === 'approved').length,
        declined: invoices.filter(i => i.status === 'declined').length,
    };

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-xl font-bold tracking-tight">Invoices</h1>
                <p className="text-muted-foreground text-sm">
                    Review and manage invoices submitted by your support workers.
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="h-10">
                    <TabsTrigger value="all" className="text-xs gap-1.5">
                        All
                        <Badge variant="secondary" className="h-4 w-4 mt-0.5 px-1.5 text-[9px]">
                            {counts.all}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="pending" className="text-xs gap-1.5">
                        Pending
                        <Badge className="h-4 w-4 mt-0.5 px-1.5 text-[9px] bg-yellow-100 text-yellow-700 hover:bg-yellow-100 py-1">
                            {counts.pending}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="approved" className="text-xs gap-1.5">
                        Approved
                        <Badge className="h-4 w-4 mt-0.5 px-1.5 text-[9px] bg-green-100 text-green-700 hover:bg-green-100">
                            {counts.approved}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="declined" className="text-xs gap-1.5">
                        Declined
                        <Badge className="h-4 w-4 mt-0.5 px-1.5 text-[9px] bg-red-100 text-red-700 hover:bg-red-100">
                            {counts.declined}
                        </Badge>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-3">
                    {loading && (
                        <p className="text-xs text-muted-foreground py-2">Loading invoices...</p>
                    )}

                    {!loading && filteredInvoices.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <FileText className="h-8 w-8 mx-auto mb-2 opacity-25" />
                            <p className="text-sm">No {activeTab !== 'all' ? activeTab : ''} invoices found.</p>
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filteredInvoices.map(invoice => {
                            const status = statusConfig[invoice.status];
                            const isActioning = actionLoading === invoice._id;

                            return (
                                <Card key={invoice._id} className="hover:shadow-sm transition-shadow border">
                                    <CardContent className="px-3 space-y-2.5">

                                        {/* Worker + status */}
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <Avatar className="h-7 w-7 shrink-0">
                                                    <AvatarImage src={invoice.worker?.avatar} />
                                                    <AvatarFallback className="text-[10px]">
                                                        {invoice.worker?.firstName?.[0]}{invoice.worker?.lastName?.[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold leading-tight truncate">
                                                        {invoice.worker?.firstName} {invoice.worker?.lastName}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground truncate">
                                                        {invoice.worker?.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge className={`text-[10px] flex items-center gap-0.5 px-1.5 py-0.5 rounded-full font-medium shrink-0 ${status.className}`}>
                                                {status.icon}
                                                {status.label}
                                            </Badge>
                                        </div>

                                        {/* Divider */}
                                        <div className="border-t" />

                                        {/* Invoice details */}
                                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <FileText className="h-3 w-3 shrink-0" />
                                                <span className="font-medium text-foreground truncate">
                                                    {invoice.invoiceNumber}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <DollarSign className="h-3 w-3 shrink-0" />
                                                <span className="font-semibold text-foreground">
                                                    ${invoice.totalAmount.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <Calendar className="h-3 w-3 shrink-0" />
                                                <span>
                                                    {new Date(invoice.date).toLocaleDateString('en-AU', {
                                                        day: 'numeric', month: 'short', year: 'numeric',
                                                    })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <Clock className="h-3 w-3 shrink-0" />
                                                <span>{invoice.startTime} – {invoice.endTime}</span>
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        {invoice.notes && (
                                            <p className="text-[11px] text-muted-foreground bg-muted/40 rounded px-2 py-1 leading-relaxed">
                                                {invoice.notes}
                                            </p>
                                        )}

                                        {/* Decline reason */}
                                        {invoice.status === 'declined' && invoice.declineReason && (
                                            <div className="flex items-start gap-1 text-[11px] text-red-600 bg-red-50 rounded px-2 py-1">
                                                <XCircle className="h-3 w-3 mt-0.5 shrink-0" />
                                                <span>{invoice.declineReason}</span>
                                            </div>
                                        )}

                                        {/* Approved at */}
                                        {invoice.status === 'approved' && invoice.approvedAt && (
                                            <p className="text-[11px] text-green-600">
                                                Approved on {new Date(invoice.approvedAt).toLocaleDateString('en-AU')}
                                            </p>
                                        )}

                                        {/* Actions */}
                                        {invoice.status === 'pending' && (
                                            <div className="flex gap-1.5 pt-0.5">
                                                <Button
                                                    size="sm"
                                                    className="flex-1 h-7 text-[11px] bg-green-600 hover:bg-green-700 text-white"
                                                    disabled={isActioning}
                                                    onClick={() => handleOpenApprove(invoice._id)}
                                                >
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex-1 h-7 text-[11px] border-red-200 text-red-600 hover:bg-red-50"
                                                    disabled={isActioning}
                                                    onClick={() => handleOpenDecline(invoice._id)}
                                                >
                                                    <XCircle className="h-3 w-3 mr-1" />
                                                    Decline
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Approve dialog */}
            <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-base">Approve Invoice</DialogTitle>
                        <DialogDescription className="text-sm">
                            Are you sure you want to approve this invoice? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 pt-1">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setApproveDialogOpen(false)}
                            disabled={!!actionLoading}
                        >
                            No, cancel
                        </Button>
                        <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={handleApproveConfirm}
                            disabled={!!actionLoading}
                        >
                            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                            {actionLoading ? 'Approving...' : 'Yes, approve'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Decline dialog */}
            <Dialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-base">Decline Invoice</DialogTitle>
                        <DialogDescription className="text-sm">
                            Please provide a reason. The worker will be able to see this.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-1.5">
                        <Label htmlFor="declineReason" className="text-xs">
                            Reason <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="declineReason"
                            placeholder="e.g. Incorrect hours recorded..."
                            value={declineReason}
                            onChange={e => {
                                setDeclineReason(e.target.value);
                                if (e.target.value.trim()) setDeclineReasonError(false);
                            }}
                            rows={3}
                            className={`text-sm ${declineReasonError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        />
                        {declineReasonError && (
                            <p className="text-xs text-red-500">Reason is required.</p>
                        )}
                    </div>
                    <DialogFooter className="gap-2 pt-1">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeclineDialogOpen(false)}
                            disabled={!!actionLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={handleDeclineConfirm}
                            disabled={!!actionLoading}
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