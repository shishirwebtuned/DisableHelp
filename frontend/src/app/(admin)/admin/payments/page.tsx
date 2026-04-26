'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchAllPayments } from '@/redux/slices/paymentSlice';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/table';
import Pagination from '@/components/ui/pagination';
import Loading from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function AdminPaymentsPage() {
    const dispatch = useAppDispatch();
    const { items: payments, loading, pagination } = useAppSelector((state) => state.payments);

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchAllPayments({ page: currentPage, limit: pageSize }));
    }, [dispatch, currentPage]);

    const getUserName = (user: any) => {
        if (typeof user === "object") {
            return `${user?.firstName} ${user?.lastName}`;
        }
        return "Unknown";
    }
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Payment Details</h1>
                    <p className="text-muted-foreground">Review all worker payments on the platform</p>
                </div>
            </div>

            {loading && <Loading />}

            {!loading && payments.length > 0 && (
                <div className="overflow-x-auto rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Worker</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Late Fee</TableHead>
                                <TableHead>Total Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Payment Date</TableHead>
                                <TableHead className='text-center'>Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {payments.map((payment, index) => (
                                <TableRow key={payment._id}>
                                    {/* <TableCell>{payment._id.slice(-8).toUpperCase()}</TableCell> */}
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{getUserName(payment.worker)}</TableCell>
                                    <TableCell>{getUserName(payment.client)}</TableCell>
                                    <TableCell>${payment.lateFee.toFixed(2)}</TableCell>
                                    <TableCell>${payment.totalAmount.toFixed(2)}</TableCell>
                                    <TableCell className={`capitalize ${payment.status === 'successful' ? 'text-green-600' : payment.status === 'pending' ? 'text-yellow-600' : 'text-red-600'}`}>
                                        {payment.status}
                                    </TableCell>
                                    <TableCell>{payment.paymentMethod}</TableCell>
                                    <TableCell>{new Date(payment.paymentDate).toLocaleDateString()} {new Date(payment.paymentDate).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}</TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {/* View */}
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => {
                                                    setSelectedPayment(payment);
                                                    setViewDialogOpen(true);
                                                }}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {!loading && payments.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">No payments found.</div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <Pagination
                    totalPages={pagination.totalPages}
                    currentPage={currentPage}
                    onPageChange={(page) => setCurrentPage(page)}
                />
            )}

            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className='sm:max-w-lg'>
                    <DialogHeader>
                        <DialogTitle className='text-xl font-semibold'>Payment Details</DialogTitle>
                        <DialogDescription>Review the details of this payment transaction.</DialogDescription>
                    </DialogHeader>
                    {selectedPayment && (
                        <div className="space-y-4">
                            <div className="rounded-lg border bg-muted/30 p-5 text-center">
                                <p className="text-sm text-muted-foreground">
                                    Total Payment
                                </p>

                                <div className="text-3xl font-bold text-green-600">
                                    ${selectedPayment.totalAmount.toFixed(2)}
                                </div>

                                <p className="text-xs text-muted-foreground mt-1">
                                    Includes late fee if applicable
                                </p>
                            </div>

                            {/* Details grid */}
                            <div className="grid grid-cols-2 gap-4 text-sm">

                                <div className="space-y-1">
                                    <p className="text-muted-foreground">Worker</p>
                                    <p className="font-medium">
                                        {getUserName(selectedPayment.worker)}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-muted-foreground">Client</p>
                                    <p className="font-medium">
                                        {getUserName(selectedPayment.client)}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-muted-foreground">Base Amount</p>
                                    <p className="font-medium">
                                        ${selectedPayment.amount.toFixed(2)}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-muted-foreground">Late Fee</p>
                                    <p className="font-medium text-orange-600">
                                        ${selectedPayment.lateFee.toFixed(2)}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-muted-foreground">Payment Method</p>
                                    <p className="font-medium capitalize">
                                        {selectedPayment.paymentMethod}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-muted-foreground">Status</p>

                                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium
              ${selectedPayment.status === "successful"
                                            ? "bg-green-100 text-green-700"
                                            : selectedPayment.status === "pending"
                                                ? "bg-yellow-100 text-yellow-700"
                                                : "bg-red-100 text-red-700"
                                        }`}>
                                        {selectedPayment.status}
                                    </span>

                                </div>

                            </div>

                            {/* Divider */}
                            <div className="border-t" />

                            {/* Metadata */}
                            <div className="space-y-3 text-sm">

                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Payment Reference
                                    </span>

                                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                                        {selectedPayment.paymentReference}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Payment Date
                                    </span>

                                    <span className="font-medium">
                                        {new Date(selectedPayment.paymentDate).toLocaleDateString()}{" "}
                                        {new Date(selectedPayment.paymentDate).toLocaleTimeString([], {
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            hour12: true
                                        })}
                                    </span>

                                </div>

                            </div>

                        </div>

                    )}
                </DialogContent>
            </Dialog>

        </div>
    );
}