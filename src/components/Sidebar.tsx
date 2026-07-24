import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, CalendarDays, CheckSquare, Brain, MessageSquare,
  Timer, Trophy, BarChart3, Settings, GraduationCap, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { levelProgress } from '@/lib/gamification';
import { initials } from '@/lib/utils';

const NAV = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/planner', label: 'AI Planner', icon: Brain },
  { to: '/app/todos', label: 'To-Do List', icon: CheckSquare },
  { to: '/app/chat', label: 'AI Companion', icon: MessageSquare },
  { to: '/app/focus', label: 'Focus Timer', icon: Timer },
  { to: '/app/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/app/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/app/rewards', label: 'Rewards', icon: Trophy },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { profile } = useAuth();
  const location = useLocation();
  const lp = profile ? levelProgress(profile.xp) : null;

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden" onClick={onClose} />}

      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 flex w-72 flex-col glass-strong border-r transition-transform lg:translate-x-0 lg:static lg:z-auto',
        open ? 'translate-x-0' : '-translate-x-full',
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient shadow-glow">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="font-display text-lg font-extrabold">DayPilot<span className="text-gradient"> AI</span></span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-white/10 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-thin px-3 py-2">
          {NAV.map((item) => {
            const active = item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                  active ? 'text-brand-700 dark:text-white' : 'text-muted hover:text-brand-600 hover:bg-brand-50/60 dark:hover:bg-white/5',
                )}
              >
                {active && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-xl bg-brand-gradient opacity-90"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <item.icon className={cn('relative z-10 h-5 w-5', active && 'text-white')} />
                <span className={cn('relative z-10', active && 'text-white')}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Profile / XP */}
        {profile && lp && (
          <div className="border-t border-brand-200/40 p-4 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-gradient text-sm font-bold text-white shadow-glow">
                {initials(profile.full_name || profile.email)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{profile.full_name || 'Student'}</p>
                <p className="text-xs text-muted">Level {lp.level} · {profile.xp} XP</p>
              </div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-100 dark:bg-white/10">
              <motion.div
                className="h-full rounded-full bg-brand-gradient"
                initial={{ width: 0 }}
                animate={{ width: `${lp.pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <p className="mt-1.5 text-right text-xs text-muted">{lp.current}/{lp.needed} XP</p>
          </div>
        )}
      </aside>
    </>
  );
}
