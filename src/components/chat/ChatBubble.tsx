import { useEffect, useRef } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { Text } from '@/src/components/ui';
import { StreamingText } from './StreamingText';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useChatAnimation } from '@/src/contexts/ChatAnimationContext';
import { colors, darkColors, spacing } from '@/src/constants/theme';
import type { ChatMessage } from '@/src/types/chat';

interface ChatBubbleProps {
  message: ChatMessage;
  index: number;
  isFirstMessage?: boolean;
  isLatestAssistant?: boolean;
  isStreaming?: boolean;
}

export function ChatBubble({
  message,
  index,
  isFirstMessage = false,
  isLatestAssistant = false,
  isStreaming = false,
}: ChatBubbleProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const { height: windowHeight } = useWindowDimensions();
  const isUser = message.role === 'user';
  const shouldStream = !isUser && isLatestAssistant && isStreaming;

  const {
    registerMessage,
    notifyAnimationComplete,
    waitForPreviousUserMessage,
    isNewChatAnimating,
    markNewChatAnimationComplete,
  } = useChatAnimation();

  // Animation shared values
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(isUser ? 16 : 8);

  // Check if this is first user message in a new chat (v0-style animation)
  const isFirstUserInNewChat = isUser && index === 0 && isNewChatAnimating;

  useEffect(() => {
    let isMounted = true;
    registerMessage(message.id, message.role);

    const runAnimation = async () => {
      // Assistant messages wait for previous user message
      if (!isUser) {
        await waitForPreviousUserMessage(message.id);
        if (!isMounted) return;
      }

      // Special animation for first user message in new chat (v0-style)
      if (isFirstUserInNewChat) {
        // Start from center-ish of screen, slide up to top
        const startY = windowHeight * 0.3;
        translateY.value = startY;

        opacity.value = withTiming(1, {
          duration: 250,
          easing: Easing.out(Easing.cubic),
        });

        translateY.value = withSpring(0, {
          damping: 18,
          stiffness: 180,
          mass: 1,
        });

        setTimeout(() => {
          if (isMounted) {
            notifyAnimationComplete(message.id);
            markNewChatAnimationComplete();
          }
        }, 400);
      } else {
        // Standard animation
        opacity.value = withTiming(1, {
          duration: 200,
          easing: Easing.out(Easing.cubic),
        });

        translateY.value = withSpring(0, {
          damping: 20,
          stiffness: 300,
        });

        setTimeout(() => {
          if (isMounted) {
            notifyAnimationComplete(message.id);
          }
        }, 250);
      }
    };

    runAnimation();

    return () => {
      isMounted = false;
    };
  }, [message.id]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  // iMessage-style bubbles
  const userBubbleStyle = {
    backgroundColor: themeColors.primary,
    borderRadius: 18,
    borderBottomRightRadius: 4,
  };

  const assistantBubbleStyle = {
    backgroundColor: isDark ? themeColors.surface : '#F0F2F5',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
  };

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          flexDirection: 'row',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          marginBottom: spacing.xs,
          paddingHorizontal: 4,
        },
      ]}
    >
      <View
        style={[
          isUser ? userBubbleStyle : assistantBubbleStyle,
          {
            maxWidth: '78%',
            paddingHorizontal: 14,
            paddingVertical: 10,
          },
        ]}
      >
{shouldStream ? (
          <StreamingText
            text={message.content}
            isStreaming={true}
            style={{
              color: themeColors.textPrimary,
              fontSize: 16,
              lineHeight: 22,
            }}
          />
        ) : (
          <Text
            variant="body"
            style={{
              color: isUser ? themeColors.textInverse : themeColors.textPrimary,
              lineHeight: 22,
            }}
          >
            {message.content}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}
