import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ThemeToggle } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { useLandingColors } from '../landing/theme';
import logoImg from '../assets/logo.svg';

export default function Login() {
  const colors = useLandingColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : undefined;
      setError(message ?? 'Login failed');
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
                Shared Paths, Seamless Plans
              </span>
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="text-2xl font-bold mb-1" style={{ color: colors.text }}>
                Welcome Back
              </h1>
              <p className="text-sm mb-6" style={{ color: colors.textMuted }}>
                Please enter your details to access your account.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
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

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium" style={{ color: colors.text }}>
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-sm font-medium hover:underline"
                      style={{ color: colors.primary }}
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-shadow"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-full border-slate-300 text-[#8B5CF6] focus:ring-[#8B5CF6]/20"
                  />
                  <span className="text-sm" style={{ color: colors.textMuted }}>
                    Remember me for 30 days
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-95 disabled:opacity-50"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryHeader} 100%)`,
                    boxShadow: '0 8px 24px 0 rgba(139, 92, 246, 0.3)',
                  }}
                >
                  {loading ? 'Signing in…' : 'Sign In'}
                  {!loading && (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  )}
                </button>
              </form>

              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: colors.textMuted }}>
                  Or continue with
                </span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
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
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13 2.9 1.19 4.04-.95 4.04-.95-.03-.02 2.31-1.4 2.31-4.22-.02-2.8-2.28-4.66-4.32-4.69-1.36-.02-2.64.47-3.68 1.32-.52-.3-1.2-.5-1.9-.5-2.07 0-3.75 1.68-3.75 3.75 0 1.44.77 2.71 1.92 3.42-.07.24-.15.5-.15.78 0 2.06 1.67 3.73 3.73 3.73 2.06 0 3.73-1.67 3.73-3.73 0-.28-.02-.54-.07-.78 1.15-.71 1.92-1.98 1.92-3.42 0-2.07-1.68-3.75-3.75-3.75-.7 0-1.38.2-1.98.54-.98-.78-2.24-1.25-3.58-1.25z" />
                  </svg>
                  Apple
                </button>
              </div>

              <p className="mt-8 text-center text-sm" style={{ color: colors.textMuted }}>
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium hover:underline"
                  style={{ color: colors.primary }}
                >
                  Create an Account
                </Link>
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
