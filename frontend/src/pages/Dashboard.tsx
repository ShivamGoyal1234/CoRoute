import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { tripsApi } from '../lib/api';
import type { Trip } from '../types';
import { Loading } from '../components/Loading';
import { TripCard } from '../components/TripCard';
import { useTheme } from '../contexts/ThemeContext';
import { useLandingColors } from '../landing/theme';

type TabId = 'upcoming' | 'planning' | 'completed';

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
  const colors = useLandingColors();
  const { effectiveTheme } = useTheme();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('upcoming');

  useEffect(() => {
    tripsApi
      .list()
      .then(({ data }) => setTrips(data.trips))
      .catch(() => setError('Could not load trips'))
      .finally(() => setLoading(false));
  }, []);

  const myTrips = useMemo(() => trips.filter(isMyTrip), [trips]);
  const filteredTrips = useMemo(() => {
    return myTrips.filter((t) => getTripStatus(t) === activeTab);
  }, [myTrips, activeTab]);

  if (loading) return <Loading message="Loading your trips…" />;
  if (error) {
    return (
      <div
        className="rounded-xl border p-4"
        style={{
          backgroundColor: effectiveTheme === 'dark' ? 'rgba(185, 28, 28, 0.25)' : '#FEF2F2',
          color: effectiveTheme === 'dark' ? '#FCA5A5' : '#B91C1C',
          borderColor: effectiveTheme === 'dark' ? 'rgba(248, 113, 113, 0.3)' : '#FECACA',
        }}
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

  const emptyCardBg = effectiveTheme === 'dark' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(236, 229, 249, 0.6)';
  const emptyCardBorder = effectiveTheme === 'dark' ? 'rgba(139, 92, 246, 0.4)' : 'rgba(139, 92, 246, 0.4)';

  return (
    <div
      className="min-h-screen rounded-2xl"
      style={{ backgroundColor: colors.background }}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1
              className="text-2xl font-bold tracking-tight mb-1"
              style={{ color: colors.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              My Trips
            </h1>
            <p className="text-sm mt-1" style={{ color: colors.textMuted }}>
              Manage and collaborate on your upcoming adventures.
            </p>
          </div>
          <Link
            to="/trips/new"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-medium text-white transition-opacity hover:opacity-95 shrink-0"
            style={{
              backgroundColor: colors.primary,
              boxShadow: '0 8px 24px 0 rgba(139, 92, 246, 0.3), 0 6px 24px -4px rgba(0,0,0,0.10)',
            }}
          >
            + Create New Trip
          </Link>
        </div>

        <nav className="flex gap-6 border-b" style={{ borderColor: colors.border }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="pb-3 text-sm font-medium transition-colors -mb-px"
              style={{
                color: activeTab === tab.id ? colors.text : colors.textMuted,
                borderBottom: activeTab === tab.id ? `2px solid ${colors.primary}` : '2px solid transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {myTrips.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border-2 border-dashed p-12 text-center"
            style={{
              borderColor: emptyCardBorder,
              backgroundColor: emptyCardBg,
            }}
          >
            <p className="mb-4" style={{ color: colors.textMuted }}>
              No trips yet. Create one to start planning.
            </p>
            <Link
              to="/trips/new"
              className="inline-flex px-5 py-2.5 rounded-xl font-medium text-white transition-opacity hover:opacity-95"
              style={{
                backgroundColor: colors.primary,
                boxShadow: '0 8px 24px 0 rgba(139, 92, 246, 0.3)',
              }}
            >
              Create your first trip
            </Link>
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
                  mapCenter={trip.location ? { lat: trip.location.lat, lng: trip.location.lng } : undefined}
                  mapZoom={trip.location?.zoom}
                  memberCount={trip.travelerCount}
                  members={trip.travelers?.map((t) => ({ name: t.name, avatarUrl: t.avatarUrl }))}
                />
              </motion.li>
            ))}
            <motion.li
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: filteredTrips.length * 0.05 }}
              >
                <Link
                  to="/trips/new"
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 h-full min-h-[260px] text-center transition-colors hover:border-opacity-100"
                  style={{
                    borderColor: emptyCardBorder,
                    backgroundColor: emptyCardBg,
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                    style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)' }}
                  >
                    <svg className="w-6 h-6" style={{ color: colors.primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <p
                    className="font-medium text-sm mb-1"
                    style={{ color: colors.text }}
                  >
                    Planning something new?
                  </p>
                  <p
                    className="text-xs mb-2"
                    style={{ color: colors.textMuted }}
                  >
                    Start a new collaboration trip
                  </p>
                  <span
                    className="text-sm font-medium"
                    style={{ color: colors.primary }}
                  >
                    Click to start planning
                  </span>
                </Link>
              </motion.li>
          </ul>
        )}
      </div>
    </div>
  );
}
