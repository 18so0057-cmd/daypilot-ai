import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  fetchTasks, fetchTimetable, fetchFocusSessions, fetchAnalytics,
  fetchSubjects, fetchAchievements, toggleTaskComplete as toggleTask,
  updateTask, addTask, deleteTask, reorderTasks, addSubject, deleteSubject,
  saveTimetable, completeFocusSession, fetchChatHistory, addChatMessage,
  clearChatHistory,
} from '@/lib/data';
import { generateTimetable } from '@/lib/scheduler';
import type {
  Task, TimetableBlock, FocusSession, AnalyticsDaily, Subject,
  UserAchievement, ChatMessageRow, NewTaskInput, Profile, FocusMode,
} from '@/lib/types';
import { todayISO } from '@/lib/utils';
import { toast } from '@/components/ui/Toaster';
import { badgeByKey } from '@/lib/gamification';

export function useUserData() {
  const { profile, session, refreshProfile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [timetable, setTimetable] = useState<TimetableBlock[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsDaily[]>([]);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = session?.user.id;

  const loadAll = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [t, s, tt, fs, an, ach] = await Promise.all([
        fetchTasks(userId),
        fetchSubjects(userId),
        fetchTimetable(userId, todayISO()),
        fetchFocusSessions(userId),
        fetchAnalytics(userId, 7),
        fetchAchievements(userId),
      ]);
      setTasks(t);
      setSubjects(s);
      setTimetable(tt);
      setFocusSessions(fs);
      setAnalytics(an);
      setAchievements(ach);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('loadAll error', e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ---- derived dashboard values ----
  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const todayAnalytics = analytics.find((a) => a.day === todayISO());
  const focusToday = focusSessions.filter(
    (f) => f.completed_at && f.started_at.slice(0, 10) === todayISO(),
  ).length;
  const hoursStudied = todayAnalytics ? todayAnalytics.study_minutes / 60 : 0;
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  // ---- task mutations ----
  const handleToggleTask = useCallback(async (task: Task) => {
    if (!profile) return;
    const { xp, newBadges } = await toggleTask(task, profile);
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, completed: !t.completed, completed_at: t.completed ? null : new Date().toISOString(), xp_rewarded: t.completed ? 0 : Math.max(0, xp) } : t)));
    await refreshProfile();
    if (xp > 0) {
      toast(`+${xp} XP earned!`, 'success');
      newBadges.forEach((key) => {
        const b = badgeByKey(key);
        if (b) toast(`Badge unlocked: ${b.name}!`, 'success');
      });
    }
  }, [profile, refreshProfile]);

  const handleUpdateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    await updateTask(id, updates);
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  const handleAddTask = useCallback(async (input: NewTaskInput): Promise<Task | null> => {
    if (!userId) return null;
    const t = await addTask(userId, input);
    if (t) setTasks((prev) => [...prev, t]);
    return t;
  }, [userId]);

  const handleDeleteTask = useCallback(async (id: string) => {
    await deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleReorder = useCallback(async (orderedIds: string[]) => {
    setTasks((prev) => orderedIds.map((id, i) => ({ ...prev.find((t) => t.id === id)!, sort_order: i })).filter(Boolean));
    if (userId) await reorderTasks(userId, orderedIds);
  }, [userId]);

  // ---- subject mutations ----
  const handleAddSubject = useCallback(async (name: string, color: string) => {
    if (!userId) return;
    const s = await addSubject(userId, name, color);
    if (s) setSubjects((prev) => [...prev, s]);
  }, [userId]);

  const handleDeleteSubject = useCallback(async (id: string) => {
    await deleteSubject(id);
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // ---- timetable ----
  const handleRegenerateTimetable = useCallback(async () => {
    if (!userId || !profile) return;
    const prefs = profile.preferences ?? {};
    const blocks = generateTimetable(tasks, prefs);
    const rows = blocks.map((b) => ({
      start_time: b.start_time, end_time: b.end_time, label: b.label,
      block_type: b.block_type, subject_name: b.subject_name, task_id: b.task_id,
    }));
    await saveTimetable(userId, todayISO(), rows);
    const fresh = await fetchTimetable(userId, todayISO());
    setTimetable(fresh);
    toast('Your day has been regenerated!', 'success');
  }, [userId, profile, tasks]);

  // ---- focus ----
  const handleCompleteFocus = useCallback(async (mode: FocusMode, minutes: number) => {
    if (!userId || !profile) return;
    const { xp, newBadges } = await completeFocusSession(userId, mode, minutes, profile);
    setFocusSessions((prev) => [{ id: 'tmp-' + Date.now(), user_id: userId, mode, duration_minutes: minutes, started_at: new Date().toISOString(), completed_at: new Date().toISOString(), xp_rewarded: xp }, ...prev]);
    await refreshProfile();
    await loadAll();
    toast(`+${xp} XP — great focus session!`, 'success');
    newBadges.forEach((key) => {
      const b = badgeByKey(key);
      if (b) toast(`Badge unlocked: ${b.name}!`, 'success');
    });
  }, [userId, profile, refreshProfile, loadAll]);

  return {
    profile, session, loading, refreshProfile,
    tasks, pendingTasks, completedTasks,
    subjects, timetable, focusSessions, analytics, achievements,
    focusToday, hoursStudied, completionRate, todayAnalytics,
    handleToggleTask, handleUpdateTask, handleAddTask, handleDeleteTask, handleReorder,
    handleAddSubject, handleDeleteSubject,
    handleRegenerateTimetable, handleCompleteFocus,
    reload: loadAll,
  };
}

// ---- chat hook ----
export function useChat() {
  const { session } = useAuth();
  const [messages, setMessages] = useState<ChatMessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const userId = session?.user.id;

  const loadHistory = useCallback(async () => {
    if (!userId) return;
    try {
      const h = await fetchChatHistory(userId, 100);
      setMessages(h);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const sendMessage = useCallback(async (role: 'user' | 'assistant', content: string) => {
    if (!userId) return;
    await addChatMessage(userId, role, content);
    setMessages((prev) => [...prev, { id: 'tmp-' + Date.now() + Math.random(), user_id: userId, role, content, created_at: new Date().toISOString() }]);
  }, [userId]);

  const clearHistory = useCallback(async () => {
    if (!userId) return;
    await clearChatHistory(userId);
    setMessages([]);
  }, [userId]);

  return { messages, loading, sendMessage, clearHistory };
}

// ---- profile/settings hook ----
export function useSettings() {
  const { profile, session, updatePreferences } = useAuth();
  const [saving, setSaving] = useState(false);

  const save = useCallback(async (updates: Partial<Profile>) => {
    setSaving(true);
    try {
      await updatePreferences(updates);
      toast('Settings saved', 'success');
    } catch {
      toast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  }, [profile, session, updatePreferences]);

  return { profile, save, saving };
}
