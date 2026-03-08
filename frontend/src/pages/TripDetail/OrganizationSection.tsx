import { useRef, useState } from 'react';
import type { ChecklistItem, TripFile } from '../../types';
import type { Membership } from '../../types';
import { getInitials } from '../../utils/helpers';
import { fileUrl } from '../../lib/api';
import { useLandingColors } from '../../landing/theme';

const PACKING_CATEGORY = 'packing';
const PRETRIP_CATEGORY = 'booking';

const CHECKLIST_GROUPS: { key: typeof PACKING_CATEGORY | typeof PRETRIP_CATEGORY; title: string; icon: 'suitcase' | 'document' }[] = [
  { key: PACKING_CATEGORY, title: 'Packing Checklist', icon: 'suitcase' },
  { key: PRETRIP_CATEGORY, title: 'Pre-Trip Tasks', icon: 'document' },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatAdded(uploadedAt: string): string {
  const date = new Date(uploadedAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

function isImageFile(fileType: string, fileName: string): boolean {
  return /^image\//.test(fileType) || /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
}

function isPdfFile(fileType: string, fileName: string): boolean {
  return fileType === 'application/pdf' || /\.pdf$/i.test(fileName);
}

interface OrganizationSectionProps {
  tripTitle: string;
  members: Membership[];
  checklists: ChecklistItem[];
  tripFiles: TripFile[];
  canEdit: boolean;
  isViewer: boolean;
  newChecklistTask: string;
  setNewChecklistTask: (v: string) => void;
  onAddChecklistToCategory: (task: string, category: string) => void;
  onToggleChecklist: (item: ChecklistItem) => void;
  onDeleteChecklistItem: (itemId: string) => void;
  onUploadFile: (file: File) => void;
  onDeleteFile: (fileId: string) => void;
}

function ChecklistIcon({ name }: { name: 'suitcase' | 'document' }) {
  const c = 'w-4 h-4 shrink-0 text-white';
  if (name === 'suitcase') {
    return (
      <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
  }
  return (
    <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

export function OrganizationSection({
  tripTitle,
  members,
  checklists,
  tripFiles,
  canEdit,
  isViewer,
  newChecklistTask,
  setNewChecklistTask,
  onAddChecklistToCategory,
  onToggleChecklist,
  onDeleteChecklistItem: _onDeleteChecklistItem,
  onUploadFile,
  onDeleteFile,
}: OrganizationSectionProps) {
  const colors = useLandingColors();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [addingToCategory, setAddingToCategory] = useState<string | null>(null);
  const [showViewerAccess, setShowViewerAccess] = useState(false);

  const viewers = members.filter((m) => m.role === 'viewer');

  const handleShare = async (file: TripFile) => {
    const url = fileUrl(file.fileUrl);
    try {
      if (navigator.share) {
        await navigator.share({
          title: file.fileName,
          url,
          text: `Check out ${file.fileName}`,
        });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(url);
        } catch {
          // ignore
        }
      }
    }
  };

  const packingItems = checklists.filter((i) => (i.category ?? 'other') === PACKING_CATEGORY);
  const preTripItems = checklists.filter((i) => (i.category ?? 'other') === PRETRIP_CATEGORY);
  const otherItems = checklists.filter((i) => {
    const c = i.category ?? 'other';
    return c !== PACKING_CATEGORY && c !== PRETRIP_CATEGORY;
  });

  const groups: { key: string; title: string; icon: 'suitcase' | 'document'; items: ChecklistItem[] }[] = [
    { ...CHECKLIST_GROUPS[0], items: packingItems },
    { ...CHECKLIST_GROUPS[1], items: preTripItems },
  ];
  if (otherItems.length > 0) {
    groups.push({ key: 'other', title: 'Other', icon: 'document', items: otherItems });
  }

  const extraCount = members.length > 2 ? members.length - 2 : 0;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        onUploadFile(files[i]);
      }
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    const files = e.dataTransfer.files;
    for (let i = 0; i < files.length; i++) {
      onUploadFile(files[i]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (canEdit) e.dataTransfer.dropEffect = 'copy';
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-6 w-full" style={{ backgroundColor: colors.background }}>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
        onChange={handleFileSelect}
      />
      {showViewerAccess && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowViewerAccess(false)}
        >
          <div
            className="rounded-xl shadow-xl max-w-sm w-full p-4"
            style={{ backgroundColor: colors.surface }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold" style={{ color: colors.text }}>Viewer Access</h3>
              <button
                type="button"
                onClick={() => setShowViewerAccess(false)}
                className="p-1 rounded transition-colors"
                style={{ color: colors.textMuted }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.background; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-xs mb-3" style={{ color: colors.textMuted }}>
              Viewers can only view and download files. They cannot edit, delete, or upload.
            </p>
            {viewers.length === 0 ? (
              <p className="text-sm py-2" style={{ color: colors.textMuted }}>No viewers in this trip.</p>
            ) : (
              <ul className="space-y-2">
                {viewers.map((m) => {
                  const u = typeof m.userId === 'object' ? m.userId : null;
                  const name = u?.name ?? '?';
                  const email = u && 'email' in u ? u.email : '';
                  return (
                    <li key={m._id} className="flex items-center gap-2 py-1.5">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 overflow-hidden"
                        style={{ backgroundColor: colors.background, color: colors.primary }}
                      >
                        {u && 'avatarUrl' in u && u.avatarUrl ? (
                          <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          getInitials(name)
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate" style={{ color: colors.text }}>{name}</p>
                        {email && <p className="text-xs truncate" style={{ color: colors.textMuted }}>{email}</p>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
      <div className="max-w-6xl">
        <div
          className="py-6 mb-6"
          style={{ backgroundColor: colors.background }}
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 shrink-0" style={{ color: colors.primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary }}>
                  Collaborative workspace
                </p>
              </div>
              <h1 className="text-3xl font-bold mb-1.5" style={{ color: colors.text }}>
                Trip Organization & Files
              </h1>
              <p className="text-sm" style={{ color: colors.textMuted }}>
                Manage your checklists, travel documents, and shared assets for the {tripTitle} trip.
              </p>
            </div>
            <div className="flex items-center mt-4 sm:mt-0 gap-3 shrink-0 self-start sm:self-end">
              <div className="flex items-center gap-2">
                {members.slice(0, 2).map((m, i) => {
                  const u = typeof m.userId === 'object' ? m.userId : null;
                  const name = u?.name ?? '?';
                  return (
                    <div
                      key={m._id}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium border-2 shadow shrink-0 overflow-hidden"
                      style={{ marginLeft: i > 0 ? -10 : 0, zIndex: 2 - i, backgroundColor: colors.border, borderColor: colors.surface }}
                      title={name}
                    >
                      {u && 'avatarUrl' in u && u.avatarUrl ? (
                        <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span style={{ color: colors.primary }}>{getInitials(name)}</span>
                      )}
                    </div>
                  );
                })}
                {extraCount > 0 && (
                  <span className="text-sm font-medium" style={{ color: colors.textMuted }}>+{extraCount}</span>
                )}
              </div>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-10 px-5 rounded-2xl font-medium text-white transition-opacity hover:opacity-95 flex items-center gap-2 shrink-0"
                  style={{
                    backgroundColor: colors.primary,
                    boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.35)',
                  }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload Document
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            

            {groups.map(({ key, title, icon, items }) => {
              const done = items.filter((i) => i.isCompleted).length;
              const total = items.length;
              return (
                <div
                  key={key}
                  className="rounded-xl p-5 shadow-sm"
                  style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderStyle: 'solid' }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: '#22c55e' }}
                    >
                      <span className="text-white">
                        <ChecklistIcon name={icon} />
                      </span>
                    </div>
                    <h2 className="font-bold text-base" style={{ color: colors.text }}>
                      {title}
                    </h2>
                    <span
                      className="text-xs ml-auto px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: colors.background, color: colors.textMuted }}
                    >
                      {done}/{total} {key === PACKING_CATEGORY ? 'Items' : 'Done'}
                    </span>
                  </div>
                  <ul className="space-y-3">
                    {items.slice(0, 6).map((item) => (
                      <li key={item._id} className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => canEdit && onToggleChecklist(item)}
                          disabled={!canEdit}
                          className="w-5 h-5 rounded flex items-center justify-center shrink-0 border-2 transition-colors"
                          style={{
                            backgroundColor: item.isCompleted ? '#10B981' : 'transparent',
                            borderColor: item.isCompleted ? '#10B981' : colors.border,
                          }}
                        >
                          {item.isCompleted && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <span
                          className="flex-1 text-sm truncate"
                          style={{ color: item.isCompleted ? colors.textMuted : colors.text, textDecoration: item.isCompleted ? 'line-through' : 'none' }}
                        >
                          {item.task}
                        </span>
                        {item.isCompleted && (
                          <span className="w-4 h-4 shrink-0 rounded-full flex items-center justify-center" style={{ backgroundColor: '#10B981' }}>
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                  {items.length > 6 && (
                    <p className="text-xs mt-2" style={{ color: colors.textMuted }}>
                      +{items.length - 6} more
                    </p>
                  )}
                  {items.length === 0 && (
                    <p className="text-sm" style={{ color: colors.textMuted }}>
                      No items yet.
                    </p>
                  )}
                  {canEdit && (
                    addingToCategory === key ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (newChecklistTask.trim()) {
                            onAddChecklistToCategory(newChecklistTask.trim(), key);
                            setNewChecklistTask('');
                            setAddingToCategory(null);
                          }
                        }}
                        className="mt-4 flex gap-2"
                      >
                        <input
                          value={newChecklistTask}
                          onChange={(e) => setNewChecklistTask(e.target.value)}
                          placeholder="New task (e.g. Pack passport)"
                          className="flex-1 min-w-0 px-3 py-2 rounded-lg border text-sm"
                          style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.text }}
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-lg text-sm font-medium text-white shrink-0"
                          style={{ backgroundColor: colors.primary }}
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAddingToCategory(null);
                            setNewChecklistTask('');
                          }}
                          className="px-3 py-2 rounded-lg text-sm transition-colors"
                          style={{ color: colors.text }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.background; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setAddingToCategory(key);
                          setNewChecklistTask('');
                        }}
                        className="block w-full text-center text-sm font-medium mt-4 py-2"
style={{ color: colors.primary }}
                        >
                        + Add New Item
                      </button>
                    )
                  )}
                </div>
              );
            })}
          </div>

          <div className="space-y-4">
            <div
              className="rounded-xl border p-4 max-h-[calc(100vh-6rem)] overflow-y-auto"
              style={{ borderColor: colors.border, backgroundColor: colors.surface }}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  <h2 className="font-semibold text-sm" style={{ color: colors.text }}>
                    Shared File Vault
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowViewerAccess(true)}
                  className="text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors"
                  style={{
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: colors.text }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Viewer Access
                </button>
              </div>
              <p className="text-xs mb-4" style={{ color: colors.textMuted }}>
                Only Admins & Editors can manage files.
              </p>

              <hr className="my-4 border-t" style={{ borderColor: colors.border }} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tripFiles.map((file) => (
                  <div
                    key={file._id}
                    className="rounded-lg border overflow-hidden"
                    style={{ borderColor: colors.border, backgroundColor: colors.surface }}
                  >
                    <div className="relative aspect-[4/3]" style={{ backgroundColor: colors.background }}>
                      {isPdfFile(file.fileType, file.fileName) ? (
                        <>
                          <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: colors.border }}>
                            <span className="text-2xl font-medium text-white">PDF</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleShare(file); }}
                            className="absolute top-2 right-2 w-7 h-7 rounded flex items-center justify-center cursor-pointer transition-colors"
                            style={{ backgroundColor: colors.surface }}
                            title="Share"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: colors.textMuted }}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                          </button>
                        </>
                      ) : isImageFile(file.fileType, file.fileName) ? (
                        <>
                          <img
                            src={fileUrl(file.fileUrl)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleShare(file); }}
                            className="absolute top-2 right-2 w-7 h-7 rounded flex items-center justify-center cursor-pointer transition-colors"
                            style={{ backgroundColor: colors.surface }}
                            title="Share"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: colors.textMuted }}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                          </button>
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 text-xs font-medium text-white bg-black/50 rounded">
                            Image Preview
                          </span>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xl font-medium" style={{ color: colors.textMuted }}>Doc</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold truncate" style={{ color: colors.text }}>
                        {file.fileName}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>
                        ADDED {formatAdded(file.uploadedAt).toUpperCase()} • {formatFileSize(file.fileSize)}
                      </p>
                      <div className="flex items-center justify-between gap-2 mt-2">
                        <a
                          href={fileUrl(file.fileUrl)}
                          download={file.fileName}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-medium flex items-center gap-1 hover:underline"
                          style={{ color: colors.primary }}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
                        </a>
                        {canEdit ? (
                          <button
                            type="button"
                            onClick={() => onDeleteFile(file._id)}
                            className="text-xs text-red-500 hover:underline"
                            title="Delete file"
                          >
                            Delete
                          </button>
                        ) : (
                          <span className="text-xs flex items-center gap-1" style={{ color: colors.textMuted }}>
                            No delete perm.
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: colors.textMuted }}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a2 2 0 00-2-2h-2M4 7v2a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2z" />
                            </svg>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {canEdit ? (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="mt-4 border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
                  style={{ borderColor: colors.border }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.primary; e.currentTarget.style.opacity = '1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.opacity = '1'; }}
                >
                  <span className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.background, color: colors.textMuted }}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                  <span className="text-sm font-medium" style={{ color: colors.text }}>
                    Drop files to upload
                  </span>
                  <span className="text-xs" style={{ color: colors.textMuted }}>
                    Max size 20MB
                  </span>
                </div>
              ) : (
                <div
className="mt-4 border border-dashed rounded-lg p-4 flex items-center justify-center gap-2"
                style={{ borderColor: colors.border }}
                >
                  <span className="text-sm" style={{ color: colors.textMuted }}>
                    Max size 20MB (upload not available for viewers)
                  </span>
                </div>
              )}
            </div>

            {isViewer && (
              <div
                className="flex items-start gap-2 p-3 rounded-lg border"
                style={{ backgroundColor: 'rgba(250, 204, 21, 0.15)', borderColor: 'rgba(250, 204, 21, 0.4)' }}
              >
                <svg className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold mb-0.5" style={{ color: colors.text }}>Role-Based Access Control</p>
                  <p className="text-sm" style={{ color: colors.text }}>
                    You are currently logged in with Viewer permissions. You can view and download all shared files, but only the Trip Owner{(() => {
                      const owner = members.find((m) => m.role === 'owner');
                      const u = owner && typeof owner.userId === 'object' ? owner.userId : null;
                      const name = u && 'name' in u ? u.name : null;
                      return name ? ` (${name})` : '';
                    })()} can delete or rename documents.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
