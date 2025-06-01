/* eslint-disable @nx/enforce-module-boundaries */
import crypto from 'crypto';
import { AppValidationError } from '../../../../packages/error-handler';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
import redis from '../../../../packages/libs/redis';
import { sendEmail } from './sendMail';
import { NextFunction } from 'express';

export const validateRegistrationData = (
  data: any,
  userType: 'user' | 'seller'
) => {
  const { name, email, password, country, phone_number } = data;

  if (
    !name ||
    !email ||
    !password ||
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
export const checkOtpRegistration = async (
  email: string,
  next: NextFunction
) => {
  if (await redis.get(`otp_lock:${email}`)) {
    return next(
      new AppValidationError(' try again later, account blocked for 30mins')
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
  const failedAttempts = parseInt((await redis.get(failedAttemptsKey)) || '0');

  if (storedOtp != otp) {
    console.log('incorrect otp');
    if (failedAttempts >= 2) {
      await redis.set(`otp_lock:${email}`, 'locked', 'EX', 1800);

      await redis.del(`otp:${email}`, failedAttemptsKey);

      return next(
        new AppValidationError(
          ' Too many attempts try again later  ( 30 mins ) '
        )
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
