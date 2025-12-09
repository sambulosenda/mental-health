import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors, darkColors, spacing } from '@/src/constants/theme';

function TypingDot({ delay }: { delay: number }) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-4, { duration: 300 }),
          withTiming(0, { duration: 300 })
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: themeColors.textMuted,
        },
      ]}
    />
  );
}

export function TypingIndicator() {
  const { isDark } = useTheme();

  return (
    <Animated.View
      entering={FadeIn.duration(150)}
      exiting={FadeOut.duration(150)}
      style={{
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginBottom: spacing.xs,
        paddingHorizontal: 4,
      }}
    >
      <View
        style={{
          backgroundColor: isDark ? 'rgba(60,60,60,0.8)' : 'rgba(240,240,240,1)',
          borderRadius: 18,
          borderBottomLeftRadius: 4,
          paddingHorizontal: 16,
          paddingVertical: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <TypingDot delay={0} />
        <TypingDot delay={150} />
        <TypingDot delay={300} />
      </View>
    </Animated.View>
  );
}
