import { Link } from 'react-router-dom';
import { TripCardMap, type MapCenter } from './TripCardMap';
import { formatDateRangeShort, getInitials } from '../utils/helpers';
import type { Trip } from '../types';
import { landingColors } from '../landing/theme';

const AVATAR_COLORS = ['#E2E8F0', '#FED7AA', '#A78B71', '#94A3B8', '#B8E0D2'];

export type TripStatus = 'upcoming' | 'planning' | 'completed';

export interface TripCardMember {
  name: string;
  avatarUrl?: string;
}

interface TripCardProps {
  trip: Trip;
  status: TripStatus;
  mapIndex?: number;
  mapCenter?: MapCenter;
  memberCount?: number;
  members?: TripCardMember[];
}

const statusConfig: Record<TripStatus, { label: string; bg: string }> = {
  upcoming: { label: 'UPCOMING', bg: landingColors.primary },
  planning: { label: 'PLANNING', bg: landingColors.secondary },
  completed: { label: 'COMPLETED', bg: landingColors.success },
};

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

export function TripCard({
  trip,
  status,
  mapIndex = 0,
  mapCenter,
  memberCount = 1,
  members = [],
}: TripCardProps) {
  const { label: statusLabel, bg: statusBg } = statusConfig[status];
  const displayCount = memberCount > 0 ? memberCount : 1;
  const maxAvatars = 3;
  const visibleMembers = members.slice(0, maxAvatars);
  const extraCount = displayCount > maxAvatars ? displayCount - maxAvatars : 0;

  return (
    <Link
      to={`/trips/${trip._id}`}
      className="block rounded-xl overflow-hidden bg-white transition-all hover:shadow-lg"
      style={{
        boxShadow: '0 1px 3px 0 rgba(0,0,0,0.06), 0 4px 12px -2px rgba(0,0,0,0.06)',
      }}
    >
      <div className="relative" style={{ minHeight: 200 }}>
        <TripCardMap
          index={mapIndex}
          center={mapCenter}
          className="absolute inset-0 w-full h-full"
        />
        <span
          className="absolute top-2 left-2 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full text-white"
          style={{ backgroundColor: statusBg }}
        >
          {statusLabel}
        </span>
      </div>

      <div className="p-4">
        <h2
          className="text-lg font-bold truncate"
          style={{ color: landingColors.text }}
        >
          {trip.title}
        </h2>
        <p
          className="flex items-center gap-1.5 text-sm mt-1.5"
          style={{ color: landingColors.textMuted }}
        >
          <CalendarIcon className="w-4 h-4 shrink-0" />
          {formatDateRangeShort(trip.startDate, trip.endDate)}
        </p>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center -space-x-2">
            {visibleMembers.length > 0 ? (
              <>
                {visibleMembers.map((m, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium shrink-0 overflow-hidden bg-slate-100"
                    style={{
                      backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
                      color: landingColors.text,
                    }}
                    title={m.name}
                  >
                    {m.avatarUrl ? (
                      <img
                        src={m.avatarUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getInitials(m.name || '?')
                    )}
                  </div>
                ))}
                {extraCount > 0 && (
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-semibold text-white shrink-0"
                    style={{ backgroundColor: landingColors.primary }}
                  >
                    +{extraCount}
                  </div>
                )}
              </>
            ) : (
              <>
                <div
                  className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium shrink-0"
                  style={{
                    backgroundColor: AVATAR_COLORS[0],
                    color: landingColors.text,
                  }}
                >
                  ?
                </div>
                {displayCount > 1 && (
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-semibold text-white shrink-0"
                    style={{ backgroundColor: landingColors.primary }}
                  >
                    +{displayCount - 1}
                  </div>
                )}
              </>
            )}
          </div>
          <span
            className="text-sm font-semibold shrink-0"
            style={{ color: '#8B5CF6' }}
          >
            {displayCount} Traveler{displayCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </Link>
  );
}
