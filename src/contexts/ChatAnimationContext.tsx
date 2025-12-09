import React, { createContext, useContext, useRef, useCallback } from 'react';

interface AnimationEntry {
  role: 'user' | 'assistant';
  completed: boolean;
  resolvers: Array<() => void>;
}

interface ChatAnimationContextValue {
  registerMessage: (id: string, role: 'user' | 'assistant') => void;
  notifyAnimationComplete: (id: string) => void;
  waitForPreviousUserMessage: (assistantId: string) => Promise<void>;
  isFirstMessage: (id: string) => boolean;
}

const ChatAnimationContext = createContext<ChatAnimationContextValue | null>(null);

export function ChatAnimationProvider({ children }: { children: React.ReactNode }) {
  const animationStates = useRef<Map<string, AnimationEntry>>(new Map());
  const messageOrder = useRef<string[]>([]);

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

  const notifyAnimationComplete = useCallback((id: string) => {
    const entry = animationStates.current.get(id);
    if (entry) {
      entry.completed = true;
      // Resolve any waiting promises
      entry.resolvers.forEach((resolve) => resolve());
      entry.resolvers = [];
    }
  }, []);

  const waitForPreviousUserMessage = useCallback((assistantId: string): Promise<void> => {
    return new Promise((resolve) => {
      const orderIndex = messageOrder.current.indexOf(assistantId);
      if (orderIndex <= 0) {
        // No previous message, resolve immediately
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
