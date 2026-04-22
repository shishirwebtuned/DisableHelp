'use client';
import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { getAgreementById, getAgreementsByWorker, terminateAgreement, updateAgreementStatus, editAgreement } from '@/redux/slices/agreementsSlice';
import { formatDateToInputValue, inputValueToISO } from '@/lib/dateHelpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Search,
    Download,
    Mail,
    Phone,
    Calendar,
    DollarSign,
    Briefcase,
    FileText,
    Clock,
    CheckCircle,
    Eye,
    XCircle,
    AlertTriangle,
    Pen,
    Plus,
    Trash2,
    CalendarDays,
} from 'lucide-react';
import axios from '@/lib/axios';
import Pagination from '@/components/ui/pagination';
import Loading from '@/components/ui/loading';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import {
    createPaymentOrder,
    capturePayment,
    fetchPaymentDue
} from '@/redux/slices/paymentSlice';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const TIME_GROUPS = [
    { label: 'Morning', startTime: '07:00', endTime: '12:00' },
    { label: 'Afternoon', startTime: '12:00', endTime: '17:00' },
    { label: 'Evening', startTime: '17:00', endTime: '21:00' },
    { label: 'Night', startTime: '21:00', endTime: '23:00' },
];

type Period = { startTime: string; endTime: string };
type ScheduleDay = { day: string; period: Period[] };


export default function WorkerAgreementsPage() {
    const dispatch = useAppDispatch();
    const { items: agreements, loading, totalPages, page: currentPageFromStore } = useAppSelector((state) => state.agreements);
    const { paymentDue, approveLink, orderId } = useAppSelector((state) => state.payments);

    const [paymentCompleted, setPaymentCompleted] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'terminated' | 'completed'>('all');
    const [currentPage, setCurrentPage] = useState<number>(currentPageFromStore || 1);

    // Terms dialog state
    const [termsDialogOpen, setTermsDialogOpen] = useState(false);
    const [selectedTermsAgreementId, setSelectedTermsAgreementId] = useState<string | null>(null);
    const [acceptingTerms, setAcceptingTerms] = useState(false);
    const [viewOnlyTerms, setViewOnlyTerms] = useState(false);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [selectedAgreementId, setSelectedAgreementId] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    const [terminating, setTerminating] = useState(false);
    const [terminateDialogOpen, setTerminateDialogOpen] = useState(false);
    const [terminateReason, setTerminateReason] = useState('');
    const [terminateReasonError, setTerminateReasonError] = useState(false);

    // Edit dialog state
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingAgreementId, setEditingAgreementId] = useState<string | null>(null);
    const [editStartDate, setEditStartDate] = useState('');
    const [editSchedule, setEditSchedule] = useState<any[]>([]);
    const [editingLoading, setEditingLoading] = useState(false);
    const [editError, setEditError] = useState('');

    const pageSize = 10;

    const agreement = agreements.find(
        (a) => a._id === selectedAgreementId
    );

    useEffect(() => {
        dispatch(getAgreementsByWorker({
            page: currentPage, limit: pageSize,
            status: statusFilter === 'all' ? undefined : statusFilter,
            search: searchTerm || undefined
        }));
    }, [dispatch, currentPage, statusFilter, searchTerm, pageSize]);



    // const filteredAgreements = agreements.filter((agreement) => {
    //     const searchLower = searchTerm.toLowerCase();
    //     const workerName = typeof agreement.worker === 'string' ? '' : `${agreement.worker.firstName} ${agreement.worker.lastName}`.toLowerCase();
    //     const clientName = `${agreement.client.firstName} ${agreement.client.lastName}`.toLowerCase();
    //     const jobTitle = agreement.job?.title?.toLowerCase() || '';
    //     return (
    //         agreement._id.toLowerCase().includes(searchLower) ||
    //         workerName.includes(searchLower) ||
    //         clientName.includes(searchLower) ||
    //         jobTitle.includes(searchLower)
    //     );
    // });

    const filteredAgreements = agreements;


    useEffect(() => {
        if (detailsDialogOpen && selectedAgreementId) {
            dispatch(getAgreementById(selectedAgreementId));
        }
    }, [detailsDialogOpen, selectedAgreementId, dispatch]);

    const handleAcceptTerms = async () => {
        if (!selectedTermsAgreementId) return;

        if (!paymentCompleted && (paymentDue?.amountDue ?? 0) > 0) {
            return;
        }
        setAcceptingTerms(true);

        await dispatch(updateAgreementStatus({
            id: selectedTermsAgreementId,
            status: 'accepted'
        }));

        setAcceptingTerms(false);
        setTermsDialogOpen(false);
        setSelectedTermsAgreementId(null);
    };

    const statusStyles: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
        active: 'bg-green-100 text-green-700 border border-green-200',
        completed: 'bg-blue-100 text-blue-700 border border-blue-200',
        terminated: 'bg-red-100 text-red-700 border border-red-200',
    };


    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 640); // Tailwind sm breakpoint
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleTerminateConfirm = async () => {
        if (!selectedAgreementId) return;
        if (!terminateReason.trim()) {
            setTerminateReasonError(true);
            return;
        }
        setTerminating(true);
        await dispatch(terminateAgreement({
            id: selectedAgreementId,
            terminationReason: terminateReason.trim(),
        }));
        setTerminating(false);
        setTerminateDialogOpen(false);
        setSelectedAgreementId(null);
        setTerminateReason('');
    };

    // Schedule editing functions
    const toggleScheduleDay = (day: string) => {
        const exists = editSchedule.find((s) => s.day === day);
        if (exists) {
            setEditSchedule(editSchedule.filter((s) => s.day !== day));
        } else {
            setEditSchedule([...editSchedule, { day, period: [{ startTime: '09:00', endTime: '11:00' }] }]);
        }
    };

    const addSchedulePeriod = (day: string) => {
        setEditSchedule(editSchedule.map((s) =>
            s.day === day
                ? { ...s, period: [...s.period, { startTime: '09:00', endTime: '11:00' }] }
                : s
        ));
    };

    const removeSchedulePeriod = (day: string, periodIdx: number) => {
        setEditSchedule(editSchedule.map((s) =>
            s.day === day
                ? { ...s, period: s.period.filter((_: any, idx: number) => idx !== periodIdx) }
                : s
        ));
    };

    const updateSchedulePeriod = (day: string, periodIdx: number, field: 'startTime' | 'endTime', value: string) => {
        setEditSchedule(editSchedule.map((s) =>
            s.day === day
                ? {
                    ...s,
                    period: s.period.map((p: any, idx: number) =>
                        idx === periodIdx ? { ...p, [field]: value } : p
                    )
                }
                : s
        ));
    };

    return (
        <>
            {loading && !detailsDialogOpen && <Loading />}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Service Agreements</h1>
                        <p className="text-muted-foreground text-sm">View and manage your service agreements.</p>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="border-none">
                    <div className="pt-3">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    placeholder="Search by Job Title, Agreement ID, worker, or client name..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Select
                                value={statusFilter}
                                onValueChange={(val) => {
                                    const v = val as 'all' | 'pending' | 'active' | 'terminated' | 'completed';
                                    setStatusFilter(v);
                                    setCurrentPage(1);
                                }}
                            >
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

                {/* Agreements Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAgreements.length > 0 ? (
                        filteredAgreements.map((agreement) => (
                            <Card key={agreement._id} className="p-3">
                                <CardHeader className="pb-2 px-0 pt-0">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-sm md:text-[15px] lg:text-base leading-tight">
                                                {agreement.job?.title || 'No Job Title'}
                                            </CardTitle>
                                            <CardDescription className="mt-1 text-xs">
                                                ID: {agreement._id.slice(-12).toUpperCase()}
                                            </CardDescription>
                                        </div>
                                        <Badge className={`text-xs font-medium capitalize px-2 py-0.5 ${statusStyles[agreement.status] ?? 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                                            {agreement.status}
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-2.5 p-0 -mt-2">
                                    {/* Client Information */}
                                    <div className="rounded-lg px-0 space-y-2">
                                        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                            Client Details
                                        </div>
                                        {typeof agreement.client === 'string' ? (
                                            <p className="text-xs text-muted-foreground">ID: {agreement.client}</p>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-2 text-sm font-medium">
                                                    <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                    {agreement.client.firstName} {agreement.client.lastName}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Mail className="h-3 w-3 shrink-0" />
                                                    {agreement.client.email}
                                                </div>
                                                {agreement.client.phoneNumber && (
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Phone className="h-3 w-3 shrink-0" />
                                                        {agreement.client.phoneNumber}
                                                    </div>
                                                )}
                                                {agreement.client.dateOfBirth && (
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Calendar className="h-3 w-3 shrink-0" />
                                                        DOB: {new Date(agreement.client.dateOfBirth).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    <div className="space-y-1.5 pt-2 border-t">
                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                            Worker Details
                                        </p>
                                        {typeof agreement.worker === 'string' ? (
                                            <p className="text-xs text-muted-foreground">ID: {agreement.worker}</p>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-2 text-sm font-medium">
                                                    <Briefcase className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                    {agreement.worker.firstName} {agreement.worker.lastName}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Mail className="h-3 w-3 shrink-0" />
                                                    {agreement.worker.email}
                                                </div>
                                                {('phoneNumber' in agreement.worker) && (agreement.worker as any).phoneNumber && (
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Phone className="h-3 w-3 shrink-0" />
                                                        {(agreement.worker as any).phoneNumber}
                                                    </div>
                                                )}
                                                {('dateOfBirth' in agreement.worker) && (agreement.worker as any).dateOfBirth && (
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Calendar className="h-3 w-3 shrink-0" />
                                                        DOB: {new Date((agreement.worker as any).dateOfBirth).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {/* Agreement Details Grid */}
                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                <DollarSign className="h-3.5 w-3.5" />
                                                Hourly Rate
                                            </div>
                                            <div className="text-sm font-bold text-green-600 ">
                                                ${agreement.hourlyRate}/hr
                                            </div>
                                        </div>
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                Start Date
                                            </div>
                                            <div className="text-xs font-medium">
                                                {new Date(agreement.startDate).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                <FileText className="h-3 w-3" />
                                                Application
                                            </div>
                                            <div className="text-xs font-mono text-muted-foreground">
                                                {agreement.application.slice(-8).toUpperCase()}
                                            </div>
                                        </div>
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                Created
                                            </div>
                                            <div className="text-xs font-medium">
                                                {new Date(agreement.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Updated Date */}
                                    <div className="text-[10px] text-muted-foreground flex items-center gap-1 pt-1 border-t">
                                        <Clock className="h-3 w-3" />
                                        Last updated: {new Date(agreement.updatedAt).toLocaleDateString()} at {new Date(agreement.updatedAt).toLocaleTimeString()}
                                    </div>

                                    {/* Terms & Actions */}
                                    <div className="flex items-center justify-between pt-3 border-t">
                                        <div className="flex items-center gap-2">
                                            {agreement.termsAcceptedByWorker ? (
                                                <Badge className="bg-green-100 text-green-700 border border-green-200 text-xs font-medium">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Terms Accepted
                                                </Badge>
                                            ) : (

                                                <Badge className="bg-red-100 text-red-700 border border-red-200 text-xs font-medium">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Terms Not Accepted
                                                </Badge>
                                            )}

                                        </div>
                                        {agreement.status === 'active' && (
                                            <button
                                                className="h-7 text-[11px] bg-red-500 text-white hover:bg-red-600 px-2.5 flex items-center rounded-sm shadow-sm transition-colors cursor-pointer"
                                                onClick={() => {
                                                    setSelectedAgreementId(agreement._id);
                                                    setTerminateReason('');
                                                    setTerminateReasonError(false);
                                                    setTerminateDialogOpen(true);
                                                }}
                                            >
                                                <XCircle className="h-3 w-3 mr-1.5" />
                                                Terminate
                                            </button>
                                        )}

                                        {agreement.status === 'pending' && (
                                            <button
                                                className="h-7 text-[11px] bg-blue-500 text-white hover:bg-blue-600 px-2.5 flex items-center rounded-sm shadow-sm transition-colors cursor-pointer"
                                                onClick={() => {
                                                    setEditingAgreementId(agreement._id);
                                                    setEditStartDate(formatDateToInputValue(agreement.startDate));
                                                    setEditSchedule(agreement.schedule || []);
                                                    setEditError('');
                                                    setEditDialogOpen(true);
                                                }}
                                            >
                                                <Pen className="h-3 w-3 mr-1.5" />
                                                Edit
                                            </button>
                                        )}



                                    </div>
                                    <div className='border-t pt-3 flex flex-row-reverse items-center justify-between'>
                                        <button className="md:h-6.5 h-6 lg:h-7 md:text-[11px] text-[11px] lg:text-[12px] bg-blue-500 text-white hover:bg-blue-600 px-2.5 flex items-center rounded-sm transition-colors cursor-pointer shadow-sm"
                                            onClick={() => {
                                                setSelectedAgreementId(agreement._id);
                                                setDetailsDialogOpen(true);
                                            }}>
                                            View Details
                                        </button>
                                        <div>
                                            {agreement.termsAcceptedByWorker ? (
                                                <button
                                                    className="md:h-6.5 h-6 lg:h-7 md:text-[11px] text-[11px] lg:text-[12px] bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground border px-2.5 flex items-center rounded-sm transition-colors cursor-pointer shadow-sm"
                                                    onClick={() => {
                                                        setSelectedTermsAgreementId(agreement._id);
                                                        setViewOnlyTerms(true);
                                                        setTermsDialogOpen(true);
                                                    }}
                                                >
                                                    <Eye className="w-3 h-3 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4 mr-1.5" />
                                                    View Terms
                                                </button>
                                            ) : (
                                                <button
                                                    className="h-7 md:text-[11px] text-[9px] lg:text-[13px] bg-blue-500 text-white hover:bg-blue-400 p-2 flex flex-row items-center rounded-sm shadow-md cursor-pointer"
                                                    onClick={() => {
                                                        setSelectedTermsAgreementId(agreement._id);
                                                        setViewOnlyTerms(false);

                                                        setPaymentCompleted(false);

                                                        setTermsDialogOpen(true);

                                                        dispatch(fetchPaymentDue({
                                                            workerId: typeof agreement.worker === "string"
                                                                ? agreement.worker
                                                                : agreement.worker._id,
                                                            clientId: agreement.client._id
                                                        }));

                                                    }}
                                                >
                                                    <FileText className="w-3 h-3 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4 mr-1.5" />
                                                    <span>
                                                        Accept Terms</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full text-center text-muted-foreground py-12">
                            <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>No agreements found matching your criteria.</p>
                        </div>
                    )}
                </div>

                <Pagination
                    totalPages={totalPages || 1}
                    currentPage={currentPage}
                    onPageChange={(page) => setCurrentPage(page)}
                />
            </div>

            <PayPalScriptProvider
                options={{
                    "clientId": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
                    currency: "AUD",
                    intent: "capture"
                }}
            >
                <Dialog open={termsDialogOpen} onOpenChange={setTermsDialogOpen}>
                    <DialogContent className="sm:max-w-3xl">
                        <DialogHeader className='flex gap-0'>
                            <DialogTitle className='md:text-[17px] text-base lg:text-lg'>Terms & Conditions</DialogTitle>
                            <DialogDescription className='md:text-[13px] text-xs lg:text-sm'>
                                Please read the terms and conditions carefully before accepting.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="max-h-96 md:max-h-full overflow-y-auto rounded-md border bg-muted/30 px-3 md:px-4 py-1 md:py-2 md:text-[13px] text-xs lg:text-sm text-gray-600 md:space-y-2 space-y-1.5 lg:space-y-2.5">

                            <p className="font-semibold text-foreground md:text-[15px] text-sm lg:text-base">
                                Service Agreement Terms
                            </p>

                            <p>
                                By accepting these terms, you agree to provide support services professionally
                                and according to this agreement.
                            </p>

                            {(paymentDue?.amountDue ?? 0) > 0 && !paymentCompleted && (
                                <div className="rounded-lg border-2 border-green-500 bg-green-50 p-2 lg:p-3 space-y-2 shadow-sm">

                                    <div className="text-center space-y-0.5">

                                        <h3 className="lg:text-[17px] md:text-base text-[15px] font-bold text-foreground">
                                            Agreement Activation Fee
                                        </h3>

                                        <p className="text-muted-foreground lg:text-sm md:text-[13px] text-xs">
                                            Payment is required to accept this agreement
                                        </p>

                                        <div className="md:text-[22px] text-lg lg:text-[28px] font-extrabold text-green-600">
                                            $100
                                        </div>

                                        <p className="md:text-[11px] text-[10px] lg:text-xs text-muted-foreground">
                                            Secure payment via PayPal (Sandbox)
                                        </p>

                                    </div>
                                    <PayPalButtons

                                        createOrder={async () => {

                                            const agreement = agreements.find(
                                                a => a._id === selectedTermsAgreementId
                                            );

                                            if (!agreement) return "";

                                            const workerId =
                                                typeof agreement.worker === "string"
                                                    ? agreement.worker
                                                    : agreement.worker._id;

                                            const res = await dispatch(
                                                createPaymentOrder({
                                                    workerId,
                                                    clientId: agreement.client._id,
                                                    paymentMethod: "paypal"
                                                })
                                            ).unwrap();

                                            return res.orderId;

                                        }}

                                        onApprove={async (data) => {

                                            const agreement = agreements.find(
                                                a => a._id === selectedTermsAgreementId
                                            );

                                            if (!agreement) return;

                                            const workerId =
                                                typeof agreement.worker === "string"
                                                    ? agreement.worker
                                                    : agreement.worker._id;

                                            await dispatch(
                                                capturePayment({
                                                    orderId: data.orderID,
                                                    workerId,
                                                    clientId: agreement.client._id,
                                                    paymentMethod: "paypal"
                                                })
                                            );

                                            setPaymentCompleted(true);

                                        }}

                                        onError={(err) => {
                                            console.log(err);
                                        }}

                                        style={{
                                            layout: "horizontal",
                                            height: isMobile ? 25 : 38,
                                            shape: "rect",
                                            color: "blue",
                                            label: "pay",
                                            tagline: false
                                        }}

                                    // style={{
                                    //     layout: "horizontal",
                                    //     height: 35,
                                    //     shape: "pill",
                                    //     color: "gold",
                                    //     label: "pay",
                                    //     tagline: false
                                    // }}

                                    />
                                </div>
                            )}
                            {paymentCompleted && (
                                <div className="text-green-600 text-sm text-center font-medium">
                                    ✅ Payment completed. You can now accept terms.
                                </div>
                            )}
                            {/* IMPORTANT TERMS ONLY */}
                            <div className="space-y-1.5 md:space-y-2 text-[11px] md:text-xs lg:text-[13px] border-t pt-2">

                                <p className="font-medium text-foreground">
                                    Key Conditions:
                                </p>

                                <p>
                                    <span className="font-medium text-foreground">Payment:</span>{" "}
                                    A monthly subscription fee of <span className="text-[green] font-medium">$100</span> is required for each client.
                                </p>

                                <p>
                                    <span className="font-medium text-foreground">Confidentiality:</span>{" "}
                                    All client information must be treated as strictly confidential and handled
                                    in accordance with privacy obligations. Disclosure or misuse of such information
                                    is not permitted under any circumstances.
                                </p>

                                <p>
                                    <span className="font-medium text-foreground">Conduct:</span>{" "}
                                    You are expected to maintain professional, respectful, and ethical behavior
                                    at all times while interacting with clients and stakeholders, ensuring a safe
                                    and appropriate working environment.
                                </p>

                                <p>
                                    <span className="font-medium text-foreground">Compliance:</span>{" "}
                                    All services must be delivered in full compliance with NDIS standards,
                                    organizational policies, and applicable safety regulations at all times.
                                </p>

                                {/* <p>
                                    <span className="font-medium text-foreground">Insurance:</span>
                                    {" "}Valid liability insurance required.
                                </p> */}

                            </div>

                        </div>
                        <DialogFooter className="gap-2 pt-1">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setTermsDialogOpen(false)}
                            >
                                {viewOnlyTerms ? 'Close' : 'Cancel'}
                            </Button>
                            {!viewOnlyTerms && (
                                <Button
                                    size="sm"
                                    onClick={handleAcceptTerms}
                                    disabled={acceptingTerms || ((paymentDue?.amountDue ?? 0) > 0 && !paymentCompleted)}
                                    className={`${acceptingTerms ? 'cursor-not-allowed opacity-60 bg-muted' : ''}`}
                                >
                                    <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                                    {acceptingTerms ? 'Accepting...' : 'Accept'}
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={terminateDialogOpen} onOpenChange={setTerminateDialogOpen}>
                    <DialogContent className="sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-red-600">
                                <AlertTriangle className="h-4 w-4" />
                                Terminate Agreement
                            </DialogTitle>
                            <DialogDescription>
                                This action cannot be undone. Please provide a reason for terminating this agreement.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-1.5">
                            <Label htmlFor="terminateReason" className="text-xs">
                                Reason <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                id="terminateReason"
                                placeholder="e.g. Services no longer required..."
                                value={terminateReason}
                                onChange={e => {
                                    setTerminateReason(e.target.value);
                                    if (e.target.value.trim()) setTerminateReasonError(false);
                                }}
                                rows={3}
                                className={`text-sm ${terminateReasonError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            />
                            {terminateReasonError && (
                                <p className="text-xs text-red-500">Reason is required to terminate.</p>
                            )}
                        </div>

                        <DialogFooter className="gap-2 pt-1">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setTerminateDialogOpen(false)}
                                disabled={terminating}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={handleTerminateConfirm}
                                disabled={terminating}
                            >
                                <XCircle className="h-3.5 w-3.5 mr-1.5" />
                                {terminating ? 'Terminating...' : 'Confirm'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

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

                                            {agreement.job?.location?.suburb}
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

                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Pen className="h-4 w-4" />
                                Edit Agreement
                            </DialogTitle>
                            <DialogDescription>
                                Update the start date and schedule for this pending agreement.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                            <div className="space-y-1.5">
                                <Label htmlFor="editStartDate" className="text-xs">
                                    Start Date <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="editStartDate"
                                    type="date"
                                    value={editStartDate}
                                    onChange={(e) => setEditStartDate(e.target.value)}
                                    className="text-sm"
                                />
                            </div>

                            {/* Schedule Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4" />
                                    <Label className="text-sm font-medium">Schedule</Label>
                                </div>

                                {/* Days Selection */}
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Select Days</Label>
                                    <div className='flex flex-wrap gap-2'>
                                        {DAYS.map((day) => {
                                            const active = editSchedule.some((s) => s.day === day);
                                            return (
                                                <button
                                                    key={day}
                                                    type="button"
                                                    onClick={() => toggleScheduleDay(day)}
                                                    className={cn(
                                                        'px-3 py-1.5 rounded-full text-sm border-2 capitalize transition-all cursor-pointer',
                                                        active
                                                            ? 'border-[#6cc5e8] bg-primary/10 text-[#6cc5e8] font-medium'
                                                            : 'border-2 border-gray-300 bg-muted/30 text-gray-400 hover:border-gray-400'
                                                    )}
                                                >
                                                    {day.slice(0, 3)}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Time Slots */}
                                <div className="space-y-4">
                                    {editSchedule.map((scheduleDay) => (
                                        <div key={scheduleDay.day} className="pb-4 border-b last:border-b-0">
                                            {/* Day header */}
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="font-medium capitalize text-sm flex items-center gap-1.5">
                                                    <Clock className="h-3.5 w-3.5 text-primary" />{scheduleDay.day}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => addSchedulePeriod(scheduleDay.day)}
                                                    className="gap-1 text-xs h-7 px-2"
                                                >
                                                    <Plus className="h-3 w-3" /> Add Slot
                                                </Button>
                                            </div>

                                            {scheduleDay.period.map((p: any, pIdx: number) => (
                                                <div key={pIdx} className="mb-3 p-3 bg-muted/30 rounded-md">
                                                    {/* Quick time-group picker */}
                                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                                        {TIME_GROUPS.map((tg) => {
                                                            const active = p.startTime === tg.startTime && p.endTime === tg.endTime;
                                                            return (
                                                                <button
                                                                    key={tg.label}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        updateSchedulePeriod(scheduleDay.day, pIdx, 'startTime', tg.startTime);
                                                                        updateSchedulePeriod(scheduleDay.day, pIdx, 'endTime', tg.endTime);
                                                                    }}
                                                                    className={cn(
                                                                        'px-2.5 py-0.5 rounded text-xs border transition-all cursor-pointer',
                                                                        active
                                                                            ? 'border-primary bg-primary/10 text-primary font-medium'
                                                                            : 'border-border text-muted-foreground hover:border-primary/40'
                                                                    )}
                                                                >
                                                                    {tg.label}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Custom from/to */}
                                                    <div className="grid grid-cols-2 gap-3 items-end">
                                                        <div>
                                                            <Label className="text-xs text-muted-foreground">From</Label>
                                                            <Input
                                                                type="time"
                                                                value={p.startTime}
                                                                onChange={(e) => updateSchedulePeriod(scheduleDay.day, pIdx, 'startTime', e.target.value)}
                                                                className="mt-1 text-sm"
                                                            />
                                                        </div>
                                                        <div className="flex gap-2 items-end">
                                                            <div className="flex-1">
                                                                <Label className="text-xs text-muted-foreground">To</Label>
                                                                <Input
                                                                    type="time"
                                                                    value={p.endTime}
                                                                    onChange={(e) => updateSchedulePeriod(scheduleDay.day, pIdx, 'endTime', e.target.value)}
                                                                    className="mt-1 text-sm"
                                                                />
                                                            </div>
                                                            {scheduleDay.period.length > 1 && (
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => removeSchedulePeriod(scheduleDay.day, pIdx)}
                                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {editError && (
                                <p className="text-xs text-red-500 bg-red-50 p-2 rounded">{editError}</p>
                            )}
                        </div>

                        <DialogFooter className="gap-2 pt-1">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditDialogOpen(false)}
                                disabled={editingLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={async () => {
                                    if (!editingAgreementId) return;
                                    if (!editStartDate) {
                                        setEditError('Start date is required');
                                        return;
                                    }
                                    setEditingLoading(true);
                                    setEditError('');
                                    try {
                                        await dispatch(editAgreement({
                                            agreementId: editingAgreementId,
                                            startDate: inputValueToISO(editStartDate),
                                            schedule: editSchedule.length > 0 ? editSchedule : undefined
                                        })).unwrap();
                                        setEditDialogOpen(false);
                                        setEditingAgreementId(null);
                                        setEditStartDate('');
                                        setEditSchedule([]);
                                    } catch (err: any) {
                                        setEditError(err?.message || 'Failed to update agreement');
                                    } finally {
                                        setEditingLoading(false);
                                    }
                                }}
                                disabled={editingLoading || !editStartDate}
                                className={editingLoading ? 'opacity-60' : ''}
                            >
                                {editingLoading ? 'Updating...' : 'Update'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </PayPalScriptProvider>
        </>
    );
}