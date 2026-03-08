import nodemailer from 'nodemailer';
import config from '../config';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;
  const { user, pass, host, port, secure } = config.smtp;
  if (!user || !pass) {
    console.warn('SMTP not configured (SMTP_USER/SMTP_PASS missing). OTP emails will not be sent.');
    return null;
  }
  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
  return transporter;
}

const SEND_MAIL_TIMEOUT_MS = 20000;

export async function sendOtpEmail(to: string, otp: string, purpose: 'register' | 'forgot_password'): Promise<void> {
  const trans = getTransporter();
  if (!trans) {
    if (config.nodeEnv === 'development') {
      console.log(`[DEV] OTP for ${to} (${purpose}): ${otp}`);
    }
    return;
  }
  const subject =
    purpose === 'register'
      ? 'Your CoRoute verification code'
      : 'Reset your CoRoute password';
  const text =
    purpose === 'register'
      ? `Your verification code is: ${otp}. It expires in 10 minutes.`
      : `Your password reset code is: ${otp}. It expires in 10 minutes. If you didn't request this, ignore this email.`;
  const sendPromise = trans.sendMail({
    from: config.smtp.from,
    to,
    subject,
    text,
    html: `<p>${text.replace(otp, `<strong>${otp}</strong>`)}</p>`,
  });
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Send mail timeout')), SEND_MAIL_TIMEOUT_MS)
  );
  await Promise.race([sendPromise, timeoutPromise]);
}
