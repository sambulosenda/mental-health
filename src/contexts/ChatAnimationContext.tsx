import React, { createContext, useContext, useRef, useCallback, useState } from 'react';

interface AnimationEntry {
  role: 'user' | 'assistant';
  completed: boolean;
  resolvers: (() => void)[];
}

// Keep only last N completed animations to prevent unbounded growth
const MAX_COMPLETED_ENTRIES = 20;

interface ChatAnimationContextValue {
  registerMessage: (id: string, role: 'user' | 'assistant') => void;
  notifyAnimationComplete: (id: string) => void;
  waitForPreviousUserMessage: (assistantId: string) => Promise<void>;
  isFirstMessage: (id: string) => boolean;
  // New chat animation state
  isNewChatAnimating: boolean;
  setNewChatAnimating: (value: boolean) => void;
  markNewChatAnimationComplete: () => void;
}

const ChatAnimationContext = createContext<ChatAnimationContextValue | null>(null);

export function ChatAnimationProvider({ children }: { children: React.ReactNode }) {
  const animationStates = useRef<Map<string, AnimationEntry>>(new Map());
  const messageOrder = useRef<string[]>([]);
  const [isNewChatAnimating, setNewChatAnimating] = useState(false);

  const markNewChatAnimationComplete = useCallback(() => {
    setNewChatAnimating(false);
  }, []);

  const registerMessage = useCallback((id: string, role: 'user' | 'assistant') => {
    if (!animationStates.current.has(id)) {
      animationStates.current.set(id, {
        role,
        completed: false,
        resolvers: [],
      });
      messageOrder.current.push(id);
    }
  }, []);

  const pruneOldEntries = useCallback(() => {
    const completedCount = Array.from(animationStates.current.values())
      .filter(e => e.completed).length;

    if (completedCount > MAX_COMPLETED_ENTRIES) {
      // Remove oldest completed entries
      const toRemove = completedCount - MAX_COMPLETED_ENTRIES;
      let removed = 0;

      for (const id of [...messageOrder.current]) {
        if (removed >= toRemove) break;

        const entry = animationStates.current.get(id);
        if (entry?.completed && entry.resolvers.length === 0) {
          animationStates.current.delete(id);
          messageOrder.current = messageOrder.current.filter(mid => mid !== id);
          removed++;
        }
      }
    }
  }, []);

  const notifyAnimationComplete = useCallback((id: string) => {
    const entry = animationStates.current.get(id);
    if (entry) {
      entry.completed = true;
      // Resolve any waiting promises
      entry.resolvers.forEach((resolve) => resolve());
      entry.resolvers = [];

      // Prune old entries periodically
      pruneOldEntries();
    }
  }, [pruneOldEntries]);

  const waitForPreviousUserMessage = useCallback((assistantId: string): Promise<void> => {
    return new Promise((resolve) => {
      const orderIndex = messageOrder.current.indexOf(assistantId);

      // -1 means message not registered yet (race condition) - resolve immediately
      // 0 means this is the first message - no previous message to wait for
      // Both cases: safe to proceed without waiting
      if (orderIndex <= 0) {
        resolve();
        return;
      }

      // Find the previous user message
      for (let i = orderIndex - 1; i >= 0; i--) {
        const prevId = messageOrder.current[i];
        const prevEntry = animationStates.current.get(prevId);

        if (prevEntry?.role === 'user') {
          if (prevEntry.completed) {
            // Already completed, resolve immediately
            resolve();
          } else {
            // Wait for completion
            prevEntry.resolvers.push(resolve);
          }
          return;
        }
      }

      // No previous user message found
      resolve();
    });
  }, []);

  const isFirstMessage = useCallback((id: string) => {
    return messageOrder.current[0] === id;
  }, []);

  return (
    <ChatAnimationContext.Provider
      value={{
        registerMessage,
        notifyAnimationComplete,
        waitForPreviousUserMessage,
        isFirstMessage,
        isNewChatAnimating,
        setNewChatAnimating,
        markNewChatAnimationComplete,
      }}
    >
      {children}
    </ChatAnimationContext.Provider>
  );
}

export function useChatAnimation() {
  const context = useContext(ChatAnimationContext);
  if (!context) {
    throw new Error('useChatAnimation must be used within ChatAnimationProvider');
  }
  return context;
}
