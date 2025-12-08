import { View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Text } from '@/src/components/ui';
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors, darkColors, borderRadius, spacing } from '@/src/constants/theme';
import type { ChatMessage } from '@/src/types/chat';

interface ChatBubbleProps {
  message: ChatMessage;
  index: number;
}

export function ChatBubble({ message, index }: ChatBubbleProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const isUser = message.role === 'user';

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 50).duration(300)}
      className={`flex-row ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
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
