import { useEffect, useState } from 'react';
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

type LocalMember = Membership & { pendingRole: MemberRole };

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
  const [localMembers, setLocalMembers] = useState<LocalMember[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLocalMembers(members.map((m) => ({ ...m, pendingRole: m.role })));
    }
  }, [isOpen, members]);

  if (!isOpen) return null;

  const handleChangeRole = (membershipId: string, role: MemberRole) => {
    setLocalMembers((prev) =>
      prev.map((m) => (m._id === membershipId ? { ...m, pendingRole: role } : m))
    );
  };

  const handleRemoveLocal = (membershipId: string) => {
    setLocalMembers((prev) => prev.filter((m) => m._id !== membershipId));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const originalById = new Map(members.map((m) => [m._id, m]));
      const currentById = new Map(localMembers.map((m) => [m._id, m]));

      for (const m of localMembers) {
        const original = originalById.get(m._id);
        if (original && original.role !== m.pendingRole) {
          await onUpdateRole(m._id, m.pendingRole);
        }
      }

      for (const original of members) {
        if (!currentById.has(original._id) && original.role !== 'owner') {
          await onRemoveMember(original._id);
        }
      }

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="rounded-xl border w-full max-w-md max-h-[90vh] overflow-hidden shadow-xl flex flex-col"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: colors.border }}>
          <h2 className="font-semibold text-lg" style={{ color: colors.text }}>Share trip</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg"
            style={{ color: colors.textMuted }}
            aria-label="Close"
            disabled={isSubmitting}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.background;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4">
          {isOwner && <InviteMemberForm onInvite={onInvite} />}
          <ul className="divide-y" style={{ borderColor: colors.border }}>
            {localMembers.map((m) => {
              const u = typeof m.userId === 'object' ? m.userId : null;
              const name = u?.name ?? 'Unknown';
              const email = u?.email ?? '';
              const isOwnerMember = m.role === 'owner';
              return (
                <li key={m._id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm"
                      style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', color: colors.primary }}
                    >
                      {u?.avatarUrl ? (
                        <img src={u.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        getInitials(name)
                      )}
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: colors.text }}>
                        {name}
                      </p>
                      <p className="text-sm" style={{ color: colors.textMuted }}>
                        {email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOwner && !isOwnerMember && (
                      <>
                        <select
                          value={m.pendingRole}
                          onChange={(e) => handleChangeRole(m._id, e.target.value as MemberRole)}
                          className="text-sm rounded border px-2 py-1"
                          style={{ borderColor: colors.border }}
                          disabled={isSubmitting}
                        >
                          <option value="editor">Editor</option>
                          <option value="viewer">Viewer</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleRemoveLocal(m._id)}
                          className="text-sm text-red-600 hover:underline"
                          disabled={isSubmitting}
                        >
                          Remove
                        </button>
                      </>
                    )}
                    {isOwnerMember && (
                      <span
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', color: colors.primary }}
                      >
                        Owner
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="px-4 py-3 border-t flex justify-end gap-2" style={{ borderColor: colors.border }}>
          <button
            type="button"
            className="px-3 py-1.5 text-sm rounded-lg"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-3 py-1.5 text-sm rounded-lg text-white"
            style={{ backgroundColor: colors.primary, opacity: isSubmitting ? 0.7 : 1 }}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
