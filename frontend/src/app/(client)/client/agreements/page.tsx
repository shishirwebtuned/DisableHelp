'use client';
import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {  getAgreementsByClient ,updateAgreementStatus } from '@/redux/slices/agreementsSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
     Search,
    Download,
    Eye,
    Mail,
    Phone,
    Calendar,
    DollarSign,
    Briefcase,
    FileText,
    Clock,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import Pagination from '@/components/ui/pagination';
import Loading from '@/components/ui/loading';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function AdminAgreementsPage() {
    const dispatch = useAppDispatch();
    const { items: agreements, loading, total, totalPages, page: currentPageFromStore } = useAppSelector((state) => state.agreements);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'expired' | 'rejected'>('all');
    const [currentPage, setCurrentPage] = useState<number>(currentPageFromStore || 1);
    const pageSize = 10;

    useEffect(() => {
        dispatch(getAgreementsByClient({ page: currentPage, limit: pageSize, status: statusFilter }));
    }, [dispatch, currentPage, statusFilter]);

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'active': return 'default';
            case 'pending': return 'secondary';
            case 'expired': return 'destructive';
            case 'rejected': return 'destructive';
            default: return 'outline';
        }
    };
    // Filter agreements based on search term
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

    // // Calculate stats
    // const activeCount = agreements.filter(a => a.status === 'active').length;
    // const pendingCount = agreements.filter(a => a.status === 'pending').length;

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

                {/* Quick Stats */}
                {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Active Agreements</CardDescription>
                            <CardTitle className="text-2xl font-bold">{activeCount}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Pending Approval</CardDescription>
                            <CardTitle className="text-2xl font-bold text-amber-600 text-amber-700 dark:text-amber-400">{pendingCount}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total Agreements</CardDescription>
                            <CardTitle className="text-2xl font-bold text-blue-600 text-blue-700 dark:text-blue-400">{total}</CardTitle>
                        </CardHeader>
                    </Card>
                </div> */}

                {/* Search and Filters */}
                <div className="border-none ">
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
                            <Select value={statusFilter} onValueChange={(val) => {
                                const v = val as 'all' | 'pending' | 'active' | 'expired' | 'rejected';
                                setStatusFilter(v);
                                setCurrentPage(1);
                            }}>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredAgreements.length > 0 ? (
                        filteredAgreements.map((agreement) => (
                            <Card key={agreement._id} className="p-3">
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="flex items-center gap-2 text-sm leading-tight">
                                                {agreement.job?.title || 'No Job Title'}
                                            </CardTitle>
                                            <CardDescription className="mt-1 text-[11px]">
                                                ID: {agreement._id.slice(-12).toUpperCase()}
                                            </CardDescription>
                                        </div>
                                        <Badge variant={getStatusVariant(agreement.status)} className="capitalize text-xs px-2 py-0.5">
                                            {agreement.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm p-0">
                                    {/* Client Information */}
                                    <div className=" rounded-lg p-2 space-y-2">
                                        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Client Details</div>
                                        {typeof agreement.client === 'string' ? (
                                            <div className="text-sm text-muted-foreground">Client ID: <span className="font-medium">{agreement.client}</span></div>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">{agreement.client.firstName} {agreement.client.lastName}</span>
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
                                                        <span className="text-xs">DOB: {new Date(agreement.client.dateOfBirth).toLocaleDateString()}</span>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {/* Worker Information */}
                                    <div className=" rounded-lg p-3 space-y-2">
                                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Worker Details</div>
                                        {typeof agreement.worker === 'string' ? (
                                            <div className="text-sm text-muted-foreground">Worker ID: <span className="font-medium">{agreement.worker}</span></div>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">{agreement.worker.firstName} {agreement.worker.lastName}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Mail className="h-3.5 w-3.5" />
                                                    <span className="text-xs">{agreement.worker.email}</span>
                                                </div>
                                                {('phoneNumber' in agreement.worker) && agreement.worker.phoneNumber && (
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Phone className="h-3.5 w-3.5" />
                                                        <span className="text-xs">{(agreement.worker as any).phoneNumber}</span>
                                                    </div>
                                                )}
                                                {('dateOfBirth' in agreement.worker) && (agreement.worker as any).dateOfBirth && (
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        <span className="text-xs">DOB: {new Date((agreement.worker as any).dateOfBirth).toLocaleDateString()}</span>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {/* Agreement Details Grid */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <DollarSign className="h-3.5 w-3.5" />
                                                Hourly Rate
                                            </div>
                                            <div className="text-sm font-bold text-green-600 dark:text-green-400">${agreement.hourlyRate}/hr</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                Start Date
                                            </div>
                                            <div className="text-sm font-medium">{new Date(agreement.startDate).toLocaleDateString()}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <FileText className="h-3 w-3" />
                                                Application
                                            </div>
                                            <div className="text-xs font-mono text-muted-foreground">{agreement.application.slice(-8).toUpperCase()}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                Created
                                            </div>
                                            <div className="text-xs font-medium">{new Date(agreement.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    </div>

                                    {/* Updated Date */}
                                    <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-2 border-t">
                                        <Clock className="h-3 w-3" />
                                        Last updated: {new Date(agreement.updatedAt).toLocaleDateString()} {new Date(agreement.updatedAt).toLocaleTimeString()}
                                    </div>

                                    {/* Terms Accepted & Actions */}
                                    <div className="flex items-center justify-between pt-2 border-t">
                                        <div className="flex items-center gap-2" >
                                            <Checkbox checked={agreement.termsAcceptedByWorker===true} disabled={true} />
                                            <span className="text-xs font-medium">Terms Accepted</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                                                <Download className="h-3 w-3 mr-1" />
                                                Download
                                            </Button>
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
                    onPageChange={(page) => {
                        setCurrentPage(page);
                    }}
                />
            </div>
        </>
    );
}
