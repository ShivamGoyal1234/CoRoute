import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getInitials } from '../utils/helpers';
import { landingColors } from '../landing/theme';
import { tripsApi, membersApi } from '../lib/api';
import type { Trip, Membership, MemberRole } from '../types';

type RoleOption = 'Editor' | 'Viewer';

interface FeedItem {
  type: string;
  userName: string;
  text: string;
  detail?: string;
  timestamp: string;
}

function ActivityIcon({ type }: { type: string }) {
  const className = 'w-4 h-4 shrink-0';
  const color = landingColors.primary;
  const iconMap: Record<string, React.ReactNode> = {
    edit: (
      <svg className={className} style={{ color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
    comment: (
      <svg className={className} style={{ color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    pin: (
      <svg className={className} style={{ color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    ),
    person: (
      <svg className={className} style={{ color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  };
  return iconMap[type] ?? iconMap.comment;
}

function formatFeedTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} MINUTE${diffMins !== 1 ? 'S' : ''} AGO`;
  if (diffHours < 24) return `${diffHours} HOUR${diffHours !== 1 ? 'S' : ''} AGO`;
  if (diffDays === 1) return 'YESTERDAY';
  if (diffDays < 7) return `${diffDays} DAYS AGO`;
  return d.toLocaleDateString();
}

export default function Settings() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tripIdFromUrl = searchParams.get('tripId');

  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(tripIdFromUrl);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [members, setMembers] = useState<Membership[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTrip, setLoadingTrip] = useState(false);

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<RoleOption>('Editor');
  const [inviteError, setInviteError] = useState('');
  const [inviting, setInviting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedTripId(tripIdFromUrl);
  }, [tripIdFromUrl]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await tripsApi.list();
        if (!cancelled) setTrips(res.data.trips ?? []);
      } catch {
        if (!cancelled) setTrips([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!selectedTripId) {
      setTrip(null);
      setMembers([]);
      setFeed([]);
      setLoading(false);
      setLoadingTrip(false);
      return;
    }
    let cancelled = false;
    setLoadingTrip(true);
    (async () => {
      try {
        const [tripRes, membersRes, feedRes] = await Promise.all([
          tripsApi.get(selectedTripId),
          membersApi.list(selectedTripId),
          tripsApi.getFeed(selectedTripId).catch(() => ({ data: { feed: [] } })),
        ]);
        if (cancelled) return;
        setTrip(tripRes.data.trip);
        setMembers(membersRes.data.members ?? []);
        setFeed(feedRes.data.feed ?? []);
      } catch {
        if (!cancelled) {
          setTrip(null);
          setMembers([]);
          setFeed([]);
        }
      } finally {
        if (!cancelled) setLoadingTrip(false);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedTripId]);

  const handleInvite = async () => {
    if (!selectedTripId || !email.trim()) return;
    setInviteError('');
    setInviting(true);
    try {
      const apiRole: MemberRole = role === 'Editor' ? 'editor' : 'viewer';
      await membersApi.invite(selectedTripId, email.trim(), apiRole);
      const res = await membersApi.list(selectedTripId);
      setMembers(res.data.members ?? []);
      setEmail('');
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : 'Failed to send invite';
      setInviteError(msg || 'Failed to send invite');
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (membershipId: string) => {
    setRemovingId(membershipId);
    try {
      await membersApi.remove(membershipId);
      if (selectedTripId) {
        const res = await membersApi.list(selectedTripId);
        setMembers(res.data.members ?? []);
      }
    } finally {
      setRemovingId(null);
    }
  };

  const canManageAccess = trip?.userRole === 'owner' || trip?.userRole === 'editor';
  const currentUserId = user?.id;

  const memberDisplayList = members.map((m) => {
    const u = m.userId as { _id?: string; id?: string; name: string; email: string; avatarUrl?: string };
    const uid = u?._id ?? (u as { id?: string })?.id;
    const isYou = currentUserId && uid === currentUserId;
    const roleLabel = m.role.toUpperCase();
    return {
      _id: m._id,
      name: u?.name ?? 'Unknown',
      email: u?.email ?? '',
      avatarUrl: u?.avatarUrl,
      role: roleLabel,
      isYou,
      isOwner: m.role === 'owner',
    };
  });

  const handleTripChange = (tripId: string) => {
    setSelectedTripId(tripId || null);
    if (tripId) {
      setSearchParams({ tripId });
    } else {
      searchParams.delete('tripId');
      setSearchParams(searchParams);
    }
  };

  if (loading && !selectedTripId) {
    return (
      <div className="max-w-4xl mx-auto rounded-2xl border overflow-hidden flex items-center justify-center min-h-[200px]" style={{ backgroundColor: landingColors.surface, borderColor: landingColors.border }}>
        <p style={{ color: landingColors.textMuted }}>Loading…</p>
      </div>
    );
  }

  return (
    <div
      className="max-w-4xl mx-auto rounded-2xl border overflow-hidden"
      style={{ backgroundColor: landingColors.surface, borderColor: landingColors.border }}
    >
      <div className="p-8">
        <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: landingColors.textMuted }}>
          Project Workspace
        </p>
        <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: landingColors.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Collaboration & Permissions
        </h1>
        <p className="text-sm mb-4" style={{ color: landingColors.textMuted }}>
          Invite travelers and monitor real-time activity for your trips.
        </p>

        {trips.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1.5" style={{ color: landingColors.text }}>
              Select trip
            </label>
            <select
              value={selectedTripId ?? ''}
              onChange={(e) => handleTripChange(e.target.value)}
              className="w-full max-w-sm px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2"
              style={{
                borderColor: landingColors.border,
                backgroundColor: landingColors.background,
                color: landingColors.text,
              }}
            >
              <option value="">Choose a trip…</option>
              {trips.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {!selectedTripId && (
          <p className="text-sm py-4" style={{ color: landingColors.textMuted }}>
            Select a trip above to manage members and view activity.
          </p>
        )}

        {selectedTripId && loadingTrip && (
          <p className="text-sm py-4" style={{ color: landingColors.textMuted }}>
            Loading…
          </p>
        )}

        {selectedTripId && !loadingTrip && (
          <div className="grid gap-8 lg:grid-cols-[1fr,340px]">
            <div className="space-y-8">
              {canManageAccess && (
                <section>
                  <h2 className="text-sm font-semibold mb-3" style={{ color: landingColors.text }}>
                    Invite Travelers
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="email"
                      placeholder="Enter traveler's email address..."
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setInviteError(''); }}
                      className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2"
                      style={{
                        borderColor: inviteError ? '#dc2626' : landingColors.border,
                        backgroundColor: landingColors.background,
                        color: landingColors.text,
                      }}
                    />
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as RoleOption)}
                      className="px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2"
                      style={{
                        borderColor: landingColors.border,
                        backgroundColor: landingColors.background,
                        color: landingColors.text,
                      }}
                    >
                      <option value="Editor">Editor</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                    <button
                      type="button"
                      disabled={inviting || !email.trim()}
                      onClick={handleInvite}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white transition-opacity hover:opacity-95 disabled:opacity-60"
                      style={{
                        backgroundColor: landingColors.primary,
                        boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.35)',
                      }}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" />
                      </svg>
                      {inviting ? 'Sending…' : 'Send Invite'}
                    </button>
                  </div>
                  {inviteError && (
                    <p className="text-sm mt-1.5" style={{ color: '#dc2626' }}>
                      {inviteError}
                    </p>
                  )}
                </section>
              )}

              <section>
                <h2 className="text-sm font-semibold mb-3" style={{ color: landingColors.text }}>
                  Manage Access
                </h2>
                <ul className="space-y-3">
                  {memberDisplayList.map((m) => (
                    <li
                      key={m._id}
                      className="flex items-center gap-3 py-2.5 px-3 rounded-xl"
                      style={{ backgroundColor: landingColors.background }}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium shrink-0 overflow-hidden"
                        style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', color: landingColors.primaryHeader }}
                      >
                        {m.isYou && user?.avatarUrl ? (
                          <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : m.avatarUrl ? (
                          <img src={m.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          getInitials(m.name)
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate" style={{ color: landingColors.text }}>
                          {m.name}
                          {m.isYou && (
                            <span className="ml-1.5 text-xs font-normal" style={{ color: landingColors.textMuted }}>
                              (You)
                            </span>
                          )}
                        </p>
                        <p className="text-xs truncate" style={{ color: landingColors.textMuted }}>
                          {m.email}
                        </p>
                      </div>
                      <span
                        className="text-xs font-medium px-2.5 py-1 rounded-md shrink-0"
                        style={{
                          backgroundColor: m.isOwner ? 'rgba(139, 92, 246, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                          color: m.isOwner ? landingColors.primaryHeader : landingColors.textMuted,
                        }}
                      >
                        {m.role}
                      </span>
                      {canManageAccess && !m.isYou && !m.isOwner && (
                        <button
                          type="button"
                          disabled={removingId === m._id}
                          onClick={() => handleRemove(m._id)}
                          className="p-2 rounded-lg transition-opacity hover:opacity-80 disabled:opacity-50"
                          style={{ color: landingColors.textMuted }}
                          aria-label={`Remove ${m.name}`}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: landingColors.text }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Activity Log
                </h2>
              </div>
              <div
                className="rounded-xl border p-4 space-y-4 max-h-[320px] overflow-y-auto"
                style={{ borderColor: landingColors.border, backgroundColor: landingColors.background }}
              >
                {feed.length === 0 ? (
                  <p className="text-sm" style={{ color: landingColors.textMuted }}>
                    No activity yet.
                  </p>
                ) : (
                  feed.map((a, i) => (
                    <div key={`${a.timestamp}-${i}`} className="flex gap-3">
                      <div className="mt-0.5 shrink-0">
                        <ActivityIcon type={a.type} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm" style={{ color: landingColors.text }}>
                          <span className="font-medium">{a.userName}</span> {a.text}
                          {a.detail && <span className="text-xs" style={{ color: landingColors.textMuted }}> — {a.detail}</span>}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: landingColors.textMuted }}>
                          {formatFeedTime(a.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                {trip && (
                  <Link
                    to={`/trips/${trip._id}`}
                    className="text-sm font-medium w-full pt-2 border-t block text-center"
                    style={{ color: landingColors.primary, borderColor: landingColors.border }}
                  >
                    View trip
                  </Link>
                )}
              </div>
            </section>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t" style={{ borderColor: landingColors.border }}>
          <Link
            to={selectedTripId ? `/trips/${selectedTripId}` : '/dashboard'}
            className="px-4 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-90"
            style={{ color: landingColors.textMuted }}
          >
            {selectedTripId ? 'Back to trip' : 'Cancel'}
          </Link>
          <Link
            to="/dashboard"
            className="px-5 py-2.5 rounded-xl font-medium text-white transition-opacity hover:opacity-95"
            style={{
              backgroundColor: landingColors.primary,
              boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.35)',
            }}
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
