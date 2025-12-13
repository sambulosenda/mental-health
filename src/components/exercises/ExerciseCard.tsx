import { Text } from '@/src/components/ui';
import { colors, darkColors, borderRadius, getCardShadow, getCardBorder, pressAnimation } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import type { ExerciseTemplate } from '@/src/types/exercise';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ExerciseCardProps {
  template: ExerciseTemplate;
  onPress: () => void;
  compact?: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  cbt: 'CBT',
  act: 'ACT',
  dbt: 'DBT',
  meditation: 'Meditation',
};

export function ExerciseCard({ template, onPress, compact }: ExerciseCardProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const accentColor = template.color || themeColors.primary;
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(pressed.value, [0, 1], [1, pressAnimation.scale]);
    return {
      transform: [{ scale }],
    };
  });

  const handlePressIn = () => {
    pressed.value = withSpring(1, pressAnimation.springConfig);
  };

  const handlePressOut = () => {
    pressed.value = withSpring(0, pressAnimation.springConfig);
  };

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  if (compact) {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          {
            borderRadius: borderRadius.lg,
            padding: 16,
            backgroundColor: themeColors.surfaceElevated,
            width: 160,
            ...getCardShadow(isDark),
            ...getCardBorder(isDark),
          },
          animatedStyle,
        ]}
      >
        <View
          className="w-10 h-10 rounded-xl items-center justify-center mb-3"
          style={{ backgroundColor: `${accentColor}${isDark ? '30' : '15'}` }}
        >
          <Ionicons
            name={(template.icon as any) || 'fitness-outline'}
            size={20}
            color={accentColor}
          />
        </View>

        <Text variant="bodyMedium" color="textPrimary" numberOfLines={1}>
          {template.name}
        </Text>

        <Text variant="caption" color="textMuted" className="mt-1">
          {template.duration} min
        </Text>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        {
          borderRadius: borderRadius.lg,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: themeColors.surfaceElevated,
          ...getCardShadow(isDark),
          ...getCardBorder(isDark),
        },
        animatedStyle,
      ]}
    >
      <View
        className="w-10 h-10 rounded-xl items-center justify-center mr-4"
        style={{ backgroundColor: `${accentColor}${isDark ? '30' : '15'}` }}
      >
        <Ionicons
          name={(template.icon as any) || 'fitness-outline'}
          size={20}
          color={accentColor}
        />
      </View>

      <View className="flex-1">
        <View className="flex-row items-center gap-2 mb-0.5">
          <Text variant="bodyMedium" color="textPrimary">
            {template.name}
          </Text>
          <View
            className="px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${accentColor}${isDark ? '30' : '15'}` }}
          >
            <Text variant="label" style={{ color: accentColor, fontSize: 10 }}>
              {TYPE_LABELS[template.type] || template.type.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text variant="caption" color="textSecondary" numberOfLines={1}>
          {template.description}
        </Text>

        <Text variant="caption" color="textMuted" className="mt-1">
          {template.duration} min · {template.steps.length} steps
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color={themeColors.textMuted} />
    </AnimatedPressable>
  );
}
