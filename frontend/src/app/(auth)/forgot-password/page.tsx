'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail } from 'lucide-react';
import { forgotPassword } from "@/redux/slices/authSlice"
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';

export default function ForgotPasswordPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const { isLoading, error, forgotMessage } = useSelector((state: RootState) => state.auth);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const resultAction = await dispatch(forgotPassword(email));
        if (forgotPassword.fulfilled.match(resultAction)) {
            // navigate to verify-email page with email in query
            router.push(`/verify-email?email=${encodeURIComponent(email)}&type=reset`);
        }
    };

    return (

        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4">
            <Card className="w-full max-w-md">

                <CardHeader>
                    <Link href="/login">
                        <Button variant="ghost" size="sm" className="mb-4 cursor-pointer">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Login
                        </Button>
                    </Link>
                    <CardTitle className="text-2xl">Forgot Password?</CardTitle>
                    <CardDescription>
                        Enter your email address and we'll send you instructions to reset your password
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Inline, accessible messages for error/success */}
                    {error && (
                        <div
                            role="alert"
                            aria-live="assertive"
                            className="mb-4 w-full rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive"
                        >
                            {error}
                        </div>
                    )}

                    {forgotMessage && (
                        <div
                            role="status"
                            aria-live="polite"
                            className="mb-4 w-full rounded-md border border-green-300 bg-green-50 px-4 py-2 text-sm text-green-800"
                        >
                            {forgotMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-6">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your.email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading || !email}
                        >
                            {isLoading ? 'Sending...' : 'Send Reset Link'}
                        </Button>

                        <div className="text-center text-sm text-muted-foreground">
                            Remember your password?{' '}
                            <Link href="/login" className="text-primary hover:underline font-medium">
                                Sign in
                            </Link>
                        </div>
                    </form>


                </CardContent>
            </Card>
        </div>
    );
}
