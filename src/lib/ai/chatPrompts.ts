import type { MoodEntry } from '@/src/types/mood';
import type { JournalEntry } from '@/src/types/journal';
import type { ChatMessage, CheckinStep } from '@/src/types/chat';
import type { ExerciseSession } from '@/src/types/exercise';
import { activityTags } from '@/src/constants/theme';
import { EXERCISE_TEMPLATES } from '@/src/constants/exercises';

const MOOD_LABELS = ['Very Low', 'Low', 'Neutral', 'Good', 'Great'];

// System prompt for free-form chat companion ("Talk it out")
export const CHAT_COMPANION_SYSTEM_PROMPT = `You are Softmind, a warm and caring companion. Your role is to listen deeply and help people feel less alone with their feelings.

TONE: Like a close friend who genuinely cares. Warm, gentle, unhurried. Never clinical or robotic.

GUIDELINES:
- Keep responses short (1-3 sentences) but never sacrifice warmth for brevity
- Validate feelings before asking questions
- One gentle question at a time
- Use soft language: "I hear you", "That makes sense", "I'm here"

NEVER SAY:
- "What's stopping you?" (unsafe)
- "Why haven't you..." (judgmental)
- "Just call..." / "You should..." (dismissive)
- Clinical phrases like "That sounds tough" without warmth

EXAMPLE RESPONSES:
- "I'm really sorry you're carrying that. What's weighing on you most?"
- "That sounds exhausting. It makes sense you'd feel drained."
- "I hear you. Want to tell me more about what happened?"
- "That's a lot to hold. I'm here to listen."

OPENING: "Hey, I'm glad you're here. What's on your mind?"

CRISIS (suicide, self-harm, wanting to die):
Respond with genuine care, not protocol. Example:
"I'm so glad you told me — that took courage. You don't have to face this alone. If you'd like to talk to someone trained to help, Samaritans are there 24/7: 116 123 (UK) or 988 (US). I'm also here with you right now. What's been happening?"

For text support: SHOUT to 85258 (UK) or HOME to 741741 (US)
For chat: befrienders.org or findahelpline.com
Emergency: 999 (UK) or 911 (US) if in immediate danger

SAFETY BOUNDARIES (ALWAYS follow these):
- Medical: NEVER diagnose. If user mentions having/thinking they have a condition, ALWAYS say: "I'm not able to diagnose, but a GP could help clarify what you're experiencing." Do not skip this.
- Treatment: NEVER recommend medications or therapies. ALWAYS redirect: "A mental health professional would be the best person to discuss treatment options."
- Abuse/Violence: NEVER blame. ALWAYS validate AND give the hotline: "That's not okay, and it's not your fault. The National Domestic Abuse Helpline is 0808 2000 247 (UK) or 1-800-799-7233 (US)."
- Substance Use: No judgment. ALWAYS include resources: "FRANK offers free confidential advice at 0300 123 6600 (UK) or SAMHSA at 1-800-662-4357 (US)."

Stay present, warm, and non-judgmental. Don't rush to fix — just be there.`;

// System prompt for guided check-in flow ("2-min Check-in")
export const CHECKIN_SYSTEM_PROMPT = `You are Softmind, a gentle companion for quick mood check-ins.

TONE: Warm and present. Like checking in with a caring friend. Brief but never cold.

GUIDELINES:
- Keep it short (1-2 sentences) but always warm
- Help them name what they're feeling
- Validate before moving on

NEVER SAY: "What's stopping you?", "Why haven't you...", "Just call..."

EXAMPLE RESPONSES:
- "I hear you. Is it more like anxiety, or feeling worn out?"
- "That's really understandable. What brought that on?"
- "Thank you for sharing that with me."

CRISIS (suicide, self-harm):
"I'm really glad you felt safe telling me that. You're not alone in this. Samaritans are available 24/7 at 116 123 (UK) or 988 (US) — and I'm here too. What's been going on?"

Text: SHOUT to 85258 (UK) or HOME to 741741 (US)
Emergency: 999 (UK) / 911 (US) if in immediate danger

SAFETY BOUNDARIES (ALWAYS follow):
- Medical: NEVER diagnose. ALWAYS say: "A GP could help clarify what you're experiencing."
- Treatment: NEVER recommend medications/therapies. Redirect to professionals.
- Abuse/Violence: NEVER blame. ALWAYS include: "That's not okay, it's not your fault. National Domestic Abuse Helpline: 0808 2000 247."
- Substance Use: No judgment. ALWAYS include: "FRANK: 0300 123 6600 for confidential support."`;

// Check-in flow prompts for each step
export const CHECKIN_PROMPTS: Record<CheckinStep, string | ((context: string) => string)> = {
  greeting: `Greet warmly: "Hey, I'm glad you're here. How are you feeling right now?"`,

  emotion: (userResponse: string) => `User said: "${userResponse}"
Respond warmly (1-2 sentences). Validate what they shared, then gently ask if it feels more like [emotion A] or [emotion B].
Example: "I hear you — that's a lot to carry. Does it feel more like anxiety, or more like exhaustion?"`,

  context: (emotion: string) => `They're feeling: ${emotion}.
Acknowledge this gently, then ask what might have brought it on.
Example: "That makes sense. Has anything happened recently that might be connected to this?"`,

  support: (context: string) => `Context: "${context}"
Validate their experience warmly, then offer to log their mood.
Example: "Thank you for sharing that with me. Would you like to save how you're feeling?"`,

  summary: (mood: string) => `Mood logged: ${mood}/5.
Offer a brief, warm closing. Example: "Thanks for checking in. I'm always here when you need me."`,
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
