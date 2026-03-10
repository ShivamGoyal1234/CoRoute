import { useRef, useCallback, useState, useEffect } from 'react';
import { getInitials } from '../../utils/helpers';
import { useSocket, type FeedEvent, type TypingUser, type CollabTypingUser } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { tripsApi } from '../../lib/api';
import { useLandingColors } from '../../landing/theme';

const COLLAB_TYPING_DEBOUNCE_MS = 400;
const ACCEPT_IMAGE = 'image/jpeg,image/png,image/gif,image/webp';

interface FeedItem {
  name: string;
  text: string;
  detail?: string;
  imageUrl?: string;
  avatarUrl?: string;
  time: string;
  typing: boolean;
}

interface CollaborationFeedProps {
  tripId: string | null;
  tripNote: string;
  onTripNoteChange: (v: string) => void;
  useLiveFeed?: boolean;
}

function formatFeedTime(timestamp: string) {
  const d = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  if (diffMs < 60000) return 'just now';
  if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)} mins ago`;
  if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)} hours ago`;
  return d.toLocaleDateString();
}

export function CollaborationFeed({ tripId, tripNote, onTripNoteChange, useLiveFeed }: CollaborationFeedProps) {
  const colors = useLandingColors();
  const [minimized, setMinimized] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user } = useAuth();
  const {
    feedEvents,
    typingByActivity,
    collabTyping,
    emitCollabTypingStart,
    emitCollabTypingStop,
  } = useSocket();
  const collabDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const otherCollabTyping = useLiveFeed ? collabTyping.filter((t: CollabTypingUser) => t.userId !== user?.id) : [];
  const typingUsers: TypingUser[] = useLiveFeed
    ? Object.values(typingByActivity).flat().filter((t: TypingUser) => t.userId !== user?.id)
    : [];
  const dedupedTyping = typingUsers.filter(
    (t, i, arr) => arr.findIndex((x) => x.userId === t.userId && x.activityId === t.activityId) === i
  );

  const handleMessageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onTripNoteChange(e.target.value);
      if (!useLiveFeed) return;
      if (collabDebounceRef.current) clearTimeout(collabDebounceRef.current);
      collabDebounceRef.current = setTimeout(() => {
        emitCollabTypingStart();
        collabDebounceRef.current = null;
      }, COLLAB_TYPING_DEBOUNCE_MS);
    },
    [onTripNoteChange, useLiveFeed, emitCollabTypingStart]
  );

  const handleMessageBlur = useCallback(() => {
    if (collabDebounceRef.current) {
      clearTimeout(collabDebounceRef.current);
      collabDebounceRef.current = null;
    }
    emitCollabTypingStop();
  }, [emitCollabTypingStop]);

  const handleSendMessage = useCallback(async () => {
    const content = tripNote.trim();
    if (!tripId || (!content && !selectedImage)) return;
    handleMessageBlur();
    try {
      await tripsApi.sendMessage(tripId, content, selectedImage ?? undefined);
      onTripNoteChange('');
      setSelectedImage(null);
    } catch {
      // ignore
    }
  }, [tripId, tripNote, selectedImage, onTripNoteChange, handleMessageBlur]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [feedEvents]);

  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!selectedImage) {
      setImagePreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedImage);
    setImagePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedImage]);

  const items: FeedItem[] = useLiveFeed && feedEvents.length > 0
    ? feedEvents.map((evt: FeedEvent) => ({
        name: evt.userName,
        text: evt.text,
        detail: evt.detail,
        imageUrl: evt.imageUrl,
        avatarUrl: evt.userAvatarUrl,
        time: formatFeedTime(evt.timestamp),
        typing: false,
      }))
    : [];
  if (minimized) {
    return (
      <aside
        className="w-12 shrink-0 flex flex-col items-center justify-center border-l py-3"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
        <button
          type="button"
          onClick={() => setMinimized(false)}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          title="Expand chat"
          aria-label="Expand collaboration feed"
        >
          <svg className="w-5 h-5" style={{ color: colors.primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </aside>
    );
  }

  return (
    <aside
      className="w-72 shrink-0 flex flex-col border-l"
      style={{ borderColor: colors.border, backgroundColor: colors.surface }}
    >
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: colors.border }}>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>
          Collaboration feed
        </span>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => setMinimized(true)}
            className="p-1.5 rounded hover:bg-slate-100"
            aria-label="Minimize chat"
            title="Minimize"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
          <button type="button" className="p-1.5 rounded hover:bg-slate-100" aria-label="Refresh">
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4">
        {(dedupedTyping.length > 0 || otherCollabTyping.length > 0) && (
          <div className="pb-3 mb-3 border-b" style={{ borderColor: colors.border }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: colors.textMuted }}>
              Typing now
            </p>
            {otherCollabTyping.map((t: CollabTypingUser) => (
              <div key={`collab-${t.userId}`} className="flex gap-3 mb-2">
                <div
                  className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-sm font-medium animate-pulse"
                  style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', color: colors.primary }}
                >
                  {getInitials(t.userName)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm" style={{ color: colors.text }}>
                    <span className="font-medium">{t.userName}</span> is typing…
                  </p>
                </div>
              </div>
            ))}
            {dedupedTyping.map((t: TypingUser) => (
              <div key={`${t.userId}-${t.activityId}`} className="flex gap-3 mb-2">
                <div
                  className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-sm font-medium animate-pulse"
                  style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', color: colors.primary }}
                >
                  {getInitials(t.userName)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm" style={{ color: colors.text }}>
                    <span className="font-medium">{t.userName}</span> is typing a comment
                    {t.activityTitle ? ` in "${t.activityTitle.length > 25 ? t.activityTitle.slice(0, 25) + '…' : t.activityTitle}"` : '…'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        {items.length > 0 ? items.map((item: FeedItem, i: number) => (
          <div key={`${item.name}-${item.time}-${i}`} className="flex gap-3">
            {item.avatarUrl ? (
              <div className="w-9 h-9 rounded-full shrink-0 overflow-hidden border" style={{ borderColor: colors.border }}>
                <img src={item.avatarUrl} alt={item.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div
                className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-sm font-medium"
                style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', color: colors.primary }}
              >
                {getInitials(item.name)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm" style={{ color: colors.text }}>
                <span className="font-medium">{item.name}</span> {item.text}
              </p>
              {item.detail && (
                <p className="text-sm mt-0.5 font-medium" style={{ color: colors.primary }}>
                  {item.detail}
                </p>
              )}
              {item.imageUrl && (
                <a href={item.imageUrl} target="_blank" rel="noopener noreferrer" className="block mt-1.5 rounded-lg overflow-hidden border max-w-full" style={{ borderColor: colors.border }}>
                  <img src={item.imageUrl} alt="Shared" className="max-h-40 w-auto object-cover" />
                </a>
              )}
              {!item.typing && <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>{item.time}</p>}
            </div>
          </div>
        )) : (
          <p className="text-sm py-4" style={{ color: colors.textMuted }}>
            Activity from your collaborators will appear here.
          </p>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="shrink-0 p-4 border-t" style={{ borderColor: colors.border }}>
        {selectedImage && imagePreviewUrl && (
          <div className="flex items-center gap-2 mb-2">
            <img src={imagePreviewUrl} alt="Preview" className="h-12 w-12 rounded object-cover border" style={{ borderColor: colors.border }} />
            <span className="text-sm truncate flex-1" style={{ color: colors.textMuted }}>{selectedImage.name}</span>
            <button type="button" onClick={() => setSelectedImage(null)} className="p-1 rounded hover:bg-slate-200 text-slate-500" aria-label="Remove image">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_IMAGE}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setSelectedImage(f);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-full transition-colors hover:bg-slate-100 shrink-0 flex items-center justify-center"
            style={{ color: colors.primary, width: '2rem', height: '2rem', padding: 0 }}
            aria-label="Attach image"
            title="Attach image"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
              style={{ display: 'block' }}
            >
              <circle cx="10" cy="10" r="9" stroke={colors.border} strokeWidth="1" fill={colors.background} />
              <path d="M10 6v8M6 10h8" stroke={colors.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <input
            value={tripNote}
            onChange={handleMessageChange}
            onBlur={handleMessageBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Send a message..."
            className="flex-1 px-3 py-2 rounded-lg border text-sm placeholder-slate-400"
            style={{ borderColor: colors.border }}
          />
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={(!tripNote.trim() && !selectedImage) || !tripId}
            className="p-2 rounded-lg transition-colors hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ color: colors.primary }}
            aria-label="Send"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
