import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, X, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

let toastId = 0;
const listeners: ((t: Toast) => void)[] = [];

export function toast(message: string, type: ToastType = 'success') {
  const t = { id: ++toastId, message, type };
  listeners.forEach((l) => l(t));
}

const ICONS = {
  success: CheckCircle2,
  error: X,
  info: Info,
  warning: AlertTriangle,
};

const COLORS = {
  success: 'text-success-500',
  error: 'text-error-500',
  info: 'text-accent-500',
  warning: 'text-warning-500',
};

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (t: Toast) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 3500);
    };
    listeners.push(handler);
    return () => {
      const idx = listeners.indexOf(handler);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  }, []);

  return createPortal(
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="glass-strong flex items-center gap-3 rounded-xl px-4 py-3 shadow-soft-lg min-w-[260px]"
            >
              <Icon className={`h-5 w-5 ${COLORS[t.type]}`} />
              <span className="text-sm font-medium">{t.message}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>,
    document.body,
  );
}
