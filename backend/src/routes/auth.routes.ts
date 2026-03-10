import { Router, RequestHandler } from 'express';
import {
  sendOtp,
  register,
  login,
  getMe,
  updateProfile,
  uploadAvatar,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import {
  validateSendOtp,
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
} from '../utils/validators';

const router = Router();

router.post('/send-otp', validateSendOtp, sendOtp);
router.post('/register', uploadAvatar.single('avatar') as unknown as RequestHandler, validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/reset-password', validateResetPassword, resetPassword);

router.get('/me', authenticate, getMe);
router.put(
  '/profile',
  authenticate,
  uploadAvatar.single('avatar') as unknown as RequestHandler,
  updateProfile
);

export default router;
