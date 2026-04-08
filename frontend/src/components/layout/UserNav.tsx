'use client';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { logout, getmee } from '@/redux/slices/authSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useRouter } from 'next/navigation';
import { User as UserIcon, Settings, CreditCard, LogOut, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose
} from '@/components/ui/dialog';

export function UserNav() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { user, isLoading, isAuthenticated, error } = useAppSelector((state) => state.auth);


    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

    useEffect(() => {
        if (!user && !isLoading && !isAuthenticated && !error) {
            dispatch(getmee());
        }
    }, [dispatch, user, isLoading, isAuthenticated, error]);

    if (!user) return null;

    const handleLogout = async () => {
        setLogoutDialogOpen(false);
        await dispatch(logout());
        router.push('/login');
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full flex items-center justify-center p-0 hover:bg-muted transition-colors">
                        <Avatar className="h-9 w-9 border shadow-sm ring-offset-2 ring-transparent transition-all hover:ring-2 hover:ring-blue-500/20">
                            <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                            <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">
                                {(user.firstName?.[0] || user.email?.[0] || 'U')?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mt-2 z-100" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal p-2">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-semibold leading-none">{user.firstName} {user.lastName}</p>
                            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="text-[10px] px-2 py-0 h-4 uppercase tracking-tighter">
                                    {user.role}
                                </Badge>
                                {user.isVerified && (
                                    <Badge variant="default" className="text-[10px] px-2 py-0 h-4 bg-green-500 hover:bg-green-600 border-none">
                                        Verified
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`/${user.role}/profile`)}>
                            <UserIcon className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </DropdownMenuItem>
                        {/* <DropdownMenuItem className="cursor-pointer">
                            <CreditCard className="mr-2 h-4 w-4" />
                            <span>Billing</span>
                        </DropdownMenuItem> */}
                        <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`/${user.role}/settings`)}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive font-bold" onClick={() => setLogoutDialogOpen(true)}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you sure you want to logout?</DialogTitle>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setLogoutDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleLogout}>
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
