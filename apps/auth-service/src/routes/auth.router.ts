import express, { Router } from 'express';
import {
  loginUser,
  userForgotPassword,
  userRegisteration,
  verifyUser,
} from '../controllers/auth.controller';
import {
  resetUserPassword,
  verifyUserForgotPassword,
} from '../utils/auth.helper';
// import { loginUser } from '../utils/auth.helper';

const router: Router = express.Router();

router.post('/user-registration', userRegisteration);

router.post('/verify-registration', verifyUser);

router.post('/login-user', loginUser);

router.post('/forgot-password-user', userForgotPassword);

router.post('/reset-password-user', resetUserPassword);

router.post('/verify-forgot-password-user', verifyUserForgotPassword);

export default router;
