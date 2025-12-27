import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { Card, Text } from '@/src/components/ui';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useGamificationStore } from '@/src/stores/useGamificationStore';
import { colors, darkColors } from '@/src/constants/theme';

interface StreakCardProps {
  onPress?: () => void;
}

export function StreakCard({ onPress }: StreakCardProps) {
  const { isDark } = useTheme();
  const { streaks, streakProtectionsRemaining } = useGamificationStore();
  const overallStreak = streaks.overall;

  const scale = useSharedValue(1);
  const flameOpacity = useSharedValue(1);

  // Animate when streak changes
  useEffect(() => {
    if (overallStreak.currentStreak > 0) {
      scale.value = withSequence(
        withSpring(1.2, { damping: 8 }),
        withSpring(1, { damping: 10 })
      );
      flameOpacity.value = withSequence(
        withTiming(0.6, { duration: 100 }),
        withTiming(1, { duration: 200 })
      );
    }
  }, [overallStreak.currentStreak]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const flameAnimatedStyle = useAnimatedStyle(() => ({
    opacity: flameOpacity.value,
  }));

  const hasActiveStreak = overallStreak.currentStreak > 0;
  const themeColors = isDark ? darkColors : colors;
  const streakColor = hasActiveStreak ? '#FF6B35' : themeColors.textMuted;

  const getMessage = () => {
    const streak = overallStreak.currentStreak;
    if (streak === 0) return "Start your streak today!";
    if (streak === 1) return "Great start! Keep it going!";
    if (streak < 7) return "Building momentum!";
    if (streak < 14) return "You're on fire!";
    if (streak < 30) return "Incredible consistency!";
    return "Legendary dedication!";
  };

  return (
    <Pressable onPress={onPress}>
      <Card className="mb-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Animated.View style={[animatedStyle, flameAnimatedStyle]}>
              <View
                className="w-12 h-12 rounded-full items-center justify-center"
                style={{ backgroundColor: hasActiveStreak ? '#FFF3E0' : themeColors.surfaceElevated }}
              >
                <Ionicons
                  name={hasActiveStreak ? 'flame' : 'flame-outline'}
                  size={28}
                  color={streakColor}
                />
              </View>
            </Animated.View>

            <View className="ml-4">
              <View className="flex-row items-baseline">
                <Text variant="h2" style={{ color: streakColor }}>
                  {overallStreak.currentStreak}
                </Text>
                <Text variant="bodyMedium" color="textSecondary" className="ml-1">
                  {overallStreak.currentStreak === 1 ? 'day' : 'days'}
                </Text>
              </View>
              <Text variant="caption" color="textMuted">
                {getMessage()}
              </Text>
            </View>
          </View>

          <View className="items-end">
            {overallStreak.longestStreak > 0 && (
              <View className="flex-row items-center">
                <Ionicons
                  name="trophy-outline"
                  size={14}
                  color={themeColors.textMuted}
                />
                <Text variant="caption" color="textMuted" className="ml-1">
                  Best: {overallStreak.longestStreak}
                </Text>
              </View>
            )}
            {streakProtectionsRemaining > 0 && (
              <View className="flex-row items-center mt-1">
                <Ionicons
                  name="shield-outline"
                  size={12}
                  color={themeColors.textMuted}
                />
                <Text variant="label" color="textMuted" className="ml-1">
                  {streakProtectionsRemaining} rest days
                </Text>
              </View>
            )}
          </View>
        </View>
      </Card>
    </Pressable>
  );
}
