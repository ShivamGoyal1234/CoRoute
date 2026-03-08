import type { Membership, MemberRole } from '../../types';
import { getInitials } from '../../utils/helpers';
import { InviteMemberForm } from '../../components';
import { landingColors } from '../../landing/theme';

interface ShareTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Membership[];
  isOwner: boolean;
  onInvite: (email: string, role: MemberRole) => Promise<void>;
  onRemoveMember: (membershipId: string) => Promise<void>;
  onUpdateRole: (membershipId: string, role: MemberRole) => Promise<void>;
}

export function ShareTripModal({
  isOpen,
  onClose,
  members,
  isOwner,
  onInvite,
  onRemoveMember,
  onUpdateRole,
}: ShareTripModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="rounded-xl border bg-white dark:bg-slate-800 w-full max-w-md max-h-[90vh] overflow-hidden shadow-xl flex flex-col"
        style={{ borderColor: 'rgba(226, 232, 240, 0.8)' }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(226, 232, 240, 0.8)' }}>
          <h2 className="font-semibold text-lg" style={{ color: landingColors.text }}>Share trip</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500" aria-label="Close">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4">
          {isOwner && <InviteMemberForm onInvite={onInvite} />}
          <ul className="divide-y" style={{ borderColor: 'rgba(226, 232, 240, 0.8)' }}>
            {members.map((m) => {
              const u = typeof m.userId === 'object' ? m.userId : null;
              const name = u?.name ?? 'Unknown';
              const email = u?.email ?? '';
              return (
                <li key={m._id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm" style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', color: landingColors.primary }}>
                      {u?.avatarUrl ? <img src={u.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" /> : getInitials(name)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-100">{name}</p>
                      <p className="text-sm text-slate-500">{email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOwner && m.role !== 'owner' && (
                      <>
                        <select
                          value={m.role}
                          onChange={(e) => onUpdateRole(m._id, e.target.value as MemberRole)}
                          className="text-sm rounded border px-2 py-1"
                          style={{ borderColor: 'rgba(226, 232, 240, 0.8)' }}
                        >
                          <option value="editor">Editor</option>
                          <option value="viewer">Viewer</option>
                        </select>
                        <button type="button" onClick={() => onRemoveMember(m._id)} className="text-sm text-red-600 hover:underline">Remove</button>
                      </>
                    )}
                    {m.role === 'owner' && (
                      <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', color: landingColors.primary }}>Owner</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
