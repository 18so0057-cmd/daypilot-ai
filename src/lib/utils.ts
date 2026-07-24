export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'No deadline';
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatTime(timeStr: string): string {
  // "14:30:00" -> "2:30 PM"
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

export function relativeDeadline(dateStr: string | null | undefined): { label: string; urgent: boolean; overdue: boolean } {
  if (!dateStr) return { label: 'No deadline', urgent: false, overdue: false };
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = d.getTime() - now.getTime();
  const diffH = diffMs / 3.6e5;
  const overdue = diffMs < 0;
  if (overdue) return { label: 'Overdue', urgent: true, overdue: true };
  if (diffH < 24) return { label: `Due in ${Math.max(1, Math.round(diffH))}h`, urgent: true, overdue: false };
  if (diffH < 48) return { label: 'Due tomorrow', urgent: true, overdue: false };
  const days = Math.round(diffH / 24);
  if (days < 7) return { label: `Due in ${days}d`, urgent: false, overdue: false };
  return { label: formatDate(dateStr), urgent: false, overdue: false };
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function dayLabel(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(undefined, { weekday: 'short' });
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export function initials(name: string): string {
  if (!name) return 'U';
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
}
