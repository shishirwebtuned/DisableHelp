'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Mail, Loader2, AlertCircle } from 'lucide-react';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const email = searchParams.get('email') || '';
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [countdown]);

    const handleCodeChange = (index: number, value: string) => {
        if (value.length > 1) {
            value = value[0];
        }

        const newCode = [...verificationCode];
        newCode[index] = value;
        setVerificationCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`code-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
            const prevInput = document.getElementById(`code-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        const newCode = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
        setVerificationCode(newCode);
    };

    const handleVerify = async () => {
        const code = verificationCode.join('');
        if (code.length !== 6) {
            setError('Please enter the complete verification code');
            return;
        }

        setIsVerifying(true);
        setError(null);

        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Simulate verification
            if (code === '123456') {
                setIsVerified(true);
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                setError('Invalid verification code. Please try again.');
            }
        } catch (err) {
            setError('Verification failed. Please try again.');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        setError(null);

        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setCountdown(60);
            setCanResend(false);
            setVerificationCode(['', '', '', '', '', '']);
        } catch (err) {
            setError('Failed to resend code. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    if (isVerified) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <CardTitle className="text-2xl">Email Verified!</CardTitle>
                        <CardDescription>
                            Your email has been successfully verified. You can now sign in to your account.
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
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Mail className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Verify Your Email</CardTitle>
                    <CardDescription>
                        We've sent a 6-digit verification code to <strong>{email}</strong>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md font-medium flex items-center">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Verification Code</Label>
                        <div className="flex gap-2 justify-center">
                            {verificationCode.map((digit, index) => (
                                <Input
                                    key={index}
                                    id={`code-${index}`}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleCodeChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    className="w-12 h-12 text-center text-lg font-semibold"
                                />
                            ))}
                        </div>
                    </div>

                    <Button
                        onClick={handleVerify}
                        className="w-full"
                        disabled={isVerifying || verificationCode.join('').length !== 6}
                    >
                        {isVerifying ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            'Verify Email'
                        )}
                    </Button>

                    <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Didn't receive the code?
                        </p>
                        <Button
                            variant="outline"
                            onClick={handleResend}
                            disabled={!canResend || isResending}
                            className="w-full"
                        >
                            {isResending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Resending...
                                </>
                            ) : canResend ? (
                                'Resend Code'
                            ) : (
                                `Resend Code (${countdown}s)`
                            )}
                        </Button>
                    </div>

                    <div className="text-center pt-4 border-t">
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

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
