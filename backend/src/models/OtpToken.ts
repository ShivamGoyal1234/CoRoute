import mongoose, { Schema, Document } from 'mongoose';

export type OtpPurpose = 'register' | 'forgot_password';

export interface IOtpToken extends Document {
  email: string;
  otp: string;
  purpose: OtpPurpose;
  expiresAt: Date;
  createdAt: Date;
}

const otpTokenSchema = new Schema<IOtpToken>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    otp: { type: String, required: true },
    purpose: { type: String, required: true, enum: ['register', 'forgot_password'] },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

otpTokenSchema.index({ email: 1, purpose: 1 });
otpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IOtpToken>('OtpToken', otpTokenSchema);
