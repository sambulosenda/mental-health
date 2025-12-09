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
import { colors, darkColors, borderRadius, spacing } from '@/src/constants/theme';
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
  const translateY = useSharedValue(isUser ? 20 : 10);
  const scale = useSharedValue(isFirstMessage && isUser ? 0.95 : 1);

  useEffect(() => {
    // Register this message for animation coordination
    registerMessage(message.id, message.role);

    const runAnimation = async () => {
      // Assistant messages wait for previous user message to animate first
      if (!isUser) {
        await waitForPreviousUserMessage(message.id);
        // Small delay after user animation completes
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Animate in
      opacity.value = withTiming(1, {
        duration: 250,
        easing: Easing.out(Easing.cubic),
      });

      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 300,
        mass: 0.8,
      });

      if (isFirstMessage && isUser) {
        scale.value = withSpring(1, {
          damping: 15,
          stiffness: 200,
        });
      }

      // Notify completion after animation duration
      setTimeout(() => {
        notifyAnimationComplete(message.id);
      }, 300);
    };

    runAnimation();
  }, [message.id]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          flexDirection: 'row',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          marginBottom: spacing.sm,
        },
      ]}
    >
      <View
        style={{
          maxWidth: '80%',
          backgroundColor: isUser ? themeColors.primary : themeColors.surfaceElevated,
          borderRadius: borderRadius.lg,
          borderBottomRightRadius: isUser ? 4 : borderRadius.lg,
          borderBottomLeftRadius: isUser ? borderRadius.lg : 4,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderWidth: isUser ? 0 : 1,
          borderColor: themeColors.border,
        }}
      >
        <Text
          variant="body"
          style={{ color: isUser ? themeColors.textInverse : themeColors.textPrimary }}
        >
          {message.content}
        </Text>
      </View>
    </Animated.View>
  );
}
