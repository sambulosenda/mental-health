import { useState, useCallback, useEffect } from 'react';
import type { MoodEntry, DailyMoodSummary } from '@/src/types/mood';
import type { JournalEntry } from '@/src/types/journal';
import type { Insight } from '@/src/components/insights/InsightCard';
import { buildPrivacySafeInsightsPrompt } from './prompts';
import { callGroqAPI, hasGroqApiKey } from './groq';

export type AIState = 'idle' | 'loading' | 'generating' | 'ready' | 'error';

interface UseAIInsightsOptions {
  moodEntries: MoodEntry[];
  moodSummaries: DailyMoodSummary[];
  journalEntries: JournalEntry[];
}

interface UseAIInsightsReturn {
  state: AIState;
  insights: Insight[];
  error: string | null;
  isModelReady: boolean;
  generateInsights: () => Promise<void>;
}

// Fallback insights when LLM is unavailable
function getFallbackInsights(moodEntries: MoodEntry[]): Insight[] {
  const insights: Insight[] = [];

  if (moodEntries.length >= 3) {
    const avgMood = moodEntries.reduce((sum, e) => sum + e.mood, 0) / moodEntries.length;

    if (avgMood >= 4) {
      insights.push({
        id: `fallback-insight-${Date.now()}-1`,
        type: 'pattern',
        title: 'Positive Trend',
        description: "You've been feeling good lately! Keep doing what works for you.",
        priority: 'medium',
        isAIGenerated: true,
      });
    } else if (avgMood <= 2.5) {
      insights.push({
        id: `fallback-insight-${Date.now()}-1`,
        type: 'pattern',
        title: 'Check In With Yourself',
        description: "It seems like things have been tough recently. Remember to be kind to yourself.",
        priority: 'high',
        isAIGenerated: true,
      });
    } else {
      insights.push({
        id: `fallback-insight-${Date.now()}-1`,
        type: 'pattern',
        title: 'Balanced Days',
        description: "Your mood has been relatively steady. Notice what helps maintain this balance.",
        priority: 'medium',
        isAIGenerated: true,
      });
    }

    insights.push({
      id: `fallback-suggestion-${Date.now()}-1`,
      type: 'suggestion',
      title: 'Suggestion',
      description: 'Try journaling about what made you feel your best this week.',
      icon: 'bulb-outline',
      priority: 'high',
      isAIGenerated: true,
    });
  }

  return insights;
}

function parseInsightsFromResponse(response: string): Insight[] {
  const insights: Insight[] = [];

  // Parse INSIGHT/SUGGESTION pairs
  const insightMatches = response.matchAll(/INSIGHT:\s*(.+?)(?=SUGGESTION:|INSIGHT:|$)/gi);
  const suggestionMatches = response.matchAll(/SUGGESTION:\s*(.+?)(?=INSIGHT:|SUGGESTION:|$)/gi);

  const insightTexts = Array.from(insightMatches).map(m => m[1].trim());
  const suggestionTexts = Array.from(suggestionMatches).map(m => m[1].trim());

  // Create insight objects
  insightTexts.forEach((text, i) => {
    if (text) {
      insights.push({
        id: `ai-insight-${Date.now()}-${i}`,
        type: 'pattern',
        title: 'AI Insight',
        description: text,
        priority: 'medium',
        isAIGenerated: true,
      });
    }
  });

  suggestionTexts.forEach((text, i) => {
    if (text) {
      insights.push({
        id: `ai-suggestion-${Date.now()}-${i}`,
        type: 'suggestion',
        title: 'Suggestion',
        description: text,
        icon: 'bulb-outline',
        priority: 'high',
        isAIGenerated: true,
      });
    }
  });

  // Fallback: if no structured format found, treat whole response as insight
  if (insights.length === 0 && response.trim()) {
    insights.push({
      id: `ai-insight-${Date.now()}`,
      type: 'pattern',
      title: 'AI Analysis',
      description: response.trim().slice(0, 200),
      priority: 'medium',
      isAIGenerated: true,
    });
  }

  return insights;
}

export function useAIInsights(options: UseAIInsightsOptions): UseAIInsightsReturn {
  const { moodEntries, moodSummaries } = options;

  const [state, setState] = useState<AIState>('idle');
  const [insights, setInsights] = useState<Insight[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isModelReady, setIsModelReady] = useState(false);

  // Check readiness on mount
  useEffect(() => {
    setIsModelReady(true);
    setState('ready');
  }, []);

  const generateInsights = useCallback(async () => {
    if (!isModelReady) {
      setError('AI is still loading. Please wait.');
      return;
    }

    if (moodEntries.length < 3) {
      setError('Need at least 3 mood entries for AI analysis.');
      return;
    }

    setState('generating');
    setError(null);

    // Check for API key
    const hasKey = hasGroqApiKey();

    if (!hasKey) {
      // No API key - use fallback insights
      const fallbackInsights = getFallbackInsights(moodEntries);
      setInsights(fallbackInsights);
      setState('ready');
      return;
    }

    try {
      // Build privacy-safe prompt (no personal content)
      const prompt = buildPrivacySafeInsightsPrompt(moodEntries, moodSummaries);

      const response = await callGroqAPI(
        [{ role: 'user', content: prompt }],
        { maxTokens: 512, temperature: 0.7 }
      );

      // Parse the response
      const parsedInsights = parseInsightsFromResponse(response);

      if (parsedInsights.length > 0) {
        setInsights(parsedInsights);
      } else {
        // Fallback if parsing failed
        setInsights(getFallbackInsights(moodEntries));
      }
      setState('ready');
    } catch (err) {
      if (__DEV__) console.warn('AI insights generation failed, using fallback:', err);
      const fallbackInsights = getFallbackInsights(moodEntries);
      setInsights(fallbackInsights);
      setState('ready');
    }
  }, [isModelReady, moodEntries, moodSummaries]);

  return {
    state,
    insights,
    error,
    isModelReady,
    generateInsights,
  };
}

export { buildWellnessPrompt, buildQuickInsightPrompt } from './prompts';
