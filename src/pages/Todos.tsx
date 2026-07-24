import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, CheckCircle2, Circle, Trash2, GripVertical, Filter,
  BookOpen, FileText, GraduationCap, Users, Sparkles, Heart, Zap,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/Feedback';
import { Select } from '@/components/ui/Input';
import { TaskForm } from '@/components/TaskForm';
import { useUserData } from '@/hooks/useUserData';
import { formatMinutes, relativeDeadline } from '@/lib/utils';
import { CATEGORY_META, PRIORITY_META, DIFFICULTY_META, xpForTask } from '@/lib/gamification';
import type { TaskCategory, NewTaskInput, Task } from '@/lib/types';
import { cn } from '@/lib/utils';

const CATEGORY_ICONS = { homework: BookOpen, assignment: FileText, exam: GraduationCap, tuition: Users, club: Sparkles, personal: Heart };

const FILTERS: { key: 'all' | 'pending' | 'completed'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'completed', label: 'Completed' },
];

export function Todos() {
  const data = useUserData();
  const [formOpen, setFormOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const dragId = useRef<string | null>(null);
  const dragOverId = useRef<string | null>(null);

  const handleAddTask = async (input: NewTaskInput) => {
    await data.handleAddTask(input);
  };

  const filtered = data.tasks
    .filter((t) => (filter === 'pending' ? !t.completed : filter === 'completed' ? t.completed : true))
    .filter((t) => (categoryFilter === 'all' ? true : t.category === categoryFilter))
    .sort((a, b) => a.sort_order - b.sort_order);

  const completedCount = data.completedTasks.length;
  const totalCount = data.tasks.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  function onDragStart(id: string) { dragId.current = id; }
  function onDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    dragOverId.current = id;
  }
  async function onDrop() {
    const fromId = dragId.current;
    const toId = dragOverId.current;
    if (!fromId || !toId || fromId === toId) return;
    const ordered = data.tasks.sort((a, b) => a.sort_order - b.sort_order).map((t) => t.id);
    const fromIdx = ordered.indexOf(fromId);
    const toIdx = ordered.indexOf(toId);
    ordered.splice(fromIdx, 1);
    ordered.splice(toIdx, 0, fromId);
    await data.handleReorder(ordered);
    dragId.current = null;
    dragOverId.current = null;
  }

  if (data.loading) {
    return <div className="flex h-96 items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-300 border-t-brand-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-extrabold sm:text-3xl">Smart To-Do List</h2>
          <p className="mt-1 text-muted">Organize, prioritize, and earn XP for every completed task.</p>
        </div>
        <Button onClick={() => setFormOpen(true)} size="lg"><Plus className="h-5 w-5" /> Add task</Button>
      </div>

      {/* Progress overview */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted">Overall progress</p>
            <p className="text-2xl font-bold">{completedCount} / {totalCount} done</p>
          </div>
          <div className="text-right">
            <p className="font-display text-3xl font-extrabold text-gradient">{progressPct}%</p>
          </div>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-brand-100 dark:bg-white/10">
          <motion.div className="h-full rounded-full bg-brand-gradient" initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} transition={{ duration: 0.8 }} />
        </div>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1.5 rounded-xl glass p-1">
          {FILTERS.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={cn('rounded-lg px-4 py-2 text-sm font-semibold transition', filter === f.key ? 'bg-brand-gradient text-white shadow-glow' : 'text-muted hover:text-brand-600')}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted" />
          <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-40">
            <option value="all">All categories</option>
            {Object.entries(CATEGORY_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </Select>
        </div>
      </div>

      {/* Task list */}
      <Card className="p-6">
        {filtered.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="No tasks here" description="Add a task to get started — you will earn XP for completing it!" action={<Button size="sm" onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" /> Add task</Button>} />
        ) : (
          <div className="space-y-2.5">
            <AnimatePresence>
              {filtered.map((t) => (
                <TaskRow key={t.id} task={t} onToggle={() => data.handleToggleTask(t)} onDelete={() => data.handleDeleteTask(t.id)} onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </Card>

      <TaskForm open={formOpen} onClose={() => setFormOpen(false)} subjects={data.subjects} onSubmit={handleAddTask} />
    </div>
  );
}

interface TaskRowProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDrop: () => void;
}

function TaskRow({ task, onToggle, onDelete, onDragStart, onDragOver, onDrop }: TaskRowProps) {
  const cat = CATEGORY_META[task.category];
  const Icon = CATEGORY_ICONS[task.category];
  const rel = relativeDeadline(task.deadline);
  const xp = xpForTask(task.category, task.priority, task.difficulty);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -30, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      draggable
      onDragStart={() => onDragStart(task.id)}
      onDragOver={(e) => onDragOver(e, task.id)}
      onDrop={onDrop}
      className={cn('group flex items-center gap-3 rounded-xl border px-4 py-3 transition', task.completed ? 'border-transparent bg-success-50/50 dark:bg-success-500/5' : 'border-brand-100 bg-white/50 hover:shadow-soft dark:border-white/5 dark:bg-white/5')}
    >
      <GripVertical className="h-5 w-5 shrink-0 cursor-grab text-muted/40 opacity-0 transition group-hover:opacity-100" />

      <button onClick={onToggle} className="shrink-0 transition-transform hover:scale-110">
        <AnimatePresence mode="wait">
          {task.completed ? (
            <motion.div key="done" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
              <CheckCircle2 className="h-6 w-6 text-success-500" />
            </motion.div>
          ) : (
            <motion.div key="todo" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Circle className="h-6 w-6 text-brand-300 hover:text-brand-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <span className="h-10 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: cat.color }} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 shrink-0" style={{ color: cat.color }} />
          <p className={cn('truncate text-sm font-semibold', task.completed && 'text-muted line-through')}>{task.title}</p>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
          <span>{task.subject_name || cat.label}</span>
          <span>·</span>
          <span>{formatMinutes(task.estimated_minutes)}</span>
          <span>·</span>
          <span className={rel.urgent ? 'font-semibold text-error-500' : ''}>{rel.label}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {!task.completed && (
          <span className="hidden items-center gap-1 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-600 dark:bg-brand-800/40 sm:flex">
            <Zap className="h-3 w-3" /> +{xp}
          </span>
        )}
        <span className="hidden rounded-full px-2 py-0.5 text-xs font-semibold sm:inline" style={{ backgroundColor: `${PRIORITY_META[task.priority].color}20`, color: PRIORITY_META[task.priority].color }}>
          {PRIORITY_META[task.priority].label}
        </span>
        <button onClick={onDelete} className="rounded-lg p-1.5 text-muted opacity-0 transition hover:text-error-500 group-hover:opacity-100">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
