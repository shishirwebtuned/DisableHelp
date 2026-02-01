'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';

const formSchema = z.object({
    password: z.string().min(8, {
        message: "Password must be at least 8 characters.",
    }).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: "Password must contain at least one uppercase letter, one lowercase letter, and one number.",
    }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isValidToken, setIsValidToken] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        // Validate token on component mount
        const validateToken = async () => {
            if (!token) {
                setIsValidToken(false);
                setError('Invalid or missing reset token. Please request a new password reset link.');
                return;
            }

            // Mock token validation
            // In real app, call API to validate token
            try {
                await new Promise(resolve => setTimeout(resolve, 500));
                // Simulate token validation
                setIsValidToken(true);
            } catch (err) {
                setIsValidToken(false);
                setError('This password reset link has expired or is invalid. Please request a new one.');
            }
        };

        validateToken();
    }, [token]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        setError(null);

        try {
            // Mock API call to reset password
            await new Promise(resolve => setTimeout(resolve, 1500));

            // In real app, send values.password and token to backend
            // await api.resetPassword({ password: values.password, token });

            setIsSuccess(true);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err) {
            setError('Failed to reset password. Please try again or request a new reset link.');
        } finally {
            setIsLoading(false);
        }
    }

    if (!isValidToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                            <AlertCircle className="h-8 w-8 text-destructive" />
                        </div>
                        <CardTitle className="text-2xl">Invalid Reset Link</CardTitle>
                        <CardDescription>
                            {error}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Link href="/forgot-password" className="block">
                            <Button className="w-full">
                                Request New Reset Link
                            </Button>
                        </Link>
                        <Link href="/login" className="block">
                            <Button variant="outline" className="w-full">
                                Back to Login
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <CardTitle className="text-2xl">Password Reset Successful!</CardTitle>
                        <CardDescription>
                            Your password has been successfully reset. You can now sign in with your new password.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center">
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            <span className="text-sm text-muted-foreground">Redirecting to login...</span>
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
                    <CardTitle className="text-2xl">Reset Your Password</CardTitle>
                    <CardDescription>
                        Enter your new password below. Make sure it's strong and secure.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md font-medium mb-4 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    {...field}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Must be at least 8 characters with uppercase, lowercase, and numbers
                                        </p>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm New Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    {...field}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Resetting Password...
                                    </>
                                ) : (
                                    'Reset Password'
                                )}
                            </Button>
                        </form>
                    </Form>

                    <div className="text-center mt-4 pt-4 border-t">
                        <Link href="/login">
                            <Button variant="ghost" size="sm">
                                Back to Login
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}
