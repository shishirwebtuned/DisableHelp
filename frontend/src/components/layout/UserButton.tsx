'use client';

import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
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
import { User as UserIcon, Settings, CreditCard, LogOut } from 'lucide-react';

interface UserButtonProps {
    variant?: 'default' | 'sidebar' | 'minimal';
    showName?: boolean;
}

export function UserButton({ variant = 'default', showName = false }: UserButtonProps) {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { user } = useSelector((state: RootState) => state.auth);

    const handleLogout = async () => {
        await dispatch(logout());
        router.push('/login');
    };

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
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer group">
                    <Avatar className={`${avatarSize} border shadow-sm ring-offset-2 ring-transparent transition-all group-hover:ring-2 group-hover:ring-blue-500/20`}>
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-blue-600 text-white font-bold text-sm">
                            {user.name?.[0]?.toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    {showName && (
                        <div className="hidden lg:block overflow-hidden">
                            <p className="text-sm font-medium truncate">{user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                    )}
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mt-2 z-[100]" align="end" forceMount>
                <DropdownMenuLabel className="font-normal p-2">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold leading-none">{user.name}</p>
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
                    <DropdownMenuItem className="cursor-pointer">
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Billing</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`/${user.role}/settings`)}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive font-bold" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
