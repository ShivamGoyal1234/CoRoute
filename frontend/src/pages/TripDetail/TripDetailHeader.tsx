import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Trip, Membership } from '../../types';
import { formatDateRangeShort, getInitials } from '../../utils/helpers';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { landingColors } from '../../landing/theme';
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
  onShareClick: () => void;
  onNewExpenseClick?: () => void;
  showLogout: boolean;
  onLogoutToggle: () => void;
  onLogout: () => void;
}

export function TripDetailHeader({
  trip,
  members,
  section,
  onShareClick,
  onNewExpenseClick,
  showLogout,
  onLogoutToggle,
  onLogout,
}: TripDetailHeaderProps) {
  const showNewExpense = section === 'budgeting' && onNewExpenseClick;
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
      className="shrink-0 flex items-center justify-between gap-4 px-6 py-3 border-b"
      style={{ borderColor: 'rgba(226, 232, 240, 0.8)', backgroundColor: '#F8F8FC' }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: landingColors.primary }}
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-base truncate" style={{ color: landingColors.text }}>
              {trip.title}
            </h1>
            <p className="text-xs truncate" style={{ color: landingColors.textMuted }}>
              {formatDateRangeShort(trip.startDate, trip.endDate)}
            </p>
          </div>
        </div>
        <div
          className="w-px h-10 shrink-0"
          style={{ backgroundColor: 'rgba(148, 163, 184, 0.5)' }}
          aria-hidden
        />
        <div className="flex items-center gap-1 shrink-0">
          {members.slice(0, 3).map((m, i) => {
            const u = typeof m.userId === 'object' ? m.userId : null;
            const name = u?.name ?? '?';
            const isOwnerRole = m.role === 'owner';
            const borderColor = isOwnerRole ? landingColors.primary : '#94a3b8';
            const pillBg = isOwnerRole ? landingColors.primary : m.role === 'editor' ? '#64748b' : '#94a3b8';
            const pillLabel = isOwnerRole ? 'OWN' : m.role === 'editor' ? 'EDITOR' : 'VIEWER';
            return (
              <div
                key={m._id}
                className="relative shrink-0 flex flex-col items-center"
                style={{ zIndex: 3 - i, marginLeft: i > 0 ? -8 : 0 }}
                title={`${name} (${m.role})`}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium overflow-hidden border-2 shadow"
                  style={{ borderColor, backgroundColor: '#fff' }}
                >
                  {u?.avatarUrl ? (
                    <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span style={{ color: landingColors.primary }}>{getInitials(name)}</span>
                  )}
                </div>
                <span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 px-1.5 py-0.5 rounded-full text-[10px] font-semibold text-white whitespace-nowrap shadow-sm"
                  style={{ backgroundColor: pillBg }}
                >
                  {pillLabel}
                </span>
              </div>
            );
          })}
          {members.length > 3 && (
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
              style={{ marginLeft: -8, backgroundColor: '#e2e8f0', color: landingColors.text, zIndex: 0 }}
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
              backgroundColor: landingColors.primary,
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
            className="px-4 py-2 rounded-xl font-medium text-white transition-opacity hover:opacity-95"
            style={{
              backgroundColor: landingColors.primary,
              boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.35)',
            }}
          >
            Share Trip
          </button>
        )}
        <div className="relative shrink-0" ref={notificationRef}>
          <button
            type="button"
            onClick={handleBellClick}
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-opacity hover:opacity-90 focus:outline-none relative"
            style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', color: landingColors.primary }}
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
                style={{ backgroundColor: landingColors.primary }}
              >
                {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
              </span>
            )}
          </button>
          {notificationOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-80 max-h-[min(24rem,70vh)] flex flex-col rounded-xl border shadow-xl bg-white z-50 overflow-hidden"
              style={{ borderColor: 'rgba(226, 232, 240, 0.8)' }}
            >
              <div
                className="shrink-0 px-4 py-3 border-b flex items-center justify-between"
                style={{ borderColor: 'rgba(226, 232, 240, 0.8)' }}
              >
                <span className="text-sm font-semibold" style={{ color: landingColors.text }}>
                  Notifications
                </span>
                {notifications.length > 0 && (
                  <span className="text-xs" style={{ color: landingColors.textMuted }}>
                    {notifications.length} total
                  </span>
                )}
              </div>
              <div className="flex-1 overflow-y-auto min-h-0">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-sm" style={{ color: landingColors.textMuted }}>
                      No notifications yet
                    </p>
                    <p className="text-xs mt-1" style={{ color: landingColors.textMuted }}>
                      Updates from your team will appear here
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {[...notifications].reverse().map((n) => (
                      <li
                        key={n.id}
                        className="flex gap-3 px-4 py-3 hover:bg-slate-50/80 transition-colors"
                      >
                        <div
                          className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold"
                          style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', color: landingColors.primary }}
                        >
                          {getInitials(n.actorName)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium" style={{ color: landingColors.text }}>
                            {n.title}
                          </p>
                          {n.body && (
                            <p className="text-xs mt-0.5 line-clamp-2" style={{ color: landingColors.textMuted }}>
                              {n.body}
                            </p>
                          )}
                          <p className="text-xs mt-1" style={{ color: landingColors.textMuted }}>
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
          to={`/settings?tripId=${trip._id}`}
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-opacity hover:opacity-90 focus:outline-none"
          style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', color: landingColors.primary }}
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
            style={{ borderColor: 'rgba(226, 232, 240, 0.8)' }}
          >
            <button
              type="button"
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium shrink-0 focus:outline-none"
              style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', color: landingColors.primary }}
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
                className="absolute right-0 top-[110%] z-50 bg-white border rounded-lg shadow-lg min-w-[120px] py-2"
                style={{ borderColor: 'rgba(226, 232, 240, 0.8)' }}
              >
                <button
                  className="w-full text-left px-4 py-2 text-sm text-black hover:bg-slate-100"
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
