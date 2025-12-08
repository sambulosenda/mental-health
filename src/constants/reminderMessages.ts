import type { ReminderType } from '@/src/types/settings';

export interface ReminderMessage {
  title: string;
  body: string;
}

// Mood check-in messages
export const moodReminderMessages: ReminderMessage[] = [
  { title: 'How are you feeling?', body: 'Take a moment to check in with yourself.' },
  { title: 'Time for a mood check', body: 'Your feelings matter. Log them now.' },
  { title: 'Mindful moment', body: 'Pause and notice how you feel right now.' },
  { title: 'Quick check-in', body: 'A few seconds to reflect can make a big difference.' },
  { title: 'Your daily reflection', body: 'Track your mood to understand your patterns.' },
  { title: 'How\'s your day going?', body: 'Take a breath and check in with yourself.' },
  { title: 'Moment of awareness', body: 'What emotions are present right now?' },
];

// Exercise reminder messages
export const exerciseReminderMessages: ReminderMessage[] = [
  { title: 'Time for a mental exercise', body: 'A quick exercise can reset your day.' },
  { title: 'Zen moment', body: 'Take 5 minutes to ground yourself.' },
  { title: 'Breathing break', body: 'Your mind could use a short break.' },
  { title: 'Self-care reminder', body: 'A small exercise can shift your whole day.' },
  { title: 'Mindfulness time', body: 'Give yourself a few minutes of calm.' },
  { title: 'Mental reset', body: 'Ready for a quick grounding exercise?' },
];

// Journal reminder messages
export const journalReminderMessages: ReminderMessage[] = [
  { title: 'Time to reflect', body: 'Write about your day while it\'s fresh.' },
  { title: 'Journal awaits', body: 'Capture your thoughts before bed.' },
  { title: 'End-of-day reflection', body: 'What was meaningful about today?' },
  { title: 'Your thoughts matter', body: 'A few words can bring clarity.' },
  { title: 'Evening reflection', body: 'What would you like to remember from today?' },
  { title: 'Write it down', body: 'Processing your day through writing helps.' },
];

// Streak messages - {streak} and {nextStreak} are placeholders
export const streakMessages: ReminderMessage[] = [
  { title: 'Keep it going!', body: 'You\'re on a {streak}-day streak! Don\'t break it.' },
  { title: '{streak} days strong!', body: 'Your consistency is paying off.' },
  { title: 'Streak alert!', body: '{streak} days in a row. Let\'s make it {nextStreak}!' },
  { title: 'You\'re on fire!', body: '{streak} days and counting. Keep going!' },
  { title: 'Impressive streak!', body: '{streak} consecutive days. You\'re building a habit!' },
];

// Follow-up messages (gentler tone for when user missed primary reminder)
export const followUpMessages: Record<ReminderType, ReminderMessage[]> = {
  mood: [
    { title: 'Still time to check in', body: 'You haven\'t logged your mood yet today.' },
    { title: 'Afternoon check-in', body: 'How has your day been going so far?' },
    { title: 'Quick reminder', body: 'Your mood matters. Take a moment to log it.' },
  ],
  exercise: [
    { title: 'Quick exercise?', body: 'A few minutes could help reset your afternoon.' },
    { title: 'Gentle reminder', body: 'There\'s still time for a mindfulness break.' },
  ],
  journal: [
    { title: 'Don\'t forget to journal', body: 'Even a few sentences can be helpful.' },
    { title: 'Late reflection', body: 'It\'s not too late to capture your thoughts.' },
  ],
};

// Helper to get random message from array
export function getRandomMessage(messages: ReminderMessage[]): ReminderMessage {
  if (messages.length === 0) {
    throw new Error('Cannot get random message from empty array');
  }
  return messages[Math.floor(Math.random() * messages.length)];
}

// Helper to format streak message with actual numbers
export function formatStreakMessage(message: ReminderMessage, streak: number): ReminderMessage {
  return {
    title: message.title.replaceAll('{streak}', String(streak)),
    body: message.body
      .replaceAll('{streak}', String(streak))
      .replaceAll('{nextStreak}', String(streak + 1)),
  };
}

// Get message pool by reminder type
export function getMessagePool(type: ReminderType): ReminderMessage[] {
  switch (type) {
    case 'mood':
      return moodReminderMessages;
    case 'exercise':
      return exerciseReminderMessages;
    case 'journal':
      return journalReminderMessages;
  }
}
