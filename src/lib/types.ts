export type TaskCategory = 'homework' | 'assignment' | 'exam' | 'tuition' | 'club' | 'personal';
export type Priority = 'low' | 'medium' | 'high';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type BlockType = 'study' | 'break' | 'class' | 'meal' | 'activity';
export type FocusMode = 'pomodoro' | 'deep' | 'custom';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  xp: number;
  coins: number;
  level: number;
  study_streak: number;
  last_study_date: string | null;
  today_goal: string;
  preferences: ProfilePreferences;
  created_at: string;
  updated_at: string;
}

export interface ProfilePreferences {
  theme?: 'light' | 'dark' | 'system';
  notifications?: boolean;
  language?: string;
  school_start?: string; // "08:00"
  school_end?: string; // "15:00"
  study_start?: string; // "16:00"
  study_end?: string; // "22:00"
}

export interface Subject {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  subject_id: string | null;
  subject_name: string;
  category: TaskCategory;
  deadline: string | null;
  estimated_minutes: number;
  priority: Priority;
  difficulty: Difficulty;
  completed: boolean;
  completed_at: string | null;
  sort_order: number;
  xp_rewarded: number;
  created_at: string;
}

export interface TimetableBlock {
  id: string;
  user_id: string;
  task_id: string | null;
  date: string;
  start_time: string;
  end_time: string;
  label: string;
  block_type: BlockType;
  subject_name: string;
  created_at: string;
}

export interface FocusSession {
  id: string;
  user_id: string;
  mode: FocusMode;
  duration_minutes: number;
  started_at: string;
  completed_at: string | null;
  xp_rewarded: number;
}

export interface ChatMessageRow {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  badge_key: string;
  earned_at: string;
}

export interface AnalyticsDaily {
  id: string;
  user_id: string;
  day: string;
  study_minutes: number;
  tasks_completed: number;
  focus_sessions: number;
  xp_earned: number;
}

export interface Badge {
  key: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface NewTaskInput {
  title: string;
  subject_name: string;
  category: TaskCategory;
  deadline: string | null;
  estimated_minutes: number;
  priority: Priority;
  difficulty: Difficulty;
}

export interface GeneratedBlock {
  start_time: string;
  end_time: string;
  label: string;
  block_type: BlockType;
  subject_name: string;
  task_id: string | null;
}
