import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Sparkles, Brain, Calendar, Target, Trophy, MessageSquare, Timer,
  BarChart3, CheckCircle2, ArrowRight, Zap, BookOpen, Star, Users, GraduationCap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

const FEATURES = [
  { icon: Brain, title: 'AI Daily Planner', desc: 'Enter your homework, exams, and tasks — DayPilot builds a realistic, balanced timetable around your school hours and energy.' },
  { icon: CheckCircle2, title: 'Smart To-Do List', desc: 'Organize by category, priority, and deadline. Drag to reorder, complete with a tap, and earn XP for every win.' },
  { icon: MessageSquare, title: 'AI Chat Companion', desc: 'A warm, encouraging study buddy that explains concepts, quizzes you, builds plans, and keeps you motivated.' },
  { icon: Timer, title: 'Focus Timer', desc: 'Pomodoro, Deep Focus, or custom sessions with break management, session stats, and completion rewards.' },
  { icon: Trophy, title: 'Rewards & Gamification', desc: 'Earn XP, coins, and badges. Build study streaks, level up, and turn consistency into a habit you love.' },
  { icon: BarChart3, title: 'Study Analytics', desc: 'Beautiful charts track hours studied, tasks done, focus sessions, and your weekly progress over time.' },
];

const STEPS = [
  { icon: Users, title: 'Create your account', desc: 'Sign up in seconds and set up your subjects and study hours.' },
  { icon: BookOpen, title: 'Add your tasks', desc: 'Log homework, assignments, exams, tuition, clubs, and personal tasks.' },
  { icon: Sparkles, title: 'Let AI plan your day', desc: 'DayPilot generates a balanced timetable with breaks, tailored to your deadlines.' },
  { icon: Target, title: 'Focus & earn rewards', desc: 'Use the focus timer, complete tasks, and watch your XP and streak grow.' },
];

const FAQS = [
  { q: 'Is DayPilot AI free to use?', a: 'DayPilot AI offers a free plan with all core planning, focus, and gamification features. Premium AI features are coming soon.' },
  { q: 'Does the AI actually build a timetable for me?', a: 'Yes! Enter your tasks with deadlines, priority, and estimated time, and DayPilot generates a realistic daily schedule around your school hours — with built-in breaks.' },
  { q: 'Can I use it on my phone?', a: 'Absolutely. DayPilot is fully responsive and works beautifully on desktop, tablet, and mobile browsers.' },
  { q: 'Is my data secure?', a: 'Your data is stored securely with row-level isolation — only you can see and edit your tasks, schedule, and history.' },
  { q: 'What future features are planned?', a: 'Exam result analysis, weak concept detection, a homework scanner, PDF & notes assistant, multi-language support, AI memory, and weekly AI reports.' },
];

export function Landing() {
  const { session } = useAuth();
  const ctaTo = session ? '/app' : '/auth';

  return (
    <div className="min-h-screen bg-lavender-gradient dark:bg-lavender-gradient-dark">
      {/* Nav */}
      <nav className="sticky top-0 z-40 glass-strong">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient shadow-glow">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="font-display text-xl font-extrabold">DayPilot<span className="text-gradient"> AI</span></span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-muted hover:text-brand-600 transition">Features</a>
            <a href="#how" className="text-sm font-medium text-muted hover:text-brand-600 transition">How it works</a>
            <a href="#faq" className="text-sm font-medium text-muted hover:text-brand-600 transition">FAQ</a>
          </div>
          <Link to={ctaTo}>
            <Button size="sm">{session ? 'Open app' : 'Get started'}</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-20 pb-28">
        <div className="pointer-events-none absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-brand-300/40 blur-3xl dark:bg-brand-700/30" />
        <div className="pointer-events-none absolute top-10 right-1/4 h-72 w-72 rounded-full bg-accent-200/50 blur-3xl dark:bg-accent-700/20" />
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-sm font-medium text-brand-600 dark:text-brand-200"
          >
            <Sparkles className="h-4 w-4" /> Your intelligent academic companion
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl md:text-7xl"
          >
            Plan smarter.<br />Study better.<br /><span className="text-gradient">Stay motivated.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted"
          >
            DayPilot AI turns your homework, exams, and goals into a balanced daily plan — powered by AI, gamified with rewards, and built to keep you consistently on track.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link to={ctaTo}>
              <Button size="lg" className="w-full sm:w-auto">
                {session ? 'Go to dashboard' : 'Start planning free'} <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <a href="#how">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">See how it works</Button>
            </a>
          </motion.div>

          {/* Floating preview card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="relative mx-auto mt-16 max-w-3xl"
          >
            <div className="animate-float">
              <div className="glass-strong rounded-3xl p-6 shadow-soft-lg">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted">TODAY'S PLAN</p>
                    <p className="font-display text-lg font-bold">Tuesday, March 12</p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-success-100 px-3 py-1 text-xs font-semibold text-success-600 dark:bg-success-500/15">
                    <Zap className="h-3.5 w-3.5" /> +120 XP today
                  </div>
                </div>
                <div className="space-y-2.5">
                  {[
                    { time: '4:00 PM', label: 'Math — Algebra practice', color: '#6b7bf0' },
                    { time: '4:50 PM', label: 'Break', color: '#94a3b8' },
                    { time: '5:00 PM', label: 'Science — Cells revision', color: '#10b981' },
                    { time: '5:50 PM', label: 'English essay draft', color: '#ec4899' },
                  ].map((b, i) => (
                    <motion.div
                      key={b.time}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.12 }}
                      className="flex items-center gap-3 rounded-xl bg-white/50 px-4 py-3 dark:bg-white/5"
                    >
                      <span className="w-20 text-sm font-semibold text-muted">{b.time}</span>
                      <span className="h-8 w-1.5 rounded-full" style={{ backgroundColor: b.color }} />
                      <span className="text-sm font-medium">{b.label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <h2 className="font-display text-4xl font-extrabold sm:text-5xl">Everything you need to ace your day</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">One app that plans, motivates, and tracks your entire student life.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: (i % 3) * 0.1 }}
                className="glass rounded-2xl p-6 shadow-soft transition-transform hover:-translate-y-1"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <h2 className="font-display text-4xl font-extrabold sm:text-5xl">How it works</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">From chaos to clarity in four simple steps.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl glass text-brand-600 shadow-soft dark:text-brand-300">
                  <s.icon className="h-7 w-7" />
                </div>
                <div className="mb-2 text-sm font-bold text-brand-500">STEP {i + 1}</div>
                <h3 className="font-display text-lg font-bold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{s.desc}</p>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="absolute -right-4 top-7 hidden h-5 w-5 text-brand-300 lg:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials placeholder */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <h2 className="font-display text-4xl font-extrabold sm:text-5xl">Loved by students</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">Real results from students who took control of their time.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: 'Aarav S.', role: 'Class 12, Science', text: 'I finally stopped cramming. DayPilot plans my revision so I am calm before exams.', stars: 5 },
              { name: 'Maya R.', role: 'University, CS', text: 'The focus timer and streaks turned studying into a game I want to win every day.', stars: 5 },
              { name: 'Karthik N.', role: 'Class 10', text: 'The AI chat explains tough topics in a way I actually understand. Game changer.', stars: 5 },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 shadow-soft"
              >
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-warning-400 text-warning-400" />
                  ))}
                </div>
                <p className="text-sm italic text-muted">&ldquo;{t.text}&rdquo;</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient text-sm font-bold text-white">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing placeholder */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <h2 className="font-display text-4xl font-extrabold sm:text-5xl">Simple pricing</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">Start free. Upgrade when you need more AI power.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass rounded-2xl p-8 shadow-soft">
              <h3 className="font-display text-xl font-bold">Free</h3>
              <p className="mt-1 text-sm text-muted">Everything you need to get started</p>
              <p className="mt-6 text-4xl font-extrabold">$0<span className="text-base font-medium text-muted">/mo</span></p>
              <ul className="mt-6 space-y-3 text-sm">
                {['AI daily planner', 'Smart to-do list', 'Focus timer', 'Gamification & streaks', 'Calendar & analytics'].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success-500" /> {f}
                  </li>
                ))}
              </ul>
              <Link to={ctaTo} className="mt-8 block"><Button variant="outline" className="w-full">Get started</Button></Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass-strong rounded-2xl p-8 shadow-soft-lg ring-2 ring-brand-400/40">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-brand-gradient px-3 py-1 text-xs font-bold text-white">
                <Sparkles className="h-3.5 w-3.5" /> COMING SOON
              </div>
              <h3 className="font-display text-xl font-bold">Pro</h3>
              <p className="mt-1 text-sm text-muted">Unlock the full AI suite</p>
              <p className="mt-6 text-4xl font-extrabold">$9<span className="text-base font-medium text-muted">/mo</span></p>
              <ul className="mt-6 space-y-3 text-sm">
                {['Everything in Free', 'Exam result analysis', 'Weak concept detection', 'Homework scanner', 'PDF & notes assistant', 'Multi-language support', 'Weekly AI reports'].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-brand-500" /> {f}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="mt-8 w-full" disabled>Notify me</Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-14 text-center">
            <h2 className="font-display text-4xl font-extrabold sm:text-5xl">FAQ</h2>
          </div>
          <div className="space-y-4">
            {FAQS.map((f, i) => (
              <motion.details
                key={f.q}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-xl p-5 shadow-soft"
              >
                <summary className="cursor-pointer list-none font-semibold marker:hidden">{f.q}</summary>
                <p className="mt-3 text-sm text-muted">{f.a}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-brand-gradient p-12 text-center text-white shadow-soft-lg"
        >
          <h2 className="font-display text-4xl font-extrabold sm:text-5xl">Ready to take control of your day?</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/90">Join DayPilot AI and turn your study goals into a plan you will actually follow.</p>
          <Link to={ctaTo} className="mt-8 inline-block">
            <Button size="lg" variant="secondary" className="bg-white text-brand-700 hover:bg-white/90">
              {session ? 'Open dashboard' : 'Get started — it is free'} <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 border-t border-brand-200/50 pt-8 dark:border-white/10 md:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-lg font-extrabold">DayPilot AI</span>
          </div>
          <p className="text-sm text-muted">Built for students. Powered by AI. Made with care.</p>
          <div className="flex gap-5 text-sm text-muted">
            <a href="#features" className="hover:text-brand-600 transition">Features</a>
            <a href="#faq" className="hover:text-brand-600 transition">FAQ</a>
            <Link to={ctaTo} className="hover:text-brand-600 transition">Get started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
