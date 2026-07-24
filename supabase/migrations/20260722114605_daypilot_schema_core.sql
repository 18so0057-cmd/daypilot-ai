/*
# DayPilot AI — Core Schema

Builds the multi-user data layer for the DayPilot AI student planner.

## 1. New Tables
- `profiles` — user profile + gamification state (xp, coins, level, streak).
- `subjects` — subjects owned by a user (for categorizing tasks/timetable).
- `tasks` — homework / assignments / exams / tuition / clubs / personal tasks.
- `timetable_blocks` — AI-generated daily timetable slots for a given date.
- `focus_sessions` — Pomodoro / deep focus session records.
- `chat_messages` — AI chat companion conversation history.
- `user_achievements` — badges earned by a user (join table to a fixed badge set).

## 2. Placeholder Tables (future modules, minimal columns)
- `exam_results` — uploaded exam marks (future analysis).
- `weak_concepts` — per-subject weak/strong concepts (future detection).
- `notes` — uploaded PDFs / notes (future assistant).
- `homework_scans` — uploaded homework images (future scanner).
- `journal_entries` — study journal (future).
- `study_analytics_daily` — per-day rollup of analytics metrics.

## 3. Security
- Every table enables RLS.
- Owner-scoped policies on all tables: `TO authenticated`, ownership via
  `auth.uid() = user_id`. Owner column defaults to `auth.uid()` so client
  inserts that omit `user_id` still satisfy `WITH CHECK`.

## 4. Notes
- All timestamps are `timestamptz` with `now()` defaults.
- `tasks.category` uses a text check constraint for the known task kinds.
- `timetable_blocks` references `tasks` (nullable) so breaks can exist without a task.
- Idempotent: uses IF NOT EXISTS for tables and DROP IF EXISTS for policies.
*/

-- ---------- profiles ----------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  avatar_url text NOT NULL DEFAULT '',
  xp integer NOT NULL DEFAULT 0,
  coins integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  study_streak integer NOT NULL DEFAULT 0,
  last_study_date date,
  today_goal text NOT NULL DEFAULT '',
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON public.profiles;
CREATE POLICY "select_own_profile" ON public.profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "insert_own_profile" ON public.profiles;
CREATE POLICY "insert_own_profile" ON public.profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
CREATE POLICY "update_own_profile" ON public.profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "delete_own_profile" ON public.profiles;
CREATE POLICY "delete_own_profile" ON public.profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- ---------- subjects ----------
CREATE TABLE IF NOT EXISTS public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#8b9dff',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_subjects" ON public.subjects;
CREATE POLICY "select_own_subjects" ON public.subjects FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_subjects" ON public.subjects;
CREATE POLICY "insert_own_subjects" ON public.subjects FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_subjects" ON public.subjects;
CREATE POLICY "update_own_subjects" ON public.subjects FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_subjects" ON public.subjects;
CREATE POLICY "delete_own_subjects" ON public.subjects FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ---------- tasks ----------
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  subject_name text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'homework' CHECK (category IN
    ('homework','assignment','exam','tuition','club','personal')),
  deadline timestamptz,
  estimated_minutes integer NOT NULL DEFAULT 60,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN
    ('low','medium','high')),
  difficulty text NOT NULL DEFAULT 'medium' CHECK (difficulty IN
    ('easy','medium','hard')),
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  sort_order integer NOT NULL DEFAULT 0,
  xp_rewarded integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_tasks_user_deadline ON public.tasks (user_id, deadline);
CREATE INDEX IF NOT EXISTS idx_tasks_user_completed ON public.tasks (user_id, completed);

DROP POLICY IF EXISTS "select_own_tasks" ON public.tasks;
CREATE POLICY "select_own_tasks" ON public.tasks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_tasks" ON public.tasks;
CREATE POLICY "insert_own_tasks" ON public.tasks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_tasks" ON public.tasks;
CREATE POLICY "update_own_tasks" ON public.tasks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_tasks" ON public.tasks;
CREATE POLICY "delete_own_tasks" ON public.tasks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ---------- timetable_blocks ----------
CREATE TABLE IF NOT EXISTS public.timetable_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  label text NOT NULL DEFAULT '',
  block_type text NOT NULL DEFAULT 'study' CHECK (block_type IN
    ('study','break','class','break','class','meal','activity')),
  subject_name text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.timetable_blocks ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_timetable_user_date ON public.timetable_blocks (user_id, date);

DROP POLICY IF EXISTS "select_own_timetable" ON public.timetable_blocks;
CREATE POLICY "select_own_timetable" ON public.timetable_blocks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_timetable" ON public.timetable_blocks;
CREATE POLICY "insert_own_timetable" ON public.timetable_blocks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_timetable" ON public.timetable_blocks;
CREATE POLICY "update_own_timetable" ON public.timetable_blocks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_timetable" ON public.timetable_blocks;
CREATE POLICY "delete_own_timetable" ON public.timetable_blocks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ---------- focus_sessions ----------
CREATE TABLE IF NOT EXISTS public.focus_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  mode text NOT NULL DEFAULT 'pomodoro' CHECK (mode IN
    ('pomodoro','deep','custom')),
  duration_minutes integer NOT NULL DEFAULT 25,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  xp_rewarded integer NOT NULL DEFAULT 0
);
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_focus_user_started ON public.focus_sessions (user_id, started_at);

DROP POLICY IF EXISTS "select_own_focus" ON public.focus_sessions;
CREATE POLICY "select_own_focus" ON public.focus_sessions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_focus" ON public.focus_sessions;
CREATE POLICY "insert_own_focus" ON public.focus_sessions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_focus" ON public.focus_sessions;
CREATE POLICY "update_own_focus" ON public.focus_sessions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_focus" ON public.focus_sessions;
CREATE POLICY "delete_own_focus" ON public.focus_sessions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ---------- chat_messages ----------
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user','assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_chat_user_created ON public.chat_messages (user_id, created_at);

DROP POLICY IF EXISTS "select_own_chat" ON public.chat_messages;
CREATE POLICY "select_own_chat" ON public.chat_messages FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_chat" ON public.chat_messages;
CREATE POLICY "insert_own_chat" ON public.chat_messages FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_chat" ON public.chat_messages;
CREATE POLICY "delete_own_chat" ON public.chat_messages FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ---------- user_achievements ----------
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_key text NOT NULL,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_key)
);
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_achievements" ON public.user_achievements;
CREATE POLICY "select_own_achievements" ON public.user_achievements FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_achievements" ON public.user_achievements;
CREATE POLICY "insert_own_achievements" ON public.user_achievements FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_achievements" ON public.user_achievements;
CREATE POLICY "delete_own_achievements" ON public.user_achievements FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ---------- exam_results (placeholder) ----------
CREATE TABLE IF NOT EXISTS public.exam_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_name text NOT NULL DEFAULT '',
  subject_name text NOT NULL,
  marks_obtained numeric,
  total_marks numeric,
  exam_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_exam_results" ON public.exam_results;
CREATE POLICY "select_own_exam_results" ON public.exam_results FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_exam_results" ON public.exam_results;
CREATE POLICY "insert_own_exam_results" ON public.exam_results FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_exam_results" ON public.exam_results;
CREATE POLICY "delete_own_exam_results" ON public.exam_results FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ---------- weak_concepts (placeholder) ----------
CREATE TABLE IF NOT EXISTS public.weak_concepts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_name text NOT NULL,
  concept text NOT NULL,
  status text NOT NULL DEFAULT 'weak' CHECK (status IN ('weak','strong','mastered')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.weak_concepts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_weak_concepts" ON public.weak_concepts;
CREATE POLICY "select_own_weak_concepts" ON public.weak_concepts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_weak_concepts" ON public.weak_concepts;
CREATE POLICY "insert_own_weak_concepts" ON public.weak_concepts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_weak_concepts" ON public.weak_concepts;
CREATE POLICY "delete_own_weak_concepts" ON public.weak_concepts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ---------- notes (placeholder) ----------
CREATE TABLE IF NOT EXISTS public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  summary text NOT NULL DEFAULT '',
  file_url text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_notes" ON public.notes;
CREATE POLICY "select_own_notes" ON public.notes FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_notes" ON public.notes;
CREATE POLICY "insert_own_notes" ON public.notes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_notes" ON public.notes;
CREATE POLICY "delete_own_notes" ON public.notes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ---------- homework_scans (placeholder) ----------
CREATE TABLE IF NOT EXISTS public.homework_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_name text NOT NULL DEFAULT '',
  questions text NOT NULL DEFAULT '',
  deadline timestamptz,
  image_url text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.homework_scans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_homework_scans" ON public.homework_scans;
CREATE POLICY "select_own_homework_scans" ON public.homework_scans FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_homework_scans" ON public.homework_scans;
CREATE POLICY "insert_own_homework_scans" ON public.homework_scans FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_homework_scans" ON public.homework_scans;
CREATE POLICY "delete_own_homework_scans" ON public.homework_scans FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ---------- journal_entries (placeholder) ----------
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  mood text NOT NULL DEFAULT 'neutral',
  content text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_journal" ON public.journal_entries;
CREATE POLICY "select_own_journal" ON public.journal_entries FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_journal" ON public.journal_entries;
CREATE POLICY "insert_own_journal" ON public.journal_entries FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_journal" ON public.journal_entries;
CREATE POLICY "delete_own_journal" ON public.journal_entries FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ---------- study_analytics_daily ----------
CREATE TABLE IF NOT EXISTS public.study_analytics_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  day date NOT NULL DEFAULT CURRENT_DATE,
  study_minutes integer NOT NULL DEFAULT 0,
  tasks_completed integer NOT NULL DEFAULT 0,
  focus_sessions integer NOT NULL DEFAULT 0,
  xp_earned integer NOT NULL DEFAULT 0,
  UNIQUE (user_id, day)
);
ALTER TABLE public.study_analytics_daily ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_analytics" ON public.study_analytics_daily;
CREATE POLICY "select_own_analytics" ON public.study_analytics_daily FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_analytics" ON public.study_analytics_daily;
CREATE POLICY "insert_own_analytics" ON public.study_analytics_daily FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_analytics" ON public.study_analytics_daily;
CREATE POLICY "update_own_analytics" ON public.study_analytics_daily FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_analytics" ON public.study_analytics_daily;
CREATE POLICY "delete_own_analytics" ON public.study_analytics_daily FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ---------- handle_new_user trigger ----------
-- Auto-create a profile row when a new auth user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
