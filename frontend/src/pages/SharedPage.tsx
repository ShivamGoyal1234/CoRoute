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

export default function SharedPage() {
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

  const sharedTrips = useMemo(
    () => trips.filter((t) => t.userRole && t.userRole !== 'owner'),
    [trips]
  );
  const filteredTrips = useMemo(
    () => sharedTrips.filter((t) => getTripStatus(t) === activeTab),
    [sharedTrips, activeTab]
  );

  if (loading) return <Loading message="Loading shared trips…" />;
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
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: colors.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Shared with Me
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: colors.textMuted }}
          >
            Trips others have shared with you.
          </p>
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

        {sharedTrips.length === 0 ? (
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
              No trips shared with you yet. When someone invites you to a trip, it will appear here.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex px-5 py-2.5 rounded-xl font-medium text-white transition-opacity hover:opacity-95"
              style={{
                backgroundColor: colors.primary,
                boxShadow: '0 8px 24px 0 rgba(139, 92, 246, 0.3)',
              }}
            >
              Back to My Trips
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
          </ul>
        )}
      </div>
    </div>
  );
}
