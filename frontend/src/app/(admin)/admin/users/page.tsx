'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchUsers } from '@/redux/slices/usersSlice';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Search,
    MoreHorizontal,
    ShieldCheck,
    UserX,
    Mail,
    CheckCircle2,
    Clock,
    UserCheck,
    AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import Loading from '@/components/ui/loading';
import Pagination from '@/components/ui/pagination';
import { useRouter } from 'next/navigation';

type UserRole = 'worker' | 'client' | 'admin' | 'unknown';

const roleStyles: Record<UserRole, string> = {
    worker: "bg-blue-100 text-blue-700 border-blue-300",
    client: "bg-purple-100 text-purple-700 border-purple-300",
    admin: "bg-red-100 text-red-700 border-red-300",
    unknown: "bg-muted/50",
};

export default function AdminUsersPage() {
    const dispatch = useAppDispatch();
    const { items: users, loading, pagination } = useAppSelector((state) => state.users);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [workerTypeFilter, setWorkerTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const router = useRouter();
    // Reset to page 1 whenever filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, roleFilter, statusFilter, workerTypeFilter]);

    // Fetch users from server whenever filters or page change (debounced)
    useEffect(() => {
        const params: any = { page: currentPage, limit: 10 };
        if (searchTerm) params.search = searchTerm;
        if (roleFilter && roleFilter !== 'all') params.role = roleFilter;
        if (statusFilter && statusFilter !== 'all') params.approved = statusFilter;
        // Add worker type filter for NDIS Provider/Individual Worker
        if (roleFilter === 'worker' && workerTypeFilter !== 'all') {
            params.isNdisProvider = workerTypeFilter === 'ndis-provider';
        }

        const t = setTimeout(() => {
            dispatch(fetchUsers(params));
        }, 300);

        return () => clearTimeout(t);
    }, [dispatch, searchTerm, roleFilter, statusFilter, workerTypeFilter, currentPage]);



    // Normalize incoming user objects so the UI can handle different API shapes
    const normalizedUsers = users.map((u: any) => {
        const firstName = u.firstName ?? u.name?.split?.(' ')?.[0] ?? '';
        const lastName = u.lastName ?? (u.name ? u.name.split(' ').slice(1).join(' ') : '');
        const fullName = ((u.name) ? u.name : `${firstName} ${lastName}`).trim();

        // createdAt may be unix seconds or milliseconds or string
        let joinedDate = u.createdAt ?? u.createdAt ?? null;
        if (!joinedDate && u.createdAt) {
            const n = Number(u.createdAt);
            if (!Number.isNaN(n)) {
                joinedDate = new Date(n < 1e12 ? n * 1000 : n).toISOString();
            }
        }

        return {
            id: u.id ?? u._id,
            name: fullName || 'Unknown',
            firstName,
            lastName,
            email: u.email ?? '',
            role: (u.role ?? 'unknown') as UserRole,
            approved: typeof u.approved !== 'undefined' ? u.approved : (u.isVerified ?? false),
            isVerified: typeof u.isVerified !== 'undefined' ? u.isVerified : (u.approved ?? false),
            joinedDate: u.createdAt ?? new Date().toISOString(),
            avatar: u.avatar ?? null,
            raw: u,
            isNdisProvider: typeof u.isNdisProvider !== 'undefined' ? u.isNdisProvider : false,
        };
    });


    // When filtering is done server-side, normalizedUsers already reflects active filters
    // Apply frontend filter for worker type if needed (for extra safety)
    let displayedUsers = normalizedUsers;
    if (roleFilter === 'worker' && workerTypeFilter !== 'all') {
        displayedUsers = displayedUsers.filter(u =>
            workerTypeFilter === 'ndis-provider' ? u.isNdisProvider : !u.isNdisProvider
        );
    }



    const getVerificationIcon = (status: boolean) => {
        switch (status) {
            case true: return <ShieldCheck className="h-3 w-3 text-green-600 mr-1" />;
            case false: return <Clock className="h-3 w-3 text-amber-600 mr-1" />;
            default: return null;
        }
    };


    return (
        <div className="space-y-6">

            {
                loading && <Loading />
            }
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground">Manage and monitor all platform users</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-blue-600 ">Total Users</CardDescription>
                        <CardTitle className="text-2xl font-bold text-blue-600 ">{pagination?.total ?? users.length}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900/20">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-green-600">Workers</CardDescription>
                        <CardTitle className="text-2xl font-bold text-green-600">
                            {users.filter(u => u.role === 'worker').length}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-purple-50/50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-900/20">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-purple-600">Clients</CardDescription>
                        <CardTitle className="text-2xl font-bold text-purple-600 ">
                            {users.filter(u => u.role === 'client').length}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/20">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-amber-600 ">Pending Review</CardDescription>
                        <CardTitle className="text-2xl font-bold text-amber-600 ">
                            {users.filter(u => u.approved === false).length}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Filters and Search */}
            <div className="border-none ">
                <div className="pt-3">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search by name or email..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={roleFilter} onValueChange={value => {
                                setRoleFilter(value);
                                setWorkerTypeFilter('all'); // Reset worker type filter when role changes
                            }}>
                                <SelectTrigger className="w-32.5">
                                    <SelectValue placeholder="Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    <SelectItem value="worker">Workers</SelectItem>
                                    <SelectItem value="client">Clients</SelectItem>
                                </SelectContent>
                            </Select>
                            {/* Show worker type filter only if role is worker */}
                            {roleFilter === 'worker' && (
                                <Select value={workerTypeFilter} onValueChange={setWorkerTypeFilter}>
                                    <SelectTrigger className="w-42.5">
                                        <SelectValue placeholder="Worker Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Workers</SelectItem>
                                        <SelectItem value="ndis-provider">Ndis Provider</SelectItem>
                                        <SelectItem value="individual-worker">Individual Worker</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-32.5">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="true">Approved</SelectItem>
                                    <SelectItem value="false">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead></TableHead>
                            <TableHead>Contact Info</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Approved</TableHead>
                            <TableHead>Verified (Email)</TableHead>
                            <TableHead>Type</TableHead>

                            <TableHead>Joined Date</TableHead>
                            <TableCell> View Details</TableCell>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {displayedUsers.length > 0 ? (
                            displayedUsers.map((user: any, index) => (
                                <TableRow key={user.id} className="group">
                                    <TableCell>{((currentPage - 1) * (pagination?.limit ?? 10)) + index + 1}</TableCell>

                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">{user.name}</span>
                                            <span className="text-xs text-muted-foreground">{user.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={`capitalize ${roleStyles[user.role as UserRole] || "bg-muted/50"}`}
                                        >
                                            {user.role}
                                        </Badge>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center text-xs font-medium">
                                            {getVerificationIcon(user.approved)}
                                            <span className="capitalize">{user.approved ? 'Approved' : 'Pending'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center text-xs font-medium">
                                            <span className="capitalize">{user.isVerified ? 'Verified' : 'Not Verified'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {user.role === "worker" ? (
                                            <Badge variant="outline">
                                                {user.isNdisProvider ? "NDIS Provider" : "Individual Worker"}
                                            </Badge>
                                        ) : ("—")}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {new Date(user.joinedDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/admin/profile/${user.id}`}>
                                            <Button variant="link" className=" cursor-pointer text-xs font-medium">
                                                View Details
                                            </Button>
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <Link href={`/admin/users/${user.id}`}>
                                                    <DropdownMenuItem className="cursor-pointer">

                                                        <UserCheck className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                </Link>
                                                {/* <DropdownMenuItem className="cursor-pointer">
                                                    <Mail className="mr-2 h-4 w-4" />
                                                    Send Email
                                                </DropdownMenuItem> */}
                                                <DropdownMenuSeparator />
                                                {user.approved ? (
                                                    <DropdownMenuItem
                                                        className="text-destructive cursor-pointer"
                                                        onClick={() => { router.push(`/admin/users/${user.id}#scroll-bottom`) }}
                                                    >
                                                        <UserX className="mr-2 h-4 w-4" />
                                                        Remove Approval (suspend)
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem
                                                        className="text-green-600 cursor-pointer"
                                                        onClick={() => { router.push(`/admin/users/${user.id}#scroll-bottom`) }}
                                                    >
                                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                                        Approve User
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    No users found matching your filters.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <Pagination
                currentPage={currentPage}
                totalPages={pagination?.totalPages ?? 1}
                onPageChange={(page) => setCurrentPage(page)}
            />


        </div>
    );
}
