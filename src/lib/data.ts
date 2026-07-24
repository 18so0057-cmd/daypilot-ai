import { supabase } from './supabase';
import type {
  Profile, Subject, Task, TimetableBlock, FocusSession, ChatMessageRow,
  UserAchievement, AnalyticsDaily, NewTaskInput, FocusMode,
} from './types';
import { xpForTask, xpForFocusSession, coinsForXp, levelFromXp, shouldEarnBadge } from './gamification';

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<void> {
  const { error } = await supabase.from('profiles').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', userId);
  if (error) throw error;
}

export async function ensureDefaultSubjects(userId: string): Promise<void> {
  const { count } = await supabase.from('subjects').select('*', { count: 'exact', head: true }).eq('user_id', userId);
  if (count && count > 0) return;
  const defaults = [
    { name: 'Mathematics', color: '#6b7bf0' },
    { name: 'Science', color: '#10b981' },
    { name: 'English', color: '#ec4899' },
    { name: 'History', color: '#f59e0b' },
    { name: 'Computer Science', color: '#38bdf8' },
  ];
  const rows = defaults.map((d) => ({ ...d, user_id: userId }));
  await supabase.from('subjects').insert(rows);
}

// ---------- Subjects ----------
export async function fetchSubjects(userId: string): Promise<Subject[]> {
  const { data, error } = await supabase.from('subjects').select('*').eq('user_id', userId).order('name');
  if (error) throw error;
  return (data as Subject[]) ?? [];
}

export async function addSubject(userId: string, name: string, color: string): Promise<Subject | null> {
  const { data, error } = await supabase.from('subjects').insert({ user_id: userId, name, color }).select().maybeSingle();
  if (error) throw error;
  return data as Subject | null;
}

export async function deleteSubject(id: string): Promise<void> {
  const { error } = await supabase.from('subjects').delete().eq('id', id);
  if (error) throw error;
}

// ---------- Tasks ----------
export async function fetchTasks(userId: string): Promise<Task[]> {
  const { data, error } = await supabase.from('tasks').select('*').eq('user_id', userId).order('sort_order');
  if (error) throw error;
  return (data as Task[]) ?? [];
}

export async function addTask(userId: string, input: NewTaskInput): Promise<Task | null> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({ user_id: userId, ...input, deadline: input.deadline })
    .select()
    .maybeSingle();
  if (error) throw error;
  return data as Task | null;
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<void> {
  const { error } = await supabase.from('tasks').update(updates).eq('id', id);
  if (error) throw error;
}

export async function toggleTaskComplete(task: Task, profile: Profile): Promise<{ xp: number; coins: number; newBadges: string[] }> {
  if (task.completed) {
    // un-complete: revoke xp
    await updateTask(task.id, { completed: false, completed_at: null, xp_rewarded: 0 });
    await adjustXp(profile.id, -task.xp_rewarded);
    return { xp: -task.xp_rewarded, coins: 0, newBadges: [] };
  }
  const xp = xpForTask(task.category, task.priority, task.difficulty);
  const coins = coinsForXp(xp);
  await updateTask(task.id, { completed: true, completed_at: new Date().toISOString(), xp_rewarded: xp });
  const { newXp, newBadges } = await adjustXp(profile.id, xp);
  await bumpAnalytics(profile.id, 'tasks_completed', 1, xp);
  await checkStreak(profile);
  void newXp;
  return { xp, coins, newBadges };
}

export async function reorderTasks(userId: string, orderedIds: string[]): Promise<void> {
  const updates = orderedIds.map((id, i) => ({ id, sort_order: i }));
  for (const u of updates) {
    await supabase.from('tasks').update({ sort_order: u.sort_order }).eq('id', u.id).eq('user_id', userId);
  }
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}

// ---------- XP / gamification ----------
async function adjustXp(userId: string, delta: number): Promise<{ newXp: number; newBadges: string[] }> {
  const { data: p } = await supabase.from('profiles').select('xp, coins, level, study_streak').eq('id', userId).maybeSingle();
  const profile = p as Profile | null;
  if (!profile) return { newXp: 0, newBadges: [] };
  const newXp = Math.max(0, profile.xp + delta);
  const newLevel = levelFromXp(newXp);
  const newCoins = delta > 0 ? profile.coins + coinsForXp(delta) : profile.coins;
  await supabase.from('profiles').update({ xp: newXp, level: newLevel, coins: newCoins, updated_at: new Date().toISOString() }).eq('id', userId);

  // badge check
  const { count: taskCount } = await supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('completed', true);
  const { count: focusCount } = await supabase.from('focus_sessions').select('*', { count: 'exact', head: true }).eq('user_id', userId).not('completed_at', 'is', null);
  const eligible = shouldEarnBadge(
    { xp: newXp, study_streak: profile.study_streak, level: newLevel },
    { tasksCompleted: taskCount ?? 0, focusCount: focusCount ?? 0 },
  );
  const newBadges: string[] = [];
  for (const key of eligible) {
    const { error } = await supabase.from('user_achievements').insert({ user_id: userId, badge_key: key }).select().maybeSingle();
    if (!error) newBadges.push(key);
  }
  return { newXp, newBadges };
}

export async function checkStreak(profile: Profile): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const last = profile.last_study_date ? new Date(profile.last_study_date).toISOString().slice(0, 10) : null;
  if (last === today) return;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const newStreak = last === yesterday ? profile.study_streak + 1 : 1;
  await supabase
    .from('profiles')
    .update({ study_streak: newStreak, last_study_date: today, updated_at: new Date().toISOString() })
    .eq('id', profile.id);
  await adjustXp(profile.id, 0); // re-check badges with new streak
}

async function bumpAnalytics(userId: string, field: 'tasks_completed' | 'focus_sessions', count: number, xp: number): Promise<void> {
  const day = new Date().toISOString().slice(0, 10);
  const { data: existing } = await supabase
    .from('study_analytics_daily')
    .select('*')
    .eq('user_id', userId)
    .eq('day', day)
    .maybeSingle();
  if (existing) {
    const row = existing as AnalyticsDaily;
    await supabase
      .from('study_analytics_daily')
      .update({
        [field]: row[field] + count,
        xp_earned: row.xp_earned + xp,
      })
      .eq('id', row.id);
  } else {
    await supabase.from('study_analytics_daily').insert({
      user_id: userId,
      day,
      [field]: count,
      xp_earned: xp,
    });
  }
}

// ---------- Focus sessions ----------
export async function fetchFocusSessions(userId: string): Promise<FocusSession[]> {
  const { data, error } = await supabase.from('focus_sessions').select('*').eq('user_id', userId).order('started_at', { ascending: false });
  if (error) throw error;
  return (data as FocusSession[]) ?? [];
}

export async function completeFocusSession(userId: string, mode: FocusMode, minutes: number, profile: Profile): Promise<{ xp: number; newBadges: string[] }> {
  const xp = xpForFocusSession(mode, minutes);
  const { data } = await supabase
    .from('focus_sessions')
    .insert({ user_id: userId, mode, duration_minutes: minutes, completed_at: new Date().toISOString(), xp_rewarded: xp })
    .select()
    .maybeSingle();
  void data;
  await bumpAnalytics(userId, 'focus_sessions', 1, xp);
  // also bump study minutes
  const day = new Date().toISOString().slice(0, 10);
  const { data: existing } = await supabase.from('study_analytics_daily').select('*').eq('user_id', userId).eq('day', day).maybeSingle();
  if (existing) {
    const row = existing as AnalyticsDaily;
    await supabase.from('study_analytics_daily').update({ study_minutes: row.study_minutes + minutes }).eq('id', row.id);
  } else {
    await supabase.from('study_analytics_daily').insert({ user_id: userId, day, study_minutes: minutes });
  }
  await checkStreak(profile);
  const { newBadges } = await adjustXp(userId, xp);
  return { xp, newBadges };
}

// ---------- Timetable ----------
export async function fetchTimetable(userId: string, date: string): Promise<TimetableBlock[]> {
  const { data, error } = await supabase.from('timetable_blocks').select('*').eq('user_id', userId).eq('date', date).order('start_time');
  if (error) throw error;
  return (data as TimetableBlock[]) ?? [];
}

export async function saveTimetable(userId: string, date: string, blocks: { start_time: string; end_time: string; label: string; block_type: string; subject_name: string; task_id: string | null }[]): Promise<void> {
  await supabase.from('timetable_blocks').delete().eq('user_id', userId).eq('date', date);
  if (blocks.length === 0) return;
  const rows = blocks.map((b) => ({ ...b, user_id: userId, date }));
  await supabase.from('timetable_blocks').insert(rows);
}

// ---------- Chat ----------
export async function fetchChatHistory(userId: string, limit = 50): Promise<ChatMessageRow[]> {
  const { data, error } = await supabase.from('chat_messages').select('*').eq('user_id', userId).order('created_at', { ascending: true }).limit(limit);
  if (error) throw error;
  return (data as ChatMessageRow[]) ?? [];
}

export async function addChatMessage(userId: string, role: 'user' | 'assistant', content: string): Promise<void> {
  const { error } = await supabase.from('chat_messages').insert({ user_id: userId, role, content });
  if (error) throw error;
}

export async function clearChatHistory(userId: string): Promise<void> {
  const { error } = await supabase.from('chat_messages').delete().eq('user_id', userId);
  if (error) throw error;
}

// ---------- Achievements ----------
export async function fetchAchievements(userId: string): Promise<UserAchievement[]> {
  const { data, error } = await supabase.from('user_achievements').select('*').eq('user_id', userId).order('earned_at', { ascending: false });
  if (error) throw error;
  return (data as UserAchievement[]) ?? [];
}

// ---------- Analytics ----------
export async function fetchAnalytics(userId: string, days = 7): Promise<AnalyticsDaily[]> {
  const since = new Date(Date.now() - (days - 1) * 86400000).toISOString().slice(0, 10);
  const { data, error } = await supabase.from('study_analytics_daily').select('*').eq('user_id', userId).gte('day', since).order('day');
  if (error) throw error;
  return (data as AnalyticsDaily[]) ?? [];
}

export async function fetchCalendarEvents(userId: string, startDate: string, endDate: string): Promise<{ tasks: Task[]; focus: FocusSession[] }> {
  const [tasksRes, focusRes] = await Promise.all([
    supabase.from('tasks').select('*').eq('user_id', userId).gte('deadline', startDate).lte('deadline', endDate + 'T23:59:59'),
    supabase.from('focus_sessions').select('*').eq('user_id', userId).gte('started_at', startDate).lte('started_at', endDate + 'T23:59:59'),
  ]);
  if (tasksRes.error) throw tasksRes.error;
  if (focusRes.error) throw focusRes.error;
  return { tasks: (tasksRes.data as Task[]) ?? [], focus: (focusRes.data as FocusSession[]) ?? [] };
}
