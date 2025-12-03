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
