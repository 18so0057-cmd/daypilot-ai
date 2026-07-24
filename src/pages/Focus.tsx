import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipForward, RotateCcw, Timer as TimerIcon, Brain,
  Coffee, Settings2, Music, X, Zap, Trophy,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useUserData } from '@/hooks/useUserData';
import { formatClock, formatMinutes } from '@/lib/utils';
import type { FocusMode } from '@/lib/types';
import { cn } from '@/lib/utils';

const MODES: { key: FocusMode; label: string; work: number; break: number; icon: typeof TimerIcon; color: string; desc: string }[] = [
  { key: 'pomodoro', label: 'Pomodoro', work: 25, break: 5, icon: TimerIcon, color: '#6b7bf0', desc: '25 min focus / 5 min break' },
  { key: 'deep', label: 'Deep Focus', work: 50, break: 10, icon: Brain, color: '#38bdf8', desc: '50 min focus / 10 min break' },
  { key: 'custom', label: 'Custom', work: 45, break: 10, icon: Settings2, color: '#10b981', desc: 'Set your own time' },
];

type Phase = 'idle' | 'work' | 'break' | 'done';

export function Focus() {
  const data = useUserData();
  const [mode, setMode] = useState<FocusMode>('pomodoro');
  const [customWork, setCustomWork] = useState(45);
  const [customBreak, setCustomBreak] = useState(10);
  const [customOpen, setCustomOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [sessionCount, setSessionCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const modeConfig = MODES.find((m) => m.key === mode)!;
  const workMin = mode === 'custom' ? customWork : modeConfig.work;
  const breakMin = mode === 'custom' ? customBreak : modeConfig.break;

  const stop = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  const complete = useCallback(async () => {
    stop();
    setPhase('done');
    setSessionCount((c) => c + 1);
    await data.handleCompleteFocus(mode, workMin);
    setTimeout(() => { setPhase('idle'); setSecondsLeft(workMin * 60); }, 2500);
  }, [stop, data, mode, workMin]);

  const startBreak = useCallback(() => {
    setPhase('break');
    setSecondsLeft(breakMin * 60);
  }, [breakMin]);

  useEffect(() => {
    if (phase === 'idle' || phase === 'done') { stop(); return; }
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (phase === 'work') { startBreak(); return breakMin * 60; }
          if (phase === 'break') { complete(); return 0; }
        }
        return s - 1;
      });
    }, 1000);
    return stop;
  }, [phase, breakMin, startBreak, complete, stop]);

  function start() { setPhase('work'); setSecondsLeft(workMin * 60); }
  function pause() { stop(); setPhase('idle'); }
  function reset() { stop(); setPhase('idle'); setSecondsLeft(workMin * 60); }
  function skipBreak() { stop(); complete(); }

  const selectMode = (m: FocusMode) => {
    if (m === 'custom') { setCustomOpen(true); return; }
    stop(); setMode(m); setPhase('idle'); setSecondsLeft(MODES.find((x) => x.key === m)!.work * 60);
  };

  const isWorking = phase === 'work';
  const isBreak = phase === 'break';
  const progress = phase === 'idle' ? 0 : 1 - secondsLeft / ((isBreak ? breakMin : workMin) * 60);

  // session stats today
  const todaySessions = data.focusSessions.filter((f) => f.completed_at && f.started_at.slice(0, 10) === new Date().toISOString().slice(0, 10));
  const todayMinutes = todaySessions.reduce((sum, f) => sum + f.duration_minutes, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-extrabold sm:text-3xl">Focus Timer</h2>
        <p className="mt-1 text-muted">Stay in the zone. Earn XP for every completed session.</p>
      </div>

      {/* Mode selector */}
      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button key={m.key} onClick={() => selectMode(m.key)} className={cn('flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition', mode === m.key ? 'text-white shadow-glow' : 'glass text-muted hover:text-brand-600')} style={mode === m.key ? { backgroundColor: m.color } : undefined}>
            <m.icon className="h-4 w-4" /> {m.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Timer */}
        <Card className="relative flex flex-col items-center justify-center overflow-hidden p-8 lg:col-span-2">
          <div className={cn('pointer-events-none absolute inset-0 opacity-30 transition-opacity', (isWorking || isBreak) && 'opacity-60')} style={{ background: isBreak ? 'radial-gradient(circle at 50% 40%, #10b98130, transparent 60%)' : 'radial-gradient(circle at 50% 40%, #6b7bf030, transparent 60%)' }} />

          {/* Pulse rings when active */}
          {(isWorking || isBreak) && (
            <div className="pointer-events-none absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2">
              <div className={cn('absolute inset-0 rounded-full animate-pulse-ring', isBreak ? 'bg-success-400' : 'bg-brand-400')} style={{ opacity: 0.3 }} />
            </div>
          )}

          <div className="relative flex flex-col items-center">
            <span className={cn('mb-2 rounded-full px-4 py-1 text-sm font-bold uppercase tracking-wide', isBreak ? 'bg-success-100 text-success-600 dark:bg-success-500/15' : phase === 'done' ? 'bg-brand-100 text-brand-600 dark:bg-brand-800/40' : 'text-muted')}>
              {phase === 'done' ? 'Session Complete!' : isBreak ? 'Break time' : phase === 'work' ? 'Focusing' : 'Ready'}
            </span>

            {/* Circular progress */}
            <div className="relative h-64 w-64">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" className="text-brand-100 dark:text-white/10" />
                <motion.circle
                  cx="50" cy="50" r="45" fill="none" stroke="url(#timerGrad)" strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 45}
                  animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - progress) }}
                  transition={{ ease: 'linear', duration: 0.3 }}
                />
                <defs>
                  <linearGradient id="timerGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={isBreak ? '#10b981' : '#6b7bf0'} />
                    <stop offset="100%" stopColor={isBreak ? '#34d399' : '#38bdf8'} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-5xl font-extrabold tabular-nums">{formatClock(secondsLeft)}</span>
                <span className="mt-1 text-sm text-muted">{modeConfig.label} · {workMin}/{breakMin} min</span>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-8 flex items-center gap-3">
              {phase === 'idle' && <Button onClick={start} size="lg" className="w-36"><Play className="h-5 w-5" /> Start</Button>}
              {isWorking && <Button onClick={pause} size="lg" variant="secondary" className="w-36"><Pause className="h-5 w-5" /> Pause</Button>}
              {isBreak && <Button onClick={skipBreak} size="lg" variant="success" className="w-36"><SkipForward className="h-5 w-5" /> Skip</Button>}
              {phase !== 'idle' && <Button onClick={reset} size="icon" variant="ghost"><RotateCcw className="h-5 w-5" /></Button>}
            </div>

            {/* Music placeholder */}
            <button className="mt-4 inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium text-muted transition hover:text-brand-600">
              <Music className="h-4 w-4" /> Focus music (coming soon)
            </button>
          </div>

          {/* Completion celebration */}
          <AnimatePresence>
            {phase === 'done' && (
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <motion.div animate={{ rotate: [0, 15, -15, 0], y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-6xl">
                  <Trophy className="h-16 w-16 text-warning-400" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Session stats */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-display text-lg font-bold">Session Statistics</h3>
            <div className="mt-4 space-y-4">
              <Stat icon={TimerIcon} label="Sessions today" value={todaySessions.length} color="#6b7bf0" />
              <Stat icon={Coffee} label="Minutes focused" value={formatMinutes(todayMinutes)} color="#38bdf8" />
              <Stat icon={Zap} label="This session set" value={sessionCount} color="#f59e0b" />
              <Stat icon={Brain} label="Total sessions" value={data.focusSessions.filter((f) => f.completed_at).length} color="#10b981" />
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-display text-lg font-bold">Recent Sessions</h3>
            {data.focusSessions.filter((f) => f.completed_at).length === 0 ? (
              <p className="mt-3 text-sm text-muted">No sessions yet. Start your first focus block!</p>
            ) : (
              <div className="mt-3 space-y-2">
                {data.focusSessions.filter((f) => f.completed_at).slice(0, 5).map((f) => (
                  <div key={f.id} className="flex items-center justify-between rounded-lg bg-white/40 px-3 py-2 text-sm dark:bg-white/5">
                    <span className="capitalize font-medium">{f.mode}</span>
                    <span className="text-muted">{formatMinutes(f.duration_minutes)} · +{f.xp_rewarded} XP</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <Modal open={customOpen} onClose={() => setCustomOpen(false)} title="Custom timer">
        <div className="space-y-4">
          <Input label="Focus duration (minutes)" type="number" min={1} max={180} value={customWork} onChange={(e) => setCustomWork(Math.max(1, parseInt(e.target.value) || 1))} />
          <Input label="Break duration (minutes)" type="number" min={1} max={60} value={customBreak} onChange={(e) => setCustomBreak(Math.max(1, parseInt(e.target.value) || 1))} />
          <div className="flex gap-2">
            <button onClick={() => setCustomOpen(false)} className="input-base flex-1">Cancel</button>
            <Button className="flex-1" onClick={() => { setCustomOpen(false); stop(); setPhase('idle'); setSecondsLeft(customWork * 60); }}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Stat({ icon: Icon, label, value, color }: { icon: typeof TimerIcon; label: string; value: string | number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}18`, color }}>
        <Icon className="h-5 w-5" />
      </div>
      <div><p className="text-lg font-bold leading-none">{value}</p><p className="text-xs text-muted">{label}</p></div>
    </div>
  );
}

void X;
