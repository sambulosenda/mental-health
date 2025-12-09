import { View } from 'react-native';
import { Text } from '@/src/components/ui';
import { StreamingText } from './StreamingText';
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors, darkColors, borderRadius, spacing } from '@/src/constants/theme';
import type { ChatMessage } from '@/src/types/chat';

interface AssistantBubbleProps {
  message: ChatMessage;
  isLatest: boolean;
  isGenerating: boolean;
}

export function AssistantBubble({ message, isLatest, isGenerating }: AssistantBubbleProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;

  // Only stream text for the latest message while generating
  const shouldStream = isLatest && isGenerating;

  return (
    <View
      style={{
        maxWidth: '80%',
        backgroundColor: themeColors.surfaceElevated,
        borderRadius: borderRadius.lg,
        borderBottomLeftRadius: 4,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderWidth: 1,
        borderColor: themeColors.border,
      }}
    >
      {shouldStream ? (
        <StreamingText
          text={message.content}
          isStreaming={true}
          style={{
            color: themeColors.textPrimary,
            fontSize: 16,
            lineHeight: 24,
          }}
        />
      ) : (
        <Text
          variant="body"
          style={{ color: themeColors.textPrimary }}
        >
          {message.content}
        </Text>
      )}
    </View>
  );
}
