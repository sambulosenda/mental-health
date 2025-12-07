import { eq, desc } from 'drizzle-orm';
import { db } from '../client';
import {
  exerciseSessions,
  type ExerciseSessionRow,
  type NewExerciseSession,
} from '../schema';
import type {
  ExerciseSession,
  ExerciseSessionStatus,
  MoodValue,
} from '@/src/types/exercise';

// Generate UUID
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Safely parse JSON with fallback
function safeJsonParse(json: string | null, fallback: Record<string, unknown> = {}): Record<string, unknown> {
  if (!json) return fallback;
  try {
    return JSON.parse(json);
  } catch (error) {
    console.error('Failed to parse exercise responses JSON:', error);
    return fallback;
  }
}

// Convert database row to app type
function toExerciseSession(row: ExerciseSessionRow): ExerciseSession {
  return {
    id: row.id,
    templateId: row.templateId,
    status: row.status as ExerciseSessionStatus,
    startedAt: row.startedAt,
    completedAt: row.completedAt ?? undefined,
    responses: safeJsonParse(row.responses) as Record<string, string | string[]>,
    moodBefore: row.moodBefore as MoodValue | undefined,
    moodAfter: row.moodAfter as MoodValue | undefined,
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
  return toExerciseSession(entry as ExerciseSessionRow);
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

  const completed = rows.filter(
    (r) => r.moodBefore !== null && r.moodAfter !== null
  );

  const totalCompleted = rows.length;
  let averageMoodDelta: number | null = null;

  if (completed.length > 0) {
    const deltas = completed.map(
      (r) => (r.moodAfter as number) - (r.moodBefore as number)
    );
    averageMoodDelta = deltas.reduce((a, b) => a + b, 0) / deltas.length;
  }

  return { totalCompleted, averageMoodDelta };
}
