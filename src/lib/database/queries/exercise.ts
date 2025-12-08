import type {
  ExerciseSession,
  ExerciseSessionStatus,
  MoodValue,
} from '@/src/types/exercise';
import { desc, eq } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';
import { db } from '../client';
import {
  exerciseSessions,
  type ExerciseSessionRow,
  type NewExerciseSession,
} from '../schema';

function generateId(): string {
  return Crypto.randomUUID();
}

// Validate that a value is a string or array of strings
function isValidResponseValue(value: unknown): value is string | string[] {
  if (typeof value === 'string') return true;
  if (Array.isArray(value)) return value.every((v) => typeof v === 'string');
  return false;
}

// Safely parse JSON with fallback and validation
function safeJsonParse(json: string | null, fallback: Record<string, string | string[]> = {}): Record<string, string | string[]> {
  if (!json) return fallback;
  try {
    const parsed = JSON.parse(json);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      console.error('Invalid exercise responses JSON: not an object');
      return fallback;
    }
    // Filter to only include valid string or string[] values
    const validated: Record<string, string | string[]> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (isValidResponseValue(value)) {
        validated[key] = value;
      } else {
        console.warn(`Invalid response value for key "${key}":`, value);
      }
    }
    return validated;
  } catch (error) {
    console.error('Failed to parse exercise responses JSON:', error);
    return fallback;
  }
}

// Valid exercise session statuses
const VALID_STATUSES: ExerciseSessionStatus[] = ['in_progress', 'completed', 'abandoned'];

// Validate status is a valid ExerciseSessionStatus
function isValidStatus(status: string): status is ExerciseSessionStatus {
  return VALID_STATUSES.includes(status as ExerciseSessionStatus);
}

// Validate mood value is 1-5
function isValidMoodValue(mood: number): mood is MoodValue {
  return Number.isInteger(mood) && mood >= 1 && mood <= 5;
}

// Convert database row to app type
function toExerciseSession(row: ExerciseSessionRow): ExerciseSession {
  // Validate status
  const status = isValidStatus(row.status) ? row.status : 'in_progress';
  if (!isValidStatus(row.status)) {
    console.warn(`Invalid session status "${row.status}", defaulting to "in_progress"`);
  }

  // Validate mood values: null → undefined, invalid number → undefined with warning
  const moodBefore = row.moodBefore === null
    ? undefined
    : isValidMoodValue(row.moodBefore) ? row.moodBefore : undefined;
  const moodAfter = row.moodAfter === null
    ? undefined
    : isValidMoodValue(row.moodAfter) ? row.moodAfter : undefined;

  if (row.moodBefore !== null && !isValidMoodValue(row.moodBefore)) {
    console.warn(`Invalid moodBefore value "${row.moodBefore}", ignoring`);
  }
  if (row.moodAfter !== null && !isValidMoodValue(row.moodAfter)) {
    console.warn(`Invalid moodAfter value "${row.moodAfter}", ignoring`);
  }

  return {
    id: row.id,
    templateId: row.templateId,
    status,
    startedAt: row.startedAt,
    completedAt: row.completedAt ?? undefined,
    responses: safeJsonParse(row.responses),
    moodBefore,
    moodAfter,
  };
}

// Create a new exercise session
export async function createExerciseSession(
  templateId: string
): Promise<ExerciseSession> {
  const now = new Date();
  const entry: NewExerciseSession = {
    id: generateId(),
    templateId,
    status: 'in_progress',
    startedAt: now,
  };

  await db.insert(exerciseSessions).values(entry);

  // Build full row shape with defaults for nullable fields
  const row: ExerciseSessionRow = {
    id: entry.id,
    templateId: entry.templateId,
    status: entry.status,
    startedAt: entry.startedAt,
    completedAt: null,
    responses: null,
    moodBefore: null,
    moodAfter: null,
  };

  return toExerciseSession(row);
}

// Update session responses
export async function updateSessionResponses(
  id: string,
  responses: Record<string, string | string[]>
): Promise<void> {
  await db
    .update(exerciseSessions)
    .set({ responses: JSON.stringify(responses) })
    .where(eq(exerciseSessions.id, id));
}

// Set mood before exercise
export async function setSessionMoodBefore(
  id: string,
  mood: MoodValue
): Promise<void> {
  await db
    .update(exerciseSessions)
    .set({ moodBefore: mood })
    .where(eq(exerciseSessions.id, id));
}

// Set mood after exercise
export async function setSessionMoodAfter(
  id: string,
  mood: MoodValue
): Promise<void> {
  await db
    .update(exerciseSessions)
    .set({ moodAfter: mood })
    .where(eq(exerciseSessions.id, id));
}

// Complete an exercise session
export async function completeExerciseSession(
  id: string,
  responses: Record<string, string | string[]>,
  moodAfter?: MoodValue
): Promise<void> {
  const now = new Date();
  await db
    .update(exerciseSessions)
    .set({
      status: 'completed',
      completedAt: now,
      responses: JSON.stringify(responses),
      ...(moodAfter && { moodAfter }),
    })
    .where(eq(exerciseSessions.id, id));
}

// Abandon an exercise session
export async function abandonExerciseSession(id: string): Promise<void> {
  await db
    .update(exerciseSessions)
    .set({ status: 'abandoned' })
    .where(eq(exerciseSessions.id, id));
}

// Get a session by ID
export async function getExerciseSession(
  id: string
): Promise<ExerciseSession | null> {
  const rows = await db
    .select()
    .from(exerciseSessions)
    .where(eq(exerciseSessions.id, id))
    .limit(1);

  return rows.length > 0 ? toExerciseSession(rows[0]) : null;
}

// Get recent sessions
export async function getRecentExerciseSessions(
  limit: number = 10
): Promise<ExerciseSession[]> {
  const rows = await db
    .select()
    .from(exerciseSessions)
    .orderBy(desc(exerciseSessions.startedAt))
    .limit(limit);

  return rows.map(toExerciseSession);
}

// Get completed sessions count by template
export async function getExerciseStats(): Promise<{
  totalCompleted: number;
  averageMoodDelta: number | null;
}> {
  const rows = await db
    .select()
    .from(exerciseSessions)
    .where(eq(exerciseSessions.status, 'completed'));

  // Filter to only include rows with valid mood values (non-null AND in 1-5 range)
  const withValidMoods = rows.filter(
    (r) =>
      r.moodBefore !== null &&
      r.moodAfter !== null &&
      isValidMoodValue(r.moodBefore) &&
      isValidMoodValue(r.moodAfter)
  );

  const totalCompleted = withValidMoods.length;
  let averageMoodDelta: number | null = null;

  if (withValidMoods.length > 0) {
    const deltas = withValidMoods.map(
      (r) => (r.moodAfter as number) - (r.moodBefore as number)
    );
    averageMoodDelta = deltas.reduce((a, b) => a + b, 0) / deltas.length;
  }

  return { totalCompleted, averageMoodDelta };
}

// Get exercise effectiveness by template (for personalized recommendations)
export async function getExerciseEffectiveness(): Promise<
  { templateId: string; avgMoodDelta: number; completionCount: number }[]
> {
  const rows = await db
    .select()
    .from(exerciseSessions)
    .where(eq(exerciseSessions.status, 'completed'));

  // Group by templateId and calculate average mood delta
  const byTemplate = new Map<
    string,
    { totalDelta: number; count: number }
  >();

  for (const row of rows) {
    // Only include sessions with valid before/after moods
    if (
      row.moodBefore === null ||
      row.moodAfter === null ||
      !isValidMoodValue(row.moodBefore) ||
      !isValidMoodValue(row.moodAfter)
    ) {
      continue;
    }

    const delta = row.moodAfter - row.moodBefore;
    const existing = byTemplate.get(row.templateId);

    if (existing) {
      existing.totalDelta += delta;
      existing.count += 1;
    } else {
      byTemplate.set(row.templateId, { totalDelta: delta, count: 1 });
    }
  }

  // Convert to array with averages
  return Array.from(byTemplate.entries()).map(([templateId, data]) => ({
    templateId,
    avgMoodDelta: data.totalDelta / data.count,
    completionCount: data.count,
  }));
}
