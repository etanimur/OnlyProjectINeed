'use client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

const Signup = () => {
    interface FormData {
        name: string;
        email: string;
        password: string;
        confirmPassword: string;
    }

    const [passwordVisible, setPasswordVisible] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [rememberMe, setRememberMe] = useState(false);
    const [success, setSuccess] = useState(false);
    const [canSend, setCanSend] = useState(true);
    const [otp, setOtp] = useState<string[]>(Array(4).fill(''));
    const [showOtp, setShowOtp] = useState(false);
    const [otpError, setOtpError] = useState<string | null>(null);
    const [otpLoading, setOtpLoading] = useState(false);
    const [timer, setTimer] = useState(60);
    const otpRefs = React.useRef<(HTMLInputElement | null)[]>([]);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<FormData>({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    });

    // Debug: Log the server URI
    console.log('SERVER_URI:', process.env.NEXT_PUBLIC_SERVER_URI);

    // OTP resend timer logic
    const startResendTimer = () => {
        setTimer(60);
        setCanSend(false);
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

    // Store signup form data for OTP verification
    const [signupFormData, setSignupFormData] = useState<FormData | null>(null);

    // OTP verification function using /api/verify-registration endpoint
    const verifyOtp = async (otp: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_SERVER_URI;
            if (!apiUrl) throw new Error('API URL is not set.');
            if (!signupFormData) throw new Error('Signup data missing.');
            // Send all required fields as expected by backend
            const res = await axios.post(`${apiUrl}/api/verify-registration`, {
                email: signupFormData.email,
                otp,
                password: signupFormData.password,
                name: signupFormData.name,
            });
            return res.data?.success || false;
        } catch (err: any) {
            setOtpError(
                err?.response?.data?.message || 'OTP verification failed'
            );
            return false;
        }
    };

    const handleResendOtp = () => {
        setOtp(Array(4).fill(''));
        setOtpError(null);
        startResendTimer();
        // Optionally, trigger backend resend here
    };

    const signupMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const apiUrl = process.env.NEXT_PUBLIC_SERVER_URI;
            if (!apiUrl) {
                throw new Error(
                    'API URL is not set. Please set NEXT_PUBLIC_SERVER_URI in your environment variables.'
                );
            }
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/user-registration`,
                data
            );
            return res.data;
        },
        onSuccess: () => {
            setShowOtp(true);
            setServerError(null);
            startResendTimer();
        },
        onError: (error: any) => {
            setServerError(error?.response?.data?.message || 'Signup failed');
        },
    });

    const onSubmit = (data: FormData) => {
        setServerError(null);
        setSignupFormData(data); // Save form data for OTP step
        signupMutation.mutate(data);
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^[0-9]?$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 3) {
            otpRefs.current[index + 1]?.focus();
        }
        if (value === '' && index > 0) {
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
        } else if (e.key === 'ArrowRight' && index < 3) {
            otpRefs.current[index + 1]?.focus();
            e.preventDefault();
        }
    };

    // Allow pasting a 6-digit OTP into any OTP input
    const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const paste = e.clipboardData
            .getData('text')
            .replace(/\D/g, '')
            .slice(0, 4);
        if (paste.length > 0) {
            const newOtp = [...otp];
            for (let i = 0; i < paste.length; i++) {
                newOtp[i] = paste[i];
            }
            setOtp(newOtp);
            setTimeout(
                () => otpRefs.current[Math.min(paste.length - 1, 3)]?.focus(),
                0
            );
        }
        e.preventDefault();
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setOtpError(null);
        setOtpLoading(true);
        const enteredOtp = otp.join('');
        if (enteredOtp.length < 4) {
            setOtpError('Please enter the 4-digit OTP.');
            setOtpLoading(false);
            return;
        }
        const valid = await verifyOtp(enteredOtp);
        setOtpLoading(false);
        if (valid) {
            setSuccess(true);
            setShowOtp(false);
            setTimeout(() => router.push('/'), 1500);
        } else {
            setOtpError('Invalid OTP. Please try again.');
        }
    };

    return (
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 ">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-tBase">
                        Sign Up for eShop
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <a
                            href="/login"
                            className="font-medium text-primary hover:text-indigo-500"
                        >
                            Login
                        </a>
                    </p>
                </div>

                <button
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                    disabled={signupMutation.isPending}
                    type="button"
                >
                    <img
                        className="h-5 w-5 mr-2"
                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                        alt="Google logo"
                    />
                    Sign up with Google
                </button>

                <div className="relative flex items-center">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <div className="px-4 text-sm text-tBase">
                        Or sign up with email
                    </div>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                {serverError && (
                    <div className="text-red-500 text-center text-sm">
                        {serverError}
                    </div>
                )}
                {success && (
                    <div className="text-green-600 text-center text-sm">
                        Signup successful! Redirecting...
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
                                    {...register('name', {
                                        required: 'Name is required',
                                        minLength: {
                                            value: 2,
                                            message:
                                                'Name must be at least 2 characters',
                                        },
                                    })}
                                    type="text"
                                    className={`appearance-none text-tBase rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm ${
                                        errors.name ? 'border-red-500' : ''
                                    }`}
                                    placeholder="Full Name"
                                    disabled={signupMutation.isPending}
                                    autoComplete="name"
                                />
                                {errors.name && (
                                    <span className="text-red-500 text-xs mt-1 block">
                                        {errors.name.message}
                                    </span>
                                )}
                            </div>
                            <br />
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
                                    disabled={signupMutation.isPending}
                                    autoComplete="email"
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
                                        minLength: {
                                            value: 8,
                                            message:
                                                'Password must be at least 8 characters',
                                        },
                                        validate: {
                                            hasUpper: (v) =>
                                                /[A-Z]/.test(v) ||
                                                'Must contain an uppercase letter',
                                            hasLower: (v) =>
                                                /[a-z]/.test(v) ||
                                                'Must contain a lowercase letter',
                                            hasNumber: (v) =>
                                                /[0-9]/.test(v) ||
                                                'Must contain a number',
                                            hasSpecial: (v) =>
                                                /[!@#$%^&*(),.?":{}|<>]/.test(
                                                    v
                                                ) ||
                                                'Must contain a special character',
                                        },
                                    })}
                                    type={passwordVisible ? 'text' : 'password'}
                                    className={`appearance-none rounded text-tBase relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm ${
                                        errors.password ? 'border-red-500' : ''
                                    }`}
                                    placeholder="Password"
                                    disabled={signupMutation.isPending}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setPasswordVisible((v) => !v)
                                    }
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 text-lg"
                                    tabIndex={-1}
                                    aria-label="Toggle password visibility"
                                >
                                    {passwordVisible ? '👁️' : '👁️‍🗨️'}
                                </button>
                                {errors.password && (
                                    <span className="text-red-500 text-xs mt-1 block">
                                        {errors.password.message}
                                    </span>
                                )}
                            </div>
                            <br />
                            <div className="relative">
                                <input
                                    {...register('confirmPassword', {
                                        required:
                                            'Please confirm your password',
                                        validate: (value) =>
                                            value === watch('password') ||
                                            'Passwords do not match',
                                    })}
                                    type={passwordVisible ? 'text' : 'password'}
                                    className={`appearance-none rounded text-tBase relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm ${
                                        errors.confirmPassword
                                            ? 'border-red-500'
                                            : ''
                                    }`}
                                    placeholder="Confirm Password"
                                    disabled={signupMutation.isPending}
                                    autoComplete="new-password"
                                />
                                {errors.confirmPassword && (
                                    <span className="text-red-500 text-xs mt-1 block">
                                        {errors.confirmPassword.message}
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
                                    disabled={signupMutation.isPending}
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
                                disabled={signupMutation.isPending}
                            >
                                {signupMutation.isPending
                                    ? 'Signing up...'
                                    : 'Sign up'}
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
                                        ref={(el) => {
                                            otpRefs.current[idx] = el;
                                        }}
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
                                        onPaste={(e) => {
                                            const paste = e.clipboardData
                                                .getData('text')
                                                .replace(/\D/g, '');
                                            if (paste.length > 1) {
                                                // Fill as many OTP boxes as possible
                                                const newOtp = [...otp];
                                                for (
                                                    let i = 0;
                                                    i < 4 - idx &&
                                                    i < paste.length;
                                                    i++
                                                ) {
                                                    newOtp[idx + i] = paste[i];
                                                }
                                                setOtp(newOtp);
                                                // Focus the last filled input
                                                setTimeout(() => {
                                                    otpRefs.current[
                                                        Math.min(
                                                            idx +
                                                                paste.length -
                                                                1,
                                                            3
                                                        )
                                                    ]?.focus();
                                                }, 0);
                                                e.preventDefault();
                                            } else {
                                                handleOtpPaste(e);
                                            }
                                        }}
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

export default Signup;
