import { getMoodEntriesForDate, getMoodEntriesForLastDays } from './database/queries/mood';
import { getJournalEntriesForLastDays } from './database/queries/journal';
import { getRecentExerciseSessions } from './database/queries/exercise';
import type { ReminderType } from '@/src/types/settings';

export interface StreakInfo {
  mood: number;
  exercise: number;
  journal: number;
}

// Normalize date to start of day for comparison
function normalizeToDay(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

// Calculate consecutive days from array of timestamps
function calculateConsecutiveDays(timestamps: Date[]): number {
  if (timestamps.length === 0) return 0;

  // Get unique dates (normalized to day)
  const uniqueDates = new Set(
    timestamps.map((t) => normalizeToDay(t).toISOString())
  );

  const sortedDates = Array.from(uniqueDates)
    .map((d) => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime());

  const today = normalizeToDay(new Date());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if today or yesterday has an entry (streak is only valid if recent)
  const hasToday = sortedDates.some((d) => d.getTime() === today.getTime());
  const hasYesterday = sortedDates.some((d) => d.getTime() === yesterday.getTime());

  if (!hasToday && !hasYesterday) return 0;

  // Count consecutive days starting from most recent
  let streak = 0;
  let checkDate = hasToday ? today : yesterday;

  while (sortedDates.some((d) => d.getTime() === checkDate.getTime())) {
    streak++;
    checkDate = new Date(checkDate);
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return streak;
}

// Calculate streaks for all types
export async function calculateStreaks(): Promise<StreakInfo> {
  // Get entries for last 30 days (filtered at query level for performance)
  const moodEntries = await getMoodEntriesForLastDays(30);
  const journalEntries = await getJournalEntriesForLastDays(30);
  const exerciseSessions = await getRecentExerciseSessions(100);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const moodStreak = calculateConsecutiveDays(
    moodEntries.map((e) => e.timestamp)
  );

  const journalStreak = calculateConsecutiveDays(
    journalEntries.map((e) => e.createdAt)
  );

  const exerciseStreak = calculateConsecutiveDays(
    exerciseSessions
      .filter((s) => s.status === 'completed' && s.startedAt >= thirtyDaysAgo)
      .map((s) => s.startedAt)
  );

  return {
    mood: moodStreak,
    exercise: exerciseStreak,
    journal: journalStreak,
  };
}

// Check if user has completed action today
export async function hasCompletedToday(type: ReminderType): Promise<boolean> {
  switch (type) {
    case 'mood': {
      const entries = await getMoodEntriesForDate(new Date());
      return entries.length > 0;
    }
    case 'exercise': {
      const today = normalizeToDay(new Date());
      const sessions = await getRecentExerciseSessions(20);
      return sessions.some(
        (s) =>
          s.status === 'completed' &&
          normalizeToDay(s.startedAt).getTime() === today.getTime()
      );
    }
    case 'journal': {
      const today = normalizeToDay(new Date());
      const entries = await getJournalEntriesForLastDays(1);
      return entries.some(
        (e) => normalizeToDay(e.createdAt).getTime() === today.getTime()
      );
    }
  }
}

// Get streak for specific type
export async function getStreakForType(type: ReminderType): Promise<number> {
  const streaks = await calculateStreaks();
  return streaks[type];
}
