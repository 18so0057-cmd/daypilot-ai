import { AnimatePresence, motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Card } from './Card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  color?: string;
  delay?: number;
}

export function StatCard({ icon: Icon, label, value, hint, color = '#6b7bf0', delay = 0 }: StatCardProps) {
  return (
    <Card className="p-5" hover>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: delay + 0.1, type: 'spring', stiffness: 300 }}
        className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${color}18`, color }}
      >
        <Icon className="h-5 w-5" />
      </motion.div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted">{label}</p>
      {hint && <p className="mt-1 text-xs text-muted/70">{hint}</p>}
    </Card>
  );
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-400 dark:bg-white/5 dark:text-brand-300">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onCancel} />
          <motion.div
            className="glass-strong relative z-10 w-full max-w-sm rounded-2xl p-6 shadow-soft-lg"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <h3 className="text-lg font-bold">{title}</h3>
            <p className="mt-2 text-sm text-muted">{message}</p>
            <div className="mt-5 flex gap-2">
              <button onClick={onCancel} className="input-base flex-1">Cancel</button>
              <button onClick={onConfirm} className="flex-1 rounded-xl bg-error-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-error-600 transition">
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
