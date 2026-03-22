'use client';
import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { getAgreementsByWorker, updateAgreementStatus } from '@/redux/slices/agreementsSlice';
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

export default function AdminAgreementsPage() {
    const dispatch = useAppDispatch();
    const { items: agreements, loading, total, totalPages, page: currentPageFromStore } = useAppSelector((state) => state.agreements);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'expired' | 'rejected'>('all');
    const [currentPage, setCurrentPage] = useState<number>(currentPageFromStore || 1);

    // Terms dialog state
    const [termsDialogOpen, setTermsDialogOpen] = useState(false);
    const [selectedTermsAgreementId, setSelectedTermsAgreementId] = useState<string | null>(null);
    const [acceptingTerms, setAcceptingTerms] = useState(false);
    const [viewOnlyTerms, setViewOnlyTerms] = useState(false);

    const pageSize = 10;

    useEffect(() => {
        dispatch(getAgreementsByWorker({ page: currentPage, limit: pageSize, status: statusFilter }));
    }, [dispatch, currentPage, statusFilter]);



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

    const handleAcceptTerms = async () => {
        if (!selectedTermsAgreementId) return;
        setAcceptingTerms(true);
        await dispatch(updateAgreementStatus({ id: selectedTermsAgreementId, status: 'accepted' }));
        setAcceptingTerms(false);
        setTermsDialogOpen(false);
        setSelectedTermsAgreementId(null);
    };

    const statusStyles: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
        active: 'bg-blue-100 text-blue-700 border border-blue-200',
        completed: 'bg-green-100 text-green-700 border border-green-200',
        terminated: 'bg-red-100 text-red-700 border border-red-200',
    };



    return (
        <>
            {loading && <Loading />}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Service Agreements</h1>
                        <p className="text-muted-foreground">Monitor and manage all service agreements on the platform</p>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="border-none">
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
                            <Select
                                value={statusFilter}
                                onValueChange={(val) => {
                                    const v = val as 'all' | 'pending' | 'active' | 'expired' | 'rejected';
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
                            <Card key={agreement._id}>
                                <CardHeader className="pb-1">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="flex items-center gap-2 text-lg">
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

                                <CardContent className="space-y-4">
                                    {/* Client Information */}
                                    <div className="rounded-lg px-0 space-y-2">
                                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                            Client Details
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">
                                                {agreement.client.firstName} {agreement.client.lastName}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Mail className="h-3.5 w-3.5" />
                                            <span className="text-xs">{agreement.client.email}</span>
                                        </div>
                                        {agreement.client.phoneNumber && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Phone className="h-3.5 w-3.5" />
                                                <span className="text-xs">{agreement.client.phoneNumber}</span>
                                            </div>
                                        )}
                                        {agreement.client.dateOfBirth && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="h-3.5 w-3.5" />
                                                <span className="text-xs">
                                                    DOB: {new Date(agreement.client.dateOfBirth).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Agreement Details Grid */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <DollarSign className="h-3.5 w-3.5" />
                                                Hourly Rate
                                            </div>
                                            <div className="text-sm font-bold text-green-600 dark:text-green-400">
                                                ${agreement.hourlyRate}/hr
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Calendar className="h-3.5 w-3.5" />
                                                Start Date
                                            </div>
                                            <div className="text-sm font-medium">
                                                {new Date(agreement.startDate).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <FileText className="h-3.5 w-3.5" />
                                                Application
                                            </div>
                                            <div className="text-xs font-mono text-muted-foreground">
                                                {agreement.application.slice(-8).toUpperCase()}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Clock className="h-3.5 w-3.5" />
                                                Created
                                            </div>
                                            <div className="text-xs font-medium">
                                                {new Date(agreement.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Updated Date */}
                                    <div className="text-xs text-muted-foreground flex items-center gap-1.5 pt-2 border-t">
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
                                                    className="h-7 md:text-[11px] text-[9px] lg:text-[13px] bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground border px-2.5 flex items-center rounded-sm transition-colors cursor-pointer shadow-sm"
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

                                                        setTermsDialogOpen(true);

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

            {/* Terms & Conditions Dialog */}
            <Dialog open={termsDialogOpen} onOpenChange={setTermsDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Terms & Conditions</DialogTitle>
                        <DialogDescription>
                            Please read the terms and conditions carefully before accepting.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="max-h-64 overflow-y-auto rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground space-y-3">
                        <p className="font-semibold text-foreground">Service Agreement Terms</p>
                        <p>
                            By accepting these terms, you agree to provide support services as outlined
                            in this agreement in a professional and timely manner.
                        </p>
                        <p>
                            <span className="font-medium text-foreground">1. Confidentiality.</span>{' '}
                            You agree to keep all client information strictly confidential and not
                            disclose any personal details to third parties.
                        </p>
                        <p>
                            <span className="font-medium text-foreground">2. Code of Conduct.</span>{' '}
                            You agree to treat all clients with respect, dignity, and compassion at all
                            times during service delivery.
                        </p>
                        <p>
                            <span className="font-medium text-foreground">3. Compliance.</span>{' '}
                            You agree to comply with all relevant legislation including the NDIS Code of
                            Conduct, Work Health and Safety laws, and any applicable state regulations.
                        </p>
                        <p>
                            <span className="font-medium text-foreground">4. Invoicing.</span>{' '}
                            Invoices must be submitted accurately and within the agreed timeframe.
                            Falsification of hours or services rendered may result in immediate
                            termination of this agreement.
                        </p>
                        <p>
                            <span className="font-medium text-foreground">5. Termination.</span>{' '}
                            Either party may terminate this agreement with reasonable notice as specified
                            in the service schedule.
                        </p>
                        <p>
                            <span className="font-medium text-foreground">6. Insurance.</span>{' '}
                            You confirm that you hold valid and current professional indemnity and public
                            liability insurance as required.
                        </p>
                    </div>

                    <DialogFooter className="gap-2 pt-1">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setTermsDialogOpen(false)}
                            disabled={acceptingTerms}
                        >
                            {viewOnlyTerms ? 'Close' : 'Cancel'}
                        </Button>
                        {!viewOnlyTerms && (
                            <Button
                                size="sm"
                                onClick={handleAcceptTerms}
                                disabled={acceptingTerms}
                            >
                                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                                {acceptingTerms ? 'Accepting...' : 'Accept Terms'}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}