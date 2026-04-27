'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { login, getmee } from '@/redux/slices/authSlice';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import getMee from "@/redux/slices/authSlice"
import {
    Eye,
    EyeOff,
    HeartHandshake,
    Settings,
    Menu,
    X,
    Loader2,
    AlertCircle
} from 'lucide-react';

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
import { Checkbox } from '@/components/ui/checkbox';
import { connectSocket } from '@/lib/socket';

const formSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(1, {
        message: "Password is required.",
    }),
});

export default function DisabilityLoginPortal() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const { isLoading, error, loginmessage } = useAppSelector((state) => state.auth);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const resultAction = await dispatch(login(values));
        // after a successful login, fetch current user data
        dispatch(getmee())
        if (login.fulfilled.match(resultAction)) {
            const payload: any = resultAction.payload;
            const user = payload?.data ?? payload;
            const role = payload?.role ?? user?.role;

            const token = payload?.token ?? payload?.data?.token;

            console.log("User at connectSocket time:", user);
            console.log("User._id:", user?.id);

            console.log("Token for socket:", token);
            connectSocket(token, user.id);

            if (role === 'worker') router.push('/worker');
            else if (role === 'client') router.push('/client');
            else if (role === 'admin') router.push('/admin');
            else router.push('/');
        }
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="bg-white  border-b border-[#8ac6dd]/30">
                <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                        <div>
                            <Image
                                src='/disablehelplogo.png'
                                width={200}
                                height={200}
                                alt="Disable Help Logo"
                                className='hover:scale-105 duration-150 '
                            />
                        </div>
                    </div>

                    {/* <div className="md:hidden">
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600">
                            {mobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div> */}

                    {/* <nav className="hidden md:flex space-x-6 text-sm font-medium">
                        <Link href="#" className="text-slate-600 hover:text-[#8ac6dd]">Resources</Link>
                        <Link href="#" className="text-slate-600 hover:text-[#8ac6dd]">Accessibility</Link>
                        <Link href="#" className="text-slate-600 hover:text-[#8ac6dd]">Contact</Link>
                    </nav> */}
                </div>

                {/* Mobile menu (backdrop + panel) */}
                {/* {mobileMenuOpen && (
                    <div className=' relative'>
                        <div
                            className="fixed  inset-0 bg-black/30 z-40 md:hidden"
                            onClick={() => setMobileMenuOpen(false)}
                            aria-hidden

                        >
                        </div>

                        <div className="fixed top-0 left-0 right-0 z-50 md:hidden bg-white border-t border-slate-100">
                            <nav className="flex flex-col px-4 pb-4 pt-3 space-y-2">
                                <X className=' h-7 w-7 absolute top-4 right-4  text-red-600 ' onClick={() => setMobileMenuOpen(false)} />
                                <Link href="#" onClick={() => setMobileMenuOpen(false)} className="text-slate-700 hover:text-[#8ac6dd] py-2">Resources</Link>
                                <Link href="#" onClick={() => setMobileMenuOpen(false)} className="text-slate-700 hover:text-[#8ac6dd] py-2">Accessibility</Link>
                                <Link href="#" onClick={() => setMobileMenuOpen(false)} className="text-slate-700 hover:text-[#8ac6dd] py-2">Contact</Link>
                            </nav>
                        </div>
                    </div>
                )} */}
            </header>

            {/* Main Content */}
            <main className="flex-1 flex  bg-white flex-col lg:flex-row">
                {/* Left Side: Information */}
                <div className="hidden lg:flex flex-1 p-12 items-center justify-center">
                    <div className="max-w-xl">
                        <h2 className="text-4xl font-bold text-slate-800 mb-6 leading-tight">
                            Dedicated Support for <br />
                            <span className="text-[#8ac6dd]">Diverse Abilities</span>
                        </h2>
                        <p className="text-slate-600 text-lg mb-10">
                            Access specialized resources, connect with experts, and manage inclusive programs through our secure partner portal.
                        </p>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded  border border-slate-100">
                                <div className="w-10 h-10 bg-[#8ac6dd]/10 rounded-lg flex items-center justify-center mb-4 text-[#8ac6dd]">
                                    <HeartHandshake size={24} />
                                </div>
                                <h3 className="font-bold text-slate-800">Direct Support</h3>
                                <p className="text-sm text-slate-500">Connecting clients with specialized caregivers.</p>
                            </div>
                            <div className="bg-white p-6 rounded  border border-slate-100">
                                <div className="w-10 h-10 bg-[#8ac6dd]/10 rounded-lg flex items-center justify-center mb-4 text-[#8ac6dd]">
                                    <Settings size={24} />
                                </div>
                                <h3 className="font-bold text-slate-800">Resource Hub</h3>
                                <p className="text-sm text-slate-500">Manage assistive tools and equipment.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="w-full lg:w-[500px] bg-white p-6 sm:p-12 lg:border-l border-slate-100 flex items-center">
                    <div className="w-full max-w-md mx-auto">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-900">Partner Login</h2>
                            <p className="text-slate-500">Enter your credentials to access your dashboard</p>
                        </div>

                        {error && (
                            <div className="mb-6 flex items-center gap-2 bg-red-50 text-red-700 p-3 rounded text-sm border border-red-100">
                                <AlertCircle size={18} /> {error}
                            </div>
                        )}
                        {loginmessage && !error && (
                            <div className="mb-6 bg-[#8ac6dd]/10 text-[#8ac6dd] p-3 rounded text-sm border border-[#8ac6dd]/20">
                                {loginmessage}
                            </div>
                        )}

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700 font-semibold">Email Address</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="name@example.org"
                                                    className="h-12  text-black border-slate-200 focus:ring-[#8ac6dd]"
                                                    {...field}
                                                    disabled={isLoading}
                                                />
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
                                            <FormLabel className="text-slate-700 font-semibold">Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type={showPassword ? "text" : "password"}
                                                        className="h-12  pr-12 text-black border-slate-200 focus:ring-[#8ac6dd]"
                                                        {...field}
                                                        disabled={isLoading}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                    >
                                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="remember" className="border-slate-300 data-[state=checked]:bg-[#8ac6dd] data-[state=checked]:border-[#8ac6dd]" />
                                        <label htmlFor="remember" className="text-sm font-medium text-slate-600 cursor-pointer">Remember me</label>
                                    </div>
                                    <Link href="/forgot-password" className="text-sm font-semibold text-[#8ac6dd] hover:underline">
                                        Forgot password?
                                    </Link>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 bg-[#8ac6dd] hover:bg-[#79b4cc] cursor-pointer text-white font-bold rounded transition-all active:scale-[0.98]"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</>
                                    ) : (
                                        "Sign In"
                                    )}
                                </Button>
                            </form>
                        </Form>

                        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                            <p className="text-sm text-slate-500">
                                Don't have an account?{' '}
                                <Link href="/register" className="text-[#8ac6dd] hover:underline font-bold">
                                    Create one here
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-slate-50 border-t border-slate-200 py-6 px-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-center items-center gap-4 text-xs text-slate-500">
                    <p className="font-medium text-slate-700">© {new Date().getFullYear()} Disable Help </p>
                    {/* <div className="flex gap-6">
                        <Link href="#" className="hover:text-[#8ac6dd]">Privacy</Link>
                        <Link href="#" className="hover:text-[#8ac6dd]">Terms</Link>
                        <Link href="#" className="hover:text-[#8ac6dd]">Accessibility Policy</Link>
                    </div> */}
                </div>
            </footer>
        </div>
    );
}