import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useSocket, type TripNotification } from '../contexts/SocketContext';
import { playNotificationSound } from '../utils/notificationSound';
import { getInitials } from '../utils/helpers';
import { landingColors } from '../landing/theme';

const TOAST_DURATION_MS = 5000;

interface ToastItem extends TripNotification {
  id: string;
}

export function TripNotificationToaster() {
  const { user } = useAuth();
  const { onTripNotification } = useSocket();
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const unsubscribe = onTripNotification((notification) => {
      if (notification.actorId === user?.id) return;
      playNotificationSound();
      const id = `${notification.timestamp}-${Math.random().toString(36).slice(2)}`;
      setToasts((prev) => [...prev.slice(-4), { ...notification, id }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, TOAST_DURATION_MS);
    });
    return unsubscribe;
  }, [onTripNotification, user?.id]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <div
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-sm pointer-events-none"
      aria-live="polite"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            transition={{ type: 'tween', duration: 0.2 }}
            className="pointer-events-auto"
          >
            <div
              className="flex gap-3 p-3 rounded-xl border shadow-lg bg-white"
              style={{ borderColor: 'rgba(226, 232, 240, 0.8)' }}
              role="alert"
            >
              <div
                className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-sm font-semibold"
                style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', color: landingColors.primary }}
              >
                {getInitials(toast.actorName)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: landingColors.text }}>
                  {toast.title}
                </p>
                {toast.body && (
                  <p className="text-xs mt-0.5 line-clamp-2" style={{ color: landingColors.textMuted }}>
                    {toast.body}
                  </p>
                )}
                <p className="text-xs mt-1" style={{ color: landingColors.textMuted }}>
                  {toast.actorName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded hover:bg-slate-100 text-slate-400 shrink-0"
                aria-label="Dismiss"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
