import { View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors, darkColors, borderRadius, spacing } from '@/src/constants/theme';
import { ShimmerText } from '@/src/components/ui';

export function TypingIndicator() {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      className="flex-row justify-start mb-3"
    >
      <View
        style={{
          backgroundColor: themeColors.surfaceElevated,
          borderRadius: borderRadius.lg,
          borderBottomLeftRadius: 4,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderWidth: 1,
          borderColor: themeColors.border,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <ShimmerText
          style={{
            fontSize: 14,
            color: themeColors.textMuted,
          }}
          highlightColor={themeColors.primary}
          speed={0.5}
        >
          Zen is thinking...
        </ShimmerText>
      </View>
    </Animated.View>
  );
}
