import type {
  AssessmentType,
  AssessmentSession,
  LikertValue,
  SeverityLevel,
} from '@/src/types/assessment';
import { calculateSeverity, getTemplateById } from '@/src/constants/assessments';
import { desc, eq, and } from 'drizzle-orm';
import { db } from '../client';
import {
  assessmentSessions,
  type AssessmentSessionRow,
  type NewAssessmentSession,
} from '../schema';
import {
  parseAssessmentResponses,
  castSessionStatus,
  dateRangeForLastDays,
} from '../utils';
import { generateId } from '@/src/lib/utils';

const VALID_TYPES: AssessmentType[] = ['gad7', 'phq9'];
const VALID_SEVERITIES: SeverityLevel[] = ['minimal', 'mild', 'moderate', 'severe'];

function isValidType(type: string): type is AssessmentType {
  return VALID_TYPES.includes(type as AssessmentType);
}

function isValidSeverity(severity: string): severity is SeverityLevel {
  return VALID_SEVERITIES.includes(severity as SeverityLevel);
}

// Convert database row to app type
function toAssessmentSession(row: AssessmentSessionRow): AssessmentSession | null {
  // Validate type
  if (!isValidType(row.type)) {
    console.warn(`Invalid assessment type "${row.type}", skipping`);
    return null;
  }

  // Validate severity
  const severity = row.severity && isValidSeverity(row.severity) ? row.severity : undefined;

  return {
    id: row.id,
    type: row.type as AssessmentType,
    status: castSessionStatus(row.status),
    startedAt: row.startedAt,
    completedAt: row.completedAt ?? undefined,
    responses: parseAssessmentResponses(row.responses),
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

  // Validate all questions are answered
  const expectedQuestionIds = template.questions.map((q) => q.id);
  const answeredQuestionIds = Object.keys(responses);
  const missingQuestions = expectedQuestionIds.filter((id) => !answeredQuestionIds.includes(id));

  if (missingQuestions.length > 0) {
    throw new Error(`Incomplete assessment: missing answers for ${missingQuestions.length} question(s)`);
  }

  // Validate response values are valid Likert values (0-3)
  for (const [questionId, value] of Object.entries(responses)) {
    if (typeof value !== 'number' || value < 0 || value > 3) {
      throw new Error(`Invalid response value for question ${questionId}: ${value}`);
    }
  }

  // Calculate total score (capped at max)
  const rawScore = Object.values(responses).reduce<number>((sum, val) => sum + val, 0);
  const totalScore = Math.min(rawScore, template.scoringInfo.maxScore);
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
  const rows = await db
    .select()
    .from(assessmentSessions)
    .where(
      and(
        eq(assessmentSessions.type, type),
        eq(assessmentSessions.status, 'completed'),
        dateRangeForLastDays(assessmentSessions.completedAt, days)
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
