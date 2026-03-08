import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Logo, ThemeToggle } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLandingColors } from '../landing/theme';
import logoImg from '../assets/Logos/log.svg';
import darkLogoImg from '../assets/Logos/dark_logo.svg';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const MAX_AVATAR_SIZE_MB = 2;

const features = (colors: ReturnType<typeof useLandingColors>) => [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    iconBg: colors.primary,
    text: 'Plan your first trip in minutes.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    iconBg: colors.accent,
    text: 'Collaborate in real-time with friends.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    iconBg: colors.success,
    text: 'Seamless route optimization.',
  },
];

export default function Register() {
  const colors = useLandingColors();
  const { effectiveTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const { sendOtp, register } = useAuth();
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    setError('');
    setSendingOtp(true);
    try {
      await sendOtp(email.trim(), 'register');
      setOtpSent(true);
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : undefined;
      setError(message ?? 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setProfilePic(null);
      setProfilePicPreview(null);
      return;
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError('Please choose a JPEG, PNG, GIF, or WebP image.');
      return;
    }
    if (file.size > MAX_AVATAR_SIZE_MB * 1024 * 1024) {
      setError(`Profile picture must be under ${MAX_AVATAR_SIZE_MB}MB.`);
      return;
    }
    setError('');
    setProfilePic(file);
    const reader = new FileReader();
    reader.onloadend = () => setProfilePicPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveProfilePic = () => {
    setProfilePic(null);
    setProfilePicPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent || !otp.trim()) {
      setError('Please request and enter the verification code from your email.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(email, password, name, otp.trim(), profilePic ?? undefined);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : undefined;
      setError(message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-screen flex flex-col overflow-hidden" style={{ backgroundColor: colors.background }}>
      <div className="fixed bottom-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <div className="flex-1 flex items-center justify-center p-6 md:p-8 lg:p-10 xl:p-12 min-h-0">
        <div
          className="flex w-full max-w-5xl h-full max-h-[90vh] rounded-2xl overflow-hidden border border-dashed shadow-sm min-h-[min(32rem,90vh)]"
          style={{
            borderColor: colors.border,
            boxShadow: '0 1px 3px 0 rgba(0,0,0,0.04)',
          }}
        >
          <div
            className="hidden lg:flex lg:flex-1 flex-col justify-between p-10 xl:p-14 min-h-0"
            style={{
              background: `linear-gradient(135deg, #FAFAFA 0%, #F5F3FF 50%, #EDE9FE 100%)`,
            }}
          >
        <Link to="/" className="flex items-center gap-2 w-fit">
          <img src={effectiveTheme === 'dark' ? darkLogoImg : logoImg} alt="" className="h-16 w-24 md:h-20 md:w-48 object-contain flex-shrink-0" />
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md"
        >
          <h1
            className="text-3xl xl:text-4xl font-bold tracking-tight leading-tight mb-4"
            style={{ color: colors.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Start your next{' '} <br/>
            <span style={{ color: colors.primary, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              adventure together.
            </span>
          </h1>
          <p className="text-base mb-8" style={{ color: colors.textMuted }}>
            CoRoute helps you and your friends build the perfect itinerary, split costs, and share memories.
          </p>
            <ul className="space-y-5">
            {features(colors).map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + i * 0.08 }}
                className="flex items-center gap-4"
              >
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white"
                  style={{ backgroundColor: item.iconBg }}
                >
                  {item.icon}
                </span>
                <span className="text-sm font-medium" style={{ color: colors.text }}>
                  {item.text}
                </span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
        <div aria-hidden className="h-8" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:py-16 overflow-y-auto min-h-0" style={{ backgroundColor: colors.surface }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[400px]"
        >
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/">
              <Logo size="lg" />
            </Link>
          </div>

          <h2 className="text-2xl font-bold mb-1" style={{ color: colors.text }}>
            Create Account
          </h2>
          <p className="text-sm mb-8" style={{ color: colors.textMuted }}>
            Join thousands of travelers planning better.
          </p>

          <form onSubmit={handleSubmit} className="register-form space-y-5">
            <style>{`.register-form input::placeholder { color: ${colors.textMuted}; }.register-form input[type="email"]:focus,.register-form input[type="password"]:focus,.register-form input[type="text"]:focus { border-color: #8B5CF6 !important; background-color: ${colors.surface} !important; }`}</style>
            {error && (
              <div
                className="p-3 rounded-lg text-sm"
                style={{ backgroundColor: effectiveTheme === 'dark' ? 'rgba(185, 28, 28, 0.25)' : '#FEF2F2', color: effectiveTheme === 'dark' ? '#FCA5A5' : '#B91C1C' }}
              >
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: colors.text }}>
                Email Address
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: colors.textMuted }} aria-hidden>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    readOnly={otpSent}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 transition-shadow disabled:opacity-70"
                    style={{ color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }}
                    placeholder="name@company.com"
                  />
                </div>
                {!otpSent ? (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp}
                    className="py-2.5 px-4 rounded-lg font-medium text-white whitespace-nowrap disabled:opacity-50"
                    style={{ background: colors.primary }}
                  >
                    {sendingOtp ? 'Sending…' : 'Send OTP'}
                  </button>
                ) : null}
              </div>
              {otpSent && (
                <p className="mt-1 text-xs" style={{ color: colors.textMuted }}>
                  Verification code sent. Check your inbox.
                </p>
              )}
            </div>

            {otpSent && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: colors.text }}>
                    Verification code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 transition-shadow"
                    style={{ color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }}
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: colors.text }}>
                    Full Name
                  </label>
                  <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: colors.textMuted }} aria-hidden>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 transition-shadow"
                  style={{ color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }}
                  placeholder="John Doe"
                />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: colors.text }}>
                    Profile picture (optional)
                  </label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES.join(',')}
                  onChange={handleProfilePicChange}
                  className="hidden"
                  id="profile-pic-input"
                />
                <label
                  htmlFor="profile-pic-input"
                  className="flex-shrink-0 w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer hover:border-[#8B5CF6] hover:bg-[#8B5CF6]/5 transition-colors overflow-hidden"
                  style={{ borderColor: profilePicPreview ? 'transparent' : colors.border, backgroundColor: colors.headerBg }}
                >
                  {profilePicPreview ? (
                    <img src={profilePicPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-7 h-7" style={{ color: colors.textMuted }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </label>
                <div className="min-w-0 flex-1">
                  <p className="text-sm" style={{ color: colors.textMuted }}>
                    {profilePic ? profilePic.name : 'Upload from your device'}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>
                    JPEG, PNG, GIF or WebP. Max {MAX_AVATAR_SIZE_MB}MB.
                  </p>
                  {profilePic && (
                    <button
                      type="button"
                      onClick={handleRemoveProfilePic}
                      className="mt-1.5 text-sm font-medium hover:underline"
                      style={{ color: colors.primary }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: colors.text }}>
                    Password
                  </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: colors.textMuted }} aria-hidden>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 transition-shadow"
                  style={{ color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }}
                  placeholder="••••••••"
                />
              </div>
              <p className="mt-1.5 text-xs" style={{ color: colors.textMuted }}>
                Must be at least 8 characters long.
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
                  {loading ? 'Creating account…' : 'Create Account'}
                  {!loading && (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  )}
                </button>
              </>
            )}
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ backgroundColor: colors.border }} />
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: colors.textMuted }}>
              Or continue with
            </span>
            <div className="flex-1 h-px" style={{ backgroundColor: colors.border }} />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              className="flex-1 py-2.5 rounded-xl border font-medium transition-colors flex items-center justify-center gap-2"
              style={{ borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button
              type="button"
              className="flex-1 py-2.5 rounded-xl border font-medium transition-colors flex items-center justify-center gap-2"
              style={{ borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13 2.9 1.19 4.04-.95 4.04-.95-.03-.02 2.31-1.4 2.31-4.22-.02-2.8-2.28-4.66-4.32-4.69-1.36-.02-2.64.47-3.68 1.32-.52-.3-1.2-.5-1.9-.5-2.07 0-3.75 1.68-3.75 3.75 0 1.44.77 2.71 1.92 3.42-.07.24-.15.5-.15.78 0 2.06 1.67 3.73 3.73 3.73 2.06 0 3.73-1.67 3.73-3.73 0-.28-.02-.54-.07-.78 1.15-.71 1.92-1.98 1.92-3.42 0-2.07-1.68-3.75-3.75-3.75-.7 0-1.38.2-1.98.54-.98-.78-2.24-1.25-3.58-1.25z" />
              </svg>
              Apple
            </button>
          </div>

          <p className="mt-8 text-center text-sm" style={{ color: colors.textMuted }}>
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium hover:underline"
              style={{ color: colors.primary }}
            >
              Login here
            </Link>
          </p>

          <p className="mt-6 text-center text-xs" style={{ color: colors.textMuted }}>
            By signing up, you agree to our{' '}
            <Link to="/terms" className="underline hover:opacity-80" style={{ color: colors.textMuted }}>
              Terms
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="underline hover:opacity-80" style={{ color: colors.textMuted }}>
              Privacy Policy
            </Link>
            .
          </p>
        </motion.div>
      </div>
        </div>
      </div>
    </div>
  );
}
