import { Server as SocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from '../config';
import Trip from '../models/Trip';
import Membership from '../models/Membership';

let io: SocketServer | null = null;

const FEED_STORE_MAX = 100;
const feedStore = new Map<string, Array<{ type: string; userName: string; text: string; detail?: string; timestamp: string }>>();

export function initSocket(httpServer: import('http').Server): SocketServer {
  const corsOrigin = config.nodeEnv === 'development'
    ? ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173']
    : config.cors.origin;
  io = new SocketServer(httpServer, {
    path: '/socket.io',
    cors: {
      origin: corsOrigin,
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as { userId: string; email?: string };
      (socket as any).userId = decoded.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = (socket as any).userId;
    socket.on('trip:join', async (tripId: string, payload: { userName?: string; section?: string }) => {
      if (!tripId) return;
      try {
        const trip = await Trip.findById(tripId);
        if (!trip) return;
        const isOwner = trip.createdBy.toString() === userId;
        const membership = await Membership.findOne({ tripId, userId });
        if (!isOwner && !membership) return;
        const room = `trip:${tripId}`;
        socket.join(room);
        (socket as any).currentTripId = tripId;
        (socket as any).userName = payload.userName ?? 'Unknown';
        presenceAdd(tripId, userId, payload.userName ?? 'Unknown', payload.section ?? 'itinerary');
        broadcastPresence(tripId);
      } catch {
        // ignore
      }
    });

    socket.on('trip:leave', () => {
      const tripId = (socket as any).currentTripId;
      if (tripId) {
        socket.leave(`trip:${tripId}`);
        presenceRemove(tripId, userId);
        broadcastPresence(tripId);
        (socket as any).currentTripId = null;
      }
    });

    socket.on('presence:update', (payload: { section?: string }) => {
      const tripId = (socket as any).currentTripId;
      if (tripId && payload?.section) {
        presenceUpdateSection(tripId, userId, payload.section);
        broadcastPresence(tripId);
      }
    });

    const typingTimeouts = new Map<string, NodeJS.Timeout>();
    socket.on('typing:start', (payload: { activityId: string; activityTitle?: string }) => {
      const tripId = (socket as any).currentTripId;
      if (!tripId || !payload?.activityId) return;
      const key = `${tripId}:${payload.activityId}`;
      if (typingTimeouts.has(key)) {
        clearTimeout(typingTimeouts.get(key)!);
      }
      io!.to(`trip:${tripId}`).emit('typing:user', {
        activityId: payload.activityId,
        userId,
        userName: (socket as any).userName ?? 'Someone',
        activityTitle: payload.activityTitle,
      });
      const t = setTimeout(() => {
        typingTimeouts.delete(key);
        io!.to(`trip:${tripId}`).emit('typing:stop', { activityId: payload.activityId, userId });
      }, 4000);
      typingTimeouts.set(key, t);
    });

    socket.on('typing:stop', (payload: { activityId: string }) => {
      const tripId = (socket as any).currentTripId;
      if (!tripId || !payload?.activityId) return;
      const key = `${tripId}:${payload.activityId}`;
      if (typingTimeouts.has(key)) {
        clearTimeout(typingTimeouts.get(key)!);
        typingTimeouts.delete(key);
      }
      io!.to(`trip:${tripId}`).emit('typing:stop', { activityId: payload.activityId, userId });
    });

    const collabTypingTimeouts = new Map<string, NodeJS.Timeout>();
    socket.on('collab:typing', () => {
      const tripId = (socket as any).currentTripId;
      if (!tripId) return;
      const key = `collab:${tripId}:${userId}`;
      if (collabTypingTimeouts.has(key)) clearTimeout(collabTypingTimeouts.get(key)!);
      io!.to(`trip:${tripId}`).emit('collab:typing', {
        userId,
        userName: (socket as any).userName ?? 'Someone',
      });
      collabTypingTimeouts.set(key, setTimeout(() => {
        collabTypingTimeouts.delete(key);
        io!.to(`trip:${tripId}`).emit('collab:typing:stop', { userId });
      }, 4000));
    });

    socket.on('collab:typing:stop', () => {
      const tripId = (socket as any).currentTripId;
      if (!tripId) return;
      const key = `collab:${tripId}:${userId}`;
      if (collabTypingTimeouts.has(key)) {
        clearTimeout(collabTypingTimeouts.get(key)!);
        collabTypingTimeouts.delete(key);
      }
      io!.to(`trip:${tripId}`).emit('collab:typing:stop', { userId });
    });

    socket.on('disconnect', () => {
      const tripId = (socket as any).currentTripId;
      if (tripId) {
        presenceRemove(tripId, userId);
        broadcastPresence(tripId);
      }
      typingTimeouts.forEach((t) => clearTimeout(t));
      typingTimeouts.clear();
      collabTypingTimeouts.forEach((t) => clearTimeout(t));
      collabTypingTimeouts.clear();
    });
  });

  return io;
}

export function getIO(): SocketServer | null {
  return io;
}

const presenceStore = new Map<string, Map<string, { userName: string; section: string }>>();

function presenceAdd(tripId: string, userId: string, userName: string, section: string) {
  if (!presenceStore.has(tripId)) {
    presenceStore.set(tripId, new Map());
  }
  presenceStore.get(tripId)!.set(userId, { userName, section });
}

function presenceRemove(tripId: string, userId: string) {
  presenceStore.get(tripId)?.delete(userId);
  if (presenceStore.get(tripId)?.size === 0) {
    presenceStore.delete(tripId);
  }
}

function presenceUpdateSection(tripId: string, userId: string, section: string) {
  const p = presenceStore.get(tripId)?.get(userId);
  if (p) p.section = section;
}

function broadcastPresence(tripId: string) {
  const users = presenceStore.get(tripId);
  const list = users
    ? Array.from(users.entries()).map(([userId, data]) => ({
        userId,
        userName: data.userName,
        section: data.section,
      }))
    : [];
  io?.to(`trip:${tripId}`).emit('presence:update', { users: list });
}

export function emitCommentNew(tripId: string, comment: object) {
  io?.to(`trip:${tripId}`).emit('comment:new', comment);
}

export function emitFeedEvent(tripId: string, event: { type: string; userName: string; text: string; detail?: string }) {
  const full = { ...event, timestamp: new Date().toISOString() };
  io?.to(`trip:${tripId}`).emit('feed:event', full);
  if (!feedStore.has(tripId)) feedStore.set(tripId, []);
  const list = feedStore.get(tripId)!;
  list.unshift(full);
  if (list.length > FEED_STORE_MAX) list.length = FEED_STORE_MAX;
}

export function getFeedEvents(tripId: string): Array<{ type: string; userName: string; text: string; detail?: string; timestamp: string }> {
  return feedStore.get(tripId) ?? [];
}

export function emitAttachmentNew(tripId: string, payload: { activityId: string; attachment: object }) {
  io?.to(`trip:${tripId}`).emit('attachment:new', payload);
}

export function emitAttachmentRemoved(tripId: string, payload: { activityId: string; attachmentId: string }) {
  io?.to(`trip:${tripId}`).emit('attachment:removed', payload);
}

export type TripNotificationPayload = {
  type: string;
  title: string;
  body?: string;
  actorId: string;
  actorName: string;
  metadata?: { activityId?: string; tripId?: string };
  timestamp: string;
};

export function emitTripNotification(tripId: string, payload: Omit<TripNotificationPayload, 'timestamp'>) {
  const full: TripNotificationPayload = { ...payload, timestamp: new Date().toISOString() };
  io?.to(`trip:${tripId}`).emit('trip:notification', full);
}
