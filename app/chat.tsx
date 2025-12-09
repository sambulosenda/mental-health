import { useEffect, useCallback, useRef, useState } from 'react';
import { View, Platform, LayoutChangeEvent, ScrollView } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
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
    }, 50);
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

      // Add user message
      await addUserMessage(content);
      scrollToBottom();

      // Generate AI response
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

          // Advance check-in flow if applicable
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

  // Handle close
  const handleClose = useCallback(() => {
    reset();
    router.back();
  }, []);

  // Handle end conversation
  const handleEnd = useCallback(async () => {
    await endActiveConversation();
    router.back();
  }, []);

  // Handle check-in completion
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

  // Determine if we should show the check-in summary
  const showCheckinSummary =
    isCheckin && checkinFlow?.step === 'summary' && messages.length >= 6;
  const suggestedMood =
    checkinFlow?.detectedMood || inferMoodFromConversation(messages);

  // Model loading state
  if (aiState === 'loading') {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: themeColors.background }}
      >
        <Text variant="body" color="textSecondary" center>
          Loading AI model...
        </Text>
        <Text variant="caption" color="textMuted" center className="mt-2">
          This may take a moment on first use
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

      {/* Main container */}
      <View className="flex-1">
        {/* Scrollable messages area */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{
            paddingHorizontal: spacing.md,
            paddingTop: spacing.md,
            // On Android, use padding since contentInset isn't supported
            paddingBottom: Platform.OS === 'android' ? composerHeight + spacing.lg : spacing.md,
          }}
          // On iOS, contentInset creates space for the floating composer
          contentInset={
            Platform.OS === 'ios'
              ? { bottom: composerHeight }
              : undefined
          }
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 && !isGenerating ? (
            <View className="items-center py-8">
              <Text variant="body" color="textMuted" center>
                {isModelReady
                  ? 'Starting conversation...'
                  : 'Preparing AI model...'}
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

        {/* Floating Composer */}
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
              placeholder={
                isCheckin ? 'Share how you feel...' : 'Type a message...'
              }
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
