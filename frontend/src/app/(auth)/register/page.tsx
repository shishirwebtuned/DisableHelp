'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { register as registerAction } from '@/redux/slices/authSlice';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const formSchema = z.object({
    firstName: z.string().min(2, {
        message: "First name must be at least 2 characters.",
    }),
    lastName: z.string().min(2, {
        message: "Last name must be at least 2 characters.",
    }),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters.",
    }).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: "Password must contain at least one uppercase letter, one lowercase letter, and one number.",
    }),
    confirmPassword: z.string(),
    phone: z.string().min(10, {
        message: "Please enter a valid phone number.",
    }),
    role: z.enum(['worker', 'client'], {
        message: "Please select a role.",
    }),
    termsAccepted: z.boolean().refine((val) => val === true, {
        message: "You must accept the terms and conditions.",
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export default function RegisterPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
            phone: "",
            role: undefined,
            termsAccepted: false,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        setError(null);

        try {
            const resultAction = await dispatch(registerAction(values));
            
            if (registerAction.fulfilled.match(resultAction)) {
                // Redirect to verify email page
                router.push('/verify-email?email=' + encodeURIComponent(values.email));
            } else {
                setError('Registration failed. Please try again.');
            }
        } catch (err) {
            setError('Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4">
            <Card className="w-full max-w-2xl shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight">Create an Account</CardTitle>
                    <CardDescription>
                        Join our platform and start managing your support needs
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Last Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="john.doe@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl>
                                            <Input type="tel" placeholder="+61 400 000 000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>I want to register as a</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder="Select your role" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="client">Client - I need support services</SelectItem>
                                                <SelectItem value="worker">Support Worker - I provide services</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
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
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirm Password</FormLabel>
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
                            </div>

                            <FormField
                                control={form.control}
                                name="termsAccepted"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                I agree to the{' '}
                                                <Link href="/terms" className="text-primary hover:underline">
                                                    Terms and Conditions
                                                </Link>{' '}
                                                and{' '}
                                                <Link href="/privacy" className="text-primary hover:underline">
                                                    Privacy Policy
                                                </Link>
                                            </FormLabel>
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating Account...
                                    </>
                                ) : (
                                    'Create Account'
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary hover:underline font-medium">
                            Sign in
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
