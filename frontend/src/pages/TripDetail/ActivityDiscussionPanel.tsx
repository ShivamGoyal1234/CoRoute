import { useEffect, useState, useRef, useCallback } from 'react';
import { activitiesApi, commentsApi } from '../../lib/api';
import type { Activity, Comment } from '../../types';
import { getInitials } from '../../utils/helpers';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket, type TypingUser } from '../../contexts/SocketContext';
import { useLandingColors } from '../../landing/theme';

const TYPING_DEBOUNCE_MS = 400;

interface ActivityDiscussionPanelProps {
  activityId: string;
  canEdit: boolean;
  onClose: () => void;
  onOpenFullActivity: () => void;
  onUpdate: () => void;
}

export function ActivityDiscussionPanel({
  activityId,
  canEdit,
  onClose,
  onOpenFullActivity,
  onUpdate,
}: ActivityDiscussionPanelProps) {
  const { user } = useAuth();
  const { onCommentNew, emitTypingStart, emitTypingStop, typingByActivity } = useSocket();
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const colors = useLandingColors();

  useEffect(() => {
    activitiesApi
      .get(activityId)
      .then(({ data }) => {
        setActivity(data.activity);
        setComments(data.comments);
      })
      .finally(() => setLoading(false));
  }, [activityId]);

  useEffect(() => {
    const unsub = onCommentNew((comment: any) => {
      if (comment.activityId !== activityId) return;
      setComments((prev) => {
        if (prev.some((c) => c._id === comment._id)) return prev;
        return [...prev, comment];
      });
    });
    return unsub;
  }, [activityId, onCommentNew]);

  const handleCommentChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setNewComment(e.target.value);
      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
      typingDebounceRef.current = setTimeout(() => {
        emitTypingStart(activityId, activity?.title);
        typingDebounceRef.current = null;
      }, TYPING_DEBOUNCE_MS);
    },
    [activityId, activity?.title, emitTypingStart]
  );

  const handleCommentBlur = useCallback(() => {
    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current);
      typingDebounceRef.current = null;
    }
    emitTypingStop(activityId);
  }, [activityId, emitTypingStop]);

  const typingUsers = (typingByActivity[activityId] ?? []).filter((t: TypingUser) => t.userId !== user?.id);

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
      onUpdate();
    } catch {}
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentsApi.delete(commentId);
      setComments((c) => c.filter((x) => x._id !== commentId));
    } catch {}
  };

  if (loading) {
    return (
      <div
        className="w-96 shrink-0 flex flex-col border-l"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
        <div className="p-4 border-b" style={{ borderColor: colors.border }}>
          <p className="text-sm" style={{ color: colors.textMuted }}>Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-96 shrink-0 flex flex-col border-l overflow-hidden"
      style={{ borderColor: colors.border, backgroundColor: colors.surface }}
    >
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: colors.border }}>
        <h3 className="text-sm font-semibold truncate pr-2" style={{ color: colors.text }}>
          {activity?.title ?? 'Discussion'}
        </h3>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onOpenFullActivity}
            className="text-xs font-medium px-2 py-1 rounded"
            style={{ backgroundColor: 'transparent', color: colors.primary }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.background; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            View full
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded"
            style={{ color: colors.textMuted }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.background; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
        <div className="flex-1 min-h-0">
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: colors.textMuted }}>
            Comments
          </p>
          <ul className="space-y-2 mb-4">
            {comments.map((c) => {
              const author = typeof c.userId === 'object' ? c.userId : null;
              const isOwn = user && author && (author as any)._id === user.id;
              return (
                <li key={c._id} className="flex items-start gap-2 p-2 rounded-lg" style={{ backgroundColor: colors.background }}>
                  <span
                    className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-medium"
                    style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', color: colors.primary }}
                  >
                    {author ? getInitials((author as any).name) : '?'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ color: colors.text }}>{c.content}</p>
                    <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>
                      {author && (author as any).name} · {new Date(c.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {isOwn && canEdit && (
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(c._id)}
                      className="text-xs text-red-500 hover:underline shrink-0"
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
          {canEdit && (
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                value={newComment}
                onChange={handleCommentChange}
                onBlur={handleCommentBlur}
                placeholder="Add a comment…"
                className="flex-1 px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: colors.border }}
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-lg text-sm font-medium text-white shrink-0"
                style={{ backgroundColor: colors.primary }}
              >
                Send
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
