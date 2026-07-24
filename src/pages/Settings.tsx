import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sun, Moon, Monitor, Bell, Globe, User, Shield, Check,
  Palette, Clock, Target,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { updateProfile } from '@/lib/data';
import { toast } from '@/components/ui/Toaster';
import { cn, initials } from '@/lib/utils';
import type { ProfilePreferences } from '@/lib/types';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'te', label: 'Telugu' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
];

export function Settings() {
  const { profile, session, refreshProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [todayGoal, setTodayGoal] = useState(profile?.today_goal ?? '');
  const [notifications, setNotifications] = useState(profile?.preferences?.notifications ?? true);
  const [language, setLanguage] = useState(profile?.preferences?.language ?? 'en');
  const [schoolStart, setSchoolStart] = useState(profile?.preferences?.school_start ?? '08:00');
  const [schoolEnd, setSchoolEnd] = useState(profile?.preferences?.school_end ?? '15:00');
  const [studyStart, setStudyStart] = useState(profile?.preferences?.study_start ?? '16:00');
  const [studyEnd, setStudyEnd] = useState(profile?.preferences?.study_end ?? '22:00');
  const [saving, setSaving] = useState(false);

  async function handleSavePrefs() {
    if (!session) return;
    setSaving(true);
    try {
      const prefs: ProfilePreferences = {
        theme: theme as 'light' | 'dark' | 'system',
        notifications,
        language,
        school_start: schoolStart, school_end: schoolEnd,
        study_start: studyStart, study_end: studyEnd,
      };
      await updateProfile(session.user.id, { preferences: prefs as never, today_goal: todayGoal });
      await refreshProfile();
      toast('Settings saved', 'success');
    } catch {
      toast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveProfile() {
    if (!session) return;
    setSaving(true);
    try {
      await updateProfile(session.user.id, { full_name: fullName });
      await refreshProfile();
      toast('Profile updated', 'success');
    } catch {
      toast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  }

  const themeOptions: { key: 'light' | 'dark' | 'system'; label: string; icon: typeof Sun }[] = [
    { key: 'light', label: 'Light', icon: Sun },
    { key: 'dark', label: 'Dark', icon: Moon },
    { key: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-extrabold sm:text-3xl">Settings</h2>
        <p className="mt-1 text-muted">Customize DayPilot to fit your study style.</p>
      </div>

      {/* Profile */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-brand-500" />
          <h3 className="font-display text-lg font-bold">Profile</h3>
        </div>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient text-2xl font-bold text-white shadow-glow">
            {initials(fullName || profile?.email || 'U')}
          </div>
          <div className="flex-1 space-y-3">
            <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
            <Input label="Email" value={profile?.email ?? ''} disabled />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSaveProfile} loading={saving} size="sm">Save profile</Button>
        </div>
      </Card>

      {/* Appearance */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Palette className="h-5 w-5 text-brand-500" />
          <h3 className="font-display text-lg font-bold">Appearance</h3>
        </div>
        <p className="mb-3 text-sm text-muted">Theme</p>
        <div className="grid grid-cols-3 gap-3">
          {themeOptions.map((t) => (
            <button key={t.key} onClick={() => setTheme(t.key)} className={cn('flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition', theme === t.key ? 'border-brand-400 bg-brand-50/50 dark:bg-white/5' : 'border-brand-100 hover:border-brand-300 dark:border-white/10')}>
              <t.icon className={cn('h-6 w-6', theme === t.key ? 'text-brand-500' : 'text-muted')} />
              <span className={cn('text-sm font-semibold', theme === t.key ? 'text-brand-600' : 'text-muted')}>{t.label}</span>
              {theme === t.key && <Check className="absolute h-4 w-4 text-brand-500" style={{ top: 8, right: 8 }} />}
            </button>
          ))}
        </div>
      </Card>

      {/* Today's goal */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-accent-500" />
          <h3 className="font-display text-lg font-bold">Today's Goal</h3>
        </div>
        <Input label="What is your main goal for today?" value={todayGoal} onChange={(e) => setTodayGoal(e.target.value)} placeholder="e.g. Finish the math assignment and review for the science test" />
      </Card>

      {/* Study hours */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-brand-500" />
          <h3 className="font-display text-lg font-bold">Study Hours</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input label="School starts" type="time" value={schoolStart} onChange={(e) => setSchoolStart(e.target.value)} />
          <Input label="School ends" type="time" value={schoolEnd} onChange={(e) => setSchoolEnd(e.target.value)} />
          <Input label="Study starts" type="time" value={studyStart} onChange={(e) => setStudyStart(e.target.value)} />
          <Input label="Study ends" type="time" value={studyEnd} onChange={(e) => setStudyEnd(e.target.value)} />
        </div>
        <p className="mt-2 text-xs text-muted">These hours shape your AI-generated timetable.</p>
      </Card>

      {/* Notifications */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-warning-500" />
          <h3 className="font-display text-lg font-bold">Notifications</h3>
        </div>
        <div className="space-y-3">
          {[
            { key: 'study', label: 'Study session reminders' },
            { key: 'deadline', label: 'Deadline approaching alerts' },
            { key: 'break', label: 'Break time reminders' },
            { key: 'focus', label: 'Focus timer notifications' },
          ].map((n) => (
            <div key={n.key} className="flex items-center justify-between rounded-xl bg-white/40 px-4 py-3 dark:bg-white/5">
              <span className="text-sm font-medium">{n.label}</span>
              <button
                onClick={() => setNotifications(!notifications)}
                className={cn('relative h-6 w-11 rounded-full transition', notifications ? 'bg-brand-gradient' : 'bg-brand-200 dark:bg-white/10')}
              >
                <motion.span layout className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow', notifications ? 'left-[22px]' : 'left-0.5')} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Language */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-success-500" />
          <h3 className="font-display text-lg font-bold">Language</h3>
        </div>
        <Select label="Interface language" value={language} onChange={(e) => setLanguage(e.target.value)} className="max-w-xs">
          {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
        </Select>
        <p className="mt-2 text-xs text-muted">Multi-language academic support (Hindi, Telugu, and more) is coming soon.</p>
      </Card>

      {/* Privacy */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-brand-500" />
          <h3 className="font-display text-lg font-bold">Privacy</h3>
        </div>
        <div className="space-y-3 text-sm text-muted">
          <p>Your data is protected with row-level security — only you can access your tasks, schedule, and history.</p>
          <p>Chat conversations are stored securely and can be cleared at any time from the AI Companion page.</p>
          <p>We never share your personal information with third parties.</p>
        </div>
      </Card>

      {/* Save bar */}
      <div className="sticky bottom-4 z-10">
        <Card glass className="flex items-center justify-between p-4">
          <p className="text-sm text-muted">Save your preferences</p>
          <Button onClick={handleSavePrefs} loading={saving} size="md"><Check className="h-4 w-4" /> Save settings</Button>
        </Card>
      </div>
    </div>
  );
}
