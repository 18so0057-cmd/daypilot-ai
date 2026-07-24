import type { Task, Profile } from './types';
import { formatMinutes, greeting } from './utils';

interface ChatContext {
  profile: Profile | null;
  tasks: Task[];
  streak: number;
  focusToday: number;
  hoursStudied: number;
}

const ENCOURAGEMENT = [
  "You're doing amazing — keep going!",
  'Every small step counts toward your goal.',
  'Progress, not perfection. You showed up today.',
  'Believe in yourself — you have what it takes.',
  'Consistency is your superpower. Stay with it!',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function quizOn(text: string): string {
  const topic = text.replace(/quiz me on/i, '').trim() || 'this topic';
  return [
    `Here are 3 quick questions on ${topic} to test your understanding:`,
    '',
    `1. What is the most important concept to remember about ${topic}?`,
    `2. Can you explain ${topic} in your own words to a friend?`,
    `3. Give one real-world example where ${topic} applies.`,
    '',
    'Answer these aloud or on paper — then I can help you check them. Active recall like this is one of the strongest study techniques!',
  ].join('\n');
}

function explainTopic(text: string): string {
  const topic = text.replace(/explain/i, '').replace(/this topic/i, '').replace(/^[\s:]+/, '').trim() || 'this topic';
  return [
    `Let's break down ${topic} step by step:`,
    '',
    `1. **What it is** — ${topic} is a core idea. Start by understanding its definition and why it matters.`,
    `2. **Key parts** — Identify the main components or steps that make up ${topic}.`,
    `3. **How it works** — Connect each part to the next. Think of it as a chain, not isolated facts.`,
    `4. **Example** — Apply ${topic} to a concrete example. This makes it stick.`,
    `5. **Check yourself** — Can you teach ${topic} to someone else? If yes, you understand it.`,
    '',
    `Want me to go deeper on any part, or generate practice questions on ${topic}?`,
  ].join('\n');
}

function summarizeNotes(text: string): string {
  return [
    'Here is a concise summary approach for your notes:',
    '',
    '1. **Core idea** — What is the single most important point?',
    '2. **Supporting details** — List 3-4 facts that back up the core idea.',
    '3. **Connections** — How does this relate to what you already know?',
    '4. **Keywords** — Highlight terms you must remember.',
    '',
    'Tip: Rewrite the summary in your own words without looking at the original. That self-test reveals what you truly know. Paste your notes and I will help summarize them!',
  ].join('\n');
}

function makePlan(tasks: Task[], ctx: ChatContext): string {
  const pending = tasks.filter((t) => !t.completed);
  if (pending.length === 0) {
    return "You have no pending tasks — wonderful! This is a perfect time for a relaxed review session or to get ahead on upcoming topics. Enjoy the lighter day!";
  }
  const top = pending.slice(0, 3).map((t, i) => `${i + 1}. ${t.title} (${t.subject_name || 'General'}, ${formatMinutes(t.estimated_minutes)})`).join('\n');
  return [
    `${greeting()}! Here is a focused plan for today:`,
    '',
    top,
    '',
    'Start with a 25-minute Pomodoro on task 1, take a 5-minute break, then continue. After two Pomodoro cycles, take a longer 15-minute break.',
    '',
    `You currently have a ${ctx.streak}-day streak. Completing even one task today keeps it alive!`,
  ].join('\n');
}

function motivation(): string {
  return [
    pick(ENCOURAGEMENT),
    '',
    'Remember: studying is not about being perfect — it is about showing up and improving a little each day. The fact that you are here, planning your time, already puts you ahead.',
    '',
    'Take one small action right now. Momentum will carry you forward.',
  ].join('\n');
}

function studyAdvice(text: string): string {
  const q = text.toLowerCase();
  if (q.includes('memorize') || q.includes('remember')) {
    return 'For memorization, use **spaced repetition** — review material at increasing intervals (1 day, 3 days, 1 week). Combine it with **active recall**: close your notes and try to write everything you remember. This is far more effective than re-reading.';
  }
  if (q.includes('focus') || q.includes('concentrate') || q.includes('distract')) {
    return 'To improve focus: put your phone in another room, use the Pomodoro technique (25 min work / 5 min break), and clear your workspace of clutter. Your environment shapes your attention more than willpower does.';
  }
  if (q.includes('time') || q.includes('manage') || q.includes('procrastinat')) {
    return 'Beat procrastination with the **2-minute rule**: if a task takes under 2 minutes, do it now. For bigger tasks, break them into tiny steps and commit to just the first one. Starting is the hardest part — once you begin, momentum takes over.';
  }
  if (q.includes('exam') || q.includes('test')) {
    return 'For exam prep: practice with **past papers** under timed conditions, identify weak topics, and review them with focused study sessions. Avoid cramming — spread revision over several days so your brain consolidates the material overnight.';
  }
  return 'Great question! The most effective study techniques, backed by research, are: **active recall** (test yourself instead of re-reading), **spaced repetition** (review over increasing intervals), and **interleaving** (mix related topics rather than studying one for too long). Tell me your specific subject or challenge and I will tailor the advice!';
}

function homeworkHelp(text: string): string {
  const trimmed = text.replace(/help me with (my )?homework/i, '').replace(/^[\s:]+/, '').trim();
  if (trimmed) {
    return [
      `Let's work through this together: "${trimmed}"`,
      '',
      "Here's my approach — I will guide you rather than just give the answer, because that is how you learn best:",
      '1. First, identify what the question is really asking.',
      '2. Note what information you already have.',
      '3. Think about which concept or formula applies.',
      '4. Work through it step by step.',
      '',
      'Tell me where you are stuck, or share the first step you would take, and I will help you from there!',
    ].join('\n');
  }
  return "Of course! Share the homework question or topic you are working on, and I will help you understand it step by step. I am here to guide you to the answer, not just hand it over — that way you really learn it!";
}

/**
 * The AI chat companion engine. Rule-based with a warm, encouraging personality.
 * Detects intent from the user's message and crafts a supportive, educational reply.
 */
export function generateChatReply(message: string, ctx: ChatContext): string {
  const lower = message.toLowerCase().trim();
  const name = ctx.profile?.full_name?.split(' ')[0] || 'there';

  if (/^(hi|hello|hey|good (morning|afternoon|evening))/i.test(lower)) {
    return `${greeting()}, ${name}! I am DayPilot, your study companion. I can help you plan your day, explain topics, quiz you, motivate you, and more. What would you like to work on?`;
  }
  if (/quiz me/i.test(lower)) return quizOn(lower);
  if (/^explain/i.test(lower) || /explain this topic/i.test(lower)) return explainTopic(lower);
  if (/summarize (my )?notes/i.test(lower) || /summary of/i.test(lower)) return summarizeNotes(lower);
  if (/(make|create|build|plan).*today.?s plan/i.test(lower) || /what should i (do|study) today/i.test(lower)) return makePlan(ctx.tasks, ctx);
  if (/motivat/i.test(lower) || /encourage/i.test(lower) || /i (feel|am) (sad|down|tired|stressed|overwhelmed)/i.test(lower)) return motivation();
  if (/help me (study|with (my )?homework)/i.test(lower)) return homeworkHelp(lower);
  if (/(study|advice|tip|how (do|should) i|how to)/i.test(lower)) return studyAdvice(lower);
  if (/(thank|thanks|appreciate)/i.test(lower)) return `You're very welcome, ${name}! I am always here when you need me. Keep up the great work!`;
  if (/(bye|goodbye|see you|cya)/i.test(lower)) return `Take care, ${name}! Remember, every bit of effort counts. I will be right here when you return.`;

  // Default: treat as a homework/study question
  return homeworkHelp(message);
}

export const SUGGESTED_PROMPTS = [
  'Explain this topic',
  'Help me study',
  "Make today's plan",
  'Quiz me',
  'Motivate me',
  'Summarize my notes',
];
