'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { getmee } from '@/redux/slices/authSlice';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRole?: 'admin' | 'worker' | 'client';
}

export default function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
    const { user, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const pathname = usePathname();

    const [hasToken, setHasToken] = useState<boolean | null>(null);

    useEffect(() => {
        // run only on client
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        setHasToken(!!token);

        if (!token) {
            router.push('/login');
            return;
        }

        // Only fetch if we don't have a user, aren't already loading, haven't just failed, and don't have an error
        if (!user && !isLoading && !isAuthenticated && !error) {
            dispatch(getmee());
        }
    }, [user, isLoading, isAuthenticated, error, dispatch, router]);

    useEffect(() => {
        if (error) {
            // If getmee fails, the token is likely invalid. Clear it and go to login.
            localStorage.removeItem('token');
            router.push('/login');
            return;
        }

        if (!isLoading && user) {
            if (allowedRole && user.role !== allowedRole) {
                // Redirect unauthorized users to their correct dashboard
                router.push(`/${user.role}`);
            }
        }
    }, [user, isLoading, allowedRole, router, error]);

    // Avoid rendering until we know whether a token exists on the client to prevent
    // hydration mismatches between server and client renders
    if (hasToken === null) return null;

    if (isLoading || (!user && hasToken)) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Authenticating...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return <>{children}</>;
}
