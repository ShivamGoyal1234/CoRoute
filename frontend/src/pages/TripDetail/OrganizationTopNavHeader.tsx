import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { getInitials } from '../../utils/helpers';
import { useLandingColors } from '../../landing/theme';
import type { SectionId } from './types';

function formatNotificationTime(timestamp: string) {
  const d = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  if (diffMs < 60000) return 'Just now';
  if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`;
  if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)}h ago`;
  return d.toLocaleDateString();
}

const TOP_NAV: { id?: SectionId; label: string; href?: string }[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { id: 'itinerary', label: 'Itinerary' },
  { id: 'budgeting', label: 'Budget' },
  { id: 'organization', label: 'Organization' },
  { id: 'shared-map', label: 'Shared Map' },
];

interface OrganizationTopNavHeaderProps {
  tripId: string;
  tripTitle: string;
  section: SectionId;
  onSectionChange: (s: SectionId) => void;
  onUploadClick: () => void;
  showLogout: boolean;
  onLogoutToggle: () => void;
  onLogout: () => void;
}

export function OrganizationTopNavHeader({
  tripId,
  tripTitle,
  section,
  onSectionChange,
  onUploadClick: _onUploadClick,
  showLogout,
  onLogoutToggle,
  onLogout,
}: OrganizationTopNavHeaderProps) {
  const colors = useLandingColors();
  const { user: currentUser } = useAuth();
  const {
    notifications,
    unreadNotificationCount,
    markAllNotificationsRead,
  } = useSocket();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!notificationOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificationOpen]);

  const handleBellClick = () => {
    setNotificationOpen((open) => !open);
    if (!notificationOpen) markAllNotificationsRead();
  };

  return (
    <header
      className="relative shrink-0 flex items-center justify-between gap-6 px-6 h-14 border-b border-t"
      style={{
        borderTopColor: colors.border,
        borderBottomColor: colors.border,
        backgroundColor: colors.surface,
      }}
    >
      <div className="flex items-center gap-4 min-w-0 flex-1 h-9">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: colors.primary }}
        >
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-2-1.5V6l2-1.5 2 1.5v12.5L9 20zm-6-1.5l2-1.5V4.5L3 6v12.5zm12 0l2-1.5V4.5L21 6v12.5l-2 1.5z" />
          </svg>
        </div>
        <span className="font-bold text-base shrink-0 leading-9 truncate max-w-[200px] sm:max-w-[280px]" style={{ color: colors.text }} title={tripTitle}>
          {tripTitle}
        </span>
        <nav
          className="flex items-center gap-0.5 shrink-0 h-9 ml-2"
          aria-label="Trip sections"
        >
          {TOP_NAV.filter((item) => item.id != null).map(({ id, label }) => {
            const isActive = section === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => id && onSectionChange(id)}
                className="px-4 h-9 flex items-center text-sm font-medium transition-colors relative"
                style={{
                  color: isActive ? colors.primary : colors.text,
                }}
              >
                {label}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                    style={{ backgroundColor: colors.primary }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-3 shrink-0 flex-1 justify-end h-9">
        <div className="relative shrink-0" ref={notificationRef}>
          <button
            type="button"
            onClick={handleBellClick}
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-opacity hover:opacity-90 focus:outline-none relative"
            style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', color: colors.primary }}
            title="Notifications"
            aria-label="Notifications"
            aria-expanded={notificationOpen}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadNotificationCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ backgroundColor: colors.primary }}
              >
                {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
              </span>
            )}
          </button>
          {notificationOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-80 max-h-[min(24rem,70vh)] flex flex-col rounded-xl border shadow-xl z-50 overflow-hidden"
              style={{ borderColor: colors.border, backgroundColor: colors.surface }}
            >
              <div
                className="shrink-0 px-4 py-3 border-b flex items-center justify-between"
                style={{ borderColor: colors.border }}
              >
                <span className="text-sm font-semibold" style={{ color: colors.text }}>
                  Notifications
                </span>
                {notifications.length > 0 && (
                  <span className="text-xs" style={{ color: colors.textMuted }}>
                    {notifications.length} total
                  </span>
                )}
              </div>
              <div className="flex-1 overflow-y-auto min-h-0">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-sm" style={{ color: colors.textMuted }}>
                      No notifications yet
                    </p>
                    <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
                      Updates from your team will appear here
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y" style={{ borderColor: colors.border }}>
                    {[...notifications].reverse().map((n) => (
                      <li
                        key={n.id}
                        className="flex gap-3 px-4 py-3 transition-colors"
                        style={{ backgroundColor: 'transparent' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.background; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <div
                          className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold"
                          style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', color: colors.primary }}
                        >
                          {getInitials(n.actorName)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium" style={{ color: colors.text }}>
                            {n.title}
                          </p>
                          {n.body && (
                            <p className="text-xs mt-0.5 line-clamp-2" style={{ color: colors.textMuted }}>
                              {n.body}
                            </p>
                          )}
                          <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
                            {n.actorName} · {formatNotificationTime(n.timestamp)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
        <Link
          to={`/settings?tripId=${tripId}`}
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-opacity hover:opacity-90 focus:outline-none"
          style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', color: colors.primary }}
          title="Settings"
          aria-label="Settings"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Link>
        {currentUser && (
          <div
className="relative flex items-center gap-2 pl-2 border-l"
            style={{ borderColor: colors.border }}
          >
            <button
              type="button"
              className="relative w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium shrink-0 focus:outline-none overflow-visible border-2"
              style={{ borderColor: colors.border, backgroundColor: '#e8d5c4' }}
              title={currentUser.email}
              onClick={onLogoutToggle}
            >
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="font-medium" style={{ color: colors.text }}>{getInitials(currentUser.name)}</span>
              )}
            </button>
            {showLogout && (
              <div
                className="absolute right-0 top-[110%] z-50 border rounded-lg shadow-lg min-w-[120px] py-2"
                style={{ borderColor: colors.border, backgroundColor: colors.surface }}
              >
                <button
                  className="w-full text-left px-4 py-2 text-sm transition-colors"
                  style={{ color: colors.text }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.background; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  onClick={() => {
                    onLogoutToggle();
                    onLogout();
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
