import { useEffect, useCallback, useRef, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { ChatAnimationProvider } from '@/src/contexts/ChatAnimationContext';
import { colors, darkColors, spacing } from '@/src/constants/theme';
import {
  getCheckinPrompt,
  inferMoodFromConversation,
} from '@/src/lib/ai/chatPrompts';
import type { ConversationType, ChatMessage } from '@/src/types/chat';

function ChatScreenContent() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string }>();
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [composerHeight, setComposerHeight] = useState(80);

  const type: ConversationType = (params.type as ConversationType) || 'chat';
  const isCheckin = type === 'checkin';

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

  // Scroll to bottom helper
  const scrollToBottom = useCallback((animated = true) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated });
    }, 100);
  }, []);

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
  }, []);

  // Generate initial greeting when model is ready
  useEffect(() => {
    if (!isModelReady || messages.length > 0 || !activeConversation) return;

    const generateGreeting = async () => {
      setGenerating(true);
      try {
        const greetingPrompt = isCheckin
          ? getCheckinPrompt('greeting')
          : 'Greet the user warmly and ask how they are feeling today. Be brief (2 sentences max).';

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
      } catch (error) {
        console.error('Failed to generate greeting:', error);
      } finally {
        setGenerating(false);
      }
    };

    generateGreeting();
  }, [isModelReady, activeConversation]);

  // Handle sending messages
  const handleSend = useCallback(
    async (content: string) => {
      if (!activeConversation || isGenerating) return;

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

          if (isCheckin && checkinFlow) {
            advanceCheckinStep();
          }
          scrollToBottom();
        }
      } catch (error) {
        console.error('Failed to generate response:', error);
      } finally {
        setGenerating(false);
      }
    },
    [activeConversation, messages, isGenerating, isCheckin, checkinFlow]
  );

  const handleClose = useCallback(() => {
    reset();
    router.back();
  }, []);

  const handleEnd = useCallback(async () => {
    await endActiveConversation();
    router.back();
  }, []);

  const handleLogMood = useCallback(async () => {
    setGenerating(true);
    await completeCheckin(true);
    setGenerating(false);
    router.back();
  }, []);

  const handleSkipMood = useCallback(async () => {
    await completeCheckin(false);
    router.back();
  }, []);

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
          Loading...
        </Text>
      </SafeAreaView>
    );
  }

  // Calculate bottom padding for scroll content
  // This ensures content is visible above the floating composer
  const bottomPadding = composerHeight + insets.bottom + spacing.sm;

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
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{
            paddingHorizontal: spacing.sm,
            paddingTop: spacing.md,
            paddingBottom: bottomPadding,
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
          // iOS 15+ native keyboard avoidance
          automaticallyAdjustKeyboardInsets={true}
        >
          {messages.length === 0 && !isGenerating ? (
            <View className="items-center py-12">
              <Text variant="body" color="textMuted" center>
                {isModelReady ? 'Starting...' : 'Loading...'}
              </Text>
            </View>
          ) : (
            messages.map((message, index) => (
              <ChatBubble
                key={message.id}
                message={message}
                index={index}
                isFirstMessage={index === 0 && messages.length === 1}
              />
            ))
          )}
          {isGenerating && <TypingIndicator />}
        </ScrollView>

        {/* Floating composer sticks above keyboard */}
        <KeyboardStickyView
          offset={{
            closed: 0,
            opened: 0,
          }}
        >
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
