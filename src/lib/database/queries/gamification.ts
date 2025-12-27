import { generateId } from '@/src/lib/utils';
import type { EarnedBadge, StreakType, UserStreak } from '@/src/types/gamification';
import { desc, eq, gte, sql } from 'drizzle-orm';
import { db } from '../client';
import {
  exerciseSessions,
  journalEntries,
  moodEntries,
  streakProtection,
  userBadges,
  userStreaks,
  type UserBadgeRow,
  type UserStreakRow,
} from '../schema';

// --- Streak Functions ---

const defaultStreak = (type: StreakType): UserStreak => ({
  id: type,
  type,
  currentStreak: 0,
  longestStreak: 0,
  lastActivityDate: null,
  streakStartDate: null,
  updatedAt: new Date(),
});

function toUserStreak(row: UserStreakRow): UserStreak {
  return {
    id: row.id,
    type: row.type as StreakType,
    currentStreak: row.currentStreak,
    longestStreak: row.longestStreak,
    lastActivityDate: row.lastActivityDate,
    streakStartDate: row.streakStartDate,
    updatedAt: row.updatedAt,
  };
}

export async function getStreaks(): Promise<Record<StreakType, UserStreak>> {
  const rows = await db.select().from(userStreaks);

  const result: Record<StreakType, UserStreak> = {
    mood: defaultStreak('mood'),
    journal: defaultStreak('journal'),
    exercise: defaultStreak('exercise'),
    overall: defaultStreak('overall'),
  };

  for (const row of rows) {
    const type = row.type as StreakType;
    if (type in result) {
      result[type] = toUserStreak(row);
    }
  }

  return result;
}

export async function getStreak(type: StreakType): Promise<UserStreak> {
  const rows = await db
    .select()
    .from(userStreaks)
    .where(eq(userStreaks.type, type))
    .limit(1);

  return rows.length > 0 ? toUserStreak(rows[0]) : defaultStreak(type);
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export async function updateStreak(type: StreakType, activityDate: string): Promise<UserStreak> {
  const current = await getStreak(type);
  const yesterday = getYesterday();

  // Already logged for this date
  if (current.lastActivityDate === activityDate) {
    return current;
  }

  let newStreak: number;
  let streakStart: string;

  if (current.lastActivityDate === yesterday) {
    // Continuing streak
    newStreak = current.currentStreak + 1;
    streakStart = current.streakStartDate ?? activityDate;
  } else {
    // Streak broken or first entry
    newStreak = 1;
    streakStart = activityDate;
  }

  const longestStreak = Math.max(current.longestStreak, newStreak);
  const now = new Date();

  // Upsert the streak
  await db
    .insert(userStreaks)
    .values({
      id: type,
      type,
      currentStreak: newStreak,
      longestStreak,
      lastActivityDate: activityDate,
      streakStartDate: streakStart,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: userStreaks.id,
      set: {
        currentStreak: newStreak,
        longestStreak,
        lastActivityDate: activityDate,
        streakStartDate: streakStart,
        updatedAt: now,
      },
    });

  return {
    id: type,
    type,
    currentStreak: newStreak,
    longestStreak,
    lastActivityDate: activityDate,
    streakStartDate: streakStart,
    updatedAt: now,
  };
}

// --- Badge Functions ---

function toEarnedBadge(row: UserBadgeRow): EarnedBadge {
  let metadata: Record<string, unknown> | undefined;
  if (row.metadata) {
    try {
      metadata = JSON.parse(row.metadata);
    } catch {
      // ignore invalid JSON
    }
  }
  return {
    id: row.id,
    badgeId: row.badgeId,
    earnedAt: row.earnedAt,
    metadata,
  };
}

export async function getEarnedBadges(): Promise<EarnedBadge[]> {
  const rows = await db
    .select()
    .from(userBadges)
    .orderBy(desc(userBadges.earnedAt));
  return rows.map(toEarnedBadge);
}

export async function hasBadge(badgeId: string): Promise<boolean> {
  const rows = await db
    .select()
    .from(userBadges)
    .where(eq(userBadges.badgeId, badgeId))
    .limit(1);
  return rows.length > 0;
}

export async function awardBadge(
  badgeId: string,
  metadata?: Record<string, unknown>
): Promise<EarnedBadge> {
  const now = new Date();
  const id = generateId();

  await db.insert(userBadges).values({
    id,
    badgeId,
    earnedAt: now,
    metadata: metadata ? JSON.stringify(metadata) : null,
  });

  return { id, badgeId, earnedAt: now, metadata };
}

// --- Streak Protection Functions ---

export async function getStreakProtectionsRemaining(): Promise<number> {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const used = await db
    .select()
    .from(streakProtection)
    .where(gte(streakProtection.usedAt, monthStart));

  return Math.max(0, 3 - used.length);
}

export async function useStreakProtection(reason?: string): Promise<boolean> {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const MAX_PROTECTIONS = 3;

  // Use a transaction to atomically check remaining and insert
  // SQLite's transaction locking prevents concurrent calls from both reading remaining > 0
  return await db.transaction(async (tx) => {
    const used = await tx
      .select()
      .from(streakProtection)
      .where(gte(streakProtection.usedAt, monthStart));

    const remaining = Math.max(0, MAX_PROTECTIONS - used.length);
    if (remaining <= 0) {
      return false;
    }

    await tx.insert(streakProtection).values({
      id: generateId(),
      usedAt: new Date(),
      reason: reason ?? null,
    });

    return true;
  });
}

// --- Stats Functions (for badge checking) ---

export async function getMoodEntryCount(): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(moodEntries);
  return result[0]?.count ?? 0;
}

export async function getJournalEntryCount(): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(journalEntries);
  return result[0]?.count ?? 0;
}

export async function getExerciseSessionCount(): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(exerciseSessions)
    .where(eq(exerciseSessions.status, 'completed'));
  return result[0]?.count ?? 0;
}

export async function getUniqueMoodsLogged(): Promise<number[]> {
  const rows = await db
    .selectDistinct({ mood: moodEntries.mood })
    .from(moodEntries);
  return rows.map((r) => r.mood);
}

export async function getUniqueActivitiesUsed(): Promise<string[]> {
  const rows = await db
    .select({ activities: moodEntries.activities })
    .from(moodEntries)
    .where(sql`${moodEntries.activities} IS NOT NULL`);

  const allActivities = new Set<string>();
  for (const row of rows) {
    if (row.activities) {
      try {
        const parsed = JSON.parse(row.activities) as string[];
        parsed.forEach((a) => allActivities.add(a));
      } catch {
        // ignore invalid JSON
      }
    }
  }
  return Array.from(allActivities);
}

export async function getUniqueDaysTracked(): Promise<number> {
  // Count unique dates with mood entries
  const result = await db
    .select({ count: sql<number>`count(DISTINCT date(timestamp / 1000, 'unixepoch'))` })
    .from(moodEntries);
  return result[0]?.count ?? 0;
}
