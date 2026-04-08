'use client';
import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { getAgreementById, getAgreementsByClient, terminateAgreement } from '@/redux/slices/agreementsSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Search,
    Mail,
    Phone,
    Calendar,
    DollarSign,
    Briefcase,
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Eye,
} from 'lucide-react';
import Pagination from '@/components/ui/pagination';
import Loading from '@/components/ui/loading';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function ClientAgreementsPage() {
    const dispatch = useAppDispatch();
    const { items: agreements, loading, totalPages, page: currentPageFromStore } = useAppSelector((state) => state.agreements);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'terminated' | 'completed'>('all');
    const [currentPage, setCurrentPage] = useState<number>(currentPageFromStore || 1);

    // Terminate dialog
    const [terminateDialogOpen, setTerminateDialogOpen] = useState(false);
    const [selectedAgreementId, setSelectedAgreementId] = useState<string | null>(null);
    const [terminateReason, setTerminateReason] = useState('');
    const [terminateReasonError, setTerminateReasonError] = useState(false);
    const [terminating, setTerminating] = useState(false);
    const [termsDialogOpen, setTermsDialogOpen] = useState(false);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const pageSize = 10;

    const agreement = agreements.find(
        (a) => a._id === selectedAgreementId
    );

    useEffect(() => {
        dispatch(getAgreementsByClient({ page: currentPage, limit: pageSize, status: statusFilter }));
    }, [dispatch, currentPage, statusFilter]);

    const filteredAgreements = agreements.filter((agreement) => {
        const searchLower = searchTerm.toLowerCase();
        const workerName = typeof agreement.worker === 'string'
            ? ''
            : `${agreement.worker.firstName} ${agreement.worker.lastName}`.toLowerCase();
        const clientName = `${agreement.client.firstName} ${agreement.client.lastName}`.toLowerCase();
        const jobTitle = agreement.job?.title?.toLowerCase() || '';
        return (
            agreement._id.toLowerCase().includes(searchLower) ||
            workerName.includes(searchLower) ||
            clientName.includes(searchLower) ||
            jobTitle.includes(searchLower)
        );
    });

    useEffect(() => {
        if (detailsDialogOpen && selectedAgreementId) {
            dispatch(getAgreementById(selectedAgreementId));
        }
    }, [detailsDialogOpen, selectedAgreementId, dispatch]);

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

                {/* Header */}
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Service Agreements</h1>
                    <p className="text-muted-foreground text-sm">
                        View and manage your service agreements.
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder="Search by agreement ID, worker, or client..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select
                        value={statusFilter}
                        onValueChange={(val) => {
                            setStatusFilter(val as typeof statusFilter);
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
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="terminated">Terminated</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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

                                <CardContent className="space-y-2.5 p-0">

                                    {/* Client Info */}
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                            Client Details
                                        </p>
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

                                    {/* Worker Info */}
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

                                    {/* Agreement Details */}
                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                                        <div className="space-y-0.5">
                                            <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                <DollarSign className="h-3 w-3" /> Hourly Rate
                                            </p>
                                            <p className="text-sm font-bold text-green-600">
                                                ${agreement.hourlyRate}/hr
                                            </p>
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                <Calendar className="h-3 w-3" /> Start Date
                                            </p>
                                            <p className="text-xs font-medium">
                                                {new Date(agreement.startDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                <FileText className="h-3 w-3" /> Application
                                            </p>
                                            <p className="text-xs font-mono text-muted-foreground">
                                                {agreement.application.slice(-8).toUpperCase()}
                                            </p>
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                <Clock className="h-3 w-3" /> Created
                                            </p>
                                            <p className="text-xs font-medium">
                                                {new Date(agreement.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Last updated */}
                                    <div className="text-[10px] text-muted-foreground flex items-center gap-1 pt-1 border-t">
                                        <Clock className="h-3 w-3" />
                                        Last updated: {new Date(agreement.updatedAt).toLocaleDateString()} at {new Date(agreement.updatedAt).toLocaleTimeString()}
                                    </div>

                                    {/* Terms + Terminate */}
                                    <div className="flex items-center justify-between pt-3 border-t">
                                        <div>
                                            {agreement.termsAcceptedByWorker ? (
                                                <Badge className="bg-green-100 text-green-700 border border-green-200 text-xs font-medium">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Terms Accepted
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-red-100 text-red-700 border border-red-200 text-xs font-medium">
                                                    <XCircle className="h-3 w-3 mr-1" />
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
                                    </div>
                                    <div className='border-t pt-3 flex flex-row-reverse items-center justify-between'>
                                        <button className="md:h-6.5 h-6 lg:h-7 md:text-[11px] text-[11px] lg:text-[12px] bg-blue-500 text-white hover:bg-blue-600 px-2.5 flex items-center rounded-sm transition-colors cursor-pointer shadow-sm"
                                            onClick={() => {
                                                setSelectedAgreementId(agreement._id);
                                                setDetailsDialogOpen(true);
                                            }}>
                                            View Details
                                        </button>
                                        <button
                                            className="md:h-6.5 h-6 lg:h-7 md:text-[11px] text-[11px] lg:text-[12px] bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground border px-2.5 flex items-center rounded-sm transition-colors cursor-pointer shadow-sm"
                                            onClick={() => {

                                                setTermsDialogOpen(true);
                                            }}
                                        >
                                            <Eye className="w-3 h-3 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4 mr-1.5" />
                                            View Terms

                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full text-center text-muted-foreground py-12">
                            <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p className="text-sm">No agreements found matching your criteria.</p>
                        </div>
                    )}
                </div>

                <Pagination
                    totalPages={totalPages || 1}
                    currentPage={currentPage}
                    onPageChange={(page) => setCurrentPage(page)}
                />
            </div>

            {/* Terminate Dialog */}
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

            <Dialog open={termsDialogOpen} onOpenChange={setTermsDialogOpen}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Terms & Conditions</DialogTitle>
                        <DialogDescription>
                            Please read the terms and conditions carefully before accepting.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="max-h-96 overflow-y-auto rounded-md border bg-muted/30 px-4 py-3 md:text-[13px] text-xs lg:text-sm text-muted-foreground md:space-y-2.5 space-y-2 lg:space-y-3">

                        <p className="font-semibold text-foreground md:text-[15px] text-sm lg:text-base">
                            Service Agreement Terms
                        </p>

                        <p>
                            By accepting these terms, worker agrees to provide support services professionally
                            and according to this agreement.
                        </p>



                        <div className="space-y-2 text-xs border-t pt-3">

                            <p className="font-medium text-foreground">
                                Key Conditions:
                            </p>

                            <p>
                                <span className="font-medium text-foreground">Confidentiality:</span>
                                {" "}Client data must remain private.
                            </p>

                            <p>
                                <span className="font-medium text-foreground">Conduct:</span>
                                {" "}Professional behaviour is required.
                            </p>

                            <p>
                                <span className="font-medium text-foreground">Compliance:</span>
                                {" "}NDIS and safety regulations must be followed.
                            </p>



                        </div>

                    </div>
                    <DialogFooter className="gap-2 pt-1">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setTermsDialogOpen(false)}
                        >
                            Close
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