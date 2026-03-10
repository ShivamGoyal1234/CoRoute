import React, { useState, useMemo, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getInitials } from '../utils/helpers';
import { useLandingColors } from '../landing/theme';
import { useTheme } from '../contexts/ThemeContext';
import { authApi } from '../lib/api';

export default function Profile() {
  const { user, refreshUser, logout } = useAuth();
  const colors = useLandingColors();
  const { effectiveTheme } = useTheme();

  const [firstName, setFirstName] = useState(() => (user?.name.split(' ')[0] ?? ''));
  const [lastName, setLastName] = useState(() => (user?.name.split(' ').slice(1).join(' ') ?? ''));
  const [email, setEmail] = useState(user?.email ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [saving, setSaving] = useState(false);
  const [statusChanging, setStatusChanging] = useState<'deactivate' | 'delete' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isDirty = useMemo(() => {
    if (!user) return false;
    const nameParts = user.name.trim().split(' ');
    const originalFirst = nameParts[0] ?? '';
    const originalLast = nameParts.slice(1).join(' ');
    const originalBio = user.bio ?? '';
    return (
      firstName.trim() !== originalFirst.trim() ||
      lastName.trim() !== originalLast.trim() ||
      email.trim() !== user.email.trim() ||
      bio.trim() !== originalBio.trim()
    );
  }, [bio, email, firstName, lastName, user]);

  if (!user) {
    return null;
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    setError(null);
    try {
      await authApi.updateProfile({ avatarFile: file });
      await refreshUser();
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? ((err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Failed to update avatar')
          : 'Failed to update avatar';
      setError(message);
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty || saving) return;
    setSaving(true);
    setError(null);
    try {
      const trimmedFirst = firstName.trim();
      const trimmedLast = lastName.trim();
      const fullName = [trimmedFirst, trimmedLast].filter(Boolean).join(' ') || user.name;
      await authApi.updateProfile({
        name: fullName,
        email: email.trim(),
        bio: bio.trim(),
      });
      await refreshUser();
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? ((err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Failed to update profile')
          : 'Failed to update profile';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (action: 'deactivate' | 'delete') => {
    if (statusChanging) return;
    setStatusChanging(action);
    setError(null);
    try {
      await authApi.updateProfile({ action });
      logout();
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? ((err as { response?: { data?: { error?: string } } }).response?.data?.error ??
             (action === 'delete' ? 'Failed to delete account' : 'Failed to deactivate account'))
          : action === 'delete'
            ? 'Failed to delete account'
            : 'Failed to deactivate account';
      setError(message);
    } finally {
      setStatusChanging(null);
    }
  };

  return (
    <div
      className="h-full w-full flex flex-col"
      style={{ backgroundColor: effectiveTheme === 'dark' ? colors.background : '#F6F5F8' }}
    >
      <div
        className="px-6 md:px-10 pt-6 pb-4 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        style={{ borderColor: colors.border, backgroundColor: colors.headerBg }}
      >
          <div className="flex items-center gap-4">
            <div className="relative">
              <div
                className="w-[128px] h-[128px] md:w-[128px] md:h-[128px] rounded-full overflow-hidden border-4 border-white shadow-md flex items-center justify-center text-xl font-semibold"
                style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', color: colors.primaryHeader }}
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" width={128} height={128} />
                ) : (
                  getInitials(user.name)
                )}
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs shadow-md cursor-pointer"
                style={{ backgroundColor: colors.primary }}
                aria-label="Change avatar"
                onClick={handleAvatarClick}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h4l2-3h6l2 3h4v12H3V7z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <h2 className="font-semibold" style={{ color: colors.text, fontSize: 30 }}>
                {user.name}
              </h2>
              <p className="text-sm mb-1" style={{ color: colors.textMuted, fontSize: 16 }}>
                {user.email}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-medium"
                  style={{ backgroundColor: '#E9E5F8', color: '#7859F8' }}
                >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: '#16A34A' }}
                    />
                    Verified user
                </span>
                <span style={{ color: colors.textMuted }}>
                  Member since{' '}
                  {user.createdAt
                    ? new Date(user.createdAt).getFullYear()
                    : '–'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch md:self-auto md:ml-auto">
            {/* <button
              type="button"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold border bg-white"
              style={{ color: colors.text, borderColor: colors.border }}
            >
              View Public Profile
            </button> */}
            <button
              type="submit"
              form="profile-form"
              disabled={!isDirty || saving || avatarUploading}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
              style={{
                backgroundColor: colors.primary,
                boxShadow: '0 8px 20px rgba(139, 92, 246, 0.35)',
              }}
              >
              {saving ? 'Saving…' : avatarUploading ? 'Uploading…' : 'Save Changes'}
            </button>
          </div>
        </div>

        <form
          id="profile-form"
          onSubmit={handleSubmit}
          className="flex-1 px-6 md:px-10 py-6 space-y-8 overflow-y-auto"
        >
          <section>
            <div className="grid gap-8 md:grid-cols-12 items-start">
              <div className="md:col-span-3">
                <h3 className="font-semibold mb-1.5" style={{ color: colors.text, fontSize: 18 }}>
                  Personal Information
                </h3>
                <p className="text-xs" style={{ color: colors.textMuted, fontSize: 14 }}>
                  Update your basic profile details and how others see you on the platform.
                </p>
              </div>
              <div className="md:col-span-9 grid gap-4 md:grid-cols-12">
                <div className="md:col-span-6">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: colors.textMuted }}>
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-offset-0"
                  style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.text }}
                />
                </div>
                <div className="md:col-span-6">
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: colors.textMuted }}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-offset-0"
                    style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.text }}
                  />
                </div>
                <div className="md:col-span-12">
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: colors.textMuted }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-offset-0"
                    style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.text }}
                  />
                </div>
                <div className="md:col-span-12">
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: colors.textMuted }}>
                    Bio
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell others about your role, interests, and how you like to collaborate."
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-offset-0"
                    style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.text }}
                  />
                </div>
              </div>
            </div>
            {error && (
              <p className="text-xs mt-3" style={{ color: '#DC2626' }}>
                {error}
              </p>
            )}
          </section>

          <section className="pt-8 border-t" style={{ borderColor: colors.border }}>
            <div className="grid gap-8 md:grid-cols-12 items-start">
              <div className="md:col-span-3">
                <h3 className="text-sm font-semibold mb-1.5" style={{ color: '#DC2626' }}>
                  Danger Zone
                </h3>
                <p className="text-xs" style={{ color: colors.textMuted }}>
                  Actions here are permanent and cannot be undone.
                </p>
              </div>
              <div className="md:col-span-9">
                <div
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-2xl border px-4 md:px-6 py-4"
                  style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA' }}
                >
                  <div>
                    <h4 className="text-sm font-semibold mb-1" style={{ color: '#B91C1C' }}>
                      Delete Account
                    </h4>
                    <p className="text-xs" style={{ color: '#DC2626' }}>
                      Once you delete your account, there is no going back. Please be certain before proceeding.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 justify-end">
                    <button
                      type="button"
                      disabled={statusChanging === 'delete'}
                      className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                      style={{ backgroundColor: '#EF4444' }}
                      onClick={() => handleStatusChange('delete')}
                    >
                      {statusChanging === 'delete' ? 'Deleting…' : 'Delete Account'}
                    </button>
                    <button
                      type="button"
                      disabled={statusChanging === 'deactivate'}
                      className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: '#F97373',
                        color: '#FFFFFF',
                      }}
                      onClick={() => handleStatusChange('deactivate')}
                    >
                      {statusChanging === 'deactivate' ? 'Deactivating…' : 'Deactivate'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </form>
    </div>
  );
}

