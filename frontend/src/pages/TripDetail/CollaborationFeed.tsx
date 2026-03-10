import { useRef, useCallback, useState, useEffect } from 'react';
import { getInitials } from '../../utils/helpers';
import { useSocket, type FeedEvent, type TypingUser, type CollabTypingUser } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { tripsApi } from '../../lib/api';
import arrowSvg from '../../assets/arrow.svg';
import { useLandingColors } from '../../landing/theme';
import { useTheme } from '../../contexts/ThemeContext';

const COLLAB_TYPING_DEBOUNCE_MS = 400;
const ACCEPT_IMAGE = 'image/jpeg,image/png,image/gif,image/webp';

interface FeedItem {
  type: string;
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
  const { effectiveTheme } = useTheme();
  const collabTextColor = effectiveTheme === 'dark' ? colors.text : '#0F172A';
  const [minimized, setMinimized] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
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
        type: evt.type,
        name: evt.userName,
        text: evt.text,
        detail: evt.detail,
        imageUrl: evt.imageUrl,
        avatarUrl: evt.userAvatarUrl,
        time: formatFeedTime(evt.timestamp),
        typing: false,
      }))
    : [];
  const avatarByUserName: Record<string, string> = {};
  items.forEach((item) => {
    if (item.avatarUrl && !avatarByUserName[item.name]) {
      avatarByUserName[item.name] = item.avatarUrl;
    }
  });

  const panelContent = (
    <>
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: colors.border }}>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>
          Collaboration feed
        </span>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => setMinimized(true)}
            className="p-1.5 rounded hover:bg-slate-100 hidden md:inline-flex"
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
        {items.length > 0 ? items.map((item: FeedItem, i: number) => {
          const isMessage = item.type === 'message';
          const isMine = isMessage && user && item.name === user.name;
          const messageBubbleBg = effectiveTheme === 'dark'
            ? '#111827'
            : '#F8FAFC';

          if (isMessage) {
            return (
              <div
                key={`${item.name}-${item.time}-${i}`}
                className={`flex items-start gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                {!isMine && (
                  item.avatarUrl ? (
                    <div className="w-8 h-8 rounded-full shrink-0 overflow-hidden border" style={{ borderColor: colors.border }}>
                      <img src={item.avatarUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-medium"
                      style={{ backgroundColor: 'rgba(148, 163, 184, 0.35)', color: colors.primary }}
                    >
                      {getInitials(item.name)}
                    </div>
                  )
                )}
                <div className="max-w-[82%] flex flex-col items-end">
                  <div
                    className="rounded-2xl px-3 py-2 text-sm leading-snug break-words"
                    style={{
                      backgroundColor: messageBubbleBg,
                      color: effectiveTheme === 'dark' ? '#FFFFFF' : '#0F172A',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                    }}
                  >
                    <span>{item.detail ?? (item.imageUrl ? 'Sent an image' : '')}</span>
                    {item.imageUrl && (
                      <a
                        href={item.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-2 rounded-lg overflow-hidden border max-w-full"
                        style={{ borderColor: colors.border }}
                      >
                        <img src={item.imageUrl} alt="Shared" className="max-h-40 w-auto object-cover" />
                      </a>
                    )}
                  </div>
                  {!item.typing && (
                    <p className="text-[11px] mt-1" style={{ color: colors.textMuted }}>
                      {item.time}
                    </p>
                  )}
                </div>
                {isMine && (
                  item.avatarUrl ? (
                    <div className="w-8 h-8 rounded-full shrink-0 overflow-hidden border" style={{ borderColor: colors.border }}>
                      <img src={item.avatarUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-medium"
                      style={{ backgroundColor: 'rgba(148, 163, 184, 0.35)', color: colors.primary }}
                    >
                      {getInitials(item.name)}
                    </div>
                  )
                )}
              </div>
            );
          }

          return (
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
                <p className="text-sm" style={{ color: collabTextColor }}>
                  <span className="font-medium">{item.name}</span>
                  {item.text ? ` ${item.text}` : ''}
                </p>
                {item.detail && (
                  <p
                    className="text-sm mt-0.5 font-medium"
                    style={{ color: effectiveTheme === 'dark' ? colors.primary : collabTextColor }}
                  >
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
          );
        }) : (
          <p className="text-sm py-4" style={{ color: colors.textMuted }}>
            Activity from your collaborators will appear here.
          </p>
        )}
        {(dedupedTyping.length > 0 || otherCollabTyping.length > 0) && (
          <div className="pt-3 mt-3 border-t" style={{ borderColor: colors.border }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: colors.textMuted }}>
              Typing now
            </p>
            {otherCollabTyping.map((t: CollabTypingUser) => (
              <div key={`collab-${t.userId}`} className="flex gap-3 mb-2">
                {avatarByUserName[t.userName] ? (
                  <div className="w-9 h-9 rounded-full shrink-0 overflow-hidden border animate-pulse" style={{ borderColor: colors.border }}>
                    <img src={avatarByUserName[t.userName]} alt={t.userName} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div
                    className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-sm font-medium animate-pulse"
                    style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', color: colors.primary }}
                  >
                    {getInitials(t.userName)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm" style={{ color: collabTextColor }}>
                    <span className="font-medium">{t.userName}</span> is typing…
                  </p>
                </div>
              </div>
            ))}
            {dedupedTyping.map((t: TypingUser) => (
              <div key={`${t.userId}-${t.activityId}`} className="flex gap-3 mb-2">
                {avatarByUserName[t.userName] ? (
                  <div className="w-9 h-9 rounded-full shrink-0 overflow-hidden border animate-pulse" style={{ borderColor: colors.border }}>
                    <img src={avatarByUserName[t.userName]} alt={t.userName} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div
                    className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-sm font-medium animate-pulse"
                    style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', color: colors.primary }}
                  >
                    {getInitials(t.userName)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm" style={{ color: collabTextColor }}>
                    <span className="font-medium">{t.userName}</span> is typing a comment
                    {t.activityTitle ? ` in "${t.activityTitle.length > 25 ? t.activityTitle.slice(0, 25) + '…' : t.activityTitle}"` : '…'}
                  </p>
                </div>
              </div>
            ))}
          </div>
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
        <div
          className="flex items-center gap-3 rounded-full px-4 py-2 shadow-sm"
          style={{
            backgroundColor: colors.surface,
            boxShadow: '0 0 0 1px rgba(148, 163, 184, 0.25)',
          }}
        >
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
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 shrink-0"
            style={{ color: colors.primary }}
            aria-label="Attach image"
            title="Attach image"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.7}
            >
              <path
                d="M12 5v14M5 12h14"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <textarea
            value={tripNote}
            onChange={(e) => {
              // auto-grow the textarea instead of showing a scrollbar
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
              handleMessageChange(e);
            }}
            onBlur={handleMessageBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            rows={1}
            placeholder="Add a trip note..."
            className="flex-1 bg-transparent text-sm placeholder-slate-400 focus:outline-none resize-none leading-snug"
            style={{ color: collabTextColor, overflow: 'hidden' }}
          />
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={(!tripNote.trim() && !selectedImage) || !tripId}
            className="flex h-8 w-8 items-center justify-center rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'transparent' }}
            aria-label="Send"
          >
            <img src={arrowSvg} alt="Send" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      {minimized ? (
        <aside
          className="hidden md:flex w-12 shrink-0 flex-col items-center justify-center border-l py-3"
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
      ) : (
        <aside
          className="hidden md:flex w-80 shrink-0 flex-col border-l"
          style={{ borderColor: colors.border, backgroundColor: colors.surface }}
        >
          {panelContent}
        </aside>
      )}

      {/* Mobile chatbot launcher */}
      <button
        type="button"
        className="md:hidden fixed bottom-20 right-4 z-40 inline-flex items-center justify-center w-12 h-12 rounded-full shadow-lg"
        style={{ backgroundColor: colors.primary, color: '#fff' }}
        aria-label="Open collaboration chat"
        onClick={() => setMobileOpen(true)}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 10c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 18l1.395-3.72C3.512 13.042 3 11.574 3 10c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      {/* Mobile chatbot panel */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className="relative z-50 w-full max-w-md mx-auto mb-4 rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[80vh]"
            style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
          >
            <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: colors.border }}>
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>
                Collaboration feed
              </span>
              <button
                type="button"
                className="p-1.5 rounded hover:bg-slate-100"
                aria-label="Close chat"
                onClick={() => setMobileOpen(false)}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {panelContent}
          </div>
        </div>
      )}
    </>
  );
}
