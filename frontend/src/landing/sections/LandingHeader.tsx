import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import type { useLandingColors } from '../theme';
import logoImg from '../../assets/Logos/log.svg';
import darkLogoImg from '../../assets/Logos/dark_logo.svg';

type Colors = ReturnType<typeof useLandingColors>;

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#cta', label: 'Community' },
  { href: '#pricing', label: 'Pricing' },
];

export function LandingHeader({ colors }: { colors: Colors }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { effectiveTheme } = useTheme();
  const logoSrc = effectiveTheme === 'dark' ? darkLogoImg : logoImg;

  return (
    <header
      className="sticky top-0 z-50 border-b border-slate-200/60"
      style={{ backgroundColor: colors.headerBg }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img
            src={logoSrc}
            alt="CoRoute logo"
            className="h-16 w-24 md:h-20 md:w-48 object-contain"
          />
        </Link>
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-sm font-normal hover:opacity-80 transition-opacity"
              style={{ color: colors.navLink }}
            >
              {label}
            </a>
          ))}
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

        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="md:hidden p-2 rounded-lg hover:opacity-80 transition-opacity"
          style={{ color: colors.text }}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile nav dropdown */}
      {menuOpen && (
        <div
          className="md:hidden border-t border-slate-200/60 px-4 py-4 flex flex-col gap-3"
          style={{ backgroundColor: colors.headerBg, borderColor: colors.border }}
        >
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="text-sm font-normal py-2 hover:opacity-80 transition-opacity"
              style={{ color: colors.navLink }}
            >
              {label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t" style={{ borderColor: colors.border }}>
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium py-3 rounded-xl text-center transition-opacity hover:opacity-90"
              style={{ backgroundColor: colors.logInBg, color: colors.primaryHeader }}
            >
              Log In
            </Link>
            <Link
              to="/register"
              onClick={() => setMenuOpen(false)}
              className="inline-flex font-medium items-center justify-center py-3 rounded-xl text-white transition-opacity hover:opacity-95"
              style={{
                backgroundColor: colors.primary,
                boxShadow: '0 8px 24px 0 rgba(139, 92, 246, 0.3), 0 6px 24px -4px rgba(0,0,0,0.10)',
              }}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
