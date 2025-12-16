import { Pressable, View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Text } from '@/src/components/ui';
import { darkColors, colors } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import type { GoalDefinition } from '@/src/constants/onboarding';

interface GoalCardProps {
  goal: GoalDefinition;
  selected: boolean;
  onToggle: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function GoalCard({ goal, selected, onToggle, isFirst, isLast }: GoalCardProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
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
        styles.row,
        animatedStyle,
        {
          backgroundColor: isDark ? themeColors.surfaceElevated : '#FFFFFF',
          borderTopLeftRadius: isFirst ? 12 : 0,
          borderTopRightRadius: isFirst ? 12 : 0,
          borderBottomLeftRadius: isLast ? 12 : 0,
          borderBottomRightRadius: isLast ? 12 : 0,
        },
      ]}
    >
      {/* Icon */}
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: isDark
              ? 'rgba(123, 163, 147, 0.15)'
              : 'rgba(91, 138, 114, 0.1)',
          },
        ]}
      >
        <Ionicons
          name={goal.icon}
          size={20}
          color={themeColors.primary}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text
          style={[
            styles.label,
            { color: themeColors.textPrimary },
          ]}
        >
          {goal.label}
        </Text>
        <Text
          style={[
            styles.description,
            { color: themeColors.textSecondary },
          ]}
        >
          {goal.description}
        </Text>
      </View>

      {/* Checkmark */}
      <View style={styles.checkContainer}>
        {selected ? (
          <Ionicons
            name="checkmark-circle-sharp"
            size={24}
            color={themeColors.primary}
          />
        ) : (
          <View
            style={[
              styles.emptyCheck,
              {
                borderColor: isDark
                  ? 'rgba(255,255,255,0.2)'
                  : 'rgba(0,0,0,0.15)',
              },
            ]}
          />
        )}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 72,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    fontSize: 17,
    fontWeight: '500',
    letterSpacing: -0.4,
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    letterSpacing: -0.15,
  },
  checkContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
  },
});
