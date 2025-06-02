/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import {
  checkOtpRestrictions,
  handleForgotPassword,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
  verifyOtp,
} from '../utils/auth.helper';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
// eslint-disable-next-line @nx/enforce-module-boundaries
// import prisma from '@packages/libs/prisma';
import prisma from '@packages/libs/prisma';
import { AppAuthenticationError } from '@packages/error-handler';
import { setCookie } from '../utils/cookies/setCookie';
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

    await checkOtpRestrictions(email, next);
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

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppValidationError('must fill all fields'));
  }
  const user = await prisma.users.findUnique({ where: { email } });
  if (!user) {
    return next(
      new AppAuthenticationError('user doesnt exist , please sign in')
    );
  }

  if (!(await bcrypt.compare(password, user.password))) {
    return next(new AppAuthenticationError('invalid password'));
  }

  //generating access and refresh token
  const accessToken = jwt.sign(
    { id: user.id, role: 'user' },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { id: user.id, role: 'user' },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: '7d' }
  );

  //storing tokens in http only secure cookie
  setCookie(res, 'refresh-token', refreshToken);

  setCookie(res, 'access-token', accessToken);

  res.status(200).json({
    success: true,
    message: ' login successfull ',
    user: user,
  });
};

export const userForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await handleForgotPassword(req, res, next, 'user');
};
