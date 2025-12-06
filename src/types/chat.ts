export type ConversationType = 'chat' | 'checkin';
export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export interface ChatConversation {
  id: string;
  type: ConversationType;
  title?: string;
  linkedMoodId?: string;
  startedAt: Date;
  endedAt?: Date;
  metadata?: ChatConversationMetadata;
  messages?: ChatMessage[];
}

export interface ChatConversationMetadata {
  primaryEmotion?: string;
  emotionsDiscussed?: string[];
  summary?: string;
  suggestedMood?: 1 | 2 | 3 | 4 | 5;
}

export type CheckinStep = 'greeting' | 'emotion' | 'context' | 'support' | 'summary';

export interface CheckinFlow {
  step: CheckinStep;
  detectedMood?: 1 | 2 | 3 | 4 | 5;
  emotion?: string;
  context?: string;
}
