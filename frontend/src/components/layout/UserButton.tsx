'use client';

import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { logout } from '@/redux/slices/authSlice';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { User as UserIcon, Settings, CreditCard, LogOut, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { getmee } from '@/redux/slices/authSlice';
import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '../ui/button';

interface UserButtonProps {
    variant?: 'default' | 'sidebar' | 'minimal';
    showName?: boolean;
}

export function UserButton({ variant = 'default', showName = false }: UserButtonProps) {
    const dispatch = useAppDispatch();


    const router = useRouter();
    const { user, mee, isLoading, isAuthenticated, error } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (!user && !isLoading && !isAuthenticated && !error) {
            dispatch(getmee());
        }
    }, [dispatch, user, isLoading, isAuthenticated, error]);




    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

    const handleLogout = async () => {
        setLogoutDialogOpen(false);
        await dispatch(logout());
        router.push('/login');
    };

    const { theme, setTheme, resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    // If no user, show a placeholder
    if (!user) {
        const avatarSize = variant === 'minimal' ? 'h-8 w-8' : variant === 'sidebar' ? 'h-10 w-10' : 'h-9 w-9';
        return (
            <div className="flex items-center gap-2">
                <Avatar className={`${avatarSize} border shadow-sm`}>
                    <AvatarFallback className="bg-slate-300 text-slate-600">
                        ?
                    </AvatarFallback>
                </Avatar>
                {showName && (
                    <div className="hidden lg:block overflow-hidden">
                        <p className="text-sm font-medium truncate">Guest</p>
                        <p className="text-xs text-muted-foreground truncate">Not logged in</p>
                    </div>
                )}
            </div>
        );
    }

    const avatarSize = variant === 'minimal' ? 'h-8 w-8' : variant === 'sidebar' ? 'h-10 w-10' : 'h-9 w-9';

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-2 cursor-pointer group">
                        <Avatar className={`${avatarSize} border shadow-sm ring-offset-2 ring-transparent transition-all group-hover:ring-2 group-hover:ring-[#8ac6dd]/20`}>
                            <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                            <AvatarFallback className="bg-[#8ac6dd] text-[#042a2d] font-bold text-sm">
                                {(user.firstName?.[0] || user.email?.[0] || 'U')?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        {showName && (
                            <div className="hidden lg:block overflow-hidden">
                                <p className="text-sm capitalize font-medium truncate">{user.firstName} {user.lastName}</p>
                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                        )}
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mt-2 z-100" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal p-2">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm  capitalize font-semibold leading-none">{user.firstName} {user.lastName}</p>
                            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="text-[10px] px-2 py-0 h-4 uppercase tracking-tighter">
                                    {user.role === 'worker' ?
                                        (user.isNdisProvider ?
                                            'Ndis Provider' : 'Individual Worker'
                                        )
                                        : user.role}

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
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader className="space-y-2">
                        <DialogTitle className="text-lg font-semibold">
                            Confirm Logout
                        </DialogTitle>
                        <p className="text-sm text-muted-foreground">
                            Are you sure you want to logout? You will need to login again to access your account.
                        </p>
                    </DialogHeader>

                    <DialogFooter className="gap-2 sm:justify-end mt-2">
                        <button
                            className='bg-muted-foreground/40 text-gray-900 text-[13px] md:text-sm lg:text-[15px] font-medium rounded-md px-3 md:px-4 py-1.5 cursor-pointer'
                            onClick={() => setLogoutDialogOpen(false)}
                        >
                            Cancel
                        </button>

                        <button
                            className='bg-red-500 text-white text-[13px] md:text-sm lg:text-[15px] font-medium rounded-md px-3 md:px-4 py-1.5 cursor-pointer' onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
