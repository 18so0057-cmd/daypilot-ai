import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Clock, CheckCircle2, Timer, TrendingUp, Zap, Flame,
  BarChart3, Award, Target,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/Feedback';
import { useUserData } from '@/hooks/useUserData';
import { useAuth } from '@/context/AuthContext';
import { dayLabel, formatMinutes } from '@/lib/utils';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, RadialBarChart, RadialBar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const RANGE_TABS = [
  { key: 7, label: '7 days' },
  { key: 14, label: '14 days' },
  { key: 30, label: '30 days' },
] as const;

export function Analytics({ range = 7 }: { range?: number }) {
  const data = useUserData();
  const { profile } = useAuth();
  const [selectedRange] = [range];

  const weekData = useMemo(() => {
    const days = [];
    for (let i = selectedRange - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      const a = data.analytics.find((x) => x.day === date);
      days.push({
        day: dayLabel(date),
        date,
        study: a?.study_minutes ?? 0,
        tasks: a?.tasks_completed ?? 0,
        focus: a?.focus_sessions ?? 0,
        xp: a?.xp_earned ?? 0,
      });
    }
    return days;
  }, [data.analytics, selectedRange]);

  const totals = useMemo(() => {
    const studyMin = weekData.reduce((s, d) => s + d.study, 0);
    const tasks = weekData.reduce((s, d) => s + d.tasks, 0);
    const focus = weekData.reduce((s, d) => s + d.focus, 0);
    const xp = weekData.reduce((s, d) => s + d.xp, 0);
    return { studyMin, tasks, focus, xp };
  }, [weekData]);

  const completionRate = data.tasks.length > 0 ? Math.round((data.completedTasks.length / data.tasks.length) * 100) : 0;

  // category distribution
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.tasks.forEach((t) => { counts[t.category] = (counts[t.category] ?? 0) + 1; });
    return Object.entries(counts).map(([k, v]) => ({ name: k, value: v }));
  }, [data.tasks]);

  const radarData = [
    { subject: 'Study', value: Math.min(100, totals.studyMin / (selectedRange * 60) * 100) },
    { subject: 'Tasks', value: Math.min(100, (totals.tasks / (selectedRange * 3)) * 100) },
    { subject: 'Focus', value: Math.min(100, (totals.focus / selectedRange) * 100) },
    { subject: 'XP', value: Math.min(100, (totals.xp / (selectedRange * 100)) * 100) },
    { subject: 'Streak', value: Math.min(100, (profile?.study_streak ?? 0) * 5) },
    { subject: 'Consistency', value: Math.min(100, (weekData.filter((d) => d.study > 0).length / selectedRange) * 100) },
  ];

  if (data.loading) {
    return <div className="flex h-96 items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-300 border-t-brand-600" /></div>;
  }

  const COLORS = ['#6b7bf0', '#38bdf8', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-extrabold sm:text-3xl">Study Analytics</h2>
          <p className="mt-1 text-muted">Track your progress and spot trends over time.</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Clock} label="Hours studied" value={(totals.studyMin / 60).toFixed(1)} hint={`last ${selectedRange} days`} color="#6b7bf0" />
        <StatCard icon={CheckCircle2} label="Tasks completed" value={totals.tasks} hint={`last ${selectedRange} days`} color="#10b981" />
        <StatCard icon={Timer} label="Focus sessions" value={totals.focus} hint={`last ${selectedRange} days`} color="#38bdf8" />
        <StatCard icon={Zap} label="XP earned" value={totals.xp} hint={`last ${selectedRange} days`} color="#f59e0b" />
      </div>

      {/* Study hours chart */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-brand-500" />
          <h3 className="font-display text-lg font-bold">Study Hours</h3>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weekData} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="studyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6b7bf0" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#6b7bf0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9aa6c4' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9aa6c4' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v / 60 * 10) / 10}h`} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} formatter={(v: number) => [formatMinutes(v), 'Study']} />
              <Area type="monotone" dataKey="study" stroke="#6b7bf0" strokeWidth={2.5} fill="url(#studyGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* XP earned chart */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-warning-500" />
            <h3 className="font-display text-lg font-bold">XP Earned</h3>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9aa6c4' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9aa6c4' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} cursor={{ fill: 'rgba(107,123,240,0.08)' }} />
                <Bar dataKey="xp" radius={[6, 6, 0, 0]}>
                  {weekData.map((_, i) => <Cell key={i} fill="#6b7bf0" />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Tasks + focus line chart */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-accent-500" />
            <h3 className="font-display text-lg font-bold">Tasks & Focus</h3>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weekData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9aa6c4' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9aa6c4' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="tasks" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="focus" stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Performance radar */}
        <Card className="p-6 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-brand-500" />
            <h3 className="font-display text-lg font-bold">Performance Overview</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#d4d9ff66" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#9aa6c4' }} />
                <Radar dataKey="value" stroke="#6b7bf0" fill="#6b7bf0" fillOpacity={0.35} strokeWidth={2} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Completion rate radial */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-success-500" />
            <h3 className="font-display text-lg font-bold">Completion Rate</h3>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="65%" outerRadius="100%" data={[{ value: completionRate, fill: '#10b981' }]} startAngle={90} endAngle={-270}>
                <RadialBar background dataKey="value" cornerRadius={12} />
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-current font-display text-3xl font-extrabold" style={{ fill: '#10b981' }}>
                  {completionRate}%
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-center text-sm text-muted">{data.completedTasks.length} of {data.tasks.length} tasks done</p>
        </Card>
      </div>

      {/* Category breakdown */}
      {categoryData.length > 0 && (
        <Card className="p-6">
          <h3 className="mb-4 font-display text-lg font-bold">Task Categories</h3>
          <div className="flex flex-wrap gap-4">
            {categoryData.map((c, i) => {
              const max = Math.max(...categoryData.map((x) => x.value));
              return (
                <div key={c.name} className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-sm font-medium capitalize">{c.name}</span>
                  <span className="text-sm font-bold" style={{ color: COLORS[i % COLORS.length] }}>{c.value}</span>
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-brand-100 dark:bg-white/10">
                    <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${(c.value / max) * 100}%` }} transition={{ duration: 0.7 }} style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

void RANGE_TABS;
void Flame;
