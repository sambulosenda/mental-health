import { MoodAnimation } from '@/src/components/mood/MoodAnimation';
import { Button, Text } from '@/src/components/ui';
import { colors, darkColors, moodLabels } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import type { MoodValue } from '@/src/types/exercise';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

interface ExerciseCompleteProps {
  exerciseName: string;
  moodBefore?: MoodValue;
  moodAfter?: MoodValue;
  onDone: () => void;
  accentColor?: string;
}

export function ExerciseComplete({
  exerciseName,
  moodBefore,
  moodAfter,
  onDone,
  accentColor,
}: ExerciseCompleteProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const color = accentColor || themeColors.primary;

  const moodDelta = moodBefore && moodAfter ? moodAfter - moodBefore : null;

  return (
    <View className="flex-1 items-center justify-center px-6">
      <Animated.View
        entering={FadeIn.duration(500)}
        className="w-20 h-20 rounded-full items-center justify-center mb-6"
        style={{ backgroundColor: `${color}20` }}
      >
        <Ionicons name="checkmark-circle" size={48} color={color} />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200).duration(400)}>
        <Text variant="h1" color="textPrimary" center className="mb-2">
          Well Done!
        </Text>
        <Text variant="body" color="textSecondary" center>
          You completed {exerciseName}
        </Text>
      </Animated.View>

      {/* Mood comparison */}
      {moodBefore && moodAfter && (
        <Animated.View
          entering={FadeInUp.delay(400).duration(400)}
          className="mt-8 w-full rounded-2xl p-6"
          style={{ backgroundColor: themeColors.surfaceElevated }}
        >
          <Text variant="bodyMedium" color="textSecondary" center className="mb-4">
            Your mood shift
          </Text>

          <View className="flex-row items-center justify-center gap-6">
            {/* Before */}
            <View className="items-center">
              <View
                className="w-14 h-14 rounded-full items-center justify-center mb-2"
                style={{ backgroundColor: colors.mood[moodBefore] }}
              >
                <MoodAnimation mood={moodBefore} size={28} />
              </View>
              <Text variant="caption" color="textMuted">
                Before
              </Text>
              <Text variant="caption" color="textSecondary">
                {moodLabels[moodBefore].label.split(' ')[0]}
              </Text>
            </View>

            {/* Arrow */}
            <View className="items-center">
              <Ionicons
                name="arrow-forward"
                size={24}
                color={themeColors.textMuted}
              />
              {moodDelta !== null && moodDelta !== 0 && (
                <Text
                  variant="caption"
                  style={{
                    color: moodDelta > 0 ? '#10B981' : '#EF4444',
                    marginTop: 4,
                  }}
                >
                  {moodDelta > 0 ? '+' : ''}{moodDelta}
                </Text>
              )}
            </View>

            {/* After */}
            <View className="items-center">
              <View
                className="w-14 h-14 rounded-full items-center justify-center mb-2"
                style={{ backgroundColor: colors.mood[moodAfter] }}
              >
                <MoodAnimation mood={moodAfter} size={28} />
              </View>
              <Text variant="caption" color="textMuted">
                After
              </Text>
              <Text variant="caption" color="textSecondary">
                {moodLabels[moodAfter].label.split(' ')[0]}
              </Text>
            </View>
          </View>

          {moodDelta !== null && moodDelta > 0 && (
            <Text variant="body" color="textSecondary" center className="mt-4">
              Great progress! Your mood improved.
            </Text>
          )}

          {moodDelta !== null && moodDelta === 0 && (
            <Text variant="body" color="textSecondary" center className="mt-4">
              Every exercise counts, even when the change isn't immediate.
            </Text>
          )}

          {moodDelta !== null && moodDelta < 0 && (
            <Text variant="body" color="textSecondary" center className="mt-4">
              It's okay to feel this way. Processing emotions takes time.
            </Text>
          )}
        </Animated.View>
      )}

      <Animated.View
        entering={FadeInUp.delay(600).duration(400)}
        className="mt-auto mb-8 w-full"
      >
        <Button onPress={onDone} style={{ backgroundColor: color }}>
          Done
        </Button>
      </Animated.View>
    </View>
  );
}
