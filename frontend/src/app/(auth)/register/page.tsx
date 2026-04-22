'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppDispatch } from '@/hooks/redux';
import { register as registerAction } from '@/redux/slices/authSlice';
import { useRouter } from 'next/navigation';
import { formatDateToInputValue, inputValueToISO } from '@/lib/dateHelpers';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Loader2, Eye, EyeOff, User, UserPlus, Mail, Lock, MapPin, ClipboardCheck, Check, Pencil, } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { cn } from '@/lib/utils';

/* Steps */
const STEPS = [
    { id: 1, title: 'Getting Started', icon: UserPlus },
    { id: 2, title: 'Personal', icon: User },
    { id: 3, title: 'Contact', icon: Mail },
    { id: 4, title: 'Security', icon: Lock },
    { id: 5, title: 'Address', icon: MapPin },
    { id: 6, title: 'Confirm', icon: ClipboardCheck },
] as const;
const TOTAL_STEPS = STEPS.length;

/* Schema */
const formSchema = z.object({
    firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
    lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
    gender: z.enum(['male', 'female', 'other', 'prefer not to say']).optional(),
    dateOfBirth: z.string().min(1, { message: "Please select a date of birth." })
        .regex(/^(19|20)\d\d-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/, { message: "Please select a valid date of birth." }),
    role: z.enum(['worker', 'client'], { message: "Please select a role." }),
    isSelfManaged: z.boolean().optional(),
    isNdisProvider: z.boolean().optional(),
    accountManagerName: z.string().optional(),
    email: z.string().email({ message: "Please enter a valid email address." }),
    phoneNumber: z.string().min(10, { message: "Please enter a valid phone number." }),
    password: z.string().min(8, { message: "Password must be at least 8 characters." })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { message: "Must contain uppercase, lowercase and a number." }),
    confirmPassword: z.string(),
    address: z.object({
        line1: z.string().min(1, { message: "Required." }),
        suburb: z.string().min(1, { message: "Required." }),
        state: z.string().min(1, { message: "Required." }),
        postalCode: z.string().min(1, { message: "Required." }),
    }),
    termsAccepted: z.boolean().refine((v) => v, { message: "You must accept the terms." }),
}).refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
}).refine((d) => {
    if (d.role === 'client' && !d.isSelfManaged) {
        return d.accountManagerName && d.accountManagerName.length >= 2;
    }
    return true;
}, { message: "Please enter a valid account manager name.", path: ["accountManagerName"] }).refine((d) => {
    if (d.isNdisProvider) return true;
    return !!d.gender;
}, { message: "Please select a gender.", path: ["gender"] });

/* Fields validated per step */
const stepFields: Record<number, string[]> = {
    1: ['role', 'isSelfManaged', 'accountManagerName', 'isNdisProvider'],
    2: ['firstName', 'lastName', 'dateOfBirth', 'gender'],
    3: ['email', 'phoneNumber'],
    4: ['password', 'confirmPassword'],
    5: ['address.line1', 'address.suburb', 'address.state', 'address.postalCode', 'termsAccepted'],
    6: [],
};

/* Review row component */
function ReviewRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between py-1.5">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm font-medium text-foreground text-right max-w-[60%] truncate">{value || '\u2014'}</span>
        </div>
    );
}

/* Component */
export default function RegisterPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
            phoneNumber: '', role: undefined, termsAccepted: false, gender: undefined,
            dateOfBirth: '', address: { line1: '', suburb: '', state: '', postalCode: '' },
            isSelfManaged: true, accountManagerName: '', isNdisProvider: false
        },
        mode: 'onTouched',
    });

    const watchRole = form.watch('role');
    const watchIsSelfManaged = form.watch('isSelfManaged');
    const watchIsNdisProvider = form.watch('isNdisProvider');
    const allValues = form.watch();

    const validateCurrentStep = async () => {
        const fields = stepFields[currentStep];
        if (!fields || fields.length === 0) return true;
        return form.trigger(fields as any);
    };

    const handleNext = async () => {
        if (await validateCurrentStep()) setCurrentStep((p) => Math.min(p + 1, TOTAL_STEPS));
    };
    const handleBack = () => setCurrentStep((p) => Math.max(p - 1, 1));

    // Clear gender when user is an NDIS provider, since it's not required
    useEffect(() => {
        if (watchIsNdisProvider) {
            form.setValue('gender', undefined);
        }
    }, [watchIsNdisProvider, form]);
    const goToStep = (s: number) => setCurrentStep(s);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        setError(null);
        try {
            const submitData = { ...values };

            if (values.role === 'client') {
                submitData.isNdisProvider = undefined;
                if (values.isSelfManaged) {
                    submitData.accountManagerName = '';
                }
            } else if (values.role === 'worker') {
                submitData.isSelfManaged = undefined;
                submitData.accountManagerName = undefined;
            }

            const resultAction = await dispatch(registerAction(submitData));

            if (registerAction.fulfilled.match(resultAction)) {
                router.push('/info?email=' + encodeURIComponent(values.email));
            } else {
                setError('Registration failed. Please try again.');
            }
        } catch {
            setError('Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    const stepMeta: Record<number, { title: string; subtitle: string }> = {
        1: { title: 'Getting started', subtitle: 'Select how you want to use the disable help' },
        2: { title: 'Create your account', subtitle: 'Tell us about yourself' },
        3: { title: 'Contact information', subtitle: 'How can we reach you?' },
        4: { title: 'Secure your account', subtitle: 'Create a strong password' },
        5: { title: 'Your address', subtitle: 'Where are you located?' },
        6: { title: 'Review & confirm', subtitle: 'Make sure everything looks good' },
    };

    const roleLabel = watchRole === 'client' ? 'Client' : watchRole === 'worker' ? 'Support Worker' : '\u2014';
    const genderLabel = allValues.gender ? allValues.gender.charAt(0).toUpperCase() + allValues.gender.slice(1) : '\u2014';

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50  p-1 md:p-4 py-2 md:py-10">
            <div className="w-full max-w-[620px] min-h-[560px] md:min-h-[640px] flex flex-col rounded bg-card overflow-hidden">

                {/* Step indicator */}
                <div className="px-4 md:px-10 pt-10 pb-3">
                    <div className="flex items-center justify-between overflow-x-auto">
                        {STEPS.map((step, index) => {
                            const StepIcon = step.icon;
                            const isCompleted = currentStep > step.id;
                            const isCurrent = currentStep === step.id;
                            return (
                                <div key={step.id} className="flex items-center flex-1 last:flex-none min-w-[64px]">
                                    <div className="flex flex-col items-center">
                                        <button
                                            type="button"
                                            onClick={() => { if (isCompleted) goToStep(step.id); }}
                                            className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 border-2 outline-none",
                                                isCompleted
                                                    ? "bg-[#8ac6dd] border-[#8ac6dd] text-white cursor-pointer hover:opacity-90"
                                                    : isCurrent
                                                        ? "border-[#8ac6dd] bg-[#8ac6dd]/10 text-[#8ac6dd] dark:bg-[#8ac6dd]/20"
                                                        : "border-muted-foreground/25 bg-muted text-muted-foreground cursor-default"
                                            )}
                                        >
                                            {isCompleted ? <Check className="h-5 w-5" /> : <StepIcon className="h-4 w-4" />}
                                        </button>
                                        <span className={cn(
                                            "text-[11px] mt-1.5 font-medium whitespace-nowrap hidden sm:block",
                                            isCurrent ? "text-[#8ac6dd]" : isCompleted ? "text-foreground" : "text-muted-foreground"
                                        )}>{step.title}</span>
                                    </div>
                                    {index < TOTAL_STEPS - 1 && (
                                        <div className={cn(
                                            "h-[2px] flex-1 mx-2 mb-5 rounded-full transition-colors duration-300",
                                            currentStep > step.id ? "bg-[#8ac6dd]" : ""
                                        )} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
                {/* Header */}
                <div className="px-4 md:px-10 pt-5 pb-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">{stepMeta[currentStep].title}</h1>
                    <p className="text-sm text-muted-foreground mt-1">{stepMeta[currentStep].subtitle}</p>
                </div>

                {/* Body */}
                <div className="flex-1 px-4 md:px-10 pt-5 pb-8">
                    {error && (
                        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md font-medium mb-5">{error}</div>
                    )}

                    <Form {...form}>
                        <form
                            onSubmit={(e) => e.preventDefault()}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                }
                            }}
                            className="flex flex-col h-full"
                        >
                            <div className="flex-1 space-y-5">

                                {/* Step 1 - Getting Started (role only) */}
                                <div className={cn(currentStep !== 1 && "hidden", "space-y-5")}>
                                    {/* Role selection cards */}
                                    <FormField
                                        control={form.control}
                                        name="role"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm">I want to register as a</FormLabel>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                                    {[
                                                        { value: 'client', label: 'Client', desc: 'I need support services' },
                                                        { value: 'worker', label: 'Support Worker', desc: 'I provide services' },
                                                    ].map((opt) => (
                                                        <button
                                                            key={opt.value}
                                                            type="button"
                                                            onClick={() => {
                                                                field.onChange(opt.value);
                                                                if (opt.value === 'worker') {
                                                                    form.setValue('isSelfManaged', true);
                                                                    form.setValue('accountManagerName', '');
                                                                }
                                                            }}
                                                            className={cn(
                                                                "rounded p-6 cursor-pointer sm:p-6 text-left transition-all border-2 outline-none",
                                                                field.value === opt.value
                                                                    ? "theme text-primary-foreground"
                                                                    : ""
                                                            )}
                                                        >
                                                            <span className="text-xl font-semibold text-foreground">{opt.label}</span>
                                                            <p className="text-sm text-muted-foreground mt-0.5">{opt.desc}</p>
                                                        </button>
                                                    ))}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Client-only: self / managed */}
                                    {watchRole === 'client' && (
                                        <div className="rounded-xl bg-muted/40 p-4 space-y-3">
                                            <FormField
                                                control={form.control}
                                                name="isSelfManaged"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value}
                                                                onCheckedChange={(c) => {
                                                                    field.onChange(c);
                                                                    if (c) { form.setValue('accountManagerName', ''); form.clearErrors('accountManagerName'); }
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <div className="leading-none">
                                                            <FormLabel className="text-sm font-medium cursor-pointer">I&apos;m opening this account for myself</FormLabel>
                                                            <p className="text-xs text-muted-foreground mt-0.5">Uncheck if someone else manages this account</p>
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />
                                            {!watchIsSelfManaged && (
                                                <FormField
                                                    control={form.control}
                                                    name="accountManagerName"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Account Manager Name</FormLabel>
                                                            <FormControl><Input placeholder="e.g. Jane Smith (Parent / Guardian)" {...field} /></FormControl>
                                                            <p className="text-xs text-muted-foreground">The person who will manage this account on behalf of the client.</p>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            )}
                                        </div>
                                    )}

                                    {/* Worker-only: NDIS Provider / Independent Worker */}
                                    {watchRole === 'worker' && (
                                        <div className="rounded-xl bg-muted/40 p-4 space-y-3">
                                            <FormField
                                                control={form.control}
                                                name="isNdisProvider"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value || false}
                                                                onCheckedChange={(c) => field.onChange(c)}
                                                            />
                                                        </FormControl>
                                                        <div className="leading-none">
                                                            <FormLabel className="text-sm font-medium cursor-pointer">
                                                                I am an NDIS registered provider
                                                            </FormLabel>
                                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                                Uncheck if you are an independent/individual worker
                                                            </p>
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    )}

                                </div>

                                {/* Step 2 - Create your account (personal details) */}
                                <div className={cn(currentStep !== 2 && "hidden", "space-y-5")}>
                                    {/* Name row */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                                        <FormField control={form.control} name="firstName" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>First Name</FormLabel>
                                                <FormControl><Input placeholder="John" className='h-10' {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="lastName" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Last Name</FormLabel>
                                                <FormControl><Input placeholder="Doe" className='h-10' {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>

                                    {/* DOB + Gender row */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                                        <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Date of Birth</FormLabel>
                                                <FormControl>
                                                    <DatePicker className="w-full h-10" value={formatDateToInputValue(field.value)} onChange={(date) => field.onChange(date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : '')} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        {!watchIsNdisProvider && (
                                            <FormField control={form.control} name="gender" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Gender</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="w-full h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="male">Male</SelectItem>
                                                            <SelectItem value="female">Female</SelectItem>
                                                            <SelectItem value="other">Other</SelectItem>
                                                            <SelectItem value="prefer not to say">Prefer not to say</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        )}
                                    </div>
                                </div>

                                {/* Step 3 - Contact */}
                                <div className={cn(currentStep !== 3 && "hidden", "space-y-5")}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                                        <FormField control={form.control} name="email" render={({ field }) => (
                                            <FormItem className="col-span-2 sm:col-span-1">
                                                <FormLabel>Email</FormLabel>
                                                <FormControl><Input type="email" placeholder="john.doe@example.com" className='h-10' {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                                            <FormItem className="col-span-2 sm:col-span-1">
                                                <FormLabel>Phone Number</FormLabel>
                                                <FormControl><Input type="tel" placeholder="+61 400 000 000" className='h-10' {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>

                                {/* Step 4 - Security */}
                                <div className={cn(currentStep !== 4 && "hidden", "space-y-5")}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                                        <FormField control={form.control} name="password" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input type={showPassword ? 'text' : 'password'} placeholder="********" className='h-10' {...field} />
                                                        <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                        </Button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Confirm Password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input type={showConfirmPassword ? 'text' : 'password'} placeholder="********" className='h-10' {...field} />
                                                        <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                        </Button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                    {/* Strength indicators */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                                        {[
                                            { test: /.{8,}/.test(allValues.password || ''), label: 'At least 8 characters' },
                                            { test: /[A-Z]/.test(allValues.password || ''), label: 'One uppercase letter' },
                                            { test: /[a-z]/.test(allValues.password || ''), label: 'One lowercase letter' },
                                            { test: /\d/.test(allValues.password || ''), label: 'One number' },
                                        ].map((r) => (
                                            <div key={r.label} className="flex items-center gap-2">
                                                <div className={cn("h-1.5 w-1.5 rounded-full transition-colors", r.test ? "bg-green-500" : "bg-muted-foreground/30")} />
                                                <span className={cn("text-xs", r.test ? "text-green-600 dark:text-green-400" : "text-muted-foreground")}>{r.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Step 5 - Address and Terms */}
                                <div className={cn(currentStep !== 5 && "hidden", "space-y-5")}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                                        <FormField control={form.control} name="address.line1" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Address Line 1</FormLabel>
                                                <FormControl><Input placeholder="123 Main St" className='h-10' {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="address.suburb" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Suburb</FormLabel>
                                                <FormControl><Input placeholder="Sydney" className='h-10' {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                                        <FormField control={form.control} name="address.state" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>State</FormLabel>
                                                <FormControl><Input placeholder="NSW" className='h-10' {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="address.postalCode" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Postal Code</FormLabel>
                                                <FormControl><Input placeholder="2000" className='h-10' {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                    <FormField control={form.control} name="termsAccepted" render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl bg-muted/40 p-4">
                                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>
                                                    I agree to the{' '}
                                                    <Link href="/terms" className="text-[#8ac6dd] hover:underline">Terms and Conditions</Link>{' '}and{' '}
                                                    <Link href="/privacy" className="text-[#8ac6dd] hover:underline">Privacy Policy</Link>
                                                </FormLabel>
                                                <FormMessage />
                                            </div>
                                        </FormItem>
                                    )} />
                                </div>

                                {/* Step 6 - Confirmation / Review */}
                                <div className={cn(currentStep !== 6 && "hidden", "space-y-4")}>
                                    {/* Personal */}
                                    <div className="rounded-xl bg-muted/40 p-5 space-y-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-sm font-semibold text-foreground">Personal Details</h3>
                                            <button type="button" onClick={() => goToStep(2)} className="text-xs text-[#8ac6dd] cursor-pointer hover:underline flex items-center gap-1"><Pencil className="h-3 w-3" />Edit</button>
                                        </div>
                                        <ReviewRow label="Role" value={roleLabel} />
                                        <ReviewRow label="Name" value={`${allValues.firstName || ''} ${allValues.lastName || ''}`.trim()} />
                                        <ReviewRow label="Date of Birth" value={allValues.dateOfBirth || '\u2014'} />
                                        <ReviewRow label="Gender" value={genderLabel} />
                                        {watchRole === 'client' && !watchIsSelfManaged && (
                                            <ReviewRow label="Account Manager" value={allValues.accountManagerName || '\u2014'} />
                                        )}
                                    </div>

                                    {/* Contact */}
                                    <div className="rounded-xl bg-muted/40 p-5 space-y-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-sm font-semibold text-foreground">Contact</h3>
                                            <button type="button" onClick={() => goToStep(3)} className="text-xs text-[#8ac6dd] hover:underline flex items-center gap-1"><Pencil className="h-3 w-3" />Edit</button>
                                        </div>
                                        <ReviewRow label="Email" value={allValues.email || ''} />
                                        <ReviewRow label="Phone" value={allValues.phoneNumber || ''} />
                                    </div>

                                    {/* Address */}
                                    <div className="rounded-xl bg-muted/40 p-5 space-y-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-sm font-semibold text-foreground">Address</h3>
                                            <button type="button" onClick={() => goToStep(5)} className="text-xs text-[#8ac6dd] hover:underline flex items-center gap-1"><Pencil className="h-3 w-3" />Edit</button>
                                        </div>
                                        <ReviewRow label="Street" value={[allValues.address?.line1, allValues.address?.suburb].filter(Boolean).join(', ')} />
                                        <ReviewRow label="State" value={allValues.address?.state || ''} />
                                        <ReviewRow label="Postal Code" value={allValues.address?.postalCode || ''} />
                                    </div>
                                </div>

                            </div>

                            {/* Navigation */}
                            <div className="flex items-center justify-between pt-8 mt-auto flex-col sm:flex-row gap-3 sm:gap-0">
                                {currentStep > 1 ? (
                                    <Button type="button" variant="outline" onClick={handleBack} className="px-6 w-full sm:w-auto">Back</Button>
                                ) : <div />}

                                {currentStep < TOTAL_STEPS ? (
                                    <Button type="button" onClick={handleNext} className="px-8 cursor-pointer rounded-full w-full sm:w-auto">Next</Button>
                                ) : (
                                    <Button type="button" className="px-8 rounded-full cursor-pointer w-full sm:w-auto" disabled={isLoading} onClick={form.handleSubmit(onSubmit)}>
                                        {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating Account...</>) : 'Create Account'}
                                    </Button>
                                )}
                            </div>
                        </form>
                    </Form>
                </div>

                {/* Footer */}
                <Separator />
                <div className="flex justify-center py-5">
                    <p className="text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link href="/login" className=" hover:underline font-medium">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
