'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '@/redux/slices/authSlice';
import { AppDispatch, RootState } from '@/redux/store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(1, {
        message: "Password is required.",
    }),
});

export default function LoginPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { isLoading, error } = useSelector((state: RootState) => state.auth);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const resultAction = await dispatch(login(values));
        if (login.fulfilled.match(resultAction)) {
            const user = resultAction.payload;
            if (user.role === 'worker') {
                router.push('/worker');
            } else if (user.role === 'client') {
                router.push('/client');
            } else if (user.role === 'admin') {
                router.push('/admin');
            } else {
                router.push('/'); // Fallback
            }
        }
    }

    const fillCredentials = (role: 'worker' | 'client' | 'admin') => {
        if (role === 'worker') {
            form.setValue('email', 'support@example.com');
            form.setValue('password', 'password');
        } else if (role === 'client') {
            form.setValue('email', 'client@example.com');
            form.setValue('password', 'password');
        } else {
            form.setValue('email', 'admin@example.com');
            form.setValue('password', 'password');
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight">Login to Platform</CardTitle>
                    <CardDescription>
                        Enter your email and password to access your account
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md font-medium">
                            {error}
                        </div>
                    )}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="m@example.com" {...field} disabled={isLoading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} disabled={isLoading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="remember" />
                                    <label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Remember me</label>
                                </div>
                                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Sign In
                            </Button>
                        </form>
                    </Form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Quick Login (Mock)
                            </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <Button variant="outline" size="xs" className="text-xs" onClick={() => fillCredentials('worker')}>
                            Worker
                        </Button>
                        <Button variant="outline" size="xs" className="text-xs" onClick={() => fillCredentials('client')}>
                            Client
                        </Button>
                        <Button variant="outline" size="xs" className="text-xs" onClick={() => fillCredentials('admin')}>
                            Admin
                        </Button>
                    </div>

                </CardContent>
                <CardFooter className="flex flex-col space-y-2 mt-2">
                    <div className="text-sm text-center text-muted-foreground">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-primary hover:underline font-medium">
                            Sign up
                        </Link>
                    </div>
                    <div className="text-sm text-center text-muted-foreground">
                        By clicking continue, you agree to our <a href="#" className="underline underline-offset-4 hover:text-primary">Terms of Service</a> and <a href="#" className="underline underline-offset-4 hover:text-primary">Privacy Policy</a>.
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
