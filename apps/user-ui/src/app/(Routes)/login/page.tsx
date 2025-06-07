/* eslint-disable react/no-unescaped-entities */
'use client';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

const Login = () => {
    interface FormData {
        email: string;
        password: string;
    }

    const [canSend, setCanSend] = useState(true);
    const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
    const [showOtp, setShowOtp] = useState(false);
    const [otpError, setOtpError] = useState<string | null>(null);
    const [otpLoading, setOtpLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [userData, setUserData] = useState<FormData | null>(null);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    });

    // Refs for OTP inputs for better focus management
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    const signupMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/login-user`,
                data
            );
            return res.data;
        },
        onSuccess: (_, formData) => {
            setUserData(formData);
            setShowOtp(true);
            startResendTimer();
        },
        onError: (error: any) => {
            setServerError(error?.response?.data?.message || 'Login failed');
        },
    });

    const [timer, setTimer] = useState(60);

    // Helper to start the resend timer and control canSend
    const startResendTimer = () => {
        setCanSend(false);
        setTimer(60);
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setCanSend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // Mock OTP verification function
    const verifyOtp = async (otp: string) => {
        // Simulate API call
        await new Promise((res) => setTimeout(res, 1000));
        // For demo, accept '123456' as valid OTP
        return otp === '123456';
    };

    // Simulate sending OTP (reset timer and clear OTP fields)
    const handleResendOtp = () => {
        setOtp(Array(6).fill(''));
        setOtpError(null);
        startResendTimer();
        // Optionally, trigger backend resend here
    };

    const onSubmit = (data: FormData) => {
        setServerError(null);
        signupMutation.mutate(data);
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
        if (value === '' && index > 0) {
            // If cleared, stay or go back
            otpRefs.current[index]?.focus();
        }
    };

    const handleOtpKeyDown = (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (e.key === 'Backspace') {
            if (otp[index] === '' && index > 0) {
                otpRefs.current[index - 1]?.focus();
                setOtp((prev) => {
                    const updated = [...prev];
                    updated[index - 1] = '';
                    return updated;
                });
                e.preventDefault();
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            otpRefs.current[index - 1]?.focus();
            e.preventDefault();
        } else if (e.key === 'ArrowRight' && index < 5) {
            otpRefs.current[index + 1]?.focus();
            e.preventDefault();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const paste = e.clipboardData
            .getData('text')
            .replace(/\D/g, '')
            .slice(0, 6);
        if (paste.length === 6) {
            setOtp(paste.split(''));
            setTimeout(() => otpRefs.current[5]?.focus(), 0);
        }
        e.preventDefault();
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setOtpError(null);
        setOtpLoading(true);
        const enteredOtp = otp.join('');
        if (enteredOtp.length < 6) {
            setOtpError('Please enter the 6-digit OTP.');
            setOtpLoading(false);
            return;
        }
        const valid = await verifyOtp(enteredOtp);
        setOtpLoading(false);
        if (valid) {
            router.push('/');
        } else {
            setOtpError('Invalid OTP. Please try again.');
        }
    };

    return (
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 ">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-tBase">
                        Login to eShop
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <a
                            href="/signup"
                            className="font-medium text-primary hover:text-indigo-500"
                        >
                            Sign up
                        </a>
                    </p>
                </div>

                <button className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <img
                        className="h-5 w-5 mr-2"
                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                        alt="Google logo"
                    />
                    Sign in with Google
                </button>

                <div className="relative flex items-center">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <div className="px-4 text-sm text-tBase">
                        Or sign in with email
                    </div>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                {serverError && (
                    <div className="text-red-500 text-center text-sm">
                        {serverError}
                    </div>
                )}

                {!showOtp ? (
                    <form
                        className="mt-8 space-y-6"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div>
                                <input
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                            message:
                                                'Enter a valid email address',
                                        },
                                    })}
                                    type="email"
                                    className={`appearance-none text-tBase rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm ${
                                        errors.email ? 'border-red-500' : ''
                                    }`}
                                    placeholder="Email address"
                                    disabled={signupMutation.isLoading}
                                />
                                {errors.email && (
                                    <span className="text-red-500 text-xs mt-1 block">
                                        {errors.email.message}
                                    </span>
                                )}
                            </div>
                            <br />
                            <div className="relative">
                                <input
                                    {...register('password', {
                                        required: 'Password is required',
                                    })}
                                    type={passwordVisible ? 'text' : 'password'}
                                    className={`appearance-none rounded text-tBase relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm ${
                                        errors.password ? 'border-red-500' : ''
                                    }`}
                                    placeholder="Password"
                                    disabled={signupMutation.isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setPasswordVisible((v) => !v)
                                    }
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 text-lg"
                                    tabIndex={-1}
                                >
                                    {passwordVisible ? '👁️' : '👁️‍🗨️'}
                                </button>
                                {errors.password && (
                                    <span className="text-red-500 text-xs mt-1 block">
                                        {errors.password.message}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) =>
                                        setRememberMe(e.target.checked)
                                    }
                                    className="h-4 w-4 focus:ring-primary rounded-xl"
                                    disabled={signupMutation.isLoading}
                                />
                                <label className="ml-2 block text-sm text-tUnfocused">
                                    Remember me
                                </label>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="group relative w-full flex justify-center py-2 px-4 hover:bg-primaryFocus border border-transparent text-sm font-medium rounded-md text-white bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                disabled={signupMutation.isLoading}
                            >
                                {signupMutation.isLoading
                                    ? 'Signing in...'
                                    : 'Sign in'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleOtpSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-tBase mb-2">
                                Enter OTP sent to your email
                            </label>
                            <div className="flex space-x-2 justify-center">
                                {otp.map((digit, idx) => (
                                    <input
                                        key={idx}
                                        id={`otp-input-${idx}`}
                                        ref={(el) =>
                                            (otpRefs.current[idx] = el)
                                        }
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        className="w-10 h-12 text-center border border-gray-300 rounded text-lg"
                                        value={digit}
                                        onChange={(e) =>
                                            handleOtpChange(idx, e.target.value)
                                        }
                                        onKeyDown={(e) =>
                                            handleOtpKeyDown(idx, e)
                                        }
                                        onPaste={handleOtpPaste}
                                        autoFocus={idx === 0}
                                    />
                                ))}
                            </div>
                            {otpError && (
                                <span className="text-red-500 text-xs mt-2 block text-center">
                                    {otpError}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <button
                                type="submit"
                                className="w-full py-2 px-4 rounded bg-primary text-white font-medium hover:bg-primaryFocus"
                                disabled={otpLoading}
                            >
                                {otpLoading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                            <button
                                type="button"
                                className={`w-full py-2 px-4 rounded border border-primary text-primary font-medium hover:bg-primary/10 ${
                                    timer > 0 || !canSend
                                        ? 'opacity-50 cursor-not-allowed'
                                        : ''
                                }`}
                                onClick={handleResendOtp}
                                disabled={timer > 0 || !canSend}
                            >
                                {timer > 0
                                    ? `Resend OTP in ${timer}s`
                                    : 'Resend OTP'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
