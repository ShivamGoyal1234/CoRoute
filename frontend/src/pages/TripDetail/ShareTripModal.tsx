import type { Membership, MemberRole } from '../../types';
import { getInitials } from '../../utils/helpers';
import { InviteMemberForm } from '../../components';
import { useLandingColors } from '../../landing/theme';

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
  const colors = useLandingColors();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="rounded-xl border w-full max-w-md max-h-[90vh] overflow-hidden shadow-xl flex flex-col"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: colors.border }}>
          <h2 className="font-semibold text-lg" style={{ color: colors.text }}>Share trip</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg" style={{ color: colors.textMuted }} aria-label="Close" onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.background; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4">
          {isOwner && <InviteMemberForm onInvite={onInvite} />}
          <ul className="divide-y" style={{ borderColor: colors.border }}>
            {members.map((m) => {
              const u = typeof m.userId === 'object' ? m.userId : null;
              const name = u?.name ?? 'Unknown';
              const email = u?.email ?? '';
              return (
                <li key={m._id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm" style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', color: colors.primary }}>
                      {u?.avatarUrl ? <img src={u.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" /> : getInitials(name)}
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: colors.text }}>{name}</p>
                      <p className="text-sm" style={{ color: colors.textMuted }}>{email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOwner && m.role !== 'owner' && (
                      <>
                        <select
                          value={m.role}
                          onChange={(e) => onUpdateRole(m._id, e.target.value as MemberRole)}
                          className="text-sm rounded border px-2 py-1"
                          style={{ borderColor: colors.border }}
                        >
                          <option value="editor">Editor</option>
                          <option value="viewer">Viewer</option>
                        </select>
                        <button type="button" onClick={() => onRemoveMember(m._id)} className="text-sm text-red-600 hover:underline">Remove</button>
                      </>
                    )}
                    {m.role === 'owner' && (
                      <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', color: colors.primary }}>Owner</span>
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
