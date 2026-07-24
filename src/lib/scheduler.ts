import type { Task, ProfilePreferences, GeneratedBlock, BlockType, Priority } from './types';

const PRIORITY_WEIGHT: Record<Priority, number> = { high: 3, medium: 2, low: 1 };
const DIFFICULTY_ORDER: Record<string, number> = { hard: 0, medium: 1, easy: 2 };

function toMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function fromMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
}

/**
 * Generates a realistic daily timetable from the user's tasks, school hours,
 * and available study windows. Inserts breaks every ~50 minutes of study.
 * Schedules higher-priority and earlier-deadline tasks first.
 */
export function generateTimetable(
  tasks: Task[],
  prefs: ProfilePreferences | null,
): GeneratedBlock[] {
  const schoolStart = prefs?.school_start ?? '08:00';
  const schoolEnd = prefs?.school_end ?? '15:00';
  const studyStart = prefs?.study_start ?? '16:00';
  const studyEnd = prefs?.study_end ?? '22:00';

  const blocks: GeneratedBlock[] = [];

  // School block
  const sStart = toMinutes(schoolStart);
  const sEnd = toMinutes(schoolEnd);
  if (sEnd > sStart) {
    blocks.push({
      start_time: fromMinutes(sStart),
      end_time: fromMinutes(sEnd),
      label: 'School',
      block_type: 'class',
      subject_name: '',
      task_id: null,
    });
  }

  // Lunch / rest gap between school and study
  const stStart = toMinutes(studyStart);
  const stEnd = toMinutes(studyEnd);
  if (stStart > sEnd) {
    blocks.push({
      start_time: fromMinutes(sEnd),
      end_time: fromMinutes(stStart),
      label: 'Lunch & Rest',
      block_type: 'meal',
      subject_name: '',
      task_id: null,
    });
  }

  // Sort tasks: overdue first, then by deadline proximity, then priority, then difficulty
  const now = Date.now();
  const sorted = [...tasks]
    .filter((t) => !t.completed)
    .sort((a, b) => {
      const aDeadline = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const bDeadline = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      const aOverdue = aDeadline < now ? 0 : 1;
      const bOverdue = bDeadline < now ? 0 : 1;
      if (aOverdue !== bOverdue) return aOverdue - bOverdue;
      if (aDeadline !== bDeadline) return aDeadline - bDeadline;
      const pw = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
      if (pw !== 0) return pw;
      return DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty];
    });

  let cursor = Math.max(stStart, sEnd);
  const maxEnd = stEnd;
  let studyStreak = 0;

  for (const task of sorted) {
    if (cursor >= maxEnd) break;
    const remaining = task.estimated_minutes;
    let allocated = 0;

    // Split long tasks into chunks of max 50 min with breaks
    while (allocated < remaining && cursor < maxEnd) {
      const chunk = Math.min(50, remaining - allocated, maxEnd - cursor);
      if (chunk <= 0) break;

      blocks.push({
        start_time: fromMinutes(cursor),
        end_time: fromMinutes(cursor + chunk),
        label: task.title,
        block_type: 'study',
        subject_name: task.subject_name,
        task_id: task.id,
      });
      cursor += chunk;
      allocated += chunk;
      studyStreak += chunk;

      // Insert a 10-min break after ~50 min of continuous study
      if (studyStreak >= 50 && cursor < maxEnd) {
        const breakLen = Math.min(10, maxEnd - cursor);
        blocks.push({
          start_time: fromMinutes(cursor),
          end_time: fromMinutes(cursor + breakLen),
          label: 'Break',
          block_type: 'break',
          subject_name: '',
          task_id: null,
        });
        cursor += breakLen;
        studyStreak = 0;
      }
    }
  }

  // Evening wind-down if time remains
  if (cursor < maxEnd) {
    blocks.push({
      start_time: fromMinutes(cursor),
      end_time: fromMinutes(maxEnd),
      label: 'Free Time / Review',
      block_type: 'activity',
      subject_name: '',
      task_id: null,
    });
  }

  return blocks.sort((a, b) => toMinutes(a.start_time) - toMinutes(b.start_time));
}

/**
 * Produces a short AI recommendation string based on tasks and stats.
 */
export function generateRecommendation(
  tasks: Task[],
  focusToday: number,
  hoursStudied: number,
): { title: string; body: string } {
  const pending = tasks.filter((t) => !t.completed);
  const overdue = pending.filter((t) => t.deadline && new Date(t.deadline).getTime() < Date.now());
  const exams = pending.filter((t) => t.category === 'exam');

  if (overdue.length > 0) {
    return {
      title: 'Catch up on overdue work',
      body: `You have ${overdue.length} overdue ${overdue.length === 1 ? 'task' : 'tasks'}. Focus on "${overdue[0].title}" first — even 25 minutes of progress counts. You've got this!`,
    };
  }
  if (exams.length > 0 && focusToday === 0) {
    const next = exams.sort((a, b) => (a.deadline || '').localeCompare(b.deadline || ''))[0];
    return {
      title: `Prep for ${next.subject_name || 'your exam'}`,
      body: `"${next.title}" is coming up. A 50-minute deep focus session now will sharpen your recall. Try the Deep Focus timer!`,
    };
  }
  if (pending.length === 0) {
    return {
      title: 'All clear — time to review',
      body: 'You have no pending tasks. Great moment to review past notes or start a relaxed focus session to build your streak.',
    };
  }
  if (hoursStudied < 1) {
    return {
      title: 'Start with a quick win',
      body: `A short Pomodoro on "${pending[0].title}" builds momentum. Small steps, big results — let's begin!`,
    };
  }
  const high = pending.find((t) => t.priority === 'high');
  if (high) {
    return {
      title: 'Tackle the high-priority task',
      body: `"${high.title}" is high priority. Block out focused time for it before lighter tasks. Consistency beats intensity!`,
    };
  }
  return {
    title: 'Keep the momentum going',
    body: `You're doing well. Pick up "${pending[0].title}" next, and remember to take breaks — rest is part of learning.`,
  };
}
