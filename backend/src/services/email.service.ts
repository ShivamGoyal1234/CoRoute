import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import config from '../config';

let transporter: nodemailer.Transporter | null = null;
let resendClient: Resend | null = null;

function getResend(): Resend | null {
  if (resendClient) return resendClient;
  if (!config.resend.apiKey) return null;
  resendClient = new Resend(config.resend.apiKey);
  return resendClient;
}

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;
  const { user, pass, host, port, secure } = config.smtp;
  if (!user || !pass) return null;
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
  const subject =
    purpose === 'register'
      ? 'Your CoRoute verification code'
      : 'Reset your CoRoute password';
  const text =
    purpose === 'register'
      ? `Your verification code is: ${otp}. It expires in 10 minutes.`
      : `Your password reset code is: ${otp}. It expires in 10 minutes. If you didn't request this, ignore this email.`;
  const html = `<p>${text.replace(otp, `<strong>${otp}</strong>`)}</p>`;


  const resend = getResend();
  if (resend) {
    const { error } = await resend.emails.send({
      from: config.resend.from,
      to: [to],
      subject,
      text,
      html,
    });
    if (error) throw new Error(`Resend: ${error.message}`);
    return;
  }

  const trans = getTransporter();
  if (!trans) {
    if (config.nodeEnv === 'development') {
      console.log(`[DEV] OTP for ${to} (${purpose}): ${otp}`);
    }
    return;
  }
  const sendPromise = trans.sendMail({
    from: config.smtp.from,
    to,
    subject,
    text,
    html,
  });
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Send mail timeout')), SEND_MAIL_TIMEOUT_MS)
  );
  await Promise.race([sendPromise, timeoutPromise]);
}
