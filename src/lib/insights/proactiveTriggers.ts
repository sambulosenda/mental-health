import type { MoodEntry, DailyMoodSummary } from '@/src/types/mood';
import { getDay, addDays, format } from 'date-fns';

/**
 * Proactive trigger types for AI outreach
 */
export type ProactiveTriggerType =
  | 'struggling' // Low mood for 3+ consecutive days
  | 'inactive' // No check-in for 3+ days
  | 'tough_day_ahead' // Tomorrow is typically a hard day
  | 'mood_dip' // Recent downward trend
  | 'check_in_after_exercise'; // Follow up after exercise completion

export interface ProactiveTrigger {
  id: string;
  type: ProactiveTriggerType;
  title: string;
  message: string;
  /** Context to pass to AI chat */
  chatContext: string;
  /** Priority for display ordering */
  priority: 'high' | 'medium' | 'low';
  /** When this trigger was detected */
  detectedAt: Date;
  /** Optional: expires after this date */
  expiresAt?: Date;
}

interface TriggerDetectionInput {
  entries: MoodEntry[];
  summaries: DailyMoodSummary[];
  lastExerciseAt?: Date;
  lastCheckInAt?: Date;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Detect proactive triggers based on user data patterns
 * Returns triggers sorted by priority (high first)
 */
export function detectProactiveTriggers(input: TriggerDetectionInput): ProactiveTrigger[] {
  const triggers: ProactiveTrigger[] = [];
  const now = new Date();

  // Check for struggling pattern (3+ days of low mood)
  const strugglingTrigger = detectStrugglingPattern(input.entries, now);
  if (strugglingTrigger) triggers.push(strugglingTrigger);

  // Check for inactivity
  const inactiveTrigger = detectInactivity(input.lastCheckInAt, now);
  if (inactiveTrigger) triggers.push(inactiveTrigger);

  // Check for tough day ahead
  const toughDayTrigger = detectToughDayAhead(input.entries, now);
  if (toughDayTrigger) triggers.push(toughDayTrigger);

  // Check for mood dip trend
  const moodDipTrigger = detectMoodDip(input.summaries, now);
  if (moodDipTrigger) triggers.push(moodDipTrigger);

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return triggers.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

/**
 * Detect if user has been struggling (mood ≤2 for 3+ consecutive days)
 */
function detectStrugglingPattern(entries: MoodEntry[], now: Date): ProactiveTrigger | null {
  if (entries.length < 3) return null;

  // Get entries from last 7 days, sorted by date descending
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentEntries = entries
    .filter((e) => e.timestamp >= sevenDaysAgo)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  if (recentEntries.length < 3) return null;

  // Group by date and get daily average
  const dailyMoods = new Map<string, number[]>();
  recentEntries.forEach((entry) => {
    const dateKey = format(entry.timestamp, 'yyyy-MM-dd');
    if (!dailyMoods.has(dateKey)) {
      dailyMoods.set(dateKey, []);
    }
    dailyMoods.get(dateKey)!.push(entry.mood);
  });

  // Calculate daily averages
  const dailyAverages = Array.from(dailyMoods.entries())
    .map(([date, moods]) => ({
      date,
      avg: moods.reduce((a, b) => a + b, 0) / moods.length,
    }))
    .sort((a, b) => b.date.localeCompare(a.date));

  // Check for 3+ consecutive days of low mood (avg ≤ 2)
  let consecutiveLowDays = 0;
  for (const day of dailyAverages) {
    if (day.avg <= 2) {
      consecutiveLowDays++;
    } else {
      break;
    }
  }

  if (consecutiveLowDays >= 3) {
    return {
      id: 'struggling-pattern',
      type: 'struggling',
      title: "I've noticed you're going through a tough time",
      message: `The last ${consecutiveLowDays} days have been challenging. Want to talk about what's going on?`,
      chatContext: `The user has logged low mood (average ≤2 out of 5) for ${consecutiveLowDays} consecutive days. Approach with empathy and gentle curiosity. Ask open-ended questions about what they're experiencing. Validate their feelings before offering any suggestions.`,
      priority: 'high',
      detectedAt: now,
      expiresAt: addDays(now, 1),
    };
  }

  return null;
}

/**
 * Detect if user hasn't checked in for 3+ days
 */
function detectInactivity(lastCheckInAt: Date | undefined, now: Date): ProactiveTrigger | null {
  if (!lastCheckInAt) return null;

  const daysSinceCheckIn = Math.floor(
    (now.getTime() - lastCheckInAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceCheckIn >= 3) {
    return {
      id: 'inactive-user',
      type: 'inactive',
      title: "Haven't heard from you in a while",
      message: `It's been ${daysSinceCheckIn} days. How have you been?`,
      chatContext: `The user hasn't logged their mood for ${daysSinceCheckIn} days. They may have been busy, avoiding difficult emotions, or simply forgot. Gently check in without making them feel guilty. Ask how they've been and what's been on their mind.`,
      priority: 'medium',
      detectedAt: now,
      expiresAt: addDays(now, 2),
    };
  }

  return null;
}

/**
 * Detect if tomorrow is typically a tough day for this user
 */
function detectToughDayAhead(entries: MoodEntry[], now: Date): ProactiveTrigger | null {
  if (entries.length < 14) return null; // Need at least 2 weeks of data

  const tomorrow = addDays(now, 1);
  const tomorrowDayOfWeek = getDay(tomorrow);
  const tomorrowName = DAY_NAMES[tomorrowDayOfWeek];

  // Get all entries for tomorrow's day of week
  const dayEntries = entries.filter((e) => getDay(e.timestamp) === tomorrowDayOfWeek);

  if (dayEntries.length < 3) return null; // Need sufficient data

  // Calculate average mood for this day
  const dayAvg = dayEntries.reduce((sum, e) => sum + e.mood, 0) / dayEntries.length;

  // Calculate overall average
  const overallAvg = entries.reduce((sum, e) => sum + e.mood, 0) / entries.length;

  // If this day is significantly lower than average
  if (overallAvg - dayAvg > 0.5) {
    return {
      id: 'tough-day-ahead',
      type: 'tough_day_ahead',
      title: `${tomorrowName}s can be challenging`,
      message: `Based on your patterns, ${tomorrowName}s tend to be tougher. Want to prepare together?`,
      chatContext: `Based on the user's historical data, ${tomorrowName}s tend to have lower mood scores (avg ${dayAvg.toFixed(1)} vs overall ${overallAvg.toFixed(1)}). Help them prepare by exploring what typically happens on ${tomorrowName}s and suggesting proactive coping strategies.`,
      priority: 'medium',
      detectedAt: now,
      expiresAt: addDays(now, 1), // Only valid until tomorrow
    };
  }

  return null;
}

/**
 * Detect recent mood dip (downward trend in last 5-7 days)
 */
function detectMoodDip(summaries: DailyMoodSummary[], now: Date): ProactiveTrigger | null {
  if (summaries.length < 5) return null;

  // Get last 7 days of summaries
  const sorted = [...summaries].sort((a, b) => a.date.localeCompare(b.date));
  const recent = sorted.slice(-7);

  if (recent.length < 5) return null;

  // Compare first half vs second half
  const midpoint = Math.floor(recent.length / 2);
  const firstHalf = recent.slice(0, midpoint);
  const secondHalf = recent.slice(midpoint);

  const firstAvg = firstHalf.reduce((sum, s) => sum + s.averageMood, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, s) => sum + s.averageMood, 0) / secondHalf.length;

  const drop = firstAvg - secondAvg;

  // Significant drop (more than 0.7 points)
  if (drop > 0.7) {
    return {
      id: 'mood-dip',
      type: 'mood_dip',
      title: 'Your mood has shifted recently',
      message: "I noticed things have felt harder lately. What's been going on?",
      chatContext: `The user's mood has dropped by ${drop.toFixed(1)} points over the last week (from avg ${firstAvg.toFixed(1)} to ${secondAvg.toFixed(1)}). This is a significant shift. Gently explore what might have changed - life events, stress, sleep, etc. Focus on understanding before suggesting interventions.`,
      priority: 'high',
      detectedAt: now,
      expiresAt: addDays(now, 2),
    };
  }

  return null;
}

/**
 * Create a trigger for post-exercise check-in
 */
export function createExerciseFollowUpTrigger(
  exerciseName: string,
  completedAt: Date
): ProactiveTrigger {
  return {
    id: `exercise-followup-${completedAt.getTime()}`,
    type: 'check_in_after_exercise',
    title: `How did ${exerciseName} feel?`,
    message: 'Want to reflect on what came up during the exercise?',
    chatContext: `The user just completed the "${exerciseName}" exercise. Ask how it went, what they noticed, and if anything came up that they'd like to explore further. Be curious and supportive.`,
    priority: 'low',
    detectedAt: completedAt,
    expiresAt: addDays(completedAt, 1),
  };
}
