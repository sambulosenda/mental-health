import { useEffect, useCallback, useState, useRef } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardStickyView, useKeyboardHandler } from 'react-native-keyboard-controller';
import Animated, {
  useSharedValue,
  useAnimatedRef,
  runOnJS,
} from 'react-native-reanimated';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChatStore, useMoodStore, useJournalStore } from '@/src/stores';
import { useAIChat } from '@/src/lib/ai/useAIChat';
import {
  ChatBubble,
  FloatingChatInput,
  ChatHeader,
  TypingIndicator,
  CheckinSummary,
} from '@/src/components/chat';
import { Text } from '@/src/components/ui';
import { useTheme } from '@/src/contexts/ThemeContext';
import { ChatAnimationProvider, useChatAnimation } from '@/src/contexts/ChatAnimationContext';
import { colors, darkColors, spacing } from '@/src/constants/theme';
import {
  getCheckinPrompt,
  inferMoodFromConversation,
} from '@/src/lib/ai/chatPrompts';
import { useMessageBlankSize } from '@/src/hooks/useMessageBlankSize';
import { useInitialScrollToEnd } from '@/src/hooks/useInitialScrollToEnd';
import { useScrollOnComposerResize } from '@/src/hooks/useScrollOnComposerResize';
import type { ConversationType, ChatMessage } from '@/src/types/chat';

// v0-style: Animated ScrollView for contentInset
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

function ChatScreenContent() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string; context?: string }>();
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const scrollViewRef = useAnimatedRef<Animated.ScrollView>();
  const [composerHeight, setComposerHeight] = useState(80);
  const [error, setError] = useState<string | null>(null);
  const lastFailedMessage = useRef<string | null>(null);
  const { setNewChatAnimating } = useChatAnimation();

  // v0-style: Track keyboard height for contentInset
  const keyboardHeight = useSharedValue(0);

  useKeyboardHandler({
    onMove: (e) => {
      'worklet';
      keyboardHeight.value = e.height;
    },
    onEnd: (e) => {
      'worklet';
      keyboardHeight.value = e.height;
    },
  }, []);

  // v0-style: useMessageBlankSize for proper contentInset calculation
  const { animatedProps } = useMessageBlankSize({
    composerHeight,
    keyboardHeight,
  });

  const type: ConversationType = (params.type as ConversationType) || 'chat';
  const isCheckin = type === 'checkin';
  const proactiveContext = params.context ? decodeURIComponent(params.context) : null;

  // Stores
  const { entries: moodEntries } = useMoodStore();
  const { entries: journalEntries } = useJournalStore();
  const {
    activeConversation,
    messages,
    isGenerating,
    checkinFlow,
    startConversation,
    startCheckin,
    addUserMessage,
    addAssistantMessage,
    setGenerating,
    advanceCheckinStep,
    completeCheckin,
    endActiveConversation,
    reset,
  } = useChatStore();

  // AI hook
  const { generateResponse, isModelReady, state: aiState } = useAIChat({
    isCheckin,
    moodEntries: moodEntries.slice(0, 7),
    journalEntries: journalEntries.slice(0, 3),
  });

  // v0-style: scroll to end when chat first loads (for existing chats)
  useInitialScrollToEnd(scrollViewRef, messages.length > 0);

  // v0-style: scroll when composer grows (multiline typing)
  useScrollOnComposerResize(scrollViewRef, composerHeight);

  // Scroll to bottom helper
  const scrollToBottom = useCallback((animated = true) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated });
    }, 150);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll to bottom when keyboard opens
  useKeyboardHandler({
    onEnd: (e) => {
      'worklet';
      if (e.height > 0) {
        runOnJS(scrollToBottom)(true);
      }
    },
  }, [scrollToBottom]);

  // Initialize conversation
  useEffect(() => {
    const initConversation = async () => {
      if (activeConversation) return;

      if (isCheckin) {
        await startCheckin();
      } else {
        await startConversation(type);
      }
    };

    initConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Generate initial greeting when model is ready
  useEffect(() => {
    if (!isModelReady || messages.length > 0 || !activeConversation) return;

    const generateGreeting = async () => {
      setGenerating(true);
      setError(null);
      try {
        // Use proactive context if available, otherwise default greeting
        let greetingPrompt: string;
        if (proactiveContext) {
          greetingPrompt = `${proactiveContext}\n\nStart a warm, empathetic conversation based on this context. Be brief (2-3 sentences max). Don't mention that you're an AI or that you've been monitoring them.`;
        } else if (isCheckin) {
          greetingPrompt = getCheckinPrompt('greeting');
        } else {
          greetingPrompt = 'Greet the user warmly and ask how they are feeling today. Be brief (2 sentences max).';
        }

        const tempMessages: ChatMessage[] = [
          {
            id: 'temp',
            conversationId: activeConversation.id,
            role: 'user',
            content: greetingPrompt,
            timestamp: new Date(),
          },
        ];

        const response = await generateResponse(tempMessages);
        if (response) {
          await addAssistantMessage(response);
          scrollToBottom();
        }
      } catch (err) {
        console.error('Failed to generate greeting:', err);
        setError('Failed to start conversation. Tap to retry.');
        lastFailedMessage.current = null; // No user message to retry
      } finally {
        setGenerating(false);
      }
    };

    generateGreeting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModelReady, activeConversation]);

  // Handle sending messages
  const handleSend = useCallback(
    async (content: string) => {
      if (!activeConversation || isGenerating) return;

      setError(null);

      // Trigger new chat animation for first user message
      const isFirstUserMessage = messages.length === 0 ||
        (messages.length === 1 && messages[0].role === 'assistant');
      if (isFirstUserMessage) {
        setNewChatAnimating(true);
      }

      await addUserMessage(content);
      scrollToBottom();

      setGenerating(true);
      try {
        const allMessages = [
          ...messages,
          {
            id: 'new',
            conversationId: activeConversation.id,
            role: 'user' as const,
            content,
            timestamp: new Date(),
          },
        ];
        const response = await generateResponse(allMessages);

        if (response) {
          await addAssistantMessage(response);
          lastFailedMessage.current = null;

          if (isCheckin && checkinFlow) {
            advanceCheckinStep();
          }
          scrollToBottom();
        }
      } catch (err) {
        console.error('Failed to generate response:', err);
        setError('Failed to get response. Tap to retry.');
        lastFailedMessage.current = content;
      } finally {
        setGenerating(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeConversation, messages, isGenerating, isCheckin, checkinFlow]
  );

  const handleClose = useCallback(() => {
    reset();
    router.back();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEnd = useCallback(async () => {
    await endActiveConversation();
    router.back();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogMood = useCallback(async () => {
    setGenerating(true);
    await completeCheckin(true);
    setGenerating(false);
    router.back();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSkipMood = useCallback(async () => {
    await completeCheckin(false);
    router.back();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRetry = useCallback(() => {
    if (lastFailedMessage.current) {
      // Retry the last failed user message
      handleSend(lastFailedMessage.current);
    } else {
      // Retry greeting generation
      setError(null);
      // Force re-run of greeting effect by resetting state
      reset();
      if (isCheckin) {
        startCheckin();
      } else {
        startConversation(type);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleSend, isCheckin, type]);

  const showCheckinSummary =
    isCheckin && checkinFlow?.step === 'summary' && messages.length >= 6;
  const suggestedMood =
    checkinFlow?.detectedMood || inferMoodFromConversation(messages);

  // Loading state
  if (aiState === 'loading') {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: themeColors.background }}
      >
        <Text variant="body" color="textSecondary" center>
          Preparing your conversation...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: themeColors.background }}
      edges={['top']}
    >
      <ChatHeader
        type={type}
        onClose={handleClose}
        onEnd={messages.length > 0 ? handleEnd : undefined}
      />

      <View className="flex-1">
        <AnimatedScrollView
          ref={scrollViewRef}
          contentContainerStyle={{
            paddingHorizontal: spacing.sm,
            paddingTop: spacing.md,
          }}
          // v0-style: contentInset from useMessageBlankSize
          // handles composer padding + keyboard height
          animatedProps={animatedProps}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
        >
          {messages.length === 0 && !isGenerating ? (
            <View className="items-center py-12">
              <Text variant="body" color="textMuted" center>
                {isModelReady ? 'Starting...' : 'Preparing...'}
              </Text>
            </View>
          ) : (
            messages.map((message, index) => {
              const isLastAssistant =
                message.role === 'assistant' &&
                index === messages.length - 1;
              return (
                <ChatBubble
                  key={message.id}
                  message={message}
                  index={index}
                  isFirstMessage={index === 0 && messages.length === 1}
                  isLatestAssistant={isLastAssistant}
                  isStreaming={isGenerating}
                />
              );
            })
          )}
          {isGenerating && <TypingIndicator />}
          {error && !isGenerating && (
            <Pressable
              onPress={handleRetry}
              className="flex-row items-center justify-center py-3 px-4 mx-4 mb-2 rounded-xl"
              style={{ backgroundColor: `${themeColors.error}15` }}
            >
              <Ionicons name="alert-circle" size={18} color={themeColors.error} />
              <Text variant="caption" style={{ color: themeColors.error, marginLeft: 8, flex: 1 }}>
                {error}
              </Text>
              <Ionicons name="refresh" size={18} color={themeColors.error} />
            </Pressable>
          )}
        </AnimatedScrollView>

        {/* Floating composer - sticks above keyboard */}
        <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
          {showCheckinSummary ? (
            <CheckinSummary
              suggestedMood={suggestedMood}
              onLogMood={handleLogMood}
              onSkip={handleSkipMood}
              isLoading={isGenerating}
            />
          ) : (
            <FloatingChatInput
              onSend={handleSend}
              disabled={isGenerating || !isModelReady}
              placeholder="Message"
              onHeightChange={setComposerHeight}
            />
          )}
        </KeyboardStickyView>
      </View>
    </SafeAreaView>
  );
}

export default function ChatScreen() {
  return (
    <ChatAnimationProvider>
      <ChatScreenContent />
    </ChatAnimationProvider>
  );
}
