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
