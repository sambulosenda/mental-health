import { eq, desc, gte, lte, and } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';
import { db } from '../client';
import { moodEntries, type MoodEntryRow, type NewMoodEntry } from '../schema';
import type { MoodEntry } from '@/src/types/mood';
import type { ActivityTagId } from '@/src/constants/theme';

// Convert database row to app type
function toMoodEntry(row: MoodEntryRow): MoodEntry {
  return {
    id: row.id,
    mood: row.mood as 1 | 2 | 3 | 4 | 5,
    timestamp: row.timestamp,
    activities: row.activities ? JSON.parse(row.activities) : [],
    note: row.note ?? undefined,
    createdAt: row.createdAt,
  };
}

function generateId(): string {
  return Crypto.randomUUID();
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
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const rows = await db
    .select()
    .from(moodEntries)
    .where(
      and(
        gte(moodEntries.timestamp, startOfDay),
        lte(moodEntries.timestamp, endOfDay)
      )
    )
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
    .where(
      and(
        gte(moodEntries.timestamp, startDate),
        lte(moodEntries.timestamp, endDate)
      )
    )
    .orderBy(desc(moodEntries.timestamp));

  return rows.map(toMoodEntry);
}

// Get entries for the last N days
export async function getMoodEntriesForLastDays(days: number): Promise<MoodEntry[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  return getMoodEntriesForRange(startDate, new Date());
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
