import { useRef, useCallback, useState } from 'react';
import { getInitials } from '../../utils/helpers';
import { useSocket, type FeedEvent, type TypingUser, type CollabTypingUser } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { tripsApi } from '../../lib/api';
import { landingColors } from '../../landing/theme';

const COLLAB_TYPING_DEBOUNCE_MS = 400;

interface FeedItem {
  name: string;
  text: string;
  detail?: string;
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
  const [minimized, setMinimized] = useState(false);
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
    if (!tripId || !content) return;
    handleMessageBlur();
    try {
      await tripsApi.sendMessage(tripId, content);
      onTripNoteChange('');
    } catch {
      // ignore
    }
  }, [tripId, tripNote, onTripNoteChange, handleMessageBlur]);
  const items: FeedItem[] = useLiveFeed && feedEvents.length > 0
    ? feedEvents.map((evt: FeedEvent) => ({
        name: evt.userName,
        text: evt.text,
        detail: evt.detail,
        time: formatFeedTime(evt.timestamp),
        typing: false,
      }))
    : [];
  if (minimized) {
    return (
      <aside
        className="w-12 shrink-0 flex flex-col items-center justify-center border-l py-3"
        style={{ borderColor: 'rgba(226, 232, 240, 0.8)', backgroundColor: '#fff' }}
      >
        <button
          type="button"
          onClick={() => setMinimized(false)}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          title="Expand chat"
          aria-label="Expand collaboration feed"
        >
          <svg className="w-5 h-5" style={{ color: landingColors.primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </aside>
    );
  }

  return (
    <aside
      className="w-72 shrink-0 flex flex-col border-l"
      style={{ borderColor: 'rgba(226, 232, 240, 0.8)', backgroundColor: '#fff' }}
    >
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(226, 232, 240, 0.8)' }}>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: landingColors.textMuted }}>
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
          <div className="pb-3 mb-3 border-b" style={{ borderColor: 'rgba(226, 232, 240, 0.8)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: landingColors.textMuted }}>
              Typing now
            </p>
            {otherCollabTyping.map((t: CollabTypingUser) => (
              <div key={`collab-${t.userId}`} className="flex gap-3 mb-2">
                <div
                  className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-sm font-medium animate-pulse"
                  style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', color: landingColors.primary }}
                >
                  {getInitials(t.userName)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm" style={{ color: landingColors.text }}>
                    <span className="font-medium">{t.userName}</span> is typing a message…
                  </p>
                </div>
              </div>
            ))}
            {dedupedTyping.map((t: TypingUser) => (
              <div key={`${t.userId}-${t.activityId}`} className="flex gap-3 mb-2">
                <div
                  className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-sm font-medium animate-pulse"
                  style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', color: landingColors.primary }}
                >
                  {getInitials(t.userName)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm" style={{ color: landingColors.text }}>
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
            <div
              className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-sm font-medium"
              style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', color: landingColors.primary }}
            >
              {getInitials(item.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm" style={{ color: landingColors.text }}>
                <span className="font-medium">{item.name}</span> {item.text}
              </p>
              {item.detail && (
                <p className="text-sm mt-0.5 font-medium" style={{ color: landingColors.primary }}>
                  {item.detail}
                </p>
              )}
              {!item.typing && <p className="text-xs mt-0.5" style={{ color: landingColors.textMuted }}>{item.time}</p>}
            </div>
          </div>
        )) : (
          <p className="text-sm py-4" style={{ color: landingColors.textMuted }}>
            Activity from your collaborators will appear here.
          </p>
        )}
      </div>
      <div className="shrink-0 p-4 border-t" style={{ borderColor: 'rgba(226, 232, 240, 0.8)' }}>
        <div className="flex gap-2">
          <input
            value={tripNote}
            onChange={handleMessageChange}
            onBlur={handleMessageBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Send a message to the team..."
            className="flex-1 px-3 py-2 rounded-lg border text-sm placeholder-slate-400"
            style={{ borderColor: 'rgba(226, 232, 240, 0.8)' }}
          />
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={!tripNote.trim() || !tripId}
            className="p-2 rounded-lg transition-colors hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ color: landingColors.primary }}
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
