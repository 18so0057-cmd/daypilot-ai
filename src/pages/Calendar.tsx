import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, BookOpen, FileText, GraduationCap,
  Timer, Users, Sparkles, Heart, Clock,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/Feedback';
import { useUserData } from '@/hooks/useUserData';
import { CATEGORY_META } from '@/lib/gamification';
import { cn, relativeDeadline } from '@/lib/utils';
import type { Task, FocusSession } from '@/lib/types';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CATEGORY_ICONS: Record<string, typeof BookOpen> = { homework: BookOpen, assignment: FileText, exam: GraduationCap, tuition: Users, club: Sparkles, personal: Heart };

interface DayEvents {
  tasks: Task[];
  focus: FocusSession[];
}

export function Calendar() {
  const data = useUserData();
  const [cursor, setCursor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const eventsByDay = useMemo(() => {
    const map: Record<string, DayEvents> = {};
    data.tasks.forEach((t) => {
      if (t.deadline) {
        const day = t.deadline.slice(0, 10);
        if (!map[day]) map[day] = { tasks: [], focus: [] };
        map[day].tasks.push(t);
      }
    });
    data.focusSessions.forEach((f) => {
      if (f.started_at) {
        const day = f.started_at.slice(0, 10);
        if (!map[day]) map[day] = { tasks: [], focus: [] };
        map[day].focus.push(f);
      }
    });
    return map;
  }, [data.tasks, data.focusSessions]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startWeekday = firstDay.getDay();
    const totalDays = lastDay.getDate();
    const days: (Date | null)[] = [];
    for (let i = 0; i < startWeekday; i++) days.push(null);
    for (let d = 1; d <= totalDays; d++) days.push(new Date(year, month, d));
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [year, month]);

  const selectedEvents = eventsByDay[selectedDate] ?? { tasks: [], focus: [] };
  const todayStr = new Date().toISOString().slice(0, 10);

  if (data.loading) {
    return <div className="flex h-96 items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-300 border-t-brand-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-extrabold sm:text-3xl">Calendar</h2>
        <p className="mt-1 text-muted">Track assignments, exams, and study sessions at a glance.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar grid */}
        <Card className="p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-xl font-bold">{cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h3>
            <div className="flex gap-1.5">
              <Button variant="ghost" size="icon" onClick={() => setCursor(new Date(year, month - 1, 1))}><ChevronLeft className="h-5 w-5" /></Button>
              <Button variant="secondary" size="sm" onClick={() => { setCursor(new Date()); setSelectedDate(todayStr); }}>Today</Button>
              <Button variant="ghost" size="icon" onClick={() => setCursor(new Date(year, month + 1, 1))}><ChevronRight className="h-5 w-5" /></Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {WEEKDAYS.map((d) => <div key={d} className="py-2 text-center text-xs font-bold text-muted">{d}</div>)}
            {calendarDays.map((day, i) => {
              if (!day) return <div key={i} />;
              const dateStr = day.toISOString().slice(0, 10);
              const events = eventsByDay[dateStr];
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;
              const hasTask = events && events.tasks.length > 0;
              const hasFocus = events && events.focus.length > 0;
              const hasExam = events?.tasks.some((t) => t.category === 'exam');
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(dateStr)}
                  className={cn(
                    'relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm font-semibold transition',
                    isSelected ? 'bg-brand-gradient text-white shadow-glow' : isToday ? 'bg-brand-100 text-brand-700 dark:bg-brand-800/40 dark:text-brand-200' : 'text-muted hover:bg-brand-50 dark:hover:bg-white/5',
                  )}
                >
                  {day.getDate()}
                  {(hasTask || hasFocus) && (
                    <div className="mt-1 flex gap-0.5">
                      {hasExam && <span className={cn('h-1.5 w-1.5 rounded-full', isSelected ? 'bg-white' : 'bg-error-500')} />}
                      {hasTask && !hasExam && <span className={cn('h-1.5 w-1.5 rounded-full', isSelected ? 'bg-white' : 'bg-brand-500')} />}
                      {hasFocus && <span className={cn('h-1.5 w-1.5 rounded-full', isSelected ? 'bg-white' : 'bg-accent-400')} />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-brand-500" /> Task / Assignment</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-error-500" /> Exam</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-accent-400" /> Focus Session</span>
          </div>
        </Card>

        {/* Selected day events */}
        <Card className="p-6">
          <h3 className="mb-1 font-display text-lg font-bold">{new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
          <p className="mb-4 text-sm text-muted">{selectedEvents.tasks.length + selectedEvents.focus.length} events</p>

          {selectedEvents.tasks.length === 0 && selectedEvents.focus.length === 0 ? (
            <EmptyState icon={Clock} title="No events" description="Nothing scheduled for this day." />
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {selectedEvents.tasks.map((t, i) => {
                  const cat = CATEGORY_META[t.category];
                  const Icon = CATEGORY_ICONS[t.category] ?? BookOpen;
                  const rel = relativeDeadline(t.deadline);
                  return (
                    <motion.div key={t.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3 rounded-xl bg-white/50 p-3 dark:bg-white/5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${cat.color}18`, color: cat.color }}>
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={cn('truncate text-sm font-semibold', t.completed && 'text-muted line-through')}>{t.title}</p>
                        <p className="text-xs text-muted">{cat.label} · {t.subject_name || 'General'}</p>
                      </div>
                      <span className={cn('shrink-0 text-xs font-semibold', rel.urgent ? 'text-error-500' : 'text-muted')}>{rel.label}</span>
                    </motion.div>
                  );
                })}
                {selectedEvents.focus.map((f, i) => (
                  <motion.div key={f.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (selectedEvents.tasks.length + i) * 0.05 }} className="flex items-center gap-3 rounded-xl bg-white/50 p-3 dark:bg-white/5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-100 text-accent-500 dark:bg-accent-500/15">
                      <Timer className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold capitalize">{f.mode} focus session</p>
                      <p className="text-xs text-muted">{f.duration_minutes} min · +{f.xp_rewarded} XP</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
