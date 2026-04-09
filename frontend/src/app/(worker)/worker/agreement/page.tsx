'use client';
import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { getAgreementById, getAgreementsByWorker, updateAgreementStatus } from '@/redux/slices/agreementsSlice';
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
                                    <div className='border-t pt-3 flex flex-row items-center justify-center'>
                                        <button className="md:h-6.5 h-6 lg:h-7 md:text-[11px] text-[11px] lg:text-[12px] bg-blue-500 text-white hover:bg-blue-600 px-2.5 flex items-center rounded-sm transition-colors cursor-pointer shadow-sm"
                                            onClick={() => {
                                                setSelectedAgreementId(agreement._id);
                                                setDetailsDialogOpen(true);
                                            }}>
                                            View Details
                                        </button>
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
                        <DialogHeader>
                            <DialogTitle>Terms & Conditions</DialogTitle>
                            <DialogDescription>
                                Please read the terms and conditions carefully before accepting.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="max-h-96 overflow-y-auto rounded-md border bg-muted/30 px-4 py-3 md:text-[13px] text-xs lg:text-sm text-gray-600 md:space-y-2.5 space-y-2 lg:space-y-3">

                            <p className="font-semibold text-foreground md:text-[15px] text-sm lg:text-base">
                                Service Agreement Terms
                            </p>

                            <p>
                                By accepting these terms, you agree to provide support services professionally
                                and according to this agreement.
                            </p>

                            {(paymentDue?.amountDue ?? 0) > 0 && !paymentCompleted && (
                                <div className="rounded-lg border-2 border-green-500 bg-green-50 p-4 space-y-3 shadow-sm">

                                    <div className="text-center space-y-1">

                                        <h3 className="lg:text-lg md:text-[17px] text-base font-bold text-foreground">
                                            Agreement Activation Fee
                                        </h3>

                                        <p className="text-muted-foreground">
                                            Payment is required to accept this agreement
                                        </p>

                                        <div className="md:text-2xl text-xl lg:text-3xl font-extrabold text-green-600">
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

                                        // style={{
                                        //     layout: "horizontal",
                                        //     height: 35,
                                        //     shape: "pill",
                                        //     color: "gold",
                                        //     label: "pay",
                                        //     tagline: false
                                        // }}
                                        style={{
                                            layout: "horizontal",   // ✅ smaller
                                            height: 38,             // ✅ smaller height
                                            shape: "rect",
                                            color: "blue",
                                            label: "pay",
                                            tagline: false          // ✅ removes extra text
                                        }}
                                    />
                                </div>
                            )}
                            {paymentCompleted && (
                                <div className="text-green-600 text-sm text-center font-medium">
                                    ✅ Payment completed. You can now accept terms.
                                </div>
                            )}
                            {/* IMPORTANT TERMS ONLY */}
                            <div className="space-y-2 text-[11px] md:text-xs lg:text-[13px] border-t pt-3">

                                <p className="font-medium text-foreground">
                                    Key Conditions:
                                </p>

                                <p>
                                    <span className="font-medium text-foreground">Payment:</span>{" "}
                                    A monthly subscription fee of <span className="text-[green] font-medium">$100</span> is required for each client.
                                </p>

                                <p>
                                    <span className="font-medium text-foreground">Confidentiality:</span>{" "}
                                    All client data must be kept strictly private.
                                </p>

                                <p>
                                    <span className="font-medium text-foreground">Conduct:</span>{" "}
                                    Maintain professional behavior at all times.
                                </p>

                                <p>
                                    <span className="font-medium text-foreground">Compliance:</span>{" "}
                                    Adhere to NDIS and safety regulations consistently.
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
            </PayPalScriptProvider>
        </>
    );
}