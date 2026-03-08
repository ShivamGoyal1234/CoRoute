import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { tripsApi } from '../lib/api';
import type { Trip } from '../types';
import { Loading } from '../components/Loading';
import { TripCard } from '../components/TripCard';
import { landingColors } from '../landing/theme';

type TabId = 'upcoming' | 'planning' | 'completed';
type SegmentId = 'my-trips' | 'shared-with-me';

function getTripStatus(trip: Trip): TabId {
  const now = new Date();
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  if (end < now) return 'completed';
  if (start > now) return 'upcoming';
  return 'planning';
}

function isMyTrip(trip: Trip): boolean {
  return trip.userRole === 'owner';
}

export default function Dashboard() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('upcoming');
  const [segment, setSegment] = useState<SegmentId>('my-trips');

  useEffect(() => {
    tripsApi
      .list()
      .then(({ data }) => setTrips(data.trips))
      .catch(() => setError('Could not load trips'))
      .finally(() => setLoading(false));
  }, []);

  const myTrips = useMemo(() => trips.filter(isMyTrip), [trips]);
  const sharedTrips = useMemo(() => trips.filter((t) => !isMyTrip(t)), [trips]);
  const segmentTrips = segment === 'my-trips' ? myTrips : sharedTrips;
  const filteredTrips = useMemo(() => {
    return segmentTrips.filter((t) => getTripStatus(t) === activeTab);
  }, [segmentTrips, activeTab]);

  if (loading) return <Loading message="Loading your trips…" />;
  if (error) {
    return (
      <div
        className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
        style={{ backgroundColor: '#FEF2F2' }}
      >
        {error}
      </div>
    );
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'planning', label: 'Planning' },
    { id: 'completed', label: 'Completed' },
  ];

  const segments: { id: SegmentId; label: string; subtitle: string }[] = [
    { id: 'my-trips', label: 'My Trips', subtitle: 'Manage and collaborate on your upcoming adventures.' },
    { id: 'shared-with-me', label: 'Shared with me', subtitle: 'Trips others have shared with you.' },
  ];

  const activeSegment = segments.find((s) => s.id === segment) ?? segments[0];

  return (
    <div
      className="min-h-screen rounded-2xl"
      style={{ backgroundColor: landingColors.background }}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex gap-4 mb-2">
              {segments.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSegment(s.id)}
                  className="text-2xl font-bold tracking-tight transition-colors"
                  style={{
                    color: segment === s.id ? landingColors.text : landingColors.textMuted,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <p className="text-sm mt-1" style={{ color: landingColors.textMuted }}>
              {activeSegment.subtitle}
            </p>
          </div>
          <Link
            to="/trips/new"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-medium text-white transition-opacity hover:opacity-95 shrink-0"
            style={{
              backgroundColor: landingColors.primary,
              boxShadow: '0 8px 24px 0 rgba(139, 92, 246, 0.3), 0 6px 24px -4px rgba(0,0,0,0.10)',
            }}
          >
            + Create New Trip
          </Link>
        </div>

        <nav className="flex gap-6 border-b border-slate-200/80" style={{ borderColor: 'rgba(100, 116, 139, 0.2)' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="pb-3 text-sm font-medium transition-colors -mb-px"
              style={{
                color: activeTab === tab.id ? landingColors.text : landingColors.textMuted,
                borderBottom: activeTab === tab.id ? `2px solid ${landingColors.primary}` : '2px solid transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {segmentTrips.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border-2 border-dashed p-12 text-center"
            style={{
              borderColor: 'rgba(139, 92, 246, 0.4)',
              backgroundColor: 'rgba(236, 229, 249, 0.6)',
            }}
          >
            {segment === 'my-trips' ? (
              <>
                <p className="mb-4" style={{ color: landingColors.textMuted }}>
                  No trips yet. Create one to start planning.
                </p>
                <Link
                  to="/trips/new"
                  className="inline-flex px-5 py-2.5 rounded-xl font-medium text-white transition-opacity hover:opacity-95"
                  style={{
                    backgroundColor: landingColors.primary,
                    boxShadow: '0 8px 24px 0 rgba(139, 92, 246, 0.3)',
                  }}
                >
                  Create your first trip
                </Link>
              </>
            ) : (
              <p className="mb-4" style={{ color: landingColors.textMuted }}>
                No trips shared with you yet. When someone invites you to a trip, it will appear here.
              </p>
            )}
          </motion.div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTrips.map((trip, i) => (
              <motion.li
                key={trip._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <TripCard
                  trip={trip}
                  status={getTripStatus(trip)}
                  mapIndex={i}
                  memberCount={trip.travelerCount}
                  members={trip.travelers?.map((t) => ({ name: t.name, avatarUrl: t.avatarUrl }))}
                />
              </motion.li>
            ))}
            {segment === 'my-trips' && (
              <motion.li
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: filteredTrips.length * 0.05 }}
              >
                <Link
                  to="/trips/new"
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 h-full min-h-[260px] text-center transition-colors hover:border-opacity-100"
                  style={{
                    borderColor: 'rgba(139, 92, 246, 0.5)',
                    backgroundColor: 'rgba(236, 229, 249, 0.5)',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                    style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)' }}
                  >
                    <svg className="w-6 h-6" style={{ color: landingColors.primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <p
                    className="font-medium text-sm mb-1"
                    style={{ color: landingColors.text }}
                  >
                    Planning something new?
                  </p>
                  <p
                    className="text-xs mb-2"
                    style={{ color: landingColors.textMuted }}
                  >
                    Start a new collaboration trip
                  </p>
                  <span
                    className="text-sm font-medium"
                    style={{ color: landingColors.primary }}
                  >
                    Click to start planning
                  </span>
                </Link>
              </motion.li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
