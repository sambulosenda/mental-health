import Constants from 'expo-constants';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Default model - LLaMA 3.3 70B is best for nuanced conversation
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

// Word limit enforcement utilities
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

export function truncateToWordLimit(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  if (words.length <= maxWords) return text.trim();

  // Try to end at sentence boundary within limit
  const truncated = words.slice(0, maxWords).join(' ');
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('?'),
    truncated.lastIndexOf('!')
  );

  // Only use sentence boundary if it preserves >50% of content
  if (lastSentenceEnd > truncated.length * 0.5) {
    return truncated.slice(0, lastSentenceEnd + 1);
  }
  return truncated;
}

export function validateWordLimit(text: string, maxWords: number): boolean {
  return countWords(text) <= maxWords;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

// Get API key from app config (set via environment variable)
export function getGroqApiKey(): string | null {
  return Constants.expoConfig?.extra?.groqApiKey || null;
}

// Check if API key is configured
export function hasGroqApiKey(): boolean {
  const key = getGroqApiKey();
  return !!key && key !== 'your_groq_api_key_here';
}

export interface WordLimitOptions {
  maxWords: number;
  enforceLimit?: boolean;  // Post-process truncate if exceeded
  retryOnViolation?: boolean;  // Retry API call if limit exceeded
  maxRetries?: number;
}

// Call Groq API with optional word limit enforcement
export async function callGroqAPI(
  messages: ChatMessage[],
  options: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    wordLimit?: WordLimitOptions;
  } = {}
): Promise<string> {
  const apiKey = getGroqApiKey();

  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    throw new Error('Groq API key not configured.');
  }

  const {
    model = DEFAULT_MODEL,
    maxTokens = 256,
    temperature = 0.7,
    wordLimit,
  } = options;

  // Use conservative max_tokens when word limit is enforced
  // ~1.5 tokens per word average, add buffer for safety
  const effectiveMaxTokens = wordLimit
    ? Math.min(maxTokens, Math.ceil(wordLimit.maxWords * 2.5))
    : maxTokens;

  const maxRetries = wordLimit?.retryOnViolation ? (wordLimit.maxRetries ?? 2) : 0;
  let lastResponse = '';

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: effectiveMaxTokens,
        temperature,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      if (response.status === 401) {
        throw new Error('Invalid API key configuration.');
      }
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      }
      throw new Error(`Groq API error: ${error}`);
    }

    const data: GroqResponse = await response.json();
    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Groq API returned empty or malformed response');
    }
    lastResponse = content;

    // Word limit validation
    if (wordLimit) {
      const wordCount = countWords(lastResponse);

      if (wordCount <= wordLimit.maxWords) {
        return lastResponse;
      }

      // Retry if enabled and not exhausted
      if (wordLimit.retryOnViolation && attempt < maxRetries) {
        console.warn(`Response exceeded ${wordLimit.maxWords} words (${wordCount}), retrying...`);
        continue;
      }

      // Enforce limit by truncation if enabled
      if (wordLimit.enforceLimit) {
        console.warn(`Truncating response from ${wordCount} to ${wordLimit.maxWords} words`);
        return truncateToWordLimit(lastResponse, wordLimit.maxWords);
      }
    }

    return lastResponse;
  }

  // Fallback: truncate if we exhausted retries
  if (wordLimit?.enforceLimit) {
    return truncateToWordLimit(lastResponse, wordLimit.maxWords);
  }

  return lastResponse;
}
