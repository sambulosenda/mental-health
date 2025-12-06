import { useEffect, useCallback, useRef } from 'react';
import { View, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChatStore, useMoodStore, useJournalStore } from '@/src/stores';
import { useAIChat } from '@/src/lib/ai/useAIChat';
import {
  ChatBubble,
  ChatInput,
  ChatHeader,
  TypingIndicator,
  CheckinSummary,
} from '@/src/components/chat';
import { Text } from '@/src/components/ui';
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors, darkColors } from '@/src/constants/theme';
import {
  CHAT_COMPANION_SYSTEM_PROMPT,
  CHECKIN_SYSTEM_PROMPT,
  getCheckinPrompt,
  inferMoodFromConversation,
} from '@/src/lib/ai/chatPrompts';
import type { ConversationType, ChatMessage } from '@/src/types/chat';

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string }>();
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const flatListRef = useRef<FlatList>(null);

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

    return () => {
      // Don't reset on unmount - let user resume if they come back
    };
  }, []);

  // Generate initial greeting when model is ready
  useEffect(() => {
    if (!isModelReady || messages.length > 0 || !activeConversation) return;

    const generateGreeting = async () => {
      setGenerating(true);
      try {
        const systemPrompt = isCheckin ? CHECKIN_SYSTEM_PROMPT : CHAT_COMPANION_SYSTEM_PROMPT;
        const greetingPrompt = isCheckin
          ? getCheckinPrompt('greeting')
          : 'Greet the user warmly and ask how they are feeling today. Be brief (2 sentences max).';

        // Create a temporary message for context
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

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Generate AI response
      setGenerating(true);
      try {
        const allMessages = [...messages, { id: 'new', conversationId: activeConversation.id, role: 'user' as const, content, timestamp: new Date() }];
        const response = await generateResponse(allMessages);

        if (response) {
          await addAssistantMessage(response);

          // Advance check-in flow if applicable
          if (isCheckin && checkinFlow) {
            advanceCheckinStep();
          }
        }
      } catch (error) {
        console.error('Failed to generate response:', error);
      } finally {
        setGenerating(false);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
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
  const showCheckinSummary = isCheckin && checkinFlow?.step === 'summary' && messages.length >= 6;
  const suggestedMood = checkinFlow?.detectedMood || inferMoodFromConversation(messages);

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
      edges={['bottom']}
    >
      <ChatHeader
        type={type}
        onClose={handleClose}
        onEnd={messages.length > 0 ? handleEnd : undefined}
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <ChatBubble message={item} index={index} />
          )}
          contentContainerStyle={{
            padding: 16,
            flexGrow: 1,
            justifyContent: messages.length === 0 ? 'center' : 'flex-end',
          }}
          ListEmptyComponent={
            !isGenerating ? (
              <View className="items-center py-8">
                <Text variant="body" color="textMuted" center>
                  {isModelReady
                    ? 'Starting conversation...'
                    : 'Preparing AI model...'}
                </Text>
              </View>
            ) : null
          }
          ListFooterComponent={isGenerating ? <TypingIndicator /> : null}
          onContentSizeChange={() => {
            flatListRef.current?.scrollToEnd({ animated: false });
          }}
        />

        {showCheckinSummary ? (
          <CheckinSummary
            suggestedMood={suggestedMood}
            onLogMood={handleLogMood}
            onSkip={handleSkipMood}
            isLoading={isGenerating}
          />
        ) : (
          <ChatInput
            onSend={handleSend}
            disabled={isGenerating || !isModelReady}
            placeholder={
              isCheckin
                ? 'Share how you feel...'
                : 'Type a message...'
            }
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
