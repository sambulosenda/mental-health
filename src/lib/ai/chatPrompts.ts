import type { MoodEntry } from '@/src/types/mood';
import type { JournalEntry } from '@/src/types/journal';
import type { ChatMessage, CheckinStep } from '@/src/types/chat';
import type { ExerciseSession } from '@/src/types/exercise';
import { activityTags } from '@/src/constants/theme';
import { EXERCISE_TEMPLATES } from '@/src/constants/exercises';

const MOOD_LABELS = ['Very Low', 'Low', 'Neutral', 'Good', 'Great'];

// System prompt for free-form chat companion ("Talk it out")
export const CHAT_COMPANION_SYSTEM_PROMPT = `You are Zen. Help users process emotions through short conversations.

CRITICAL: Max 20 words per response. No exceptions.

RULES:
- 20 words max (strict!)
- One question per response
- Validate briefly → then ask ONE question

NEVER SAY (unsafe/cold phrases):
- "What's stopping you?" (ambiguous, dangerous)
- "Why haven't you..."
- "Just call..." / "You should..."

GOOD RESPONSES:
- "That sounds frustrating. What's the hardest part?"
- "I hear you. Is it more anxiety or overwhelm?"
- "Makes sense. What would help right now?"

OPENING: "Hey! What's on your mind?"

CRISIS (suicide, self-harm, wanting to die):
1. Validate first: "I'm really glad you told me."
2. Offer ONE resource based on preference:
   - Call: UK Samaritans 116 123 (free 24/7) | US 988 Suicide & Crisis Lifeline
   - Text: UK SHOUT to 85258 | US HOME to 741741
   - Chat: befrienders.org or findahelpline.com
3. Gently ask: "Can you tell me what's happening?" (NOT "what's stopping you")
4. Emergency: "If unsafe now, 999 (UK) or 911 (US)"
5. International: iasp.info/resources/Crisis_Centres
6. Stay warm, calm, non-judgmental

Be a good friend: warm, brief, no lectures.`;

// System prompt for guided check-in flow ("2-min Check-in")
export const CHECKIN_SYSTEM_PROMPT = `You are Zen. Quick 2-min mood check-in.

CRITICAL: Max 15 words per response. No exceptions.

RULES:
- 15 words max (strict!)
- One question only
- Get them to name a specific emotion

NEVER SAY: "What's stopping you?", "Why haven't you...", "Just call..."

EMOTIONS: anxious, stressed, sad, frustrated, overwhelmed, tired, calm, good, grateful, meh

CRISIS (suicide, self-harm):
1. "I'm glad you told me." + ONE resource:
   - Call: UK 116 123 | US 988
   - Text: UK SHOUT 85258 | US HOME to 741741
   - Chat: befrienders.org
2. Ask gently: "What's been happening?"
3. Emergency: "999 (UK) / 911 (US) if unsafe now"
4. More help: iasp.info/resources/Crisis_Centres`;

// Check-in flow prompts for each step
export const CHECKIN_PROMPTS: Record<CheckinStep, string | ((context: string) => string)> = {
  greeting: `Just say: "Hey! How are you feeling right now?" (10 words max, no extras)`,

  emotion: (userResponse: string) => `User: "${userResponse}"
Respond in max 12 words. Reflect + ask if it's more like [emotion A] or [emotion B]?
Example: "I hear you. More like anxious or just tired?"`,

  context: (emotion: string) => `Feeling: ${emotion}. Ask what triggered it in under 10 words.
Example: "What's behind that?" or "What happened?"`,

  support: (context: string) => `Context: "${context}"
Validate in 5 words, then ask to log mood. Example: "Makes sense. Log this mood?"
Max 12 words total.`,

  summary: (mood: string) => `Mood: ${mood}/5. Just say "Nice one!" or "Good check-in!" (5 words max)`,
};

// Build context from user's mood, journal, and exercise data
export function buildUserContext(
  moodEntries: MoodEntry[],
  journalEntries: JournalEntry[],
  exerciseSessions?: ExerciseSession[]
): string {
  if (moodEntries.length === 0 && journalEntries.length === 0 && (!exerciseSessions || exerciseSessions.length === 0)) {
    return '';
  }

  const parts: string[] = [];

  if (moodEntries.length > 0) {
    const recentMoods = moodEntries.slice(0, 7);
    const avgMood = recentMoods.reduce((sum, e) => sum + e.mood, 0) / recentMoods.length;

    // Activity frequency
    const activityCounts: Record<string, number> = {};
    recentMoods.forEach(e => {
      e.activities.forEach(a => {
        activityCounts[a] = (activityCounts[a] || 0) + 1;
      });
    });

    const topActivities = Object.entries(activityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => activityTags.find(t => t.id === id)?.label || id);

    parts.push(`Recent mood: avg ${avgMood.toFixed(1)}/5 (${MOOD_LABELS[Math.round(avgMood) - 1]}), tracked ${recentMoods.length} times this week${topActivities.length > 0 ? `, often does: ${topActivities.join(', ')}` : ''}`);
  }

  if (journalEntries.length > 0) {
    const recent = journalEntries.slice(0, 3);
    const themes = recent
      .map(e => e.content.slice(0, 50).replace(/\n/g, ' '))
      .join('; ');
    parts.push(`Recent journal themes: ${themes}`);
  }

  // Add exercise history context
  if (exerciseSessions && exerciseSessions.length > 0) {
    const completed = exerciseSessions.filter(s => s.status === 'completed');

    if (completed.length > 0) {
      // Count exercises by type
      const exerciseCounts: Record<string, number> = {};
      completed.forEach(s => {
        const template = EXERCISE_TEMPLATES.find(t => t.id === s.templateId);
        if (template) {
          exerciseCounts[template.name] = (exerciseCounts[template.name] || 0) + 1;
        }
      });

      const topExercises = Object.entries(exerciseCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([name, count]) => `${name} (${count}x)`);

      // Calculate average mood improvement
      const withMoodData = completed.filter(s => s.moodBefore && s.moodAfter);
      let moodImpact = '';
      if (withMoodData.length >= 2) {
        const avgDelta = withMoodData.reduce((sum, s) =>
          sum + ((s.moodAfter || 0) - (s.moodBefore || 0)), 0) / withMoodData.length;
        if (avgDelta > 0.3) {
          moodImpact = `, exercises typically improve mood by +${avgDelta.toFixed(1)}`;
        }
      }

      // Get recent exercise insights (from thought records, gratitude, etc.)
      const recentWithResponses = completed
        .filter(s => s.responses && Object.keys(s.responses).length > 0)
        .slice(0, 3);

      let exerciseInsights = '';
      if (recentWithResponses.length > 0) {
        const insights: string[] = [];
        recentWithResponses.forEach(s => {
          const template = EXERCISE_TEMPLATES.find(t => t.id === s.templateId);
          if (!template) return;

          // Extract key insights based on exercise type
          if (template.id === 'thought-record') {
            // Include situation, automatic thought, and balanced thought
            if (s.responses['situation']) {
              const text = String(s.responses['situation']).slice(0, 40);
              insights.push(`situation: "${text}${String(s.responses['situation']).length > 40 ? '...' : ''}"`);
            }
            if (s.responses['automatic-thoughts']) {
              const text = String(s.responses['automatic-thoughts']).slice(0, 50);
              insights.push(`thought pattern: "${text}${String(s.responses['automatic-thoughts']).length > 50 ? '...' : ''}"`);
            }
            if (s.responses['balanced-thought']) {
              const text = String(s.responses['balanced-thought']).slice(0, 60);
              insights.push(`reframed to: "${text}${String(s.responses['balanced-thought']).length > 60 ? '...' : ''}"`);
            }
          } else if (template.id === 'gratitude-list') {
            const items = s.responses['gratitude-items'];
            if (Array.isArray(items) && items.length > 0) {
              insights.push(`grateful for: ${items.slice(0, 3).join(', ')}`);
            }
            if (s.responses['why']) {
              const text = String(s.responses['why']).slice(0, 50);
              insights.push(`meaningful because: "${text}${String(s.responses['why']).length > 50 ? '...' : ''}"`);
            }
          } else if (template.id === 'box-breathing' && s.responses['reflection']) {
            const text = String(s.responses['reflection']).slice(0, 50);
            insights.push(`after breathing: "${text}${String(s.responses['reflection']).length > 50 ? '...' : ''}"`);
          } else if (template.id === 'grounding-54321') {
            // Summarize grounding observations
            const senses: string[] = [];
            if (s.responses['see'] && Array.isArray(s.responses['see'])) {
              senses.push(`saw ${s.responses['see'].slice(0, 2).join(', ')}`);
            }
            if (s.responses['touch'] && Array.isArray(s.responses['touch'])) {
              senses.push(`felt ${s.responses['touch'].slice(0, 1).join('')}`);
            }
            if (senses.length > 0) {
              insights.push(`grounded by: ${senses.join('; ')}`);
            }
          }
        });
        if (insights.length > 0) {
          exerciseInsights = `. Recent reflections: ${insights.join('; ')}`;
        }
      }

      const favoritesStr = topExercises.length > 0 ? `, uses ${topExercises.join(', ')}` : '';
      parts.push(`Exercises: completed ${completed.length} total${favoritesStr}${moodImpact}${exerciseInsights}`);
    }
  }

  return parts.length > 0
    ? `\n\nUSER CONTEXT (use naturally, don't list back):\n${parts.join('\n')}`
    : '';
}

// Build privacy-safe context (no sensitive text, only patterns)
// Use this when sending to cloud APIs
export function buildPrivacySafeContext(
  moodEntries: MoodEntry[],
  journalEntries: JournalEntry[],
  exerciseSessions?: ExerciseSession[]
): string {
  if (moodEntries.length === 0 && journalEntries.length === 0 && (!exerciseSessions || exerciseSessions.length === 0)) {
    return '';
  }

  const parts: string[] = [];

  if (moodEntries.length > 0) {
    const recentMoods = moodEntries.slice(0, 7);
    const avgMood = recentMoods.reduce((sum, e) => sum + e.mood, 0) / recentMoods.length;

    // Activity frequency (no content, just patterns)
    const activityCounts: Record<string, number> = {};
    recentMoods.forEach(e => {
      e.activities.forEach(a => {
        activityCounts[a] = (activityCounts[a] || 0) + 1;
      });
    });

    const topActivities = Object.entries(activityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => activityTags.find(t => t.id === id)?.label || id);

    // Mood trend
    let trend = 'stable';
    if (recentMoods.length >= 3) {
      const recent = recentMoods.slice(0, 3).reduce((s, e) => s + e.mood, 0) / 3;
      const older = recentMoods.slice(-3).reduce((s, e) => s + e.mood, 0) / 3;
      if (recent - older > 0.5) trend = 'improving';
      else if (older - recent > 0.5) trend = 'declining';
    }

    parts.push(`Mood: avg ${avgMood.toFixed(1)}/5 (${MOOD_LABELS[Math.round(avgMood) - 1]}), trend ${trend}, tracked ${recentMoods.length} times${topActivities.length > 0 ? `, activities: ${topActivities.join(', ')}` : ''}`);
  }

  if (journalEntries.length > 0) {
    // Only count, no content
    parts.push(`Journaling: ${journalEntries.length} entries recently`);
  }

  if (exerciseSessions && exerciseSessions.length > 0) {
    const completed = exerciseSessions.filter(s => s.status === 'completed');

    if (completed.length > 0) {
      // Count by type (no content)
      const exerciseCounts: Record<string, number> = {};
      completed.forEach(s => {
        const template = EXERCISE_TEMPLATES.find(t => t.id === s.templateId);
        if (template) {
          exerciseCounts[template.name] = (exerciseCounts[template.name] || 0) + 1;
        }
      });

      const topExercises = Object.entries(exerciseCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, count]) => `${name} (${count}x)`);

      // Mood improvement stats only
      const withMoodData = completed.filter(s => s.moodBefore && s.moodAfter);
      let moodImpact = '';
      if (withMoodData.length >= 2) {
        const avgDelta = withMoodData.reduce((sum, s) =>
          sum + ((s.moodAfter || 0) - (s.moodBefore || 0)), 0) / withMoodData.length;
        if (avgDelta > 0.3) {
          moodImpact = `, avg mood improvement: +${avgDelta.toFixed(1)}`;
        }
      }

      const favoritesStr = topExercises.length > 0 ? `, favorites: ${topExercises.join(', ')}` : '';
      parts.push(`Exercises: ${completed.length} completed${favoritesStr}${moodImpact}`);
    }
  }

  return parts.length > 0
    ? `\n\nUSER CONTEXT:\n${parts.join('\n')}`
    : '';
}

// Build messages array for LLM
export function buildChatMessages(
  messages: ChatMessage[],
  systemPrompt: string,
  userContext: string
): { role: string; content: string }[] {
  return [
    { role: 'system', content: systemPrompt + userContext },
    ...messages.map(m => ({ role: m.role, content: m.content })),
  ];
}

// Get check-in prompt for current step
export function getCheckinPrompt(step: CheckinStep, context?: string): string {
  const prompt = CHECKIN_PROMPTS[step];
  if (typeof prompt === 'function') {
    return prompt(context || '');
  }
  return prompt;
}

// Infer mood from conversation (simple keyword matching)
export function inferMoodFromConversation(messages: ChatMessage[]): 1 | 2 | 3 | 4 | 5 {
  const userMessages = messages
    .filter(m => m.role === 'user')
    .map(m => m.content.toLowerCase())
    .join(' ');

  // Simple keyword scoring
  const positiveWords = ['happy', 'great', 'good', 'wonderful', 'excited', 'grateful', 'joy', 'peaceful', 'calm', 'love'];
  const negativeWords = ['sad', 'anxious', 'stressed', 'worried', 'angry', 'frustrated', 'tired', 'exhausted', 'overwhelmed', 'bad', 'terrible', 'awful'];
  const neutralWords = ['okay', 'fine', 'alright', 'meh', 'neutral'];

  let score = 3; // Start neutral

  positiveWords.forEach(word => {
    if (userMessages.includes(word)) score += 0.5;
  });

  negativeWords.forEach(word => {
    if (userMessages.includes(word)) score -= 0.5;
  });

  neutralWords.forEach(word => {
    if (userMessages.includes(word)) score = 3;
  });

  // Clamp to 1-5 range
  return Math.max(1, Math.min(5, Math.round(score))) as 1 | 2 | 3 | 4 | 5;
}
