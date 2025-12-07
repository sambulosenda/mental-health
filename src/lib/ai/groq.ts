import Constants from 'expo-constants';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Default model - LLaMA 3.3 70B is best for nuanced conversation
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

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

// Call Groq API
export async function callGroqAPI(
  messages: ChatMessage[],
  options: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  } = {}
): Promise<string> {
  const apiKey = getGroqApiKey();

  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    throw new Error('Groq API key not configured.');
  }

  const { model = DEFAULT_MODEL, maxTokens = 256, temperature = 0.7 } = options;

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
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
  return data.choices[0]?.message?.content || '';
}
