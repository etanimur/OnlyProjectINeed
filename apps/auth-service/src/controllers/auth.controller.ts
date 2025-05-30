import { NextFunction, Request, Response } from 'express';
import {
  checkOtpRegistration,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
} from '../utils/auth.helper';

// eslint-disable-next-line @nx/enforce-module-boundaries
import prisma from '../../../../packages/libs/prisma';

// eslint-disable-next-line @nx/enforce-module-boundaries
import { AppValidationError } from '../../../../packages/error-handler';
// import prisma from "../../../../packages/libs/prisma";

export const userRegisteration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, 'user');
    const { name, email } = req.body;

    const existingUser = await prisma.users.findUnique({ where: email });
    if (existingUser) {
      throw new AppValidationError('user already exists with this email');
    }

    await checkOtpRegistration(email, next);
    await trackOtpRequests(email, next);
    await sendOtp(email, name, 'user-activation-mail');
    res.status(200).json({
      message: 'otp sent to email , please verify your account',
    });
  } catch (error) {
    return next(error);
  }
};
