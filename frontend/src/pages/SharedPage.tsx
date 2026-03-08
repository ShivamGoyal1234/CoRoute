import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { tripsApi } from '../lib/api';
import type { Trip } from '../types';
import { Loading } from '../components/Loading';
import { TripCard } from '../components/TripCard';
import { landingColors } from '../landing/theme';

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

  return (
    <div
      className="min-h-screen rounded-2xl"
      style={{ backgroundColor: landingColors.background }}
    >
      <div className="flex flex-col gap-6">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: landingColors.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Shared with Me
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: landingColors.textMuted }}
          >
            Trips others have shared with you.
          </p>
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

        {sharedTrips.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border-2 border-dashed p-12 text-center"
            style={{
              borderColor: 'rgba(139, 92, 246, 0.4)',
              backgroundColor: 'rgba(236, 229, 249, 0.6)',
            }}
          >
            <p className="mb-4" style={{ color: landingColors.textMuted }}>
              No trips shared with you yet. When someone invites you to a trip, it will appear here.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex px-5 py-2.5 rounded-xl font-medium text-white transition-opacity hover:opacity-95"
              style={{
                backgroundColor: landingColors.primary,
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
