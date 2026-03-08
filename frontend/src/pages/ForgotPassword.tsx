import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ThemeToggle } from '../components';
import { useLandingColors } from '../landing/theme';
import logoImg from '../assets/logo.svg';
import { authApi } from '../lib/api';

export default function ForgotPassword() {
  const colors = useLandingColors();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const navigate = useNavigate();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSendingCode(true);
    try {
      await authApi.forgotPassword(email.trim());
      setCodeSent(true);
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : undefined;
      setError(message ?? 'Failed to send reset code');
    } finally {
      setSendingCode(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.resetPassword(email.trim(), otp.trim(), newPassword);
      navigate('/login', { replace: true, state: { message: 'Password reset successfully. Please sign in.' } });
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : undefined;
      setError(message ?? 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-screen flex flex-col overflow-hidden" style={{ backgroundColor: colors.background }}>
      <div className="fixed bottom-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 lg:p-10 xl:p-12 min-h-0 overflow-y-auto">
        <div
          className="w-full max-w-md rounded-2xl overflow-hidden border border-dashed shadow-sm"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            boxShadow: '0 1px 3px 0 rgba(0,0,0,0.04)',
          }}
        >
          <div className="p-8 md:p-10">
            <Link to="/" className="flex flex-col items-center mb-8">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: colors.success }}
                >
                  <img src={logoImg} alt="" className="h-5 w-5 object-contain brightness-0 invert" />
                </div>
                <span className="font-bold text-xl tracking-tight" style={{ color: colors.text }}>
                  coRoute
                </span>
              </div>
              <span className="text-sm" style={{ color: colors.textMuted }}>
                Reset your password
              </span>
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="text-2xl font-bold mb-1" style={{ color: colors.text }}>
                Forgot Password?
              </h1>
              <p className="text-sm mb-6" style={{ color: colors.textMuted }}>
                {codeSent
                  ? 'Enter the code we sent to your email and your new password.'
                  : 'Enter your email and we’ll send you a reset code.'}
              </p>

              {!codeSent ? (
                <form onSubmit={handleSendCode} className="space-y-5">
                  {error && (
                    <div
                      className="p-3 rounded-lg text-sm"
                      style={{ backgroundColor: '#FEF2F2', color: '#B91C1C' }}
                    >
                      {error}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: colors.text }}>
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-shadow"
                        placeholder="name@company.com"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={sendingCode}
                    className="w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-95 disabled:opacity-50"
                    style={{
                      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryHeader} 100%)`,
                      boxShadow: '0 8px 24px 0 rgba(139, 92, 246, 0.3)',
                    }}
                  >
                    {sendingCode ? 'Sending…' : 'Send reset code'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-5">
                  {error && (
                    <div
                      className="p-3 rounded-lg text-sm"
                      style={{ backgroundColor: '#FEF2F2', color: '#B91C1C' }}
                    >
                      {error}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: colors.text }}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      readOnly
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: colors.text }}>
                      Reset code
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-shadow"
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: colors.text }}>
                      New password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-shadow"
                      placeholder="••••••••"
                    />
                    <p className="mt-1 text-xs" style={{ color: colors.textMuted }}>
                      At least 6 characters.
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-95 disabled:opacity-50"
                    style={{
                      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryHeader} 100%)`,
                      boxShadow: '0 8px 24px 0 rgba(139, 92, 246, 0.3)',
                    }}
                  >
                    {loading ? 'Resetting…' : 'Reset password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCodeSent(false)}
                    className="w-full text-sm font-medium"
                    style={{ color: colors.textMuted }}
                  >
                    Use a different email
                  </button>
                </form>
              )}

              <p className="mt-8 text-center text-sm" style={{ color: colors.textMuted }}>
                <Link to="/login" className="font-medium hover:underline" style={{ color: colors.primary }}>
                  Back to login
                </Link>
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
