import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Sun, Moon, LogOut, Bell, Flame } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { greeting } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Feedback';

interface TopBarProps {
  onMenu: () => void;
}

export function TopBar({ onMenu }: TopBarProps) {
  const { profile, signOut } = useAuth();
  const { resolved, setTheme } = useTheme();
  const navigate = useNavigate();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);

  const name = profile?.full_name?.split(' ')[0] || 'there';

  return (
    <header className="sticky top-0 z-20 glass-strong border-b">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <button onClick={onMenu} className="rounded-lg p-2 text-muted hover:bg-white/10 lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <p className="text-sm text-muted hidden sm:block">{greeting()},</p>
            <h1 className="font-display text-lg font-bold leading-tight">{name}!</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {profile && profile.study_streak > 0 && (
            <div className="hidden items-center gap-1.5 rounded-full bg-warning-100 px-3 py-1.5 text-xs font-bold text-warning-600 dark:bg-warning-500/15 sm:flex">
              <Flame className="h-4 w-4" /> {profile.study_streak} day streak
            </div>
          )}

          {/* Notifications */}
          <div className="relative">
            <button onClick={() => setBellOpen((v) => !v)} className="relative rounded-lg p-2 text-muted hover:bg-white/10 transition">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-500" />
            </button>
            <AnimatePresence>
              {bellOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="glass-strong absolute right-0 mt-2 w-72 rounded-xl p-3 shadow-soft-lg"
                >
                  <p className="px-2 py-1 text-xs font-bold uppercase text-muted">Notifications</p>
                  <div className="mt-1 space-y-1">
                    {[
                      { t: 'Study time!', d: 'Your 4:00 PM focus session starts soon.' },
                      { t: 'Deadline ahead', d: 'Math assignment due in 2 days.' },
                      { t: 'Streak update', d: `You are on a ${profile?.study_streak ?? 0}-day streak. Keep going!` },
                    ].map((n, i) => (
                      <div key={i} className="rounded-lg px-2 py-2 hover:bg-white/10 transition">
                        <p className="text-sm font-semibold">{n.t}</p>
                        <p className="text-xs text-muted">{n.d}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
            className="rounded-lg p-2 text-muted hover:bg-white/10 transition"
          >
            <AnimatePresence mode="wait">
              {resolved === 'dark' ? (
                <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                  <Sun className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                  <Moon className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          <Button variant="ghost" size="icon" onClick={() => setConfirmLogout(true)}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmLogout}
        title="Sign out?"
        message="You will need to sign in again to access your dashboard."
        confirmLabel="Sign out"
        onConfirm={async () => { await signOut(); navigate('/'); }}
        onCancel={() => setConfirmLogout(false)}
      />
    </header>
  );
}
