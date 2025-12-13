import { and, gte, lte, type SQL, type Column } from 'drizzle-orm';
import { startOfDay, endOfDay, daysAgo } from '@/src/lib/utils';

// ============================================================================
// Date Range Query Helpers
// ============================================================================

/**
 * Build WHERE clause for single day
 */
export function dateRangeForDay<T extends Column>(
  column: T,
  date: Date
): SQL | undefined {
  return and(gte(column, startOfDay(date)), lte(column, endOfDay(date)));
}

/**
 * Build WHERE clause for date range
 */
export function dateRangeFor<T extends Column>(
  column: T,
  start: Date,
  end: Date
): SQL | undefined {
  return and(gte(column, start), lte(column, end));
}

/**
 * Build WHERE clause for last N days
 */
export function dateRangeForLastDays<T extends Column>(
  column: T,
  days: number
): SQL | undefined {
  return gte(column, daysAgo(days));
}

// ============================================================================
// Validation Helpers
// ============================================================================

/** Valid mood values (1-5 scale) */
export type MoodValue = 1 | 2 | 3 | 4 | 5;

/** Valid Likert values (0-3 scale for assessments) */
export type LikertValue = 0 | 1 | 2 | 3;

/** Session statuses */
export type SessionStatus = 'in_progress' | 'completed' | 'abandoned';

const VALID_MOOD_VALUES = [1, 2, 3, 4, 5] as const;
const VALID_LIKERT_VALUES = [0, 1, 2, 3] as const;
const VALID_SESSION_STATUSES: SessionStatus[] = ['in_progress', 'completed', 'abandoned'];

/**
 * Check if value is valid mood (1-5)
 */
export function isValidMoodValue(value: unknown): value is MoodValue {
  return typeof value === 'number' && VALID_MOOD_VALUES.includes(value as 1 | 2 | 3 | 4 | 5);
}

/**
 * Check if value is valid Likert value (0-3)
 */
export function isValidLikertValue(value: unknown): value is LikertValue {
  return typeof value === 'number' && VALID_LIKERT_VALUES.includes(value as 0 | 1 | 2 | 3);
}

/**
 * Check if value is valid session status
 */
export function isValidSessionStatus(value: string): value is SessionStatus {
  return VALID_SESSION_STATUSES.includes(value as SessionStatus);
}

/**
 * Validate and parse exercise responses (string or string[] values)
 */
export function isValidResponseValue(value: unknown): value is string | string[] {
  if (typeof value === 'string') return true;
  if (Array.isArray(value)) return value.every((v) => typeof v === 'string');
  return false;
}

/**
 * Safely parse JSON for exercise responses with validation
 */
export function parseExerciseResponses(
  json: string | null,
  fallback: Record<string, string | string[]> = {}
): Record<string, string | string[]> {
  if (!json) return fallback;
  try {
    const parsed = JSON.parse(json);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return fallback;
    }
    const validated: Record<string, string | string[]> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (isValidResponseValue(value)) {
        validated[key] = value;
      }
    }
    return validated;
  } catch {
    return fallback;
  }
}

/**
 * Safely parse JSON for assessment responses with validation
 */
export function parseAssessmentResponses(
  json: string | null,
  fallback: Record<string, LikertValue> = {}
): Record<string, LikertValue> {
  if (!json) return fallback;
  try {
    const parsed = JSON.parse(json);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return fallback;
    }
    const validated: Record<string, LikertValue> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (isValidLikertValue(value)) {
        validated[key] = value;
      }
    }
    return validated;
  } catch {
    return fallback;
  }
}

/**
 * Safely cast mood value with warning
 */
export function castMoodValue(value: number | null, context?: string): MoodValue | undefined {
  if (value === null) return undefined;
  if (isValidMoodValue(value)) return value;
  if (context) {
    console.warn(`Invalid mood value "${value}" in ${context}, ignoring`);
  }
  return undefined;
}

/**
 * Safely cast session status with default
 */
export function castSessionStatus(value: string, defaultStatus: SessionStatus = 'in_progress'): SessionStatus {
  if (isValidSessionStatus(value)) return value;
  console.warn(`Invalid session status "${value}", defaulting to "${defaultStatus}"`);
  return defaultStatus;
}
