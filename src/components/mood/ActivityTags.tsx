import { View, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
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
    <View className="flex-row flex-wrap gap-2.5">
      {activityTags.map((tag, index) => (
        <Animated.View
          key={tag.id}
          entering={FadeIn.delay(index * 30).duration(300)}
        >
          <ActivityPill
            id={tag.id}
            label={tag.label}
            isSelected={selectedActivities.includes(tag.id)}
            onPress={() => onToggleActivity(tag.id)}
          />
        </Animated.View>
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
  const opacity = useSharedValue(isSelected ? 1 : 0.8);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(opacity.value, { duration: 150 }),
  }));

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    opacity.value = isSelected ? 0.8 : 1;
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
            height: 40,
            paddingHorizontal: 18,
            borderRadius: borderRadius.full,
            backgroundColor: isSelected
              ? themeColors.primaryLight
              : 'transparent',
            borderWidth: 1,
            borderColor: isSelected
              ? themeColors.primary
              : themeColors.border,
          },
          animatedStyle,
        ]}
      >
        <Text
          variant="caption"
          style={{
            color: isSelected ? themeColors.textOnAccent : themeColors.textSecondary,
            fontWeight: isSelected ? '600' : '400',
          }}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}
