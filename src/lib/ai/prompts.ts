import type { MoodEntry, DailyMoodSummary } from '@/src/types/mood';
import type { JournalEntry } from '@/src/types/journal';
import { activityTags } from '@/src/constants/theme';

const MOOD_LABELS = ['Very Low', 'Low', 'Neutral', 'Good', 'Great'];

function formatMoodData(entries: MoodEntry[], summaries: DailyMoodSummary[]): string {
  if (entries.length === 0) {
    return 'No mood data available.';
  }

  const recentEntries = entries.slice(0, 10);
  const avgMood = entries.reduce((sum, e) => sum + e.mood, 0) / entries.length;

  // Activity frequency
  const activityCounts: Record<string, number> = {};
  entries.forEach(e => {
    e.activities.forEach(a => {
      activityCounts[a] = (activityCounts[a] || 0) + 1;
    });
  });

  const topActivities = Object.entries(activityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => {
      const tag = activityTags.find(t => t.id === id);
      return `${tag?.label || id}: ${count} times`;
    });

  return `
Recent mood tracking (last ${entries.length} entries):
- Average mood: ${avgMood.toFixed(1)}/5 (${MOOD_LABELS[Math.round(avgMood) - 1]})
- Days tracked: ${summaries.length}
- Top activities: ${topActivities.join(', ') || 'None recorded'}

Recent entries:
${recentEntries.map(e => {
  const date = new Date(e.timestamp).toLocaleDateString();
  const activities = e.activities.map(a => activityTags.find(t => t.id === a)?.label || a).join(', ');
  return `- ${date}: Mood ${e.mood}/5${activities ? `, Activities: ${activities}` : ''}${e.note ? `, Note: "${e.note.slice(0, 50)}"` : ''}`;
}).join('\n')}
`.trim();
}

function formatJournalData(entries: JournalEntry[]): string {
  if (entries.length === 0) {
    return 'No journal entries available.';
  }

  const recentEntries = entries.slice(0, 5);

  return `
Recent journal entries (${entries.length} total):
${recentEntries.map(e => {
  const date = new Date(e.createdAt).toLocaleDateString();
  const preview = e.content.slice(0, 100).replace(/\n/g, ' ');
  return `- ${date}${e.title ? ` "${e.title}"` : ''}: "${preview}..."${e.mood ? ` (Mood: ${e.mood}/5)` : ''}`;
}).join('\n')}
`.trim();
}

export function buildWellnessPrompt(
  moodEntries: MoodEntry[],
  moodSummaries: DailyMoodSummary[],
  journalEntries: JournalEntry[]
): string {
  const moodData = formatMoodData(moodEntries, moodSummaries);
  const journalData = formatJournalData(journalEntries);

  return `You are a supportive wellness assistant analyzing a user's emotional patterns. Based on their data, provide 2-3 brief, actionable insights.

USER DATA:
${moodData}

${journalData}

INSTRUCTIONS:
- Be warm and encouraging, not clinical
- Focus on patterns you notice (time of day, activities, etc.)
- Suggest one small, actionable step
- Keep each insight to 1-2 sentences
- If data is limited, acknowledge it and offer general wellness tips

Respond with insights in this format:
INSIGHT: [Your observation about their patterns]
SUGGESTION: [A small actionable recommendation]
`;
}

export function buildQuickInsightPrompt(avgMood: number, streak: number): string {
  return `Based on an average mood of ${avgMood.toFixed(1)}/5 and a ${streak}-day tracking streak, give ONE brief encouraging message (max 20 words).`;
}

// Privacy-safe insights prompt (no personal content sent to cloud)
export function buildPrivacySafeInsightsPrompt(
  moodEntries: MoodEntry[],
  moodSummaries: DailyMoodSummary[]
): string {
  if (moodEntries.length === 0) {
    return '';
  }

  const avgMood = moodEntries.reduce((sum, e) => sum + e.mood, 0) / moodEntries.length;

  // Calculate trend
  let trend = 'stable';
  if (moodEntries.length >= 3) {
    const recent = moodEntries.slice(0, 3).reduce((s, e) => s + e.mood, 0) / 3;
    const older = moodEntries.slice(-3).reduce((s, e) => s + e.mood, 0) / 3;
    if (recent - older > 0.5) trend = 'improving';
    else if (older - recent > 0.5) trend = 'declining';
  }

  // Activity frequency (patterns only, no content)
  const activityCounts: Record<string, number> = {};
  const activityMoodSum: Record<string, { sum: number; count: number }> = {};

  moodEntries.forEach(e => {
    e.activities.forEach(a => {
      activityCounts[a] = (activityCounts[a] || 0) + 1;
      if (!activityMoodSum[a]) activityMoodSum[a] = { sum: 0, count: 0 };
      activityMoodSum[a].sum += e.mood;
      activityMoodSum[a].count += 1;
    });
  });

  const topActivities = Object.entries(activityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => {
      const tag = activityTags.find(t => t.id === id);
      const avgMoodForActivity = activityMoodSum[id].sum / activityMoodSum[id].count;
      return `${tag?.label || id} (${count}x, avg mood ${avgMoodForActivity.toFixed(1)})`;
    });

  // Mood by time of day
  const morningMoods: number[] = [];
  const afternoonMoods: number[] = [];
  const eveningMoods: number[] = [];

  moodEntries.forEach(e => {
    const hour = new Date(e.timestamp).getHours();
    if (hour >= 5 && hour < 12) morningMoods.push(e.mood);
    else if (hour >= 12 && hour < 17) afternoonMoods.push(e.mood);
    else eveningMoods.push(e.mood);
  });

  const timePatterns: string[] = [];
  if (morningMoods.length >= 2) {
    timePatterns.push(`Morning avg: ${(morningMoods.reduce((a, b) => a + b, 0) / morningMoods.length).toFixed(1)}`);
  }
  if (afternoonMoods.length >= 2) {
    timePatterns.push(`Afternoon avg: ${(afternoonMoods.reduce((a, b) => a + b, 0) / afternoonMoods.length).toFixed(1)}`);
  }
  if (eveningMoods.length >= 2) {
    timePatterns.push(`Evening avg: ${(eveningMoods.reduce((a, b) => a + b, 0) / eveningMoods.length).toFixed(1)}`);
  }

  return `You are a supportive wellness assistant. Analyze this mood data and provide 2-3 personalized insights.

USER MOOD PATTERNS:
- Entries tracked: ${moodEntries.length} over ${moodSummaries.length} days
- Average mood: ${avgMood.toFixed(1)}/5 (${MOOD_LABELS[Math.round(avgMood) - 1]})
- Trend: ${trend}
- Activities with mood correlation: ${topActivities.join(', ') || 'None recorded'}
${timePatterns.length > 0 ? `- Time patterns: ${timePatterns.join(', ')}` : ''}

INSTRUCTIONS:
- Be warm and encouraging, not clinical
- Focus on patterns (activities that correlate with better mood, time of day patterns)
- Suggest one small, actionable step based on what seems to work for them
- Keep each insight to 1-2 sentences
- Don't make assumptions about WHY patterns exist, just note them

Respond in this exact format:
INSIGHT: [Your observation about their patterns]
SUGGESTION: [A small actionable recommendation]
INSIGHT: [Another observation if relevant]
SUGGESTION: [Another recommendation]`;
}
