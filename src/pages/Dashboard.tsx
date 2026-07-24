import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, Clock, Target, Zap, Flame, TrendingUp, CheckCircle2,
  Timer, Brain, ArrowRight, BookOpen, Award, Calendar as CalIcon,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard, EmptyState } from '@/components/ui/Feedback';
import { useUserData } from '@/hooks/useUserData';
import { useAuth } from '@/context/AuthContext';
import { levelProgress } from '@/lib/gamification';
import { generateRecommendation } from '@/lib/scheduler';
import {
  formatTime, formatMinutes, relativeDeadline, greeting,
} from '@/lib/utils';
import { CATEGORY_META } from '@/lib/gamification';
import {
  AreaChart, Area, ResponsiveContainer, XAxis, Tooltip,
} from 'recharts';

export function Dashboard() {
  const data = useUserData();
  const { profile } = useAuth();
  const {
    pendingTasks, completedTasks, timetable, focusSessions, analytics,
    focusToday, hoursStudied, completionRate, handleRegenerateTimetable, loading,
  } = data;

  const lp = profile ? levelProgress(profile.xp) : null;
  const recommendation = useMemo(
    () => generateRecommendation(data.tasks, focusToday, hoursStudied),
    [data.tasks, focusToday, hoursStudied],
  );

  const chartData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const todayIdx = (new Date().getDay() + 6) % 7;
    return Array.from({ length: 7 }).map((_, i) => {
      const dayOffset = i - todayIdx;
      const date = new Date(Date.now() + dayOffset * 86400000).toISOString().slice(0, 10);
      const a = analytics.find((x) => x.day === date);
      return { day: days[(new Date(date).getDay() + 6) % 7], xp: a?.xp_earned ?? 0, minutes: a?.study_minutes ?? 0 };
    });
  }, [analytics]);

  const recentActivity = useMemo(() => {
    const items: { icon: typeof CheckCircle2; label: string; time: string; color: string }[] = [];
    completedTasks.slice(-5).reverse().forEach((t) => {
      items.push({ icon: CheckCircle2, label: `Completed: ${t.title}`, time: t.completed_at ? new Date(t.completed_at).toLocaleString(undefined, { hour: 'numeric', minute: '2-digit' }) : '', color: '#10b981' });
    });
    focusSessions.filter((f) => f.completed_at).slice(0, 3).forEach((f) => {
      items.push({ icon: Timer, label: `Focus session: ${formatMinutes(f.duration_minutes)}`, time: f.completed_at ? new Date(f.completed_at).toLocaleString(undefined, { hour: 'numeric', minute: '2-digit' }) : '', color: '#38bdf8' });
    });
    return items.slice(0, 6);
  }, [completedTasks, focusSessions]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-300 border-t-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero greeting + today's goal */}
      <Card className="overflow-hidden p-6 sm:p-8" >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-500">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <h2 className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">{greeting()}, {profile?.full_name?.split(' ')[0] || 'Scholar'}!</h2>
            <p className="mt-2 max-w-lg text-muted">Here is your personalized snapshot for today. Let's make it count.</p>
            {lp && (
              <div className="mt-5 max-w-md">
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-semibold">Level {lp.level}</span>
                  <span className="text-muted">{lp.current}/{lp.needed} XP</span>
                </div>
                <ProgressBar value={lp.current} max={lp.needed} />
              </div>
            )}
          </div>
          <div className="flex flex-col items-start gap-3 lg:items-end">
            <div className="flex gap-2">
              <div className="flex items-center gap-2 rounded-xl glass px-4 py-2.5">
                <Flame className="h-5 w-5 text-warning-500" />
                <div><p className="text-lg font-bold leading-none">{profile?.study_streak ?? 0}</p><p className="text-xs text-muted">day streak</p></div>
              </div>
              <div className="flex items-center gap-2 rounded-xl glass px-4 py-2.5">
                <Zap className="h-5 w-5 text-brand-500" />
                <div><p className="text-lg font-bold leading-none">{profile?.xp ?? 0}</p><p className="text-xs text-muted">total XP</p></div>
              </div>
              <div className="flex items-center gap-2 rounded-xl glass px-4 py-2.5">
                <Award className="h-5 w-5 text-accent-500" />
                <div><p className="text-lg font-bold leading-none">{profile?.level ?? 1}</p><p className="text-xs text-muted">level</p></div>
              </div>
            </div>
            <Link to="/app/planner"><Button variant="secondary" size="sm">Open AI Planner <ArrowRight className="h-4 w-4" /></Button></Link>
          </div>
        </div>
      </Card>

      {/* Stat row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Clock} label="Hours studied" value={hoursStudied.toFixed(1)} hint="today" color="#6b7bf0" delay={0} />
        <StatCard icon={CheckCircle2} label="Tasks completed" value={completedTasks.length} hint={`of ${data.tasks.length} total`} color="#10b981" delay={0.05} />
        <StatCard icon={Timer} label="Focus sessions" value={focusToday} hint="today" color="#38bdf8" delay={0.1} />
        <StatCard icon={TrendingUp} label="Completion rate" value={`${completionRate}%`} hint="all tasks" color="#f59e0b" delay={0.15} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's schedule */}
        <Card className="p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalIcon className="h-5 w-5 text-brand-500" />
              <h3 className="font-display text-lg font-bold">Today's Schedule</h3>
            </div>
            <button onClick={handleRegenerateTimetable} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline">
              <Sparkles className="h-4 w-4" /> Regenerate
            </button>
          </div>
          {timetable.length === 0 ? (
            <EmptyState
              icon={CalIcon}
              title="No schedule yet"
              description="Generate your AI timetable from the planner."
              action={<Link to="/app/planner"><Button size="sm">Open Planner</Button></Link>}
            />
          ) : (
            <div className="max-h-[420px] space-y-2 overflow-y-auto scrollbar-thin pr-1">
              {timetable.map((b, i) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 rounded-xl bg-white/40 px-4 py-3 dark:bg-white/5"
                >
                  <span className="w-20 shrink-0 text-sm font-semibold text-muted">{formatTime(b.start_time)}</span>
                  <span className="h-10 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: b.block_type === 'break' ? '#94a3b8' : b.block_type === 'class' ? '#6b7bf0' : b.block_type === 'meal' ? '#f59e0b' : '#10b981' }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{b.label}</p>
                    <p className="text-xs text-muted">{b.subject_name || b.block_type} · {formatTime(b.end_time)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>

        {/* AI recommendation */}
        <Card className="relative overflow-hidden p-6">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-300/30 blur-2xl" />
          <div className="relative">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient text-white"><Brain className="h-5 w-5" /></div>
              <h3 className="font-display text-lg font-bold">AI Recommendation</h3>
            </div>
            <h4 className="font-semibold">{recommendation.title}</h4>
            <p className="mt-2 text-sm text-muted">{recommendation.body}</p>
            <Link to="/app/chat" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline">
              Ask DayPilot <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming tasks */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold">Upcoming Tasks</h3>
            <Link to="/app/todos" className="text-sm font-semibold text-brand-600 hover:underline">View all</Link>
          </div>
          {pendingTasks.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="All caught up!" description="No pending tasks. Nice work." />
          ) : (
            <div className="space-y-2.5">
              {pendingTasks.slice(0, 5).map((t) => {
                const cat = CATEGORY_META[t.category];
                const rel = relativeDeadline(t.deadline);
                return (
                  <div key={t.id} className="flex items-center gap-3 rounded-xl bg-white/40 px-3 py-2.5 dark:bg-white/5">
                    <span className="h-9 w-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{t.title}</p>
                      <p className="text-xs text-muted">{t.subject_name || cat.label} · {formatMinutes(t.estimated_minutes)}</p>
                    </div>
                    <span className={`shrink-0 text-xs font-semibold ${rel.urgent ? 'text-error-500' : 'text-muted'}`}>{rel.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Weekly chart */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-brand-500" />
            <h3 className="font-display text-lg font-bold">Weekly Progress</h3>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6b7bf0" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#6b7bf0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9aa6c4' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="xp" stroke="#6b7bf0" strokeWidth={2.5} fill="url(#xpGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-center text-xs text-muted">XP earned over the last 7 days</p>
        </Card>

        {/* Focus timer widget + today's goal */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="mb-3 flex items-center gap-2">
              <Target className="h-5 w-5 text-accent-500" />
              <h3 className="font-display text-lg font-bold">Today's Goal</h3>
            </div>
            <p className="text-sm text-muted">{profile?.today_goal || 'Set a goal in settings to stay focused for the day.'}</p>
            <Link to="/app/settings" className="mt-3 inline-flex text-sm font-semibold text-brand-600 hover:underline">Set goal</Link>
          </Card>
          <Card className="p-6">
            <div className="mb-3 flex items-center gap-2">
              <Timer className="h-5 w-5 text-brand-500" />
              <h3 className="font-display text-lg font-bold">Focus Timer</h3>
            </div>
            <p className="text-sm text-muted">Start a Pomodoro or deep focus session.</p>
            <Link to="/app/focus"><Button className="mt-3 w-full" size="sm">Start focusing <ArrowRight className="h-4 w-4" /></Button></Link>
          </Card>
        </div>
      </div>

      {/* Quick actions + recent activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-4 font-display text-lg font-bold">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { icon: Brain, label: 'Plan my day', to: '/app/planner' },
              { icon: CheckCircle2, label: 'Add task', to: '/app/todos' },
              { icon: Timer, label: 'Focus session', to: '/app/focus' },
              { icon: Sparkles, label: 'Ask AI', to: '/app/chat' },
              { icon: CalIcon, label: 'Calendar', to: '/app/calendar' },
              { icon: TrendingUp, label: 'Analytics', to: '/app/analytics' },
            ].map((a) => (
              <Link key={a.label} to={a.to}>
                <motion.div whileHover={{ y: -3 }} className="flex flex-col items-center gap-2 rounded-xl bg-white/40 p-4 text-center transition dark:bg-white/5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-white"><a.icon className="h-5 w-5" /></div>
                  <span className="text-sm font-semibold">{a.label}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 font-display text-lg font-bold">Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <EmptyState icon={BookOpen} title="No activity yet" description="Complete tasks or focus sessions to see them here." />
          ) : (
            <div className="space-y-2.5">
              {recentActivity.map((a, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3 rounded-xl bg-white/40 px-3 py-2.5 dark:bg-white/5">
                  <a.icon className="h-5 w-5" style={{ color: a.color }} />
                  <p className="flex-1 truncate text-sm font-medium">{a.label}</p>
                  <span className="text-xs text-muted">{a.time}</span>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

