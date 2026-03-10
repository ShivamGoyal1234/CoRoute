import { Link } from 'react-router-dom';
import { SIDEBAR_NAV } from './types';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLandingColors } from '../../landing/theme';
import type { SectionId } from './types';

function NavIcon({ name }: { name: string }) {
  const c = 'w-5 h-5 shrink-0';
  switch (name) {
    case 'calendar':
      return (
        <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case 'piggy':
      return (
        <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    case 'folder':
      return (
        <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      );
    case 'checklist':
      return (
        <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      );
    case 'map':
      return (
        <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-2-1.5V6l2-1.5 2 1.5v12.5L9 20zm-6-1.5l2-1.5V4.5L3 6v12.5zm12 0l2-1.5V4.5L21 6v12.5l-2 1.5z" />
        </svg>
      );
    default:
      return null;
  }
}

interface TripDetailSidebarProps {
  section: SectionId;
  onSectionChange: (section: SectionId) => void;
  presenceSectionLabels?: Record<string, string>;
  tripId?: string;
}

const PRESENCE_COLORS = ['#8B5CF6', '#38BDF8', '#10B981', '#F59E0B'];

export function TripDetailSidebar({ section, onSectionChange, presenceSectionLabels = {}, tripId }: TripDetailSidebarProps) {
  const colors = useLandingColors();
  const { presence } = useSocket();
  const { user } = useAuth();
  const otherUsers = presence.filter((p) => p.userId !== user?.id);
  return (
    <aside
      className="w-52 shrink-0 flex flex-col border-r py-4"
      style={{ borderColor: colors.border, backgroundColor: colors.surface }}
    >
      <nav className="px-3 space-y-0.5">
        {SIDEBAR_NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSectionChange(item.id)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: section === item.id ? colors.primary : 'transparent',
              color: section === item.id ? '#fff' : colors.textMuted,
            }}
          >
            <span style={section === item.id ? { color: '#fff' } : undefined}>
              <NavIcon name={item.icon} />
            </span>
            {item.label}
          </button>
        ))}
      </nav>
      {tripId && (
        <div className="mt-4 px-3">
          <Link
            to={`/settings?tripId=${tripId}`}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:opacity-90"
            style={{ color: colors.textMuted }}
          >
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Trip Settings
          </Link>
        </div>
      )}
      <div className="mt-auto px-3 pt-4 border-t" style={{ borderColor: colors.border }}>
        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: colors.textMuted }}>
          Live presence
        </p>
        <ul className="space-y-2">
          {otherUsers.length > 0 ? (
            otherUsers.map((p, i) => (
              <li key={p.userId} className="flex items-center gap-2 text-sm">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: PRESENCE_COLORS[i % PRESENCE_COLORS.length] }}
                />
                <span style={{ color: colors.text }}>
                  {p.userName} in {presenceSectionLabels[p.section] ?? p.section}
                </span>
              </li>
            ))
          ) : (
            <li className="text-sm" style={{ color: colors.textMuted }}>
              No one else viewing
            </li>
          )}
        </ul>
      </div>
    </aside>
  );
}
