import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Mail, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';

type Mode = 'login' | 'signup' | 'forgot';

export function Auth() {
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogle() {
    setError(null);
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error);
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) setError(error);
        else navigate('/app');
      } else if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, fullName);
        if (error) setError(error);
        else setSuccess('Account created! Check your email or sign in to continue.');
      } else {
        const { error } = await resetPassword(email);
        if (error) setError(error);
        else setSuccess('Password reset link sent to your email.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const titles: Record<Mode, string> = {
    login: 'Welcome back',
    signup: 'Create your account',
    forgot: 'Reset your password',
  };
  const subtitles: Record<Mode, string> = {
    login: 'Sign in to continue your study journey',
    signup: 'Start planning smarter in seconds',
    forgot: 'Enter your email and we will send a reset link',
  };

  return (
    <div className="min-h-screen bg-lavender-gradient dark:bg-lavender-gradient-dark lg:grid lg:grid-cols-2">
      {/* Left panel — brand showcase */}
      <div className="relative hidden overflow-hidden bg-brand-gradient p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute top-1/3 -left-10 h-60 w-60 rounded-full bg-accent-300/30 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 text-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <GraduationCap className="h-7 w-7" />
            </div>
            <span className="font-display text-2xl font-extrabold">DayPilot AI</span>
          </div>
        </div>
        <div className="relative text-white">
          <h2 className="font-display text-4xl font-extrabold leading-tight">Your AI study companion,<br />always one step ahead.</h2>
          <p className="mt-4 max-w-md text-white/85">Plan your day, focus deeply, earn rewards, and stay motivated — all in one beautifully crafted app.</p>
          <ul className="mt-8 space-y-3">
            {['AI-generated daily timetables', 'Focus timer with gamified rewards', 'Smart to-do with XP & streaks', 'Encouraging AI chat companion'].map((f) => (
              <li key={f} className="flex items-center gap-3 text-white/90">
                <CheckCircle2 className="h-5 w-5 text-white" /> {f}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-white/60">Built for students. Powered by AI.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex min-h-screen items-center justify-center p-6 lg:min-h-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="font-display text-xl font-extrabold">DayPilot AI</span>
          </div>

          <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand-600 transition">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="font-display text-3xl font-extrabold">{titles[mode]}</h1>
              <p className="mt-2 text-muted">{subtitles[mode]}</p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                {mode === 'signup' && (
                  <Input
                    label="Full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Johnson"
                    required
                  />
                )}
                <div className="relative">
                  <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                  <Mail className="pointer-events-none absolute right-3 top-9 h-5 w-5 text-muted/50" />
                </div>
                {mode !== 'forgot' && (
                  <div className="relative">
                    <Input
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                    <Lock className="pointer-events-none absolute right-3 top-9 h-5 w-5 text-muted/50" />
                  </div>
                )}

                {mode === 'signup' && (
                  <div className="relative">
                    <Input
                      label="Confirm password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                )}

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg bg-error-50 px-4 py-2.5 text-sm text-error-600 dark:bg-error-500/10">
                    {error}
                  </motion.p>
                )}
                {success && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg bg-success-50 px-4 py-2.5 text-sm text-success-600 dark:bg-success-500/10">
                    {success}
                  </motion.p>
                )}

                <Button type="submit" size="lg" loading={loading} className="w-full">
                  {mode === 'login' && 'Sign in'}
                  {mode === 'signup' && 'Create account'}
                  {mode === 'forgot' && 'Send reset link'}
                </Button>

                {mode === 'login' && (
                  <button type="button" onClick={() => { setMode('forgot'); setError(null); setSuccess(null); }} className="block w-full text-center text-sm text-brand-600 hover:underline">
                    Forgot password?
                  </button>
                )}
              </form>

              {(mode === 'login' || mode === 'signup') && (
                <>
                  <div className="my-6 flex items-center gap-3">
                    <div className="h-px flex-1 bg-brand-200 dark:bg-white/10" />
                    <span className="text-xs text-muted">OR</span>
                    <div className="h-px flex-1 bg-brand-200 dark:bg-white/10" />
                  </div>
                  <button
                    type="button"
                    onClick={handleGoogle}
                    disabled={googleLoading}
                    className="flex w-full items-center justify-center gap-3 rounded-xl glass px-4 py-3 text-sm font-semibold transition hover:bg-white/20 disabled:opacity-60"
                  >
                    {googleLoading ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" /> : <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09a7.68 7.68 0 0 1 0-4.18V7.07H2.18a11.99 11.99 0 0 0 0 9.86l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>}
                    Continue with Google
                  </button>
                </>
              )}

              <p className="mt-8 text-center text-sm text-muted">
                {mode === 'login' && <>New to DayPilot? <button onClick={() => { setMode('signup'); setError(null); setSuccess(null); }} className="font-semibold text-brand-600 hover:underline">Create an account</button></>}
                {mode === 'signup' && <>Already have an account? <button onClick={() => { setMode('login'); setError(null); setSuccess(null); }} className="font-semibold text-brand-600 hover:underline">Sign in</button></>}
                {mode === 'forgot' && <>Remember it? <button onClick={() => { setMode('login'); setError(null); setSuccess(null); }} className="font-semibold text-brand-600 hover:underline">Back to sign in</button></>}
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

