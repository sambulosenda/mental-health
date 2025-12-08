import type {
  AssessmentType,
  AssessmentSession,
  LikertValue,
  SeverityLevel,
} from '@/src/types/assessment';
import { calculateSeverity, getTemplateById } from '@/src/constants/assessments';
import { desc, eq, and, gte } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';
import { db } from '../client';
import {
  assessmentSessions,
  type AssessmentSessionRow,
  type NewAssessmentSession,
} from '../schema';

function generateId(): string {
  return Crypto.randomUUID();
}

type AssessmentSessionStatus = 'in_progress' | 'completed' | 'abandoned';

const VALID_STATUSES: AssessmentSessionStatus[] = ['in_progress', 'completed', 'abandoned'];
const VALID_TYPES: AssessmentType[] = ['gad7', 'phq9'];
const VALID_SEVERITIES: SeverityLevel[] = ['minimal', 'mild', 'moderate', 'severe'];

function isValidStatus(status: string): status is AssessmentSessionStatus {
  return VALID_STATUSES.includes(status as AssessmentSessionStatus);
}

function isValidType(type: string): type is AssessmentType {
  return VALID_TYPES.includes(type as AssessmentType);
}

function isValidSeverity(severity: string): severity is SeverityLevel {
  return VALID_SEVERITIES.includes(severity as SeverityLevel);
}

function isValidLikertValue(value: unknown): value is LikertValue {
  return typeof value === 'number' && [0, 1, 2, 3].includes(value);
}

// Safely parse JSON responses with validation
function safeJsonParse(
  json: string | null,
  fallback: Record<string, LikertValue> = {}
): Record<string, LikertValue> {
  if (!json) return fallback;
  try {
    const parsed = JSON.parse(json);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      console.error('Invalid assessment responses JSON: not an object');
      return fallback;
    }
    const validated: Record<string, LikertValue> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (isValidLikertValue(value)) {
        validated[key] = value;
      } else {
        console.warn(`Invalid Likert value for key "${key}":`, value);
      }
    }
    return validated;
  } catch (error) {
    console.error('Failed to parse assessment responses JSON:', error);
    return fallback;
  }
}

// Convert database row to app type
function toAssessmentSession(row: AssessmentSessionRow): AssessmentSession | null {
  // Validate type
  if (!isValidType(row.type)) {
    console.warn(`Invalid assessment type "${row.type}", skipping`);
    return null;
  }

  // Validate status
  const status = isValidStatus(row.status) ? row.status : 'in_progress';
  if (!isValidStatus(row.status)) {
    console.warn(`Invalid session status "${row.status}", defaulting to "in_progress"`);
  }

  // Validate severity
  const severity =
    row.severity && isValidSeverity(row.severity) ? row.severity : undefined;

  return {
    id: row.id,
    type: row.type as AssessmentType,
    status,
    startedAt: row.startedAt,
    completedAt: row.completedAt ?? undefined,
    responses: safeJsonParse(row.responses),
    totalScore: row.totalScore ?? undefined,
    severity,
  };
}

// Create a new assessment session
export async function createAssessmentSession(
  type: AssessmentType
): Promise<AssessmentSession> {
  const now = new Date();
  const entry: NewAssessmentSession = {
    id: generateId(),
    type,
    status: 'in_progress',
    startedAt: now,
  };

  await db.insert(assessmentSessions).values(entry);

  return {
    id: entry.id,
    type,
    status: 'in_progress',
    startedAt: now,
    responses: {},
  };
}

// Update session responses
export async function updateAssessmentResponses(
  id: string,
  responses: Record<string, LikertValue>
): Promise<void> {
  await db
    .update(assessmentSessions)
    .set({ responses: JSON.stringify(responses) })
    .where(eq(assessmentSessions.id, id));
}

// Complete an assessment session with scoring
export async function completeAssessmentSession(
  id: string,
  type: AssessmentType,
  responses: Record<string, LikertValue>
): Promise<{ totalScore: number; severity: SeverityLevel }> {
  const now = new Date();
  const template = getTemplateById(type);

  // Calculate total score
  const totalScore = Object.values(responses).reduce<number>((sum, val) => sum + val, 0);
  const severity = calculateSeverity(totalScore, template);

  await db
    .update(assessmentSessions)
    .set({
      status: 'completed',
      completedAt: now,
      responses: JSON.stringify(responses),
      totalScore,
      severity,
    })
    .where(eq(assessmentSessions.id, id));

  return { totalScore, severity };
}

// Abandon an assessment session
export async function abandonAssessmentSession(id: string): Promise<void> {
  await db
    .update(assessmentSessions)
    .set({ status: 'abandoned' })
    .where(eq(assessmentSessions.id, id));
}

// Get a session by ID
export async function getAssessmentSession(
  id: string
): Promise<AssessmentSession | null> {
  const rows = await db
    .select()
    .from(assessmentSessions)
    .where(eq(assessmentSessions.id, id))
    .limit(1);

  if (rows.length === 0) return null;
  return toAssessmentSession(rows[0]);
}

// Get recent completed assessments
export async function getRecentAssessments(
  type?: AssessmentType,
  limit: number = 10
): Promise<AssessmentSession[]> {
  let query = db
    .select()
    .from(assessmentSessions)
    .where(eq(assessmentSessions.status, 'completed'))
    .orderBy(desc(assessmentSessions.completedAt))
    .limit(limit);

  if (type) {
    query = db
      .select()
      .from(assessmentSessions)
      .where(
        and(
          eq(assessmentSessions.status, 'completed'),
          eq(assessmentSessions.type, type)
        )
      )
      .orderBy(desc(assessmentSessions.completedAt))
      .limit(limit);
  }

  const rows = await query;
  return rows.map(toAssessmentSession).filter((s): s is AssessmentSession => s !== null);
}

// Get assessment history for trends
export async function getAssessmentHistory(
  type: AssessmentType,
  days: number = 90
): Promise<AssessmentSession[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const rows = await db
    .select()
    .from(assessmentSessions)
    .where(
      and(
        eq(assessmentSessions.type, type),
        eq(assessmentSessions.status, 'completed'),
        gte(assessmentSessions.completedAt, startDate)
      )
    )
    .orderBy(desc(assessmentSessions.completedAt));

  return rows.map(toAssessmentSession).filter((s): s is AssessmentSession => s !== null);
}

// Get the last completed assessment of a type
export async function getLastAssessment(
  type: AssessmentType
): Promise<AssessmentSession | null> {
  const rows = await db
    .select()
    .from(assessmentSessions)
    .where(
      and(
        eq(assessmentSessions.type, type),
        eq(assessmentSessions.status, 'completed')
      )
    )
    .orderBy(desc(assessmentSessions.completedAt))
    .limit(1);

  if (rows.length === 0) return null;
  return toAssessmentSession(rows[0]);
}

// Check if an assessment is due based on recommended frequency
export async function isAssessmentDue(type: AssessmentType): Promise<boolean> {
  const template = getTemplateById(type);
  const lastAssessment = await getLastAssessment(type);

  if (!lastAssessment || !lastAssessment.completedAt) {
    return true; // Never taken
  }

  const daysSinceLastAssessment = Math.floor(
    (Date.now() - lastAssessment.completedAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysSinceLastAssessment >= template.scoringInfo.recommendedFrequencyDays;
}
