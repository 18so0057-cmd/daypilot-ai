import { useState, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import type { NewTaskInput, Subject, TaskCategory, Priority, Difficulty } from '@/lib/types';
import { CATEGORY_META, PRIORITY_META, DIFFICULTY_META } from '@/lib/gamification';

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: NewTaskInput) => Promise<void>;
  subjects: Subject[];
  initial?: Partial<NewTaskInput>;
  submitLabel?: string;
}

const defaultInput: NewTaskInput = {
  title: '', subject_name: '', category: 'homework', deadline: null,
  estimated_minutes: 60, priority: 'medium', difficulty: 'medium',
};

export function TaskForm({ open, onClose, onSubmit, subjects, initial, submitLabel = 'Add task' }: TaskFormProps) {
  const [input, setInput] = useState<NewTaskInput>({ ...defaultInput, ...initial });
  const [saving, setSaving] = useState(false);

  function reset() { setInput({ ...defaultInput, ...initial }); }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.title.trim()) return;
    setSaving(true);
    try {
      await onSubmit(input);
      reset();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit task' : 'Add a task'} className="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Title" value={input.title} onChange={(e) => setInput({ ...input, title: e.target.value })} placeholder="e.g. Algebra worksheet 5" required autoFocus />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Subject" value={input.subject_name} onChange={(e) => setInput({ ...input, subject_name: e.target.value })}>
            <option value="">General</option>
            {subjects.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
          </Select>
          <Select label="Category" value={input.category} onChange={(e) => setInput({ ...input, category: e.target.value as TaskCategory })}>
            {Object.entries(CATEGORY_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </Select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Deadline" type="datetime-local" value={input.deadline ? input.deadline.slice(0, 16) : ''} onChange={(e) => setInput({ ...input, deadline: e.target.value ? new Date(e.target.value).toISOString() : null })} />
          <Select label="Estimated duration" value={input.estimated_minutes} onChange={(e) => setInput({ ...input, estimated_minutes: parseInt(e.target.value, 10) })}>
            <option value={15}>15 min</option>
            <option value={30}>30 min</option>
            <option value={45}>45 min</option>
            <option value={60}>1 hour</option>
            <option value={90}>1.5 hours</option>
            <option value={120}>2 hours</option>
            <option value={180}>3 hours</option>
          </Select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted">Priority</label>
            <div className="flex gap-2">
              {(Object.keys(PRIORITY_META) as Priority[]).map((p) => (
                <button key={p} type="button" onClick={() => setInput({ ...input, priority: p })}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold capitalize transition ${input.priority === p ? 'border-transparent text-white' : 'border-brand-200 text-muted dark:border-white/10'}`}
                  style={input.priority === p ? { backgroundColor: PRIORITY_META[p].color } : undefined}>
                  {PRIORITY_META[p].label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted">Difficulty</label>
            <div className="flex gap-2">
              {(Object.keys(DIFFICULTY_META) as Difficulty[]).map((d) => (
                <button key={d} type="button" onClick={() => setInput({ ...input, difficulty: d })}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold capitalize transition ${input.difficulty === d ? 'border-transparent text-white' : 'border-brand-200 text-muted dark:border-white/10'}`}
                  style={input.difficulty === d ? { backgroundColor: DIFFICULTY_META[d].color } : undefined}>
                  {DIFFICULTY_META[d].label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="input-base flex-1">Cancel</button>
          <Button type="submit" loading={saving} className="flex-1"><Plus className="h-4 w-4" /> {submitLabel}</Button>
        </div>
      </form>
    </Modal>
  );
}

export function TaskFormButton({ subjects, onSubmit, children }: { subjects: Subject[]; onSubmit: (input: NewTaskInput) => Promise<void>; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <span onClick={() => setOpen(true)}>{children}</span>
      <TaskForm open={open} onClose={() => setOpen(false)} subjects={subjects} onSubmit={onSubmit} />
    </>
  );
}

