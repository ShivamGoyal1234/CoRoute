import { Link } from 'react-router-dom';
import type { useLandingColors } from '../theme';
import logoImg from '../../assets/logo.svg';

type Colors = ReturnType<typeof useLandingColors>;

export function LandingHeader({ colors }: { colors: Colors }) {
  return (
    <header
      className="sticky top-0 z-50 border-b border-slate-200/60"
      style={{ backgroundColor: colors.headerBg }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden"
            style={{ backgroundColor: colors.primaryHeader }}
          >
            <img src={logoImg} alt="" className="h-5 w-5 object-contain brightness-0 invert" />
          </div>
          <span className="font-bold text-lg tracking-tight" style={{ color: colors.text }}>
            coRoute
          </span>
        </Link>
        <nav className="flex items-center gap-6 sm:gap-8">
          <a href="#features" className="text-sm font-normal hover:opacity-80 transition-opacity" style={{ color: colors.navLink }}>
            Features
          </a>
          <a href="#cta" className="text-sm font-normal hover:opacity-80 transition-opacity" style={{ color: colors.navLink }}>
            Community
          </a>
          <a href="#pricing" className="text-sm font-normal hover:opacity-80 transition-opacity" style={{ color: colors.navLink }}>
            Pricing
          </a>
          <div className="flex gap-2">
            <Link
              to="/login"
              className="text-sm font-medium px-5 py-2.5 rounded-xl transition-opacity hover:opacity-90"
              style={{ backgroundColor: colors.logInBg, color: colors.primaryHeader }}
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="inline-flex font-medium items-center px-5 py-2.5 rounded-xl text-white transition-opacity hover:opacity-95"
              style={{
                backgroundColor: colors.primary,
                boxShadow: '0 8px 24px 0 rgba(139, 92, 246, 0.3), 0 6px 24px -4px rgba(0,0,0,0.10)',
              }}
            >
              Get Started
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
