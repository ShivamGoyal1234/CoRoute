import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { Activity, Comment } from '../../types';
import { formatTime, getInitials } from '../../utils/helpers';
import { attachmentUrl, activitiesApi, commentsApi } from '../../lib/api';
import { useSocket, type TypingUser } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLandingColors } from '../../landing/theme';

const TYPING_DEBOUNCE_MS = 400;

interface ActivityTimelineCardProps {
  activity: Activity;
  index: number;
  onOpenDetail: () => void;
  onOpenChat?: (activityId: string) => void;
  onCloseDiscussion?: () => void;
  isDiscussionOpen?: boolean;
  canEdit?: boolean;
  onDiscussionUpdate?: () => void;
  showDragHandle?: boolean;
  useRealtimeTyping?: boolean;
}

export function ActivityTimelineCard({
  activity,
  index,
  onOpenDetail,
  onOpenChat,
  onCloseDiscussion,
  isDiscussionOpen,
  canEdit,
  onDiscussionUpdate,
  showDragHandle,
  useRealtimeTyping,
}: ActivityTimelineCardProps) {
  const colors = useLandingColors();
  const { typingByActivity, onCommentNew, emitTypingStart, emitTypingStop } = useSocket();
  const { user } = useAuth();
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);

  const typingUsers = useRealtimeTyping ? (typingByActivity[activity._id] ?? []).filter((t: TypingUser) => t.userId !== user?.id) : [];

  useEffect(() => {
    if (!isDiscussionOpen) return;
    setCommentsLoading(true);
    activitiesApi
      .get(activity._id)
      .then(({ data }) => setComments(data.comments ?? []))
      .finally(() => setCommentsLoading(false));
  }, [isDiscussionOpen, activity._id]);

  useEffect(() => {
    if (!isDiscussionOpen) return;
    const unsub = onCommentNew((comment: any) => {
      if (comment.activityId !== activity._id) return;
      setComments((prev) => {
        if (prev.some((c) => c._id === comment._id)) return prev;
        return [...prev, comment];
      });
    });
    return unsub;
  }, [isDiscussionOpen, activity._id, onCommentNew]);

  const handleCommentChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setNewComment(e.target.value);
      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
      typingDebounceRef.current = setTimeout(() => {
        emitTypingStart(activity._id, activity.title);
        typingDebounceRef.current = null;
      }, TYPING_DEBOUNCE_MS);
    },
    [activity._id, activity.title, emitTypingStart]
  );

  const handleCommentBlur = useCallback(() => {
    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current);
      typingDebounceRef.current = null;
    }
    emitTypingStop(activity._id);
  }, [activity._id, emitTypingStop]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    handleCommentBlur();
    try {
      const { data } = await commentsApi.create(activity._id, newComment.trim());
      setComments((c) => (c.some((x) => x._id === data.comment._id) ? c : [...c, data.comment]));
      setNewComment('');
      onDiscussionUpdate?.();
    } catch {}
  };

  const handleDeleteComment = async (e: React.MouseEvent, commentId: string) => {
    e.stopPropagation();
    try {
      await commentsApi.delete(commentId);
      setComments((c) => c.filter((x) => x._id !== commentId));
    } catch {}
  };

  const imageSrc = activity.imageUrl
    ? (activity.imageUrl.startsWith('http') ? activity.imageUrl : attachmentUrl(activity.imageUrl))
    : null;

  return (
    <motion.div layout className="relative flex gap-4 pb-6">
      <div
        className="absolute left-0 w-6 h-6 rounded-full border-2 shadow flex items-center justify-center text-xs font-medium -translate-x-[5px]"
        style={{ borderColor: colors.surface, backgroundColor: colors.primary, color: '#fff' }}
      >
        {index + 1}
      </div>
      <div
        className="flex-1 flex flex-col rounded-xl border overflow-hidden cursor-pointer transition-shadow hover:shadow-md shadow-sm"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
        onClick={onOpenDetail}
      >
        <div className="flex items-stretch min-h-0 pt-4 pl-4">
          {imageSrc && (
            <div className="w-36 sm:w-44 shrink-0 rounded-xl overflow-hidden self-stretch" style={{ backgroundColor: colors.background }}>
              <img src={imageSrc} alt="" className="w-full h-full min-h-[140px] object-cover" />
            </div>
          )}
            <div className="flex-1 min-w-0 p-4 flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1 flex flex-wrap items-baseline gap-2">
                {showDragHandle && (
                  <span className="shrink-0 select-none" style={{ color: colors.textMuted }} title="Drag to reorder" aria-hidden>
                    ⋮⋮
                  </span>
                )}
                {activity.startTime && (
                  <span
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold shrink-0"
                    style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', color: colors.primary }}
                  >
                    {formatTime(activity.startTime)}
                  </span>
                )}
                <h3 className="font-bold text-lg" style={{ color: colors.text }}>{activity.title}</h3>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  className="p-1.5 rounded flex items-center gap-0.5"
                  style={{ backgroundColor: 'transparent', color: colors.accent }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.background; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenChat) onOpenChat(activity._id);
                    else onOpenDetail();
                  }}
                  aria-label="Comments"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {(activity.commentCount ?? 0) > 0 && (
                    <span className="text-xs font-medium" style={{ color: colors.textMuted }}>{activity.commentCount ?? 0}</span>
                  )}
                </button>
                <button type="button" className="p-1.5 rounded" style={{ color: colors.textMuted }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.background; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }} aria-label="More options">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                </button>
              </div>
            </div>
            {activity.description && (
              <p className="text-sm mt-2 line-clamp-2" style={{ color: colors.textMuted }}>{activity.description}</p>
            )}
            {activity.location && (
              <p className="text-sm mt-1.5 flex items-center gap-1.5" style={{ color: colors.textMuted }}>
                <svg className="w-4 h-4 shrink-0" style={{ color: colors.textMuted }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="truncate">{activity.location}</span>
              </p>
            )}
          </div>
        </div>
        {isDiscussionOpen ? (
          <div
            className="px-4 py-3 border-t"
            style={{ borderColor: colors.border, backgroundColor: colors.background }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>
                Comments
              </span>
              {onCloseDiscussion && (
                <button
                  type="button"
                  onClick={onCloseDiscussion}
                  className="p-1 rounded"
                  style={{ color: colors.textMuted }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.background; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  aria-label="Close"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {commentsLoading ? (
              <p className="text-xs" style={{ color: colors.textMuted }}>Loading comments…</p>
            ) : (
              <>
                <ul className="space-y-2 max-h-32 overflow-y-auto mb-3">
                  {comments.map((c) => {
                    const author = typeof c.userId === 'object' ? c.userId : null;
                    const isOwn = user && author && (author as { _id: string })._id === user.id;
                    return (
                      <li key={c._id} className="flex items-start gap-2">
                        <span
                          className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-medium"
                          style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', color: colors.primary }}
                        >
                          {author ? getInitials((author as { name?: string }).name ?? '') : '?'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm" style={{ color: colors.text }}>{c.content}</p>
                          <p className="text-xs" style={{ color: colors.textMuted }}>
                            {author && (author as { name?: string }).name}
                          </p>
                        </div>
                        {isOwn && canEdit && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteComment(e, c._id)}
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
                      style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.text }}
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
              </>
            )}
          </div>
        ) : (
          <div
            className="flex items-center gap-2 px-4 py-2.5 cursor-pointer transition-colors"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.background; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenChat) onOpenChat(activity._id);
            }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0"
              style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', color: colors.primary }}
            >
              {getInitials(typingUsers[0]?.userName ?? (index === 0 ? 'Sarah' : 'Mike'))}
            </div>
            <span className="text-xs" style={{ color: colors.textMuted }}>
              {typingUsers.length > 0
                ? `${typingUsers.map((u: TypingUser) => u.userName).join(', ')} ${typingUsers.length === 1 ? 'is' : 'are'} typing…`
                : 'Collaborate on this activity'}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
