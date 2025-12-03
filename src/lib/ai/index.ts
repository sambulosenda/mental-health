import { useState, useCallback } from 'react';
import { useLLM, LLAMA3_2_1B } from 'react-native-executorch';
import type { MoodEntry, DailyMoodSummary } from '@/src/types/mood';
import type { JournalEntry } from '@/src/types/journal';
import type { Insight } from '@/src/components/insights/InsightCard';
import { buildWellnessPrompt } from './prompts';

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
    });
  }

  return insights;
}

export function useAIInsights(options: UseAIInsightsOptions): UseAIInsightsReturn {
  const { moodEntries, moodSummaries, journalEntries } = options;

  const [state, setState] = useState<AIState>('idle');
  const [insights, setInsights] = useState<Insight[]>([]);
  const [error, setError] = useState<string | null>(null);

  const llm = useLLM({
    model: LLAMA3_2_1B,
    onDownloadProgress: (progress) => {
      if (progress < 1) {
        setState('loading');
      }
    },
  });

  const isModelReady = llm.isReady;

  const generateInsights = useCallback(async () => {
    if (!isModelReady) {
      setError('AI model is still loading. Please wait.');
      return;
    }

    if (moodEntries.length < 3) {
      setError('Need at least 3 mood entries for AI analysis.');
      return;
    }

    setState('generating');
    setError(null);

    try {
      const prompt = buildWellnessPrompt(moodEntries, moodSummaries, journalEntries);

      await llm.generate([
        {
          role: 'system',
          content: 'You are a supportive wellness assistant. Be brief, warm, and actionable.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ]);

      const response = llm.response;
      const parsedInsights = parseInsightsFromResponse(response);

      setInsights(parsedInsights);
      setState('ready');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate insights';
      setError(message);
      setState('error');
    }
  }, [isModelReady, moodEntries, moodSummaries, journalEntries, llm]);

  return {
    state,
    insights,
    error,
    isModelReady,
    generateInsights,
  };
}

export { buildWellnessPrompt, buildQuickInsightPrompt } from './prompts';
