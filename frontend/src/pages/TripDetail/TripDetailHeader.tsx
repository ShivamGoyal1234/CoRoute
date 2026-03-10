import { useRef, useEffect, useState } from 'react';
import type { Trip, Membership } from '../../types';
import { formatDateRangeShort, getInitials } from '../../utils/helpers';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { useLandingColors } from '../../landing/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
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

interface TripDetailHeaderProps {
  trip: Trip;
  members: Membership[];
  section: SectionId;
  onOpenSidebar?: () => void;
  onShareClick: () => void;
  onEditTripClick?: () => void;
  onNewExpenseClick?: () => void;
  canEdit?: boolean;
  showLogout: boolean;
  onLogoutToggle: () => void;
  onLogout: () => void;
}

export function TripDetailHeader({
  trip,
  members,
  section,
  onOpenSidebar,
  onShareClick,
  onEditTripClick,
  onNewExpenseClick,
  canEdit,
  showLogout,
  onLogoutToggle,
  onLogout,
}: TripDetailHeaderProps) {
  const colors = useLandingColors();
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';
  const showNewExpense = section === 'budgeting' && onNewExpenseClick;
  const showEditTrip = section === 'itinerary' && canEdit && onEditTripClick;
  const { user: currentUser } = useAuth();
  const {
    notifications,
    unreadNotificationCount,
    markAllNotificationsRead,
  } = useSocket();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
      className="shrink-0 flex items-center justify-between gap-4 px-6 py-3 border-b"
      style={{ borderColor: colors.border, backgroundColor: colors.headerBg }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 md:hidden"
            style={{ backgroundColor: colors.primary }}
            onClick={onOpenSidebar}
            aria-label="Open trip navigation"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="min-w-0 hidden md:block">
            <h1 className="font-bold text-base truncate" style={{ color: colors.text }}>
              {trip.title}
            </h1>
            <p className="text-xs truncate" style={{ color: colors.textMuted }}>
              {formatDateRangeShort(trip.startDate, trip.endDate)}
            </p>
          </div>
        </div>
        <div
          className="w-px h-10 shrink-0"
          style={{ backgroundColor: colors.border }}
          aria-hidden
        />
        <div className="flex items-center gap-1 shrink-0">
          {members.slice(0, 3).map((m, i) => {
            const u = typeof m.userId === 'object' ? m.userId : null;
            const name = u?.name ?? '?';
            const isOwnerRole = m.role === 'owner';
            const borderColor = isOwnerRole ? colors.primary : '#94a3b8';
            const pillBg = isOwnerRole ? colors.primary : m.role === 'editor' ? '#64748b' : '#94a3b8';
            const pillLabel = isOwnerRole ? 'OWN' : m.role === 'editor' ? 'EDITOR' : 'VIEWER';
            return (
              <div
                key={m._id}
                className="relative shrink-0 flex flex-col items-center"
                style={{ zIndex: 3 - i, marginLeft: i > 0 ? -8 : 0 }}
                title={`${name} (${m.role})`}
              >
                <div
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-[10px] md:text-xs font-medium overflow-hidden border-2 shadow"
                  style={{ borderColor, backgroundColor: colors.surface }}
                >
                  {u?.avatarUrl ? (
                    <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span style={{ color: colors.primary }}>{getInitials(name)}</span>
                  )}
                </div>
                <span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 px-1 py-0.5 rounded-full text-[9px] md:text-[10px] font-semibold text-white whitespace-nowrap shadow-sm"
                  style={{ backgroundColor: pillBg }}
                >
                  {pillLabel}
                </span>
              </div>
            );
          })}
          {members.length > 3 && (
            <div
              className="w-7 h-7 md:w-9 md:h-9 rounded-full flex items-center justify-center text-[10px] md:text-xs font-semibold shrink-0"
              style={{ marginLeft: -8, backgroundColor: colors.border, color: colors.text, zIndex: 0 }}
            >
              +{members.length - 3}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {showNewExpense && (
          <button
            type="button"
            onClick={onNewExpenseClick}
            className="px-4 py-2 rounded-xl font-medium text-white transition-opacity hover:opacity-95"
            style={{
              backgroundColor: colors.primary,
              boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.35)',
            }}
          >
            + New Expense
          </button>
        )}
        {!showNewExpense && (
          <button
            type="button"
            onClick={onShareClick}
            className="px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-opacity hover:opacity-95"
            style={{
              backgroundColor: isDark ? colors.primary : 'transparent',
              color: isDark ? '#fff' : colors.primary,
              border: isDark ? 'none' : `1.5px solid ${colors.border}`,
              borderRadius: '10px',
              boxShadow: isDark ? '0 4px 14px 0 rgba(139, 92, 246, 0.35)' : 'none',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-share2-icon lucide-share-2"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
              <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
            </svg>
            <span className="hidden md:inline">Share</span>
          </button>
        )}
        {showEditTrip && (
          <button
            type="button"
            onClick={onEditTripClick}
            className="px-4 py-2 rounded-xl font-medium transition-opacity hover:opacity-95 flex items-center gap-2 border"
            style={{
              backgroundColor: isDark ? colors.primary : 'transparent',
              color: isDark ? '#fff' : colors.primary,
              borderColor: isDark ? 'transparent' : colors.border,
              boxShadow: isDark ? '0 4px 14px 0 rgba(139, 92, 246, 0.35)' : 'none',
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="hidden md:inline">Edit Trip</span>
          </button>
        )}

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
                  <ul className="divide-y divide-slate-100">
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
        {currentUser && (
          <div
            className="relative flex items-center gap-2 pl-2 border-l"
            style={{ borderColor: colors.border }}
          >
            <button
              type="button"
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium shrink-0 focus:outline-none"
              style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', color: colors.primary }}
              title={currentUser.email}
              onClick={onLogoutToggle}
            >
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                getInitials(currentUser.name)
              )}
            </button>
            {showLogout && (
              <div
                className="absolute right-0 top-[110%] z-50 border rounded-lg shadow-lg min-w-[160px] py-2"
                style={{ borderColor: colors.border, backgroundColor: colors.surface }}
              >
                <button
                  className="w-full text-left px-4 py-2 text-sm transition-colors"
                  style={{ color: colors.text }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.background; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  onClick={() => {
                    onLogoutToggle();
                    navigate('/profile');
                  }}
                >
                  Profile
                </button>
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
