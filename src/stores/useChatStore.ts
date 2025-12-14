import { create } from 'zustand';
import type {
  ChatMessage,
  ChatConversation,
  ConversationType,
  CheckinStep,
  CheckinFlow,
  ChatConversationMetadata,
} from '@/src/types/chat';
import {
  createConversation,
  endConversation,
  addMessage,
  getConversation,
  getConversationMessages,
  getRecentConversations,
  deleteConversation,
  updateConversationMetadata,
  createMoodAndLinkConversation,
} from '@/src/lib/database';
import { inferMoodFromConversation } from '@/src/lib/ai/chatPrompts';

interface ChatState {
  // Current conversation
  activeConversation: ChatConversation | null;
  messages: ChatMessage[];
  isGenerating: boolean;
  error: string | null;

  // Check-in flow state
  checkinFlow: CheckinFlow | null;

  // History
  recentConversations: ChatConversation[];

  // Actions
  startConversation: (type: ConversationType) => Promise<ChatConversation>;
  endActiveConversation: (metadata?: ChatConversationMetadata) => Promise<void>;
  addUserMessage: (content: string) => Promise<ChatMessage>;
  addAssistantMessage: (content: string) => Promise<ChatMessage>;
  setGenerating: (isGenerating: boolean) => void;
  setError: (error: string | null) => void;

  // Check-in flow actions
  startCheckin: () => Promise<ChatConversation>;
  advanceCheckinStep: () => void;
  completeCheckin: (logMood: boolean) => Promise<string | null>;

  // History actions
  loadRecentConversations: () => Promise<void>;
  loadConversation: (id: string) => Promise<void>;
  removeConversation: (id: string) => Promise<void>;

  // Reset
  reset: () => void;
}

const CHECKIN_STEPS: CheckinStep[] = ['greeting', 'emotion', 'context', 'support', 'summary'];

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  activeConversation: null,
  messages: [],
  isGenerating: false,
  error: null,
  checkinFlow: null,
  recentConversations: [],

  // Start a new conversation
  startConversation: async (type) => {
    set({ error: null, messages: [], checkinFlow: null });

    try {
      const conversation = await createConversation(type);
      set({ activeConversation: conversation });
      return conversation;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start conversation';
      set({ error: message });
      throw error;
    }
  },

  // End the active conversation
  endActiveConversation: async (metadata) => {
    const { activeConversation } = get();
    if (!activeConversation) return;

    try {
      await endConversation(activeConversation.id, metadata);
      set({ activeConversation: null, messages: [], checkinFlow: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to end conversation';
      set({ error: message });
    }
  },

  // Add a user message
  addUserMessage: async (content) => {
    const { activeConversation } = get();
    if (!activeConversation) {
      throw new Error('No active conversation');
    }

    try {
      const chatMessage = await addMessage({
        conversationId: activeConversation.id,
        role: 'user',
        content,
      });

      set((state) => ({
        messages: [...state.messages, chatMessage],
      }));

      return chatMessage;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add message';
      set({ error: message });
      throw error;
    }
  },

  // Add an assistant message
  addAssistantMessage: async (content) => {
    const { activeConversation } = get();
    if (!activeConversation) {
      throw new Error('No active conversation');
    }

    try {
      const chatMessage = await addMessage({
        conversationId: activeConversation.id,
        role: 'assistant',
        content,
      });

      set((state) => ({
        messages: [...state.messages, chatMessage],
      }));

      return chatMessage;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add message';
      set({ error: message });
      throw error;
    }
  },

  setGenerating: (isGenerating) => set({ isGenerating }),
  setError: (error) => set({ error }),

  // Start a check-in flow
  startCheckin: async () => {
    const conversation = await get().startConversation('checkin');
    set({
      checkinFlow: {
        step: 'greeting',
      },
    });
    return conversation;
  },

  // Advance to next check-in step
  advanceCheckinStep: () => {
    const { checkinFlow, messages } = get();
    if (!checkinFlow) return;

    const currentIndex = CHECKIN_STEPS.indexOf(checkinFlow.step);
    const nextIndex = currentIndex + 1;

    if (nextIndex < CHECKIN_STEPS.length) {
      // Infer mood from conversation so far
      const detectedMood = inferMoodFromConversation(messages);

      // Get the latest user message as context
      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');

      set({
        checkinFlow: {
          ...checkinFlow,
          step: CHECKIN_STEPS[nextIndex],
          detectedMood,
          context: lastUserMessage?.content,
        },
      });
    }
  },

  // Complete the check-in and optionally log mood
  completeCheckin: async (logMood) => {
    const { activeConversation, messages, checkinFlow } = get();
    if (!activeConversation) return null;

    try {
      const detectedMood = checkinFlow?.detectedMood || inferMoodFromConversation(messages);

      let moodId: string | null = null;

      if (logMood) {
        // Atomically create mood entry and link to conversation
        const moodEntry = await createMoodAndLinkConversation(activeConversation.id, {
          mood: detectedMood,
          note: `Check-in conversation`,
        });
        moodId = moodEntry.id;
      }

      // Update conversation metadata
      const metadata: ChatConversationMetadata = {
        suggestedMood: detectedMood,
        summary: messages.slice(-2).map(m => m.content.slice(0, 50)).join(' | '),
      };
      await updateConversationMetadata(activeConversation.id, metadata);

      // End the conversation
      await get().endActiveConversation(metadata);

      return moodId;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to complete check-in';
      set({ error: message });
      return null;
    }
  },

  // Load recent conversations
  loadRecentConversations: async () => {
    try {
      const conversations = await getRecentConversations(10);
      set({ recentConversations: conversations });
    } catch (error) {
      if (__DEV__) console.error('Failed to load conversations:', error);
    }
  },

  // Load a specific conversation
  loadConversation: async (id) => {
    set({ error: null });

    try {
      const conversation = await getConversation(id);
      if (!conversation) {
        set({ error: 'Conversation not found' });
        return;
      }

      const messages = await getConversationMessages(id);
      set({
        activeConversation: conversation,
        messages,
        checkinFlow: conversation.type === 'checkin' ? { step: 'summary' } : null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load conversation';
      set({ error: message });
    }
  },

  // Remove a conversation
  removeConversation: async (id) => {
    try {
      await deleteConversation(id);
      set((state) => ({
        recentConversations: state.recentConversations.filter(c => c.id !== id),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete conversation';
      set({ error: message });
    }
  },

  // Reset state
  reset: () => {
    set({
      activeConversation: null,
      messages: [],
      isGenerating: false,
      error: null,
      checkinFlow: null,
    });
  },
}));
