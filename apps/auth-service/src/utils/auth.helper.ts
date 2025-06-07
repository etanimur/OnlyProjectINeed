/* eslint-disable @nx/enforce-module-boundaries */
import { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { AppValidationError } from '@packages/error-handler';
import redis from '@packages/libs/redis';
import prisma from '@packages/libs/prisma';
import { sendEmail } from './sendMail';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegistrationData = (
    data: any,
    userType: 'user' | 'seller'
) => {
    const { name, email, password, confirmPassword, country, phone_number } =
        data;

    if (
        !name ||
        !email ||
        !password ||
        !confirmPassword ||
        (userType === 'seller' && (!phone_number || !country))
    ) {
        throw new AppValidationError('missing required fields');
    }
    if (!emailRegex.test(email)) {
        throw new AppValidationError('Invalid email format');
    }
};

export const trackOtpRequests = async (email: string, next: NextFunction) => {
    const otpRequestKey = `otp_request_count:${email}`;
    const otpRequests = parseInt((await redis.get(otpRequestKey)) || '0');
    if (otpRequests >= 2) {
        await redis.set(`otp_spam_lock:${email}`, 'locked', 'EX', 3600); //lock for an hour
        return next(
            new AppValidationError(
                'too many requests placed, wait 1 hour before trying again'
            )
        );
    }
    await redis.set(otpRequestKey, otpRequests + 1, 'EX', 3600);
    // await redis.incr(otpRequestKey, 'EX', 3600);
};

export const checkOtpRestrictions = async (
    email: string,
    next: NextFunction
) => {
    if (await redis.get(`otp_lock:${email}`)) {
        return next(
            new AppValidationError(
                ' try again later, account blocked for 30mins'
            )
        );
    }
    if (await redis.get(`otp_spam_lock:${email}`)) {
        return next(
            new AppValidationError(
                'Too many attempts please try again after 1 hours '
            )
        );
    }
    if (await redis.get(`otp_cooldown:${email}`)) {
        return next(
            new AppValidationError('Please wait a minute before try again')
        );
    }
};

export const sendOtp = async (
    name: string,
    email: string,
    tempalte: string
) => {
    const otp = crypto.randomInt(1000, 9999).toString();
    await sendEmail(email, 'Verify Your Email', tempalte, { name, otp });
    redis.set(`otp:${email}`, otp, 'EX', 300); // Sets key with 5 min expiry
    redis.set(`otp_cooldown${email}`, 'true', 'EX', 60);
};

export const verifyOtp = async (
    email: string,
    otp: string,
    next: NextFunction
) => {
    const storedOtp = await redis.get(`otp:${email}`);
    console.log('stored otp : ', storedOtp);

    console.log('otp got from functions : ', otp);

    if (!storedOtp) {
        throw new AppValidationError('expiired or invalid otp');
    }
    const failedAttemptsKey = `otp_attempts:${email}`;
    const failedAttempts = parseInt(
        (await redis.get(failedAttemptsKey)) || '0'
    );

    if (storedOtp != otp) {
        console.log('incorrect otp');
        if (failedAttempts >= 2) {
            await redis.set(`otp_lock:${email}`, 'locked', 'EX', 1800);

            await redis.del(`otp:${email}`, failedAttemptsKey);

            throw new AppValidationError(
                ' Too many attempts try again later  ( 30 mins ) '
            );
        }
        await redis.set(failedAttemptsKey, failedAttempts + 1, 'EX', 300);
        return next(
            new AppValidationError(
                `Incorrect Otp , only ${2 - failedAttempts} attempts left `
            )
        );
        await redis.del(failedAttemptsKey);
    }
};

export const handleForgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
    role: 'user' | 'seller'
) => {
    try {
        const { email } = req.body;
        const user =
            role === 'user' &&
            (await prisma.users.findUnique({ where: { email } }));
        if (!user) {
            return next(new AppValidationError('user doesnt exists'));
        }

        await checkOtpRestrictions(email, next);
        await trackOtpRequests(email, next);
        await sendOtp(user.name, email, 'forgot-password-user-mail');
        res.status(200).json({
            success: true,
            message: 'otp sent to mail , please verify you account',
        });
    } catch (err) {
        next(err);
    }
};

export const verifyUserForgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return next(new AppValidationError('invalid request'));
    }
    await verifyOtp(email, otp, next);
    res.status(200).json({
        success: true,
        message: 'otp verified',
    });
};

export const resetUserPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            next(new AppValidationError('All fields are necessary'));
        }
        const user = await prisma.users.findUnique({ where: { email } });
        if (!user) {
            return next(new AppValidationError('user not found'));
        }

        const oldPassword = user.password;
        if (!(await bcrypt.compare(password, oldPassword))) {
            next(
                new AppValidationError(
                    'new password cannot be same as the old password'
                )
            );
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.users.update({
            where: { email },
            data: { password: hashedPassword },
        });

        res.status(200).json({
            sucess: true,
            message: 'password reset successfully',
        });
    } catch (err) {
        next(err);
    }
};
