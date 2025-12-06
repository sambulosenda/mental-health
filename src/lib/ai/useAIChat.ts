import { useState, useCallback, useRef, useEffect } from 'react';
import type { ChatMessage } from '@/src/types/chat';
import type { MoodEntry } from '@/src/types/mood';
import type { JournalEntry } from '@/src/types/journal';

export type ChatAIState = 'idle' | 'loading' | 'ready' | 'generating' | 'error';

interface UseAIChatOptions {
  isCheckin?: boolean;
  moodEntries?: MoodEntry[];
  journalEntries?: JournalEntry[];
}

interface UseAIChatReturn {
  state: ChatAIState;
  isModelReady: boolean;
  error: string | null;
  generateResponse: (messages: ChatMessage[]) => Promise<string>;
  response: string;
}

// Fallback responses for when LLM is unavailable
const FALLBACK_RESPONSES = {
  greeting: "Hi there! I'm here to support you. How are you feeling today?",
  checkin: "I'd love to hear how you're doing. What's on your mind?",
  default: "I hear you. Thank you for sharing that with me. How does that make you feel?",
  support: "That sounds challenging. Remember, it's okay to feel this way. What would help you right now?",
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
  const { isCheckin = false } = options;

  const [state, setState] = useState<ChatAIState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isModelReady, setIsModelReady] = useState(false);
  const responseRef = useRef<string>('');

  // TODO: LLM integration requires hook-compatible architecture (see issue #42)
  // For now, use fallback responses. useLLM from react-native-executorch cannot
  // be called dynamically; needs a wrapper component or context provider pattern.
  useEffect(() => {
    setIsModelReady(true);
    setState('ready');
  }, []);

  const generateResponse = useCallback(
    async (messages: ChatMessage[]): Promise<string> => {
      if (!isModelReady) {
        setError('AI model is still loading. Please wait.');
        return '';
      }

      setState('generating');
      setError(null);
      responseRef.current = '';

      // Simulate a brief delay for more natural feel
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

      const fallbackResponse = getFallbackResponse(messages, isCheckin);
      responseRef.current = fallbackResponse;
      setState('ready');
      return fallbackResponse;
    },
    [isModelReady, isCheckin]
  );

  return {
    state,
    isModelReady,
    error,
    generateResponse,
    response: responseRef.current,
  };
}
