import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { Text } from '@/src/components/ui';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useChatAnimation } from '@/src/contexts/ChatAnimationContext';
import { colors, darkColors, spacing } from '@/src/constants/theme';
import type { ChatMessage } from '@/src/types/chat';

interface ChatBubbleProps {
  message: ChatMessage;
  index: number;
  isFirstMessage?: boolean;
}

export function ChatBubble({ message, index, isFirstMessage = false }: ChatBubbleProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const isUser = message.role === 'user';

  const { registerMessage, notifyAnimationComplete, waitForPreviousUserMessage } =
    useChatAnimation();

  // Animation shared values
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(isUser ? 16 : 8);

  useEffect(() => {
    registerMessage(message.id, message.role);

    const runAnimation = async () => {
      // Assistant messages wait for previous user message
      if (!isUser) {
        await waitForPreviousUserMessage(message.id);
        await new Promise((resolve) => setTimeout(resolve, 80));
      }

      // Animate in
      opacity.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      });

      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 300,
      });

      setTimeout(() => {
        notifyAnimationComplete(message.id);
      }, 250);
    };

    runAnimation();
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
    backgroundColor: isDark ? 'rgba(60,60,60,0.8)' : 'rgba(240,240,240,1)',
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
        <Text
          variant="body"
          style={{
            color: isUser ? '#FFFFFF' : themeColors.textPrimary,
            lineHeight: 22,
          }}
        >
          {message.content}
        </Text>
      </View>
    </Animated.View>
  );
}
