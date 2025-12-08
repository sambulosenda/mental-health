import { View, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { Text } from '@/src/components/ui';
import { MoodAnimation } from './MoodAnimation';
import { colors, darkColors, spacing, moodLabels } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';

interface MoodSelectorProps {
  selectedMood: (1 | 2 | 3 | 4 | 5) | null;
  onSelectMood: (mood: 1 | 2 | 3 | 4 | 5) => void;
}

const MOODS: { value: 1 | 2 | 3 | 4 | 5 }[] = [
  { value: 1 },
  { value: 2 },
  { value: 3 },
  { value: 4 },
  { value: 5 },
];

export function MoodSelector({ selectedMood, onSelectMood }: MoodSelectorProps) {
  return (
    <View className="items-center w-full">
      <View className="flex-row justify-between w-full" style={{ paddingHorizontal: spacing.xs }}>
        {MOODS.map((mood) => (
          <MoodButton
            key={mood.value}
            mood={mood.value}
            isSelected={selectedMood === mood.value}
            onPress={() => onSelectMood(mood.value)}
          />
        ))}
      </View>
      {selectedMood && (
        <View className="mt-6">
          <Text variant="h3" color="textPrimary" center>
            {moodLabels[selectedMood].label}
          </Text>
          <Text variant="caption" color="textSecondary" center className="mt-1">
            {moodLabels[selectedMood].description}
          </Text>
        </View>
      )}
    </View>
  );
}

interface MoodButtonProps {
  mood: 1 | 2 | 3 | 4 | 5;
  isSelected: boolean;
  onPress: () => void;
}

function MoodButton({ mood, isSelected, onPress }: MoodButtonProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const scale = useSharedValue(1);
  const backgroundColor = colors.mood[mood];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scale.value = withSequence(
      withSpring(1.15, { damping: 8 }),
      withSpring(1, { damping: 10 })
    );
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Rate mood as ${moodLabels[mood].label}, ${mood} out of 5`}
      accessibilityState={{ selected: isSelected }}
      accessibilityHint={`Double tap to select ${moodLabels[mood].label} mood`}
    >
      <Animated.View
        className="w-14 h-14 rounded-full items-center justify-center"
        style={[
          {
            backgroundColor,
            borderWidth: isSelected ? 3 : 2,
            borderColor: isSelected ? themeColors.primary : 'transparent',
          },
          animatedStyle,
        ]}
      >
        <MoodAnimation mood={mood} size={32} loop={false} />
      </Animated.View>
    </Pressable>
  );
}
