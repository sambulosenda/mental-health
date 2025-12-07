import { View, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { Text } from '@/src/components/ui';
import { MoodAnimation } from './MoodAnimation';
import { colors, darkColors, moodLabels } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';

interface MoodSliderSelectorProps {
  selectedMood: (1 | 2 | 3 | 4 | 5) | null;
  onSelectMood: (mood: 1 | 2 | 3 | 4 | 5) => void;
}

const MOODS: (1 | 2 | 3 | 4 | 5)[] = [1, 2, 3, 4, 5];

export function MoodSliderSelector({ selectedMood, onSelectMood }: MoodSliderSelectorProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;

  const handleSelectMood = async (mood: 1 | 2 | 3 | 4 | 5) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelectMood(mood);
  };

  return (
    <View className="items-center w-full">
      {/* Hero mood display */}
      {selectedMood ? (
        <Animated.View
          entering={FadeIn.duration(300)}
          className="items-center mb-8"
        >
          <HeroMood mood={selectedMood} />
          <Animated.View entering={FadeIn.delay(150).duration(200)}>
            <Text variant="h2" color="textPrimary" center className="mt-6">
              {moodLabels[selectedMood].label}
            </Text>
            <Text variant="body" color="textSecondary" center className="mt-1 px-8">
              {moodLabels[selectedMood].description}
            </Text>
          </Animated.View>
        </Animated.View>
      ) : (
        <View className="items-center mb-8">
          <View
            className="w-28 h-28 rounded-full items-center justify-center"
            style={{ backgroundColor: themeColors.surfaceElevated }}
          >
            <Text variant="h1" style={{ fontSize: 48 }}>?</Text>
          </View>
          <Text variant="h3" color="textPrimary" center className="mt-4">
            How are you feeling?
          </Text>
          <Text variant="body" color="textMuted" center className="mt-1">
            Tap to select your mood
          </Text>
        </View>
      )}

      {/* Mood options */}
      <View className="flex-row justify-center gap-3 w-full px-2">
        {MOODS.map((mood) => (
          <MoodOption
            key={mood}
            mood={mood}
            isSelected={selectedMood === mood}
            onPress={() => handleSelectMood(mood)}
          />
        ))}
      </View>
    </View>
  );
}

interface HeroMoodProps {
  mood: 1 | 2 | 3 | 4 | 5;
}

function HeroMood({ mood }: HeroMoodProps) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0.3);

  // Subtle pulse animation
  scale.value = withRepeat(
    withSequence(
      withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
    ),
    -1,
    true
  );

  glow.value = withRepeat(
    withSequence(
      withTiming(0.5, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      withTiming(0.3, { duration: 1500, easing: Easing.inOut(Easing.ease) })
    ),
    -1,
    true
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: 1.3 }],
  }));

  return (
    <View className="items-center justify-center p-6">
      {/* Glow effect */}
      <Animated.View
        className="absolute w-32 h-32 rounded-full"
        style={[
          { backgroundColor: colors.mood[mood] },
          glowStyle,
        ]}
      />
      {/* Main mood circle */}
      <Animated.View
        className="w-28 h-28 rounded-full items-center justify-center"
        style={[
          { backgroundColor: colors.mood[mood] },
          animatedStyle,
        ]}
      >
        <MoodAnimation mood={mood} size={64} />
      </Animated.View>
    </View>
  );
}

interface MoodOptionProps {
  mood: 1 | 2 | 3 | 4 | 5;
  isSelected: boolean;
  onPress: () => void;
}

function MoodOption({ mood, isSelected, onPress }: MoodOptionProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.9, { damping: 10 }),
      withSpring(1, { damping: 8 })
    );
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable onPress={handlePress} className="items-center">
      <Animated.View
        className="w-14 h-14 rounded-full items-center justify-center"
        style={[
          {
            backgroundColor: isSelected
              ? colors.mood[mood]
              : themeColors.surfaceElevated,
            borderWidth: isSelected ? 0 : 2,
            borderColor: themeColors.border,
          },
          animatedStyle,
        ]}
      >
        <MoodAnimation mood={mood} size={isSelected ? 32 : 28} loop={false} />
      </Animated.View>
      <Text
        variant="caption"
        color={isSelected ? 'textPrimary' : 'textMuted'}
        className="mt-3"
        style={{ fontSize: 10 }}
      >
        {moodLabels[mood].label.split(' ')[0]}
      </Text>
    </Pressable>
  );
}
