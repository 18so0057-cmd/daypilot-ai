import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

export function Badge({ children, color, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        !color && 'bg-brand-100 text-brand-700 dark:bg-brand-800/40 dark:text-brand-200',
        className,
      )}
      style={color ? { backgroundColor: `${color}20`, color } : undefined}
    >
      {children}
    </span>
  );
}

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  color?: string;
  height?: string;
}

export function ProgressBar({ value, max = 100, className, color, height = 'h-2' }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className={cn('w-full overflow-hidden rounded-full bg-brand-100 dark:bg-white/10', height, className)}>
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${pct}%`, background: color ?? 'linear-gradient(90deg,#6b7bf0,#38bdf8)' }}
      />
    </div>
  );
}
