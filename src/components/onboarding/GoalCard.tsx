import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Text } from '@/src/components/ui';
import { colors, darkColors } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import type { GoalDefinition } from '@/src/constants/onboarding';

interface GoalCardProps {
  goal: GoalDefinition;
  selected: boolean;
  onToggle: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function GoalCard({ goal, selected, onToggle }: GoalCardProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${goal.label}: ${goal.description}`}
      style={[
        animatedStyle,
        {
          flex: 1,
          backgroundColor: selected
            ? isDark
              ? themeColors.primaryDark
              : colors.mood[1]
            : themeColors.surfaceElevated,
          borderWidth: 2,
          borderColor: selected ? themeColors.primary : themeColors.border,
          borderRadius: 16,
          padding: 16,
          minHeight: 120,
        },
      ]}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View
          className="w-10 h-10 rounded-full justify-center items-center"
          style={{
            backgroundColor: selected
              ? themeColors.primary
              : isDark
                ? themeColors.surfaceElevated
                : themeColors.background,
          }}
        >
          <Ionicons
            name={goal.icon}
            size={20}
            color={selected ? themeColors.background : themeColors.textSecondary}
          />
        </View>
        {selected && (
          <Ionicons
            name="checkmark-circle"
            size={24}
            color={themeColors.primary}
          />
        )}
      </View>
      <Text
        variant="bodyMedium"
        color={selected ? 'primary' : 'textPrimary'}
        className="mb-1"
      >
        {goal.label}
      </Text>
      <Text variant="caption" color="textSecondary">
        {goal.description}
      </Text>
    </AnimatedPressable>
  );
}
