import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, Plus, Sparkles, RefreshCw, Clock, School, BookOpen, Coffee,
  Trash2, CalendarDays,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/Feedback';
import { Input, Select } from '@/components/ui/Input';
import { TaskForm } from '@/components/TaskForm';
import { useUserData } from '@/hooks/useUserData';
import { useAuth } from '@/context/AuthContext';
import { generateTimetable } from '@/lib/scheduler';
import { updateProfile } from '@/lib/data';
import { formatTime, formatMinutes, todayISO } from '@/lib/utils';
import { CATEGORY_META, DIFFICULTY_META, PRIORITY_META } from '@/lib/gamification';
import type { GeneratedBlock, NewTaskInput } from '@/lib/types';
import { toast } from '@/components/ui/Toaster';

const BLOCK_ICONS = { study: BookOpen, break: Coffee, class: School, meal: Coffee, activity: CalendarDays };
const BLOCK_COLORS = { study: '#10b981', break: '#94a3b8', class: '#6b7bf0', meal: '#f59e0b', activity: '#ec4899' };

export function Planner() {
  const data = useUserData();
  const { profile } = useAuth();
  const [formOpen, setFormOpen] = useState(false);
  const [preview, setPreview] = useState<GeneratedBlock[] | null>(null);
  const [generating, setGenerating] = useState(false);

  const prefs = profile?.preferences ?? {};
  const pendingTasks = data.pendingTasks;

  const handleAddTask = async (input: NewTaskInput) => {
    await data.handleAddTask(input);
    toast('Task added', 'success');
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const blocks = generateTimetable(data.tasks, prefs);
      setPreview(blocks);
      await data.handleRegenerateTimetable();
    } finally {
      setGenerating(false);
    }
  };

  const displayBlocks = preview ?? data.timetable.map((b) => ({
    start_time: b.start_time, end_time: b.end_time, label: b.label,
    block_type: b.block_type, subject_name: b.subject_name, task_id: b.task_id,
  }));

  const totalStudyMin = displayBlocks
    .filter((b) => b.block_type === 'study')
    .reduce((sum, b) => {
      const s = parseInt(b.start_time.split(':')[0]) * 60 + parseInt(b.start_time.split(':')[1]);
      const e = parseInt(b.end_time.split(':')[0]) * 60 + parseInt(b.end_time.split(':')[1]);
      return sum + (e - s);
    }, 0);

  if (data.loading) {
    return <div className="flex h-96 items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-300 border-t-brand-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-extrabold sm:text-3xl">AI Daily Planner</h2>
          <p className="mt-1 text-muted">Add your tasks and let AI build a balanced timetable for {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}.</p>
        </div>
        <Button onClick={handleGenerate} loading={generating} size="lg">
          <Sparkles className="h-5 w-5" /> {data.timetable.length > 0 ? 'Regenerate My Day' : 'Generate My Day'}
        </Button>
      </div>

      {/* School hours config */}
      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <School className="h-5 w-5 text-brand-500" />
          <h3 className="font-semibold">Study window</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          <Input label="School starts" type="time" value={prefs.school_start ?? '08:00'} onChange={(e) => profile && void savePref(profile.id, { ...prefs, school_start: e.target.value })} />
          <Input label="School ends" type="time" value={prefs.school_end ?? '15:00'} onChange={(e) => profile && void savePref(profile.id, { ...prefs, school_end: e.target.value })} />
          <Input label="Study starts" type="time" value={prefs.study_start ?? '16:00'} onChange={(e) => profile && void savePref(profile.id, { ...prefs, study_start: e.target.value })} />
          <Input label="Study ends" type="time" value={prefs.study_end ?? '22:00'} onChange={(e) => profile && void savePref(profile.id, { ...prefs, study_end: e.target.value })} />
        </div>
        <p className="mt-2 text-xs text-muted">Adjust your hours to fine-tune the generated timetable. Changes apply on the next regeneration.</p>
      </Card>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Task list */}
        <Card className="p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold">Your Tasks</h3>
            <Button size="sm" onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" /> Add</Button>
          </div>
          {pendingTasks.length === 0 ? (
            <EmptyState icon={Brain} title="No pending tasks" description="Add homework, exams, or tasks to generate a plan." action={<Button size="sm" onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" /> Add task</Button>} />
          ) : (
            <div className="max-h-[520px] space-y-2 overflow-y-auto scrollbar-thin pr-1">
              {pendingTasks.map((t, i) => {
                const cat = CATEGORY_META[t.category];
                return (
                  <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="group rounded-xl bg-white/50 px-4 py-3 dark:bg-white/5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{t.title}</p>
                        <p className="text-xs text-muted">{t.subject_name || cat.label} · {formatMinutes(t.estimated_minutes)}</p>
                      </div>
                      <button onClick={() => data.handleDeleteTask(t.id)} className="opacity-0 transition group-hover:opacity-100 text-muted hover:text-error-500"><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>{cat.label}</span>
                      <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: `${PRIORITY_META[t.priority].color}20`, color: PRIORITY_META[t.priority].color }}>{PRIORITY_META[t.priority].label}</span>
                      <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: `${DIFFICULTY_META[t.difficulty].color}20`, color: DIFFICULTY_META[t.difficulty].color }}>{DIFFICULTY_META[t.difficulty].label}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Timetable */}
        <Card className="p-6 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-brand-500" />
              <h3 className="font-display text-lg font-bold">Generated Timetable</h3>
            </div>
            {displayBlocks.length > 0 && (
              <div className="flex items-center gap-3 text-xs text-muted">
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {formatMinutes(totalStudyMin)} study</span>
                <button onClick={handleGenerate} className="flex items-center gap-1 font-semibold text-brand-600 hover:underline"><RefreshCw className="h-3.5 w-3.5" /> Regenerate</button>
              </div>
            )}
          </div>
          {displayBlocks.length === 0 ? (
            <EmptyState icon={Sparkles} title="Your timetable will appear here" description="Click 'Generate My Day' to build a personalized schedule." action={<Button size="sm" onClick={handleGenerate} loading={generating}><Sparkles className="h-4 w-4" /> Generate</Button>} />
          ) : (
            <div className="relative space-y-2">
              {displayBlocks.map((b, i) => {
                const Icon = BLOCK_ICONS[b.block_type] ?? BookOpen;
                const color = BLOCK_COLORS[b.block_type] ?? '#6b7bf0';
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-stretch gap-3">
                    <div className="flex w-20 shrink-0 flex-col items-end justify-center pr-1">
                      <span className="text-sm font-bold">{formatTime(b.start_time)}</span>
                      <span className="text-xs text-muted">{formatTime(b.end_time)}</span>
                    </div>
                    <div className="relative flex-1">
                      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full" style={{ backgroundColor: color }} />
                      <div className="ml-3 flex items-center gap-3 rounded-xl bg-white/50 px-4 py-3 dark:bg-white/5" style={{ borderLeft: `3px solid ${color}` }}>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}18`, color }}>
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{b.label}</p>
                          <p className="text-xs capitalize text-muted">{b.subject_name || b.block_type}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <TaskForm open={formOpen} onClose={() => setFormOpen(false)} subjects={data.subjects} onSubmit={handleAddTask} />
    </div>
  );
}

async function savePref(userId: string, prefs: Record<string, unknown>) {
  await updateProfile(userId, { preferences: prefs as never });
}
