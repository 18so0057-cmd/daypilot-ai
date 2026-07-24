import type { Profile, TaskCategory, Priority, Difficulty, Badge } from './types';

export const CATEGORY_META: Record<TaskCategory, { label: string; color: string; icon: string }> = {
  homework: { label: 'Homework', color: '#6b7bf0', icon: 'BookOpen' },
  assignment: { label: 'Assignment', color: '#38bdf8', icon: 'FileText' },
  exam: { label: 'Exam', color: '#f59e0b', icon: 'GraduationCap' },
  tuition: { label: 'Tuition', color: '#10b981', icon: 'Users' },
  club: { label: 'Club', color: '#ec4899', icon: 'Sparkles' },
  personal: { label: 'Personal', color: '#8b5cf6', icon: 'Heart' },
};

export const PRIORITY_META: Record<Priority, { label: string; color: string }> = {
  low: { label: 'Low', color: '#10b981' },
  medium: { label: 'Medium', color: '#f59e0b' },
  high: { label: 'High', color: '#ef4444' },
};

export const DIFFICULTY_META: Record<Difficulty, { label: string; color: string }> = {
  easy: { label: 'Easy', color: '#10b981' },
  medium: { label: 'Medium', color: '#f59e0b' },
  hard: { label: 'Hard', color: '#ef4444' },
};

export const BADGES: Badge[] = [
  { key: 'first_task', name: 'First Steps', description: 'Complete your first task', icon: 'Footprints', tier: 'bronze' },
  { key: 'first_focus', name: 'In the Zone', description: 'Finish your first focus session', icon: 'Target', tier: 'bronze' },
  { key: 'xp_100', name: 'Centurion', description: 'Earn 100 XP', icon: 'Star', tier: 'bronze' },
  { key: 'xp_500', name: 'Rising Star', description: 'Earn 500 XP', icon: 'Zap', tier: 'silver' },
  { key: 'xp_1500', name: 'Overachiever', description: 'Earn 1500 XP', icon: 'Trophy', tier: 'gold' },
  { key: 'streak_3', name: 'On a Roll', description: '3 day study streak', icon: 'Flame', tier: 'bronze' },
  { key: 'streak_7', name: 'Week Warrior', description: '7 day study streak', icon: 'Flame', tier: 'silver' },
  { key: 'streak_30', name: 'Unstoppable', description: '30 day study streak', icon: 'Flame', tier: 'platinum' },
  { key: 'tasks_10', name: 'Task Master', description: 'Complete 10 tasks', icon: 'CheckCircle2', tier: 'silver' },
  { key: 'tasks_50', name: 'Productivity Pro', description: 'Complete 50 tasks', icon: 'CheckCircle2', tier: 'gold' },
  { key: 'focus_10', name: 'Deep Diver', description: 'Complete 10 focus sessions', icon: 'Timer', tier: 'silver' },
  { key: 'level_5', name: 'Level Up', description: 'Reach level 5', icon: 'TrendingUp', tier: 'silver' },
  { key: 'level_10', name: 'Scholar', description: 'Reach level 10', icon: 'Crown', tier: 'gold' },
];

export function badgeByKey(key: string): Badge | undefined {
  return BADGES.find((b) => b.key === key);
}

// XP / level system — each level needs level*250 XP
export function xpForLevel(level: number): number {
  return ((level - 1) * 250);
}

export function levelFromXp(xp: number): number {
  return Math.floor(xp / 250) + 1;
}

export function levelProgress(xp: number): { current: number; needed: number; pct: number; level: number } {
  const level = levelFromXp(xp);
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const current = xp - base;
  const needed = next - base;
  return { current, needed, pct: Math.min(100, Math.round((current / needed) * 100)), level };
}

export function xpForTask(category: TaskCategory, priority: Priority, difficulty: Difficulty): number {
  const base = 15;
  const catBonus: Record<TaskCategory, number> = { homework: 5, assignment: 10, exam: 15, tuition: 5, club: 3, personal: 5 };
  const prioBonus: Record<Priority, number> = { low: 0, medium: 5, high: 10 };
  const diffBonus: Record<Difficulty, number> = { easy: 0, medium: 5, hard: 10 };
  return base + catBonus[category] + prioBonus[priority] + diffBonus[difficulty];
}

export function xpForFocusSession(mode: string, minutes: number): number {
  const base = mode === 'deep' ? 40 : mode === 'pomodoro' ? 30 : 20;
  return Math.round(base + minutes / 5);
}

export function coinsForXp(xp: number): number {
  return Math.floor(xp / 5);
}

export function shouldEarnBadge(profile: Partial<Profile> & { xp: number; study_streak: number; level: number }, context: { tasksCompleted: number; focusCount: number }): string[] {
  const earned: string[] = [];
  const { xp, study_streak, level } = profile;
  const { tasksCompleted, focusCount } = context;
  if (tasksCompleted >= 1) earned.push('first_task');
  if (focusCount >= 1) earned.push('first_focus');
  if (xp >= 100) earned.push('xp_100');
  if (xp >= 500) earned.push('xp_500');
  if (xp >= 1500) earned.push('xp_1500');
  if (study_streak >= 3) earned.push('streak_3');
  if (study_streak >= 7) earned.push('streak_7');
  if (study_streak >= 30) earned.push('streak_30');
  if (tasksCompleted >= 10) earned.push('tasks_10');
  if (tasksCompleted >= 50) earned.push('tasks_50');
  if (focusCount >= 10) earned.push('focus_10');
  if (level >= 5) earned.push('level_5');
  if (level >= 10) earned.push('level_10');
  return earned;
}
