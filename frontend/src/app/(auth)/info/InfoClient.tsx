'use client';
import { useEffect, useState } from 'react';
import React from 'react';
import { useSearchParams } from 'next/navigation';
import { Mail, Clock, ArrowDown } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { verifyToken, resentemail } from '@/redux/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useAppDispatch } from '@/hooks/redux';
import Link from 'next/link';

const InfoPage = () => {
    const searchParams = useSearchParams();
    const email = searchParams.get('email');
    const token = searchParams.get('token');
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { isLoading, error } = useSelector((state: RootState) => state.auth);
    const [showResendButton, setShowResendButton] = useState(false);
    const [countdown, setCountdown] = useState(60);


    useEffect(() => {
        if (!email) {
            // router.push('/register');
        }
    }, [email]);

    useEffect(() => {
        if (token) {
            dispatch(verifyToken(token));
        }
    }, [token, dispatch]);

    useEffect(() => {
        // Countdown timer
        if (countdown > 0) {
            const timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);

            return () => clearInterval(timer);
        } else {
            setShowResendButton(true);
        }
    }, [countdown]);

    const handleResendEmail = () => {
        if (email) {
            dispatch(resentemail(email));
            // Reset countdown and hide button
            setShowResendButton(false);
            setCountdown(60);
        }
    };

    // Calculate progress percentage (0-100)
    const progress = ((60 - countdown) / 60) * 100;

    // Calculate stroke dash offset for circular progress
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                        <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl">Check Your Email</CardTitle>
                    <CardDescription className="text-base">
                        We've sent a verification link to your email
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    {email && (
                        <p className="text-sm font-medium">
                            {email}
                        </p>
                    )}
                    <p className="text-sm">
                        Please check your mailbox and click the verification link to complete your registration.
                    </p>
                    <p className="text-xs">
                        Didn't receive the email? Check your spam folder.
                    </p>

                    {!showResendButton && (
                        <div className="flex flex-col items-center space-y-3">
                            <div className="relative inline-flex items-center justify-center">
                                <svg className="transform -rotate-90 w-24 h-24">
                                    {/* Background circle */}
                                    <circle
                                        cx="48"
                                        cy="48"
                                        r={radius}
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                        className="text-gray-200"
                                    />
                                    {/* Progress circle */}
                                    <circle
                                        cx="48"
                                        cy="48"
                                        r={radius}
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        className="text-blue-600 transition-all duration-1000 ease-linear"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                {/* Timer text in center */}
                                <div className="absolute flex flex-col items-center">
                                    <Clock className="h-5 w-5 text-blue-600 mb-1" />
                                    <span className="text-lg font-semibold text-gray-700">
                                        {countdown}s
                                    </span>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Resend available in {countdown} seconds
                            </p>
                        </div>
                    )}

                    {showResendButton && (
                        <Button
                            onClick={handleResendEmail}
                            disabled={isLoading}
                            className="w-full"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Resending...
                                </>
                            ) : (
                                'Resend Email'
                            )}
                        </Button>
                    )}
                    <Link href="/login">
                        <Button>
                            <ArrowDown className="mr-2 h-4 w-4" /> Back to Login
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
};

export default InfoPage;
