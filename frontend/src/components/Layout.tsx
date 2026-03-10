import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, NavLink, useLocation } from 'react-router-dom';
import { ThemeToggle } from './index';
import { TripNotificationToaster } from './TripNotificationToaster';
import { useAuth } from '../contexts/AuthContext';
import { getInitials } from '../utils/helpers';
import { useTheme } from '../contexts/ThemeContext';
import { useLandingColors } from '../landing/theme';
import logoImg from '../assets/Logos/log.svg';
import darkLogoImg from '../assets/Logos/dark_logo.svg';

function isTripDetailPath(pathname: string): boolean {
  return /^\/trips\/[^/]+$/.test(pathname);
}

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/profile', label: 'Profile', icon: 'user' },
  { to: '/shared', label: 'Shared with Me', icon: 'shared' },
  { to: '/archived', label: 'Archived', icon: 'archive' },
];

function NavIcon({ name }: { name: string }) {
  const className = 'w-5 h-5 shrink-0';
  switch (name) {
    case 'dashboard':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      );
    case 'trips':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0h.5a2.5 2.5 0 002.5-2.5V8m0 4.065v-1.13a2 2 0 00-1.293-1.852l-.615-.205a2 2 0 01-1.292-1.852V5.5M8 3.935a2 2 0 00-2 2v.065M8 12v4m4-4v4m4-4v2.945M20.945 13H19a2 2 0 00-2 2v1a2 2 0 01-2 2 2 2 0 01-2-2v-2.945M16 20.065v-1.13a2 2 0 011.293-1.852l.615-.205a2 2 0 001.292-1.852V16" />
        </svg>
      );
    case 'shared':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    case 'archive':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      );
    case 'user':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 20a6 6 0 1112 0H6z" />
        </svg>
      );
    default:
      return null;
  }
}

export const Layout = () => {
  const { user, logout } = useAuth();
  const { effectiveTheme } = useTheme();
  const location = useLocation();
  const isTripBuilder = isTripDetailPath(location.pathname);
  const colors = useLandingColors();
  const logoSrc = effectiveTheme === 'dark' ? darkLogoImg : logoImg;
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

  return (
    <div
      className="h-screen flex overflow-hidden transition-colors"
      style={{ backgroundColor: colors.background }}
    >
      {user && !isTripBuilder && (
        <aside
          className="w-56 shrink-0 flex flex-col border-r"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <div className="p-4 border-b" style={{ borderColor: colors.border }}>
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <img src={logoSrc} alt="" className="h-16 w-24 md:h-20 md:w-48 object-contain" />
            </Link>
          </div>
          <nav className="flex-1 py-4 px-3 flex flex-col gap-0.5">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? '' : 'hover:opacity-90'}`}
                style={({ isActive }) =>
                  isActive
                    ? { backgroundColor: '#8B5CF6', color: '#fff' }
                    : { color: colors.textMuted }}
              >
                {({ isActive }) => (
                  <>
                    <span style={isActive ? { color: '#fff' } : undefined}>
                      <NavIcon name={item.icon} />
                    </span>
                    {item.label}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="p-3 border-t space-y-1" style={{ borderColor: colors.border }}>
            <Link
              to="/settings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
              style={{ color: colors.textMuted }}
            >
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Link>
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((o) => !o)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-opacity hover:opacity-90 focus:outline-none"
                style={{ backgroundColor: colors.background }}
                aria-expanded={profileOpen}
                aria-haspopup="true"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0"
                  style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', color: colors.primaryHeader }}
                  title={user.email}
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    getInitials(user.name)
                  )}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-sm font-medium truncate" style={{ color: colors.text }}>
                    {user.name}
                  </p>
                  <p className="text-xs truncate" style={{ color: colors.textMuted }}>
                    Premium Plan
                  </p>
                </div>
                <svg
                  className={`w-4 h-4 shrink-0 transition-transform ${profileOpen ? 'rotate-180' : ''}`}
                  style={{ color: colors.textMuted }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {profileOpen && (
                <div
                  className="absolute bottom-full left-0 right-0 mb-1 py-1 rounded-lg border shadow-lg z-50"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors hover:opacity-90 text-left focus:outline-none rounded-lg"
                    style={{ color: colors.textMuted }}
                  >
                    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>
      )}

      <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
        {user && <TripNotificationToaster />}
        <main className={`flex-1 min-h-0 ${isTripBuilder ? 'p-0 overflow-hidden' : 'p-6 overflow-y-auto'}`}>
          <Outlet />
        </main>
        {user && !isTripBuilder && (
          <div className="absolute bottom-4 right-4">
            <ThemeToggle />
          </div>
        )}
      </div>
    </div>
  );
};
