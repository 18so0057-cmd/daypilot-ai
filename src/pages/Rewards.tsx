import { motion } from 'framer-motion';
import {
  Zap, Coins, Flame, Trophy, Star, Crown, Target, Footprints,
  CheckCircle2, Timer, TrendingUp, Award, Lock, Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/Badge';
import { useUserData } from '@/hooks/useUserData';
import { useAuth } from '@/context/AuthContext';
import { levelProgress, BADGES, badgeByKey } from '@/lib/gamification';
import { cn } from '@/lib/utils';

const BADGE_ICONS: Record<string, typeof Trophy> = {
  Footprints, Target, Star, Zap, Trophy, Flame, CheckCircle2, Timer, TrendingUp, Crown,
};

const TIER_STYLES: Record<string, { bg: string; ring: string; label: string }> = {
  bronze: { bg: 'from-amber-500/20 to-amber-700/10', ring: 'ring-amber-500/30', label: 'Bronze' },
  silver: { bg: 'from-slate-300/20 to-slate-500/10', ring: 'ring-slate-400/30', label: 'Silver' },
  gold: { bg: 'from-yellow-400/20 to-yellow-600/10', ring: 'ring-yellow-500/30', label: 'Gold' },
  platinum: { bg: 'from-cyan-300/20 to-brand-500/10', ring: 'ring-cyan-400/30', label: 'Platinum' },
};

const DAILY_GOALS = [
  { key: 'complete_3_tasks', label: 'Complete 3 tasks', xp: 75, icon: CheckCircle2 },
  { key: 'focus_1_session', label: 'Finish 1 focus session', xp: 50, icon: Timer },
  { key: 'study_1_hour', label: 'Study for 1 hour', xp: 60, icon: Target },
  { key: 'chat_with_ai', label: 'Chat with AI companion', xp: 20, icon: Sparkles },
];

export function Rewards() {
  const data = useUserData();
  const { profile } = useAuth();
  const lp = profile ? levelProgress(profile.xp) : null;

  const earnedKeys = new Set(data.achievements.map((a) => a.badge_key));

  if (data.loading) {
    return <div className="flex h-96 items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-300 border-t-brand-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-extrabold sm:text-3xl">Rewards & Achievements</h2>
        <p className="mt-1 text-muted">Level up, earn badges, and keep your streak alive.</p>
      </div>

      {/* Level / XP hero */}
      {lp && (
        <Card className="relative overflow-hidden p-8">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-brand-300/30 blur-3xl" />
          <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-brand-gradient text-white shadow-glow">
                  <span className="font-display text-4xl font-extrabold">{lp.level}</span>
                </div>
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-0.5 text-xs font-bold text-brand-600 shadow-soft dark:bg-slate-800">LEVEL</span>
              </div>
              <div>
                <h3 className="font-display text-2xl font-extrabold">{profile?.full_name?.split(' ')[0] || 'Scholar'}</h3>
                <p className="text-muted">{profile?.xp} total XP · {profile?.coins} coins</p>
              </div>
            </div>
            <div className="w-full max-w-sm">
              <div className="mb-2 flex justify-between text-sm font-semibold">
                <span>Level {lp.level}</span><span>{lp.current} / {lp.needed} XP</span>
              </div>
              <ProgressBar value={lp.current} max={lp.needed} height="h-3" />
              <p className="mt-2 text-center text-xs text-muted">{lp.needed - lp.current} XP to level {lp.level + 1}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat icon={Zap} label="Total XP" value={profile?.xp ?? 0} color="#6b7bf0" />
        <MiniStat icon={Coins} label="Coins" value={profile?.coins ?? 0} color="#f59e0b" />
        <MiniStat icon={Flame} label="Study Streak" value={`${profile?.study_streak ?? 0} days`} color="#ef4444" />
        <MiniStat icon={Award} label="Badges" value={`${earnedKeys.size}/${BADGES.length}`} color="#10b981" />
      </div>

      {/* Daily goals */}
      <Card className="p-6">
        <h3 className="mb-4 font-display text-lg font-bold">Daily Goals</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {DAILY_GOALS.map((g) => {
            // simple completion logic based on today's stats
            const todayTasks = data.completedTasks.filter((t) => t.completed_at && t.completed_at.slice(0, 10) === new Date().toISOString().slice(0, 10)).length;
            const todayFocus = data.focusSessions.filter((f) => f.completed_at && f.started_at.slice(0, 10) === new Date().toISOString().slice(0, 10)).length;
            const done =
              (g.key === 'complete_3_tasks' && todayTasks >= 3) ||
              (g.key === 'focus_1_session' && todayFocus >= 1) ||
              (g.key === 'study_1_hour' && (data.todayAnalytics?.study_minutes ?? 0) >= 60) ||
              (g.key === 'chat_with_ai' && false);
            return (
              <div key={g.key} className={cn('flex items-center gap-3 rounded-xl p-4 transition', done ? 'bg-success-50 dark:bg-success-500/10' : 'bg-white/40 dark:bg-white/5')}>
                <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', done ? 'bg-success-500 text-white' : 'bg-brand-100 text-brand-500 dark:bg-white/10')}>
                  <g.icon className="h-5 w-5" />
                </div>
                <div className="flex-1"><p className="text-sm font-semibold">{g.label}</p><p className="text-xs text-muted">+{g.xp} XP</p></div>
                {done ? <CheckCircle2 className="h-5 w-5 text-success-500" /> : <Lock className="h-5 w-5 text-muted/40" />}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Badges grid */}
      <Card className="p-6">
        <h3 className="mb-4 font-display text-lg font-bold">Achievements</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BADGES.map((b, i) => {
            const earned = earnedKeys.has(b.key);
            const Icon = BADGE_ICONS[b.icon] ?? Trophy;
            const tier = TIER_STYLES[b.tier];
            const userAch = data.achievements.find((a) => a.badge_key === b.key);
            return (
              <motion.div
                key={b.key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className={cn('relative overflow-hidden rounded-2xl p-5 ring-1 transition', earned ? cn('bg-gradient-to-br', tier.bg, tier.ring) : 'bg-white/30 opacity-60 dark:bg-white/5 ring-white/10')}
              >
                {earned && <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/20 blur-2xl" />}
                <div className="relative flex items-start gap-3">
                  <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', earned ? 'bg-white/80 text-brand-600 dark:bg-white/20 dark:text-white' : 'bg-white/40 text-muted dark:bg-white/5')}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-bold">{b.name}</p>
                      <span className="shrink-0 rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-bold uppercase text-muted dark:bg-white/10">{tier.label}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted">{b.description}</p>
                    {earned && userAch && <p className="mt-1.5 text-xs font-semibold text-success-600">Earned {new Date(userAch.earned_at).toLocaleDateString()}</p>}
                  </div>
                  {earned ? <CheckCircle2 className="h-5 w-5 shrink-0 text-success-500" /> : <Lock className="h-5 w-5 shrink-0 text-muted/40" />}
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Streak calendar */}
      <Card className="p-6">
        <h3 className="mb-4 font-display text-lg font-bold">Streak History</h3>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 30 }).map((_, i) => {
            const date = new Date(Date.now() - (29 - i) * 86400000);
            const dateStr = date.toISOString().slice(0, 10);
            const hasActivity = data.analytics.some((a) => a.day === dateStr && (a.study_minutes > 0 || a.tasks_completed > 0));
            const isToday = dateStr === new Date().toISOString().slice(0, 10);
            return (
              <div key={i} className={cn('flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold transition', hasActivity ? 'bg-brand-gradient text-white' : 'bg-white/40 text-muted dark:bg-white/5', isToday && 'ring-2 ring-brand-400')} title={dateStr}>
                {date.getDate()}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

void badgeByKey;

function MiniStat({ icon: Icon, label, value, color }: { icon: typeof Trophy; label: string; value: string | number; color: string }) {
  return (
    <Card className="p-5" hover>
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}18`, color }}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </Card>
  );
}
