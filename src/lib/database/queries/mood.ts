import { eq, desc } from 'drizzle-orm';
import { db } from '../client';
import { moodEntries, type MoodEntryRow, type NewMoodEntry } from '../schema';
import { dateRangeForDay, dateRangeFor, dateRangeForLastDays } from '../utils';
import type { MoodEntry } from '@/src/types/mood';
import type { ActivityTagId } from '@/src/constants/theme';
import { generateId, parseJSONSafe } from '@/src/lib/utils';

// Convert database row to app type
function toMoodEntry(row: MoodEntryRow): MoodEntry {
  return {
    id: row.id,
    mood: row.mood as 1 | 2 | 3 | 4 | 5,
    timestamp: row.timestamp,
    activities: parseJSONSafe<ActivityTagId[]>(row.activities, []),
    note: row.note ?? undefined,
    createdAt: row.createdAt,
  };
}

// Create a new mood entry
export async function createMoodEntry(data: {
  mood: 1 | 2 | 3 | 4 | 5;
  activities?: ActivityTagId[];
  note?: string;
}): Promise<MoodEntry> {
  const now = new Date();
  const entry: NewMoodEntry = {
    id: generateId(),
    mood: data.mood,
    timestamp: now,
    activities: data.activities ? JSON.stringify(data.activities) : null,
    note: data.note ?? null,
    createdAt: now,
  };

  await db.insert(moodEntries).values(entry);
  return toMoodEntry(entry as MoodEntryRow);
}

// Get all mood entries, ordered by timestamp descending
export async function getAllMoodEntries(): Promise<MoodEntry[]> {
  const rows = await db
    .select()
    .from(moodEntries)
    .orderBy(desc(moodEntries.timestamp));
  return rows.map(toMoodEntry);
}

// Get mood entries for a specific date
export async function getMoodEntriesForDate(date: Date): Promise<MoodEntry[]> {
  const rows = await db
    .select()
    .from(moodEntries)
    .where(dateRangeForDay(moodEntries.timestamp, date))
    .orderBy(desc(moodEntries.timestamp));

  return rows.map(toMoodEntry);
}

// Get mood entries for a date range
export async function getMoodEntriesForRange(
  startDate: Date,
  endDate: Date
): Promise<MoodEntry[]> {
  const rows = await db
    .select()
    .from(moodEntries)
    .where(dateRangeFor(moodEntries.timestamp, startDate, endDate))
    .orderBy(desc(moodEntries.timestamp));

  return rows.map(toMoodEntry);
}

// Get entries for the last N days
export async function getMoodEntriesForLastDays(days: number): Promise<MoodEntry[]> {
  const rows = await db
    .select()
    .from(moodEntries)
    .where(dateRangeForLastDays(moodEntries.timestamp, days))
    .orderBy(desc(moodEntries.timestamp));

  return rows.map(toMoodEntry);
}

// Delete a mood entry
export async function deleteMoodEntry(id: string): Promise<void> {
  await db.delete(moodEntries).where(eq(moodEntries.id, id));
}

// Delete all mood entries
export async function deleteAllMoodEntries(): Promise<void> {
  await db.delete(moodEntries);
}

// Get mood entry by ID
export async function getMoodEntryById(id: string): Promise<MoodEntry | null> {
  const rows = await db
    .select()
    .from(moodEntries)
    .where(eq(moodEntries.id, id))
    .limit(1);

  return rows.length > 0 ? toMoodEntry(rows[0]) : null;
}
