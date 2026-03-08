import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { activitiesApi, commentsApi, attachmentsApi, attachmentUrl } from '../lib/api';
import type { Activity, Comment, Attachment, ExpenseCategory } from '../types';
import { formatPrice, formatTime, getInitials } from '../utils/helpers';
import { useAuth } from '../contexts/AuthContext';
import { useSocket, type TypingUser } from '../contexts/SocketContext';
import { useLandingColors } from '../landing/theme';

const TYPING_DEBOUNCE_MS = 400;

interface ActivityDetailModalProps {
  activityId: string;
  canEdit: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onDelete?: (activityId: string) => void;
  useRealtime?: boolean;
}

export function ActivityDetailModal({ activityId, canEdit, onClose, onUpdate, onDelete, useRealtime }: ActivityDetailModalProps) {
  const colors = useLandingColors();
  const { user } = useAuth();
  const { onCommentNew, onAttachmentNew, onAttachmentRemoved, emitTypingStart, emitTypingStop, typingByActivity } = useSocket();
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [uploading, setUploading] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    activitiesApi
      .get(activityId)
      .then(({ data }) => {
        setActivity(data.activity);
        setComments(data.comments);
        setAttachments(data.attachments);
      })
      .finally(() => setLoading(false));
  }, [activityId]);

  useEffect(() => {
    if (!useRealtime) return;
    const unsub = onCommentNew((comment: any) => {
      if (comment.activityId !== activityId) return;
      setComments((prev) => {
        if (prev.some((c) => c._id === comment._id)) return prev;
        return [...prev, comment];
      });
    });
    return unsub;
  }, [useRealtime, activityId, onCommentNew]);

  useEffect(() => {
    if (!useRealtime) return;
    const unsubNew = onAttachmentNew(({ activityId: aid, attachment }) => {
      if (aid !== activityId) return;
      setAttachments((prev) => {
        if (prev.some((a) => a._id === (attachment._id ?? attachment.id))) return prev;
        return [attachment as Attachment, ...prev];
      });
    });
    const unsubRemoved = onAttachmentRemoved(({ activityId: aid, attachmentId }) => {
      if (aid !== activityId) return;
      setAttachments((prev) => prev.filter((a) => a._id !== attachmentId));
    });
    return () => {
      unsubNew();
      unsubRemoved();
    };
  }, [useRealtime, activityId, onAttachmentNew, onAttachmentRemoved]);

  const handleCommentChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setNewComment(e.target.value);
      if (!useRealtime) return;
      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
      typingDebounceRef.current = setTimeout(() => {
        emitTypingStart(activityId, activity?.title);
        typingDebounceRef.current = null;
      }, TYPING_DEBOUNCE_MS);
    },
    [useRealtime, activityId, activity?.title, emitTypingStart]
  );

  const handleCommentBlur = useCallback(() => {
    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current);
      typingDebounceRef.current = null;
    }
    emitTypingStop(activityId);
  }, [activityId, emitTypingStop]);

  const typingUsers = (useRealtime ? typingByActivity[activityId] ?? [] : []).filter(
    (t: TypingUser) => t.userId !== user?.id
  );

  const handleSaveActivity = async (updates: Partial<Activity>) => {
    try {
      await activitiesApi.update(activityId, updates);
      setActivity((a) => (a ? { ...a, ...updates } : null));
      onUpdate();
    } catch {}
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    handleCommentBlur();
    try {
      const { data } = await commentsApi.create(activityId, newComment.trim());
      setComments((c) => {
        if (c.some((x) => x._id === data.comment._id)) return c;
        return [...c, data.comment];
      });
      setNewComment('');
    } catch {}
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentsApi.delete(commentId);
      setComments((c) => c.filter((x) => x._id !== commentId));
    } catch {}
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await attachmentsApi.upload(activityId, file);
      setAttachments((a) => [data.attachment, ...a]);
      onUpdate();
    } catch (err: any) {
      alert(err.response?.data?.error ?? 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteAttachment = async (id: string) => {
    try {
      await attachmentsApi.delete(id);
      setAttachments((a) => a.filter((x) => x._id !== id));
    } catch {}
  };

  const handleDeleteClick = () => setConfirmDeleteOpen(true);
  const handleConfirmDelete = () => {
    setConfirmDeleteOpen(false);
    onDelete?.(activityId);
  };

  const content = (
    <>
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col"
        style={{ backgroundColor: colors.surface }}
      >
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: colors.border }}>
          <h2 className="text-lg font-semibold" style={{ color: colors.text }}>
            {loading ? 'Loading…' : activity?.title ?? 'Activity'}
          </h2>
          <div className="flex items-center gap-1">
            {canEdit && onDelete && (
              <button
                type="button"
                onClick={handleDeleteClick}
                className="px-3 py-1.5 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
              >
                Delete
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors"
              style={{ color: colors.textMuted }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.background; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <p style={{ color: colors.textMuted }}>Loading…</p>
          ) : activity ? (
            <>
              {canEdit && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium" style={{ color: colors.textMuted }}>Title</label>
                  <input
                    type="text"
                    value={activity.title}
                    onChange={(e) => setActivity((a) => (a ? { ...a, title: e.target.value } : null))}
                    onBlur={(e) => handleSaveActivity({ title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                    style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.text }}
                  />
                  <div>
                    <label className="block text-sm" style={{ color: colors.textMuted }}>Description</label>
                    <textarea
                      value={activity.description ?? ''}
                      onChange={(e) => setActivity((a) => (a ? { ...a, description: e.target.value } : null))}
                      onBlur={(e) => handleSaveActivity({ description: e.target.value || undefined })}
                      rows={2}
                      placeholder="Optional"
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.text }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm" style={{ color: colors.textMuted }}>Time</label>
                      <input
                        type="time"
                        value={activity.startTime ?? ''}
                        onChange={(e) => setActivity((a) => (a ? { ...a, startTime: e.target.value || undefined } : null))}
                        onBlur={(e) => handleSaveActivity({ startTime: e.target.value || undefined })}
                        className="w-full px-3 py-2 rounded-lg border text-sm"
                        style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.text }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm" style={{ color: colors.textMuted }}>Image URL</label>
                      <input
                        type="url"
                        value={activity.imageUrl ?? ''}
                        onChange={(e) => setActivity((a) => (a ? { ...a, imageUrl: e.target.value || undefined } : null))}
                        onBlur={(e) => handleSaveActivity({ imageUrl: e.target.value || undefined })}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-lg border text-sm"
                        style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.text }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm" style={{ color: colors.textMuted }}>Location</label>
                      <input
                        type="text"
                        value={activity.location ?? ''}
                        onChange={(e) => setActivity((a) => (a ? { ...a, location: e.target.value } : null))}
                        onBlur={(e) => handleSaveActivity({ location: e.target.value || undefined })}
                        className="w-full px-3 py-2 rounded-lg border text-sm"
                        style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.text }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm" style={{ color: colors.textMuted }}>Cost</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={activity.cost ?? ''}
                        onChange={(e) => setActivity((a) => (a ? { ...a, cost: e.target.value ? Number(e.target.value) : undefined } : null))}
                        onBlur={(e) => handleSaveActivity({ cost: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full px-3 py-2 rounded-lg border text-sm"
                        style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.text }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm" style={{ color: colors.textMuted }}>Expense category (for map)</label>
                    <select
                      value={activity.expenseCategory ?? 'other'}
                      onChange={(e) => {
                        const expenseCategory = e.target.value as ExpenseCategory;
                        setActivity((a) => (a ? { ...a, expenseCategory } : null));
                        handleSaveActivity({ expenseCategory });
                      }}
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.text }}
                    >
                      <option value="food">Food</option>
                      <option value="shop">Shopping</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm" style={{ color: colors.textMuted }}>Status</label>
                    <select
                      value={activity.status}
                      onChange={(e) => {
                        const status = e.target.value as Activity['status'];
                        setActivity((a) => (a ? { ...a, status } : null));
                        handleSaveActivity({ status });
                      }}
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.text }}
                    >
                      <option value="planned">Planned</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              )}
              {!canEdit && (
                <div className="text-sm space-y-2" style={{ color: colors.textMuted }}>
                  {activity.startTime && <p>Time: {formatTime(activity.startTime)}</p>}
                  {activity.description && <p>{activity.description}</p>}
                  {activity.location && <p>Location: {activity.location}</p>}
                  {activity.cost != null && activity.cost > 0 && (
                    <p>
                      Cost: {formatPrice(activity.cost, 'USD')}
                      {activity.expenseCategory && ` · ${activity.expenseCategory === 'food' ? 'Food' : activity.expenseCategory === 'shop' ? 'Shopping' : 'Other'}`}
                    </p>
                  )}
                  {activity.imageUrl && (
                    <img src={activity.imageUrl.startsWith('http') ? activity.imageUrl : attachmentUrl(activity.imageUrl)} alt="" className="rounded-lg max-h-48 object-cover w-full mt-2" />
                  )}
                </div>
              )}

              <div>
                <h3 className="font-medium mb-2" style={{ color: colors.text }}>Comments</h3>
                <ul className="space-y-2 mb-3">
                  {comments.map((c) => {
                    const author = typeof c.userId === 'object' ? c.userId : null;
                    const isOwn = user && author && (author as any)._id === user.id;
                    return (
                      <li key={c._id} className="flex items-start gap-2 p-2 rounded-lg" style={{ backgroundColor: colors.background }}>
                        <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium" style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', color: colors.primary }}>
                          {author ? getInitials((author as any).name) : '?'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm" style={{ color: colors.text }}>{c.content}</p>
                          <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>
                            {author && (author as any).name} · {new Date(c.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {isOwn && (
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(c._id)}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Delete
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
                {typingUsers.length > 0 && (
                  <p className="text-xs mb-2" style={{ color: colors.textMuted }}>
                    {typingUsers.map((u: TypingUser) => u.userName).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing…
                  </p>
                )}
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    value={newComment}
                    onChange={handleCommentChange}
                    onBlur={handleCommentBlur}
                    placeholder="Add a comment…"
                    className="flex-1 px-3 py-2 rounded-lg border text-sm"
                    style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.text }}
                  />
                  <button type="submit" className="px-3 py-2 rounded-lg text-white text-sm" style={{ backgroundColor: colors.primary }}>Send</button>
                </form>
              </div>

              <div>
                <h3 className="font-medium mb-2" style={{ color: colors.text }}>Attachments</h3>
                {canEdit && (
                  <label className="inline-block mb-2">
                    <span
                      className="px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors"
                      style={{ backgroundColor: colors.background, color: colors.text }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.border; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.background; }}
                    >
                      {uploading ? 'Uploading…' : 'Upload file'}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx,.txt"
                      onChange={handleUpload}
                      disabled={uploading}
                    />
                  </label>
                )}
                <ul className="space-y-2">
                  {attachments.map((att) => (
                    <li key={att._id} className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: colors.background }}>
                      <a
                        href={attachmentUrl(att.fileUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm hover:underline truncate"
                        style={{ color: colors.primary }}
                      >
                        {att.fileName}
                      </a>
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAttachment(att._id)}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
                {attachments.length === 0 && !canEdit && <p className="text-sm" style={{ color: colors.textMuted }}>No attachments.</p>}
              </div>
            </>
          ) : null}
        </div>
      </motion.div>
    </div>

    {confirmDeleteOpen && (
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60"
        onClick={() => setConfirmDeleteOpen(false)}
        aria-modal
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={(e) => e.stopPropagation()}
          className="rounded-xl shadow-xl max-w-sm w-full p-6"
          style={{ backgroundColor: colors.surface }}
        >
          <h3 className="text-lg font-semibold mb-2" style={{ color: colors.text }}>
            Delete activity
          </h3>
          <p className="text-sm mb-6" style={{ color: colors.textMuted }}>
            Delete this activity? This cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setConfirmDeleteOpen(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
              style={{ borderColor: colors.border, color: colors.text }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.background; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </motion.div>
      </div>
    )}
    </>
  );

  return createPortal(content, document.body);
}
