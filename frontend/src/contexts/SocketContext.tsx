import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  useState,
  type ReactNode,
} from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SOCKET_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL?.replace('/api', '') || '');

export interface PresenceUser {
  userId: string;
  userName: string;
  section: string;
}

export interface FeedEvent {
  type: string;
  userName: string;
  text: string;
  detail?: string;
  timestamp: string;
}

export interface TypingUser {
  activityId: string;
  userId: string;
  userName: string;
  activityTitle?: string;
}

export interface CollabTypingUser {
  userId: string;
  userName: string;
}

export interface TripNotification {
  type: string;
  title: string;
  body?: string;
  actorId: string;
  actorName: string;
  metadata?: { activityId?: string; tripId?: string };
  timestamp: string;
}

export interface StoredNotification extends TripNotification {
  id: string;
  read?: boolean;
}

const NOTIFICATIONS_MAX = 50;

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  currentTripId: string | null;
  joinTrip: (tripId: string, section?: string) => void;
  leaveTrip: () => void;
  updateSection: (section: string) => void;
  emitTypingStart: (activityId: string, activityTitle?: string) => void;
  emitTypingStop: (activityId: string) => void;
  emitCollabTypingStart: () => void;
  emitCollabTypingStop: () => void;
  presence: PresenceUser[];
  feedEvents: FeedEvent[];
  seedFeed: (events: FeedEvent[]) => void;
  typingByActivity: Record<string, TypingUser[]>;
  collabTyping: CollabTypingUser[];
  onCommentNew: (cb: (comment: any) => void) => () => void;
  onAttachmentNew: (cb: (payload: { activityId: string; attachment: any }) => void) => () => void;
  onAttachmentRemoved: (cb: (payload: { activityId: string; attachmentId: string }) => void) => () => void;
  onTripNotification: (cb: (notification: TripNotification) => void) => () => void;
  notifications: StoredNotification[];
  unreadNotificationCount: number;
  markAllNotificationsRead: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};

const FEED_MAX_EVENTS = 50;

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const socketRef = useRef<Socket | null>(null);
  const currentTripIdRef = useRef<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);
  const [presence, setPresence] = useState<PresenceUser[]>([]);
  const [feedEvents, setFeedEvents] = useState<FeedEvent[]>([]);
  const [typingByActivity, setTypingByActivity] = useState<Record<string, TypingUser[]>>({});
  const [collabTyping, setCollabTyping] = useState<CollabTypingUser[]>([]);
  const typingTimeoutRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const commentListenersRef = useRef<Set<(c: any) => void>>(new Set());
  const attachmentNewListenersRef = useRef<Set<(p: { activityId: string; attachment: any }) => void>>(new Set());
  const attachmentRemovedListenersRef = useRef<Set<(p: { activityId: string; attachmentId: string }) => void>>(new Set());
  const tripNotificationListenersRef = useRef<Set<(n: TripNotification) => void>>(new Set());
  const userIdRef = useRef<string | null>(null);
  userIdRef.current = user?.id ?? null;

  const [notifications, setNotifications] = useState<StoredNotification[]>([]);

  const leaveTrip = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('trip:leave');
    }
    currentTripIdRef.current = null;
    setCurrentTripId(null);
    setPresence([]);
    setFeedEvents([]);
    setCollabTyping([]);
  }, []);

  const emitCollabTypingStart = useCallback(() => {
    if (socketRef.current?.connected && currentTripIdRef.current) {
      socketRef.current.emit('collab:typing');
    }
  }, []);

  const emitCollabTypingStop = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('collab:typing:stop');
    }
  }, []);

  const seedFeed = useCallback((events: FeedEvent[]) => {
    setFeedEvents(events.slice(0, FEED_MAX_EVENTS));
  }, []);

  const connect = useCallback(() => {
    if (socketRef.current?.connected || !token) return;
    const socket = io(SOCKET_URL, {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => {
      setIsConnected(false);
      setCurrentTripId(null);
      setPresence([]);
      setTypingByActivity({});
      setCollabTyping([]);
    });

    socket.on('presence:update', (payload: { users: PresenceUser[] }) => {
      setPresence(payload.users ?? []);
    });

    socket.on('feed:event', (evt: FeedEvent) => {
      setFeedEvents((prev) => [evt, ...prev].slice(0, FEED_MAX_EVENTS));
    });

    socket.on('typing:user', (payload: TypingUser) => {
      setTypingByActivity((prev) => {
        const list = prev[payload.activityId] ?? [];
        const filtered = list.filter((u) => u.userId !== payload.userId);
        const updated = [...filtered, payload];
        return { ...prev, [payload.activityId]: updated };
      });
    });

    socket.on('typing:stop', (payload: { activityId: string; userId: string }) => {
      setTypingByActivity((prev) => {
        const list = prev[payload.activityId] ?? [];
        const filtered = list.filter((u) => u.userId !== payload.userId);
        return { ...prev, [payload.activityId]: filtered.length ? filtered : [] };
      });
    });

    socket.on('comment:new', (comment: any) => {
      commentListenersRef.current.forEach((cb) => cb(comment));
    });

    socket.on('attachment:new', (payload: { activityId: string; attachment: any }) => {
      attachmentNewListenersRef.current.forEach((cb) => cb(payload));
    });
    socket.on('attachment:removed', (payload: { activityId: string; attachmentId: string }) => {
      attachmentRemovedListenersRef.current.forEach((cb) => cb(payload));
    });

    socket.on('trip:notification', (payload: TripNotification) => {
      tripNotificationListenersRef.current.forEach((cb) => cb(payload));
      if (payload.actorId !== userIdRef.current) {
        const id = `${payload.timestamp}-${Math.random().toString(36).slice(2)}`;
        setNotifications((prev) => [...prev.slice(-(NOTIFICATIONS_MAX - 1)), { ...payload, id, read: false }]);
      }
    });

    socket.on('collab:typing', (payload: { userId: string; userName: string }) => {
      setCollabTyping((prev) => {
        const filtered = prev.filter((u) => u.userId !== payload.userId);
        return [...filtered, payload];
      });
    });
    socket.on('collab:typing:stop', (payload: { userId: string }) => {
      setCollabTyping((prev) => prev.filter((u) => u.userId !== payload.userId));
    });
  }, [token]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setCurrentTripId(null);
      setPresence([]);
      setFeedEvents([]);
      setTypingByActivity({});
    }
  }, []);

  useEffect(() => {
    if (token) {
      connect();
    } else {
      disconnect();
    }
    return () => leaveTrip();
  }, [token, connect, disconnect, leaveTrip]);

  const joinTrip = useCallback(
    (tripId: string, section = 'itinerary') => {
      if (!socketRef.current || !tripId) return;
      currentTripIdRef.current = tripId;
      setCurrentTripId(tripId);
      socketRef.current.emit('trip:join', tripId, {
        userName: user?.name ?? 'Unknown',
        section,
      });
    },
    [user?.name]
  );

  const updateSection = useCallback((section: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('presence:update', { section });
    }
  }, []);

  const emitTypingStart = useCallback((activityId: string, activityTitle?: string) => {
    const tripId = currentTripIdRef.current;
    if (!socketRef.current?.connected || !tripId) return;
    const key = `${tripId}:${activityId}`;
    if (typingTimeoutRef.current[key]) {
      clearTimeout(typingTimeoutRef.current[key]);
    }
    socketRef.current!.emit('typing:start', { activityId, activityTitle });
    typingTimeoutRef.current[key] = setTimeout(() => {
      socketRef.current?.emit('typing:stop', { activityId });
      delete typingTimeoutRef.current[key];
    }, 3000);
  }, []);

  const emitTypingStop = useCallback((activityId: string) => {
    const tripId = currentTripIdRef.current;
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing:stop', { activityId });
    }
    const key = `${tripId}:${activityId}`;
    if (typingTimeoutRef.current[key]) {
      clearTimeout(typingTimeoutRef.current[key]);
      delete typingTimeoutRef.current[key];
    }
  }, []);

  const onCommentNew = useCallback((cb: (comment: any) => void) => {
    commentListenersRef.current.add(cb);
    return () => commentListenersRef.current.delete(cb);
  }, []);

  const onAttachmentNew = useCallback((cb: (payload: { activityId: string; attachment: any }) => void) => {
    attachmentNewListenersRef.current.add(cb);
    return () => attachmentNewListenersRef.current.delete(cb);
  }, []);
  const onAttachmentRemoved = useCallback((cb: (payload: { activityId: string; attachmentId: string }) => void) => {
    attachmentRemovedListenersRef.current.add(cb);
    return () => attachmentRemovedListenersRef.current.delete(cb);
  }, []);

  const onTripNotification = useCallback((cb: (notification: TripNotification) => void) => {
    tripNotificationListenersRef.current.add(cb);
    return () => tripNotificationListenersRef.current.delete(cb);
  }, []);

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;
  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const value: SocketContextType = {
    socket: null,
    isConnected,
    currentTripId,
    joinTrip,
    leaveTrip,
    updateSection,
    emitTypingStart,
    emitTypingStop,
    emitCollabTypingStart,
    emitCollabTypingStop,
    presence,
    feedEvents,
    seedFeed,
    typingByActivity,
    collabTyping,
    onCommentNew,
    onAttachmentNew,
    onAttachmentRemoved,
    onTripNotification,
    notifications,
    unreadNotificationCount,
    markAllNotificationsRead,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}
