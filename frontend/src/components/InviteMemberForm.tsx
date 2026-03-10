import { useState } from 'react';
import type { MemberRole } from '../types';
import { useLandingColors } from '../landing/theme';

interface InviteMemberFormProps {
  onInvite: (email: string, role: MemberRole) => Promise<void>;
}

export function InviteMemberForm({ onInvite }: InviteMemberFormProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<MemberRole>('editor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const colors = useLandingColors();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!email.trim()) return;
    setLoading(true);
    try {
      await onInvite(email.trim(), role);
      setSuccess(true);
      setEmail('');
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Invite failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-3 p-4 rounded-2xl border mb-4"
      style={{ borderColor: colors.border, backgroundColor: colors.surface }}
    >
      <div className="flex-1 min-w-[180px]">
        <label className="block text-xs font-semibold mb-1" style={{ color: colors.textMuted }}>
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="teammate@example.com"
          className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-offset-0"
          style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.text }}
          required
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: colors.textMuted }}>
          Role
        </label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as MemberRole)}
          className="px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-offset-0"
          style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.text }}
        >
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={loading || !email.trim()}
        className="px-5 py-2.5 rounded-xl font-medium text-white transition-opacity hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        style={{ backgroundColor: colors.primary }}
      >
        {loading ? 'Inviting…' : 'Invite'}
      </button>
      {error && (
        <p className="w-full text-xs mt-1" style={{ color: '#DC2626' }}>
          {error}
        </p>
      )}
      {success && (
        <p className="w-full text-xs mt-1" style={{ color: colors.success }}>
          Invite sent. User must have an account with this email.
        </p>
      )}
    </form>
  );
}
