import { View, Pressable, StyleSheet, Text as RNText } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { Text } from '@/src/components/ui';
import { colors, spacing, borderRadius, moodLabels } from '@/src/constants/theme';

interface MoodSelectorProps {
  selectedMood: (1 | 2 | 3 | 4 | 5) | null;
  onSelectMood: (mood: 1 | 2 | 3 | 4 | 5) => void;
}

const MOODS: Array<{ value: 1 | 2 | 3 | 4 | 5; emoji: string }> = [
  { value: 1, emoji: '😔' },
  { value: 2, emoji: '😕' },
  { value: 3, emoji: '😐' },
  { value: 4, emoji: '🙂' },
  { value: 5, emoji: '😊' },
];

export function MoodSelector({ selectedMood, onSelectMood }: MoodSelectorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.moodRow}>
        {MOODS.map((mood) => (
          <MoodButton
            key={mood.value}
            mood={mood.value}
            emoji={mood.emoji}
            isSelected={selectedMood === mood.value}
            onPress={() => onSelectMood(mood.value)}
          />
        ))}
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

interface MoodButtonProps {
  mood: 1 | 2 | 3 | 4 | 5;
  emoji: string;
  isSelected: boolean;
  onPress: () => void;
}

function MoodButton({ mood, emoji, isSelected, onPress }: MoodButtonProps) {
  const scale = useSharedValue(1);
  const backgroundColor = colors.mood[mood];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = async () => {
    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Bounce animation
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
        style={[
          styles.moodButton,
          { backgroundColor },
          isSelected && styles.moodButtonSelected,
          animatedStyle,
        ]}
      >
        <RNText style={styles.emoji}>{emoji}</RNText>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: spacing.xs,
  },
  moodButton: {
    width: 54,
    height: 54,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodButtonSelected: {
    borderColor: colors.primary,
    borderWidth: 3,
  },
  emoji: {
    fontSize: 28,
    textAlign: 'center',
  },
  labelContainer: {
    marginTop: spacing.lg,
  },
  description: {
    marginTop: spacing.xs,
  },
});
