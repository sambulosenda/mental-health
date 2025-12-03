import { View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
  useDerivedValue,
} from 'react-native-reanimated';
import { Text, NativeSlider } from '@/src/components/ui';
import { MoodAnimation } from './MoodAnimation';
import { colors, spacing, borderRadius, moodLabels } from '@/src/constants/theme';
import { useRef } from 'react';

interface MoodSliderSelectorProps {
  selectedMood: (1 | 2 | 3 | 4 | 5) | null;
  onSelectMood: (mood: 1 | 2 | 3 | 4 | 5) => void;
}

const MOOD_COLORS = [
  colors.mood[1],
  colors.mood[2],
  colors.mood[3],
  colors.mood[4],
  colors.mood[5],
];

export function MoodSliderSelector({ selectedMood, onSelectMood }: MoodSliderSelectorProps) {
  const sliderValue = useSharedValue(selectedMood ? (selectedMood - 1) / 4 : 0.5);
  const scale = useSharedValue(1);
  const lastMood = useRef(selectedMood);

  // Derived mood value from slider position
  const currentMood = useDerivedValue(() => {
    return Math.round(sliderValue.value * 4) + 1;
  });

  const handleValueChange = (value: number) => {
    sliderValue.value = value;
    const newMood = (Math.round(value * 4) + 1) as 1 | 2 | 3 | 4 | 5;

    // Only trigger haptic and callback when mood changes
    if (newMood !== lastMood.current) {
      lastMood.current = newMood;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Bounce animation on change
      scale.value = withSpring(1.1, { damping: 8 });
      scale.value = withSpring(1, { damping: 10 });

      onSelectMood(newMood);
    }
  };

  const animatedEmojiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedBackgroundStyle = useAnimatedStyle(() => {
    const moodIndex = Math.round(sliderValue.value * 4);
    const backgroundColor = interpolateColor(
      sliderValue.value * 4,
      [0, 1, 2, 3, 4],
      MOOD_COLORS
    );
    return { backgroundColor };
  });

  const displayMood = selectedMood || 3;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.emojiContainer, animatedBackgroundStyle]}>
        <Animated.View style={animatedEmojiStyle}>
          <MoodAnimation mood={displayMood as 1 | 2 | 3 | 4 | 5} size={64} />
        </Animated.View>
      </Animated.View>

      <View style={styles.sliderContainer}>
        <View style={styles.sliderLabels}>
          <MoodAnimation mood={1} size={20} loop={false} />
          <MoodAnimation mood={5} size={20} loop={false} />
        </View>
        <NativeSlider
          value={selectedMood ? (selectedMood - 1) / 4 : 0.5}
          onValueChange={handleValueChange}
          minimumValue={0}
          maximumValue={1}
          step={0.25}
        />
      </View>

      {selectedMood && (
        <View style={styles.labelContainer}>
          <Text variant="h3" color="textPrimary" center>
            {moodLabels[selectedMood].label}
          </Text>
          <Text variant="caption" color="textSecondary" center style={styles.description}>
            {moodLabels[selectedMood].description}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  emojiContainer: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  sliderContainer: {
    width: '100%',
    paddingHorizontal: spacing.md,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  labelContainer: {
    marginTop: spacing.lg,
  },
  description: {
    marginTop: spacing.xs,
  },
});
