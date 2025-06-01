/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import {
  checkOtpRegistration,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
  verifyOtp,
} from '../utils/auth.helper';
import bcrypt from 'bcryptjs';
// eslint-disable-next-line @nx/enforce-module-boundaries
// import prisma from '@packages/libs/prisma';
import prisma from '@packages/libs/prisma';
// eslint-disable-next-line @nx/enforce-module-boundaries
const { AppValidationError } = require('@packages/error-handler');
// import prisma from "../../../../packages/libs/prisma";

export const userRegisteration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, 'user');
    const { name, email, password } = req.body;
    console.log(password);
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppValidationError('user already exists with this email');
    }

    await checkOtpRegistration(email, next);
    await trackOtpRequests(email, next);
    await sendOtp(name, email, 'user-activation-mail');

    res.status(200).json({
      message: 'otp sent to email , please verify your account',
    });
  } catch (error) {
    return next(error);
  }
};

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, password, name } = req.body;
    if (!email || !otp || !password || !name) {
      throw new AppValidationError('all fields are required');
    }
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppValidationError('user already exists with this email');
    }

    await verifyOtp(email, otp, next);
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.users.create({
      data: { name, email, password: hashedPassword },
    });

    res.status(200).json({
      success: true,
      message: 'user registered',
    });
  } catch (err) {
    return next(err);
  }
};
