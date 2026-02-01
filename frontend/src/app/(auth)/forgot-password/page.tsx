'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsLoading(false);
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <CardTitle className="text-2xl">Check Your Email</CardTitle>
                        <CardDescription>
                            We've sent password reset instructions to <strong>{email}</strong>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground">
                            <p className="mb-2">📧 Please check your email inbox and spam folder.</p>
                            <p>The link will expire in 1 hour for security reasons.</p>
                        </div>
                        <div className="space-y-2">
                            <Button
                                className="w-full"
                                onClick={() => setIsSubmitted(false)}
                            >
                                Resend Email
                            </Button>
                            <Link href="/login" className="block">
                                <Button variant="outline" className="w-full">
                                    Back to Login
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <Link href="/login">
                        <Button variant="ghost" size="sm" className="mb-4">
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
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
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

                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-2">
                            💡 Test Accounts
                        </p>
                        <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                            <p>• Worker: support@example.com</p>
                            <p>• Client: client@example.com</p>
                            <p>• Admin: admin@example.com</p>
                            <p className="mt-2 italic">Password: password</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
