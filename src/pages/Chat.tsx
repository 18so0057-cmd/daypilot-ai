import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Trash2, Bot } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Feedback';
import { useChat } from '@/hooks/useUserData';
import { useAuth } from '@/context/AuthContext';
import { generateChatReply, SUGGESTED_PROMPTS } from '@/lib/aiChat';
import { initials } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function Chat() {
  const { profile } = useAuth();
  const { messages, sendMessage, clearHistory, loading } = useChat();
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  async function handleSend(text: string) {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    setInput('');
    await sendMessage('user', trimmed);
    setTyping(true);
    // Simulate AI thinking delay
    setTimeout(async () => {
      const reply = generateChatReply(trimmed, {
        profile, tasks: [], streak: profile?.study_streak ?? 0, focusToday: 0, hoursStudied: 0,
      });
      await sendMessage('assistant', reply);
      setTyping(false);
    }, 700 + Math.random() * 600);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-extrabold sm:text-3xl">AI Chat Companion</h2>
          <p className="mt-1 text-muted">Your warm, encouraging study buddy — here to help, motivate, and guide.</p>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setConfirmClear(true)}><Trash2 className="h-4 w-4" /> Clear</Button>
        )}
      </div>

      <Card className="flex h-[calc(100vh-260px)] min-h-[460px] flex-col p-0">
        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto scrollbar-thin p-5">
          {loading ? (
            <div className="flex h-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-300 border-t-brand-600" /></div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gradient shadow-glow">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-display text-xl font-bold">Hi, I am DayPilot!</h3>
              <p className="mt-2 max-w-sm text-sm text-muted">I can explain topics, build study plans, quiz you, and keep you motivated. How can I help today?</p>
              <div className="mt-6 grid w-full max-w-md grid-cols-2 gap-2">
                {SUGGESTED_PROMPTS.map((p) => (
                  <button key={p} onClick={() => handleSend(p)} className="rounded-xl glass px-4 py-2.5 text-sm font-medium text-brand-600 transition hover:bg-brand-50 dark:text-brand-200 dark:hover:bg-white/10">
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn('flex gap-3', m.role === 'user' && 'flex-row-reverse')}>
                  <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white', m.role === 'user' ? 'bg-accent-500' : 'bg-brand-gradient')}>
                    {m.role === 'user' ? (initials(profile?.full_name || 'U')) : <Bot className="h-5 w-5" />}
                  </div>
                  <div className={cn('max-w-[78%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap', m.role === 'user' ? 'bg-brand-gradient text-white rounded-tr-sm' : 'glass rounded-tl-sm')}>
                    {m.content}
                  </div>
                </motion.div>
              ))}
              {typing && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-white"><Bot className="h-5 w-5" /></div>
                  <div className="glass flex items-center gap-1.5 rounded-2xl rounded-tl-sm px-4 py-4">
                    {[0, 1, 2].map((i) => (
                      <motion.span key={i} className="h-2 w-2 rounded-full bg-brand-400" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="border-t border-brand-100 p-4 dark:border-white/10">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your studies..."
              className="input-base flex-1"
            />
            <Button type="submit" size="icon" disabled={!input.trim() || typing}><Send className="h-5 w-5" /></Button>
          </form>
          <p className="mt-2 text-center text-xs text-muted">
            DayPilot provides educational support and guidance, but should not be relied upon as the sole source for academic decisions.
          </p>
        </div>
      </Card>

      <ConfirmDialog
        open={confirmClear}
        title="Clear chat history?"
        message="This will permanently delete your conversation with DayPilot."
        confirmLabel="Clear all"
        onConfirm={() => { clearHistory(); setConfirmClear(false); }}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  );
}

