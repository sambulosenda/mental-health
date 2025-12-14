import { useState, useCallback, useRef, useEffect } from 'react';
import type { ChatMessage } from '@/src/types/chat';
import type { MoodEntry } from '@/src/types/mood';
import type { JournalEntry } from '@/src/types/journal';
import type { ExerciseSession } from '@/src/types/exercise';
import { callGroqAPI, hasGroqApiKey, type ChatMessage as GroqMessage } from './groq';
import { CHAT_COMPANION_SYSTEM_PROMPT, CHECKIN_SYSTEM_PROMPT, buildPrivacySafeContext } from './chatPrompts';

export type ChatAIState = 'idle' | 'loading' | 'ready' | 'generating' | 'error';

interface UseAIChatOptions {
  isCheckin?: boolean;
  moodEntries?: MoodEntry[];
  journalEntries?: JournalEntry[];
  exerciseSessions?: ExerciseSession[];
}

interface UseAIChatReturn {
  state: ChatAIState;
  isModelReady: boolean;
  error: string | null;
  generateResponse: (messages: ChatMessage[]) => Promise<string>;
  response: string;
  hasApiKey: boolean;
}

// Fallback responses for when API is unavailable
const FALLBACK_RESPONSES = {
  greeting: "Hi there! I'm here to support you. How are you feeling today?",
  checkin: "I'd love to hear how you're doing. What's on your mind?",
  default: "I hear you. Thank you for sharing that with me. How does that make you feel?",
  support: "That sounds challenging. Remember, it's okay to feel this way. What would help you right now?",
  noApiKey: "To chat with me, please add your Groq API key in Settings. It's free to get one at console.groq.com!",
};

function getFallbackResponse(messages: ChatMessage[], isCheckin: boolean): string {
  if (messages.length === 0) {
    return isCheckin ? FALLBACK_RESPONSES.checkin : FALLBACK_RESPONSES.greeting;
  }

  const lastMessage = messages[messages.length - 1];
  const content = lastMessage.content.toLowerCase();

  if (content.includes('stress') || content.includes('anxious') || content.includes('worried')) {
    return FALLBACK_RESPONSES.support;
  }

  return FALLBACK_RESPONSES.default;
}

export function useAIChat(options: UseAIChatOptions = {}): UseAIChatReturn {
  const { isCheckin = false, moodEntries = [], journalEntries = [], exerciseSessions = [] } = options;

  const [state, setState] = useState<ChatAIState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isModelReady, setIsModelReady] = useState(false);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);
  const responseRef = useRef<string>('');

  // Check for API key on mount
  useEffect(() => {
    const hasKey = hasGroqApiKey();
    setApiKeyConfigured(hasKey);
    setIsModelReady(true);
    setState('ready');
  }, []);

  const generateResponse = useCallback(
    async (messages: ChatMessage[]): Promise<string> => {
      if (!isModelReady) {
        setError('AI is still loading. Please wait.');
        return '';
      }

      setState('generating');
      setError(null);
      responseRef.current = '';

      // Check for API key
      const hasKey = hasGroqApiKey();

      if (!hasKey) {
        // No API key - use fallback
        const fallback = getFallbackResponse(messages, isCheckin);
        responseRef.current = fallback;
        setState('ready');
        return fallback;
      }

      try {
        // Build system prompt with privacy-safe context
        const basePrompt = isCheckin ? CHECKIN_SYSTEM_PROMPT : CHAT_COMPANION_SYSTEM_PROMPT;
        const context = buildPrivacySafeContext(moodEntries, journalEntries, exerciseSessions);
        const systemPrompt = basePrompt + context;

        // Convert messages to Groq format
        const groqMessages: GroqMessage[] = [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
        ];

        const response = await callGroqAPI(groqMessages, {
          maxTokens: 200,  // Allow longer, warmer responses (1-3 sentences)
          temperature: 0.7,
        });

        responseRef.current = response;
        setState('ready');
        return response;
      } catch (err) {
        if (__DEV__) console.error('Groq API error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to get response';
        setError(errorMessage);

        // Fall back to simple response on error
        const fallback = getFallbackResponse(messages, isCheckin);
        responseRef.current = fallback;
        setState('ready');
        return fallback;
      }
    },
    [isModelReady, isCheckin, moodEntries, journalEntries, exerciseSessions]
  );

  return {
    state,
    isModelReady,
    error,
    generateResponse,
    response: responseRef.current,
    hasApiKey: apiKeyConfigured,
  };
}
