import { useState } from 'react';
import type { MemberRole } from '../types';

interface InviteMemberFormProps {
  onInvite: (email: string, role: MemberRole) => Promise<void>;
}

export function InviteMemberForm({ onInvite }: InviteMemberFormProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<MemberRole>('editor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 mb-4">
      <div className="flex-1 min-w-[180px]">
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="teammate@example.com"
          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as MemberRole)}
          className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
        >
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark disabled:opacity-50"
      >
        {loading ? 'Inviting…' : 'Invite'}
      </button>
      {error && <p className="w-full text-sm text-red-500">{error}</p>}
      {success && <p className="w-full text-sm text-success">Invite sent. User must have an account with this email.</p>}
    </form>
  );
}
