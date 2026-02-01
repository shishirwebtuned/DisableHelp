'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchUsers, updateUserStatus } from '@/redux/slices/usersSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    Users,
    Search,
    MoreHorizontal,
    UserPlus,
    Filter,
    ShieldCheck,
    UserX,
    Mail,
    Phone,
    CheckCircle2,
    Clock,
    UserCheck,
    AlertTriangle
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function AdminUsersPage() {
    const dispatch = useAppDispatch();
    const { items: users, loading } = useAppSelector((state) => state.users);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        dispatch(fetchUsers());
    }, [dispatch]);

    const handleUpdateStatus = async (userId: string, newStatus: 'active' | 'suspended') => {
        await dispatch(updateUserStatus({ userId, status: newStatus }));
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'active': return 'default';
            case 'pending': return 'secondary';
            case 'suspended': return 'destructive';
            case 'inactive': return 'outline';
            default: return 'outline';
        }
    };

    const getVerificationIcon = (status: string) => {
        switch (status) {
            case 'verified': return <ShieldCheck className="h-3 w-3 text-green-600 mr-1" />;
            case 'pending': return <Clock className="h-3 w-3 text-amber-600 mr-1" />;
            case 'under_review': return <AlertTriangle className="h-3 w-3 text-blue-600 mr-1" />;
            default: return null;
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground">Manage and monitor all platform users</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add New User
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-blue-600 dark:text-blue-400">Total Users</CardDescription>
                        <CardTitle className="text-2xl font-bold text-blue-700 dark:text-blue-300">{users.length}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900/20">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-green-600 dark:text-green-400">Workers</CardDescription>
                        <CardTitle className="text-2xl font-bold text-green-700 dark:text-green-300">
                            {users.filter(u => u.role === 'worker').length}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-purple-50/50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-900/20">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-purple-600 dark:text-purple-400">Clients</CardDescription>
                        <CardTitle className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                            {users.filter(u => u.role === 'client').length}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/20">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-amber-600 dark:text-amber-400">Pending Review</CardDescription>
                        <CardTitle className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                            {users.filter(u => u.verification === 'under_review').length}
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
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    <SelectItem value="worker">Workers</SelectItem>
                                    <SelectItem value="client">Clients</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="icon">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">User</TableHead>
                            <TableHead>Contact Info</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Verification</TableHead>
                            <TableHead>Joined Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id} className="group">
                                    <TableCell>
                                        <Avatar className="h-9 w-9 border">
                                            <AvatarImage src={user.avatar} alt={user.name} />
                                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">{user.name}</span>
                                            <span className="text-xs text-muted-foreground">{user.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize bg-muted/50">
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(user.status)} className="capitalize">
                                            {user.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center text-xs font-medium">
                                            {getVerificationIcon(user.verification)}
                                            <span className="capitalize">{user.verification.replace('_', ' ')}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {new Date(user.joinedDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-[160px]">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem className="cursor-pointer">
                                                    <UserCheck className="mr-2 h-4 w-4" />
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="cursor-pointer">
                                                    <Mail className="mr-2 h-4 w-4" />
                                                    Send Email
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {user.status === 'active' ? (
                                                    <DropdownMenuItem 
                                                        className="text-destructive cursor-pointer"
                                                        onClick={() => handleUpdateStatus(user.id, 'suspended')}
                                                    >
                                                        <UserX className="mr-2 h-4 w-4" />
                                                        Suspend User
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem 
                                                        className="text-green-600 cursor-pointer"
                                                        onClick={() => handleUpdateStatus(user.id, 'active')}
                                                    >
                                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                                        Activate User
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
            </Card>
        </div>
    );
}
