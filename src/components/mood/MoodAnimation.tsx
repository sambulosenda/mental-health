import { useRef, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import { colors } from '@/src/constants/theme';

type MoodValue = 1 | 2 | 3 | 4 | 5;

interface MoodAnimationProps {
  mood: MoodValue;
  size?: number;
  autoPlay?: boolean;
  loop?: boolean;
  onPress?: () => void;
}

// Fallback emojis if animations not loaded
const MOOD_FALLBACK = {
  1: '😔',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😊',
} as const;

// Animation sources - replace with your custom Lottie files
const MOOD_ANIMATIONS: Record<MoodValue, any> = {
  1: require('@/assets/animations/mood-1-sad.json'),
  2: require('@/assets/animations/mood-2-down.json'),
  3: require('@/assets/animations/mood-3-neutral.json'),
  4: require('@/assets/animations/mood-4-good.json'),
  5: require('@/assets/animations/mood-5-great.json'),
};

export function MoodAnimation({
  mood,
  size = 48,
  autoPlay = true,
  loop = true,
}: MoodAnimationProps) {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    if (autoPlay && animationRef.current) {
      animationRef.current.play();
    }
  }, [autoPlay, mood]);

  // Try to load animation, fall back to emoji
  try {
    const source = MOOD_ANIMATIONS[mood];

    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <LottieView
          ref={animationRef}
          source={source}
          style={{ width: size, height: size }}
          autoPlay={autoPlay}
          loop={loop}
          speed={0.8}
        />
      </View>
    );
  } catch {
    // Fallback to emoji if animation fails
    return (
      <View style={[styles.container, styles.fallback, { width: size, height: size }]}>
        <Text style={[styles.emoji, { fontSize: size * 0.7 }]}>
          {MOOD_FALLBACK[mood]}
        </Text>
      </View>
    );
  }
}

// Smaller variant for lists/cards
export function MoodAnimationSmall({ mood }: { mood: MoodValue }) {
  return <MoodAnimation mood={mood} size={32} />;
}

// Larger variant for mood selection
export function MoodAnimationLarge({ mood }: { mood: MoodValue }) {
  return <MoodAnimation mood={mood} size={64} />;
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallback: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 999,
  },
  emoji: {
    textAlign: 'center',
  },
});
