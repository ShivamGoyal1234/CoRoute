import { Response } from 'express';
import { validationResult } from 'express-validator';
import jwt, { SignOptions } from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import User from '../models/User';
import OtpToken from '../models/OtpToken';
import { AuthRequest } from '../middleware/auth.middleware';
import config from '../config';
import { getFileUrlAfterUpload } from '../storage';
import { sendOtpEmail } from '../services/email.service';
import type { OtpPurpose } from '../models/OtpToken';

const avatarFileFilter: multer.Options['fileFilter'] = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = /image\/(jpeg|jpg|png|gif|webp)/.test(file.mimetype);
  if (ext && mime) return cb(null, true);
  cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
};

export const uploadAvatar = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: avatarFileFilter,
});

const OTP_EXPIRY_MINUTES = 10;
const OTP_LENGTH = 6;

function generateOtp(): string {
  const digits = crypto.randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, '0');
  return digits.slice(-OTP_LENGTH);
}

export const sendOtp = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, purpose } = req.body as { email: string; purpose: OtpPurpose };

    if (purpose === 'register') {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }
    } else {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: 'No account found with this email' });
      }
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    await OtpToken.deleteMany({ email, purpose });
    await OtpToken.create({ email, otp, purpose, expiresAt });
    await sendOtpEmail(email, otp, purpose);

    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, otp, avatarUrl: avatarUrlBody } = req.body;
    const avatarUrl = req.file ? await getFileUrlAfterUpload(req.file) : avatarUrlBody;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const otpRecord = await OtpToken.findOne({ email, purpose: 'register' });
    if (!otpRecord || otpRecord.otp !== otp) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }
    if (new Date() > otpRecord.expiresAt) {
      await OtpToken.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ error: 'OTP has expired' });
    }
    await OtpToken.deleteOne({ _id: otpRecord._id });

    const user = new User({
      email,
      password,
      name,
      avatarUrl,
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as SignOptions
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as SignOptions
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, avatarUrl } = req.body;
    const userId = req.user?.userId;

    const user = await User.findByIdAndUpdate(
      userId,
      { name, avatarUrl },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Profile updated', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const forgotPassword = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email } = req.body as { email: string };
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email' });
    }
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    await OtpToken.deleteMany({ email, purpose: 'forgot_password' });
    await OtpToken.create({ email, otp, purpose: 'forgot_password', expiresAt });
    await sendOtpEmail(email, otp, 'forgot_password');
    res.json({ message: 'Password reset code sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to send reset code' });
  }
};

export const resetPassword = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, otp, newPassword } = req.body;
    const otpRecord = await OtpToken.findOne({ email, purpose: 'forgot_password' });
    if (!otpRecord || otpRecord.otp !== otp) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }
    if (new Date() > otpRecord.expiresAt) {
      await OtpToken.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ error: 'Code has expired' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    user.password = newPassword;
    await user.save();
    await OtpToken.deleteOne({ _id: otpRecord._id });
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};
