import { View, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { Text } from '@/src/components/ui';
import { colors, darkColors, activityTags, type ActivityTagId, borderRadius } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';

interface ActivityTagsProps {
  selectedActivities: ActivityTagId[];
  onToggleActivity: (activity: ActivityTagId) => void;
}

export function ActivityTags({ selectedActivities, onToggleActivity }: ActivityTagsProps) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {activityTags.map((tag) => (
        <ActivityPill
          key={tag.id}
          id={tag.id}
          label={tag.label}
          isSelected={selectedActivities.includes(tag.id)}
          onPress={() => onToggleActivity(tag.id)}
        />
      ))}
    </View>
  );
}

interface ActivityPillProps {
  id: ActivityTagId;
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

function ActivityPill({ label, isSelected, onPress }: ActivityPillProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSequence(
      withTiming(0.92, { duration: 80 }),
      withSpring(1, { damping: 12, stiffness: 400 })
    );
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: isSelected }}
    >
      <Animated.View
        className="items-center justify-center"
        style={[
          {
            height: 32,
            paddingHorizontal: 14,
            borderRadius: borderRadius.full,
            backgroundColor: isSelected
              ? themeColors.primaryLight
              : isDark ? themeColors.surfaceElevated : 'transparent',
            borderWidth: isSelected ? 1.5 : 1,
            borderColor: isSelected
              ? themeColors.primary
              : themeColors.border,
            ...(isSelected && {
              shadowColor: themeColors.primary,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.15,
              shadowRadius: 2,
              elevation: 2,
            }),
          },
          animatedStyle,
        ]}
      >
        <Text
          variant="caption"
          style={{
            fontSize: 13,
            color: isSelected ? themeColors.primaryDark : themeColors.textSecondary,
            fontWeight: isSelected ? '600' : '400',
          }}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}
