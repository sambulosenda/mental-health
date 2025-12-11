import { useCallback } from 'react';
import { View, LayoutChangeEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  runOnJS,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { Text } from '@/src/components/ui';
import { MoodAnimation } from './MoodAnimation';
import { colors, darkColors, moodLabels } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';

interface MoodGradientSliderProps {
  selectedMood: (1 | 2 | 3 | 4 | 5) | null;
  onSelectMood: (mood: 1 | 2 | 3 | 4 | 5) => void;
}

const MOODS: (1 | 2 | 3 | 4 | 5)[] = [1, 2, 3, 4, 5];
const MOOD_POSITIONS = [0, 0.25, 0.5, 0.75, 1];
const THUMB_SIZE = 56;
const TRACK_HEIGHT = 64;
const TRACK_PADDING = 4;

const GRADIENT_COLORS = [
  colors.mood[1],
  colors.mood[2],
  colors.mood[3],
  colors.mood[4],
  colors.mood[5],
] as const;

// Helper to snap to nearest mood - returns mood (1-5) and target position
// This is a worklet so it can be called from gesture handlers
function getSnapInfo(normalizedPosition: number): { mood: 1 | 2 | 3 | 4 | 5; targetPosition: number } {
  'worklet';
  // Simplified snap logic - find nearest of 5 positions
  const positions = [0, 0.25, 0.5, 0.75, 1];
  const moods = [1, 2, 3, 4, 5] as const;

  let nearestIndex = 0;
  let minDist = Math.abs(normalizedPosition - positions[0]);

  for (let i = 1; i < 5; i++) {
    const dist = Math.abs(normalizedPosition - positions[i]);
    if (dist < minDist) {
      minDist = dist;
      nearestIndex = i;
    }
  }

  return {
    mood: moods[nearestIndex],
    targetPosition: positions[nearestIndex],
  };
}

export function MoodGradientSlider({ selectedMood, onSelectMood }: MoodGradientSliderProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;

  // Use shared value for track width so worklets can access it
  const trackWidthValue = useSharedValue(0);
  const position = useSharedValue(selectedMood ? MOOD_POSITIONS[selectedMood - 1] : 0.5);
  const isDragging = useSharedValue(false);
  const hasSelected = useSharedValue(selectedMood !== null);

  const handleMoodSelect = useCallback((mood: 1 | 2 | 3 | 4 | 5) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelectMood(mood);
  }, [onSelectMood]);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      'worklet';
      isDragging.value = true;
    })
    .onUpdate((e) => {
      'worklet';
      const usableWidth = trackWidthValue.value - THUMB_SIZE - TRACK_PADDING * 2;
      if (usableWidth <= 0) return;

      const newPosition = Math.max(0, Math.min(1,
        (e.x - THUMB_SIZE / 2 - TRACK_PADDING) / usableWidth
      ));
      position.value = newPosition;
    })
    .onEnd(() => {
      'worklet';
      isDragging.value = false;
      hasSelected.value = true;

      const { mood, targetPosition } = getSnapInfo(position.value);

      position.value = withSpring(targetPosition, {
        damping: 20,
        stiffness: 200,
        mass: 0.8,
      });

      runOnJS(handleMoodSelect)(mood);
    });

  const tapGesture = Gesture.Tap()
    .onEnd((e) => {
      'worklet';
      const usableWidth = trackWidthValue.value - THUMB_SIZE - TRACK_PADDING * 2;
      if (usableWidth <= 0) return;

      hasSelected.value = true;
      const newPosition = Math.max(0, Math.min(1,
        (e.x - THUMB_SIZE / 2 - TRACK_PADDING) / usableWidth
      ));

      const { mood, targetPosition } = getSnapInfo(newPosition);

      position.value = withSpring(targetPosition, {
        damping: 20,
        stiffness: 200,
        mass: 0.8,
      });

      runOnJS(handleMoodSelect)(mood);
    });

  const composedGesture = Gesture.Race(panGesture, tapGesture);

  const thumbStyle = useAnimatedStyle(() => {
    'worklet';
    const usableWidth = Math.max(0, trackWidthValue.value - THUMB_SIZE - TRACK_PADDING * 2);
    const translateX = TRACK_PADDING + position.value * usableWidth;
    const scale = isDragging.value ? 1.1 : 1;

    return {
      transform: [
        { translateX },
        { scale: withSpring(scale, { damping: 15 }) },
      ],
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    'worklet';
    const usableWidth = Math.max(0, trackWidthValue.value - THUMB_SIZE - TRACK_PADDING * 2);
    const translateX = TRACK_PADDING + position.value * usableWidth;
    const glowOpacity = hasSelected.value
      ? withRepeat(
          withSequence(
            withTiming(0.6, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        )
      : 0;

    return {
      transform: [{ translateX }],
      opacity: glowOpacity,
    };
  });

  const currentMoodIndex = selectedMood ? selectedMood - 1 : 2;
  const currentMood = MOODS[currentMoodIndex];

  const handleLayout = (e: LayoutChangeEvent) => {
    trackWidthValue.value = e.nativeEvent.layout.width;
  };

  return (
    <View className="w-full">
      {/* Mood label display */}
      <View className="items-center mb-8 min-h-[80px] justify-center">
        {selectedMood ? (
          <Animated.View entering={FadeIn.duration(300)} className="items-center">
            <Text variant="h2" color="textPrimary" center>
              {moodLabels[selectedMood].label}
            </Text>
            <Text variant="body" color="textMuted" center className="mt-2 px-4">
              {moodLabels[selectedMood].description}
            </Text>
          </Animated.View>
        ) : (
          <View className="items-center">
            <Text variant="h3" color="textPrimary" center>
              Slide to reflect
            </Text>
            <Text variant="body" color="textMuted" center className="mt-2">
              How are you feeling right now?
            </Text>
          </View>
        )}
      </View>

      {/* Slider track */}
      <GestureDetector gesture={composedGesture}>
        <Animated.View
          className="w-full overflow-hidden"
          style={{
            height: TRACK_HEIGHT,
            borderRadius: TRACK_HEIGHT / 2,
          }}
          onLayout={handleLayout}
        >
          {/* Gradient background */}
          <LinearGradient
            colors={GRADIENT_COLORS}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              borderRadius: TRACK_HEIGHT / 2,
            }}
          />

          {/* Subtle overlay for depth */}
          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              backgroundColor: isDark ? 'rgba(26,29,36,0.2)' : 'rgba(255,255,255,0.15)',
              borderRadius: TRACK_HEIGHT / 2,
            }}
          />

          {/* Glow effect behind thumb */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: (TRACK_HEIGHT - THUMB_SIZE * 1.5) / 2,
                width: THUMB_SIZE * 1.5,
                height: THUMB_SIZE * 1.5,
                borderRadius: THUMB_SIZE * 0.75,
                backgroundColor: selectedMood ? colors.mood[selectedMood] : colors.mood[3],
              },
              glowStyle,
            ]}
          />

          {/* Draggable thumb */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: (TRACK_HEIGHT - THUMB_SIZE) / 2,
                width: THUMB_SIZE,
                height: THUMB_SIZE,
                borderRadius: THUMB_SIZE / 2,
                backgroundColor: themeColors.surface,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 4,
              },
              thumbStyle,
            ]}
          >
            <MoodAnimation mood={currentMood} size={36} loop={false} />
          </Animated.View>

          {/* Tick marks */}
          <View
            style={{
              position: 'absolute',
              left: TRACK_PADDING + THUMB_SIZE / 2,
              right: TRACK_PADDING + THUMB_SIZE / 2,
              top: 0,
              bottom: 0,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            {MOODS.map((mood) => (
              <View
                key={mood}
                style={{
                  width: 3,
                  height: 3,
                  borderRadius: 1.5,
                  backgroundColor: isDark ? 'rgba(247,248,250,0.3)' : 'rgba(47,52,65,0.15)',
                }}
              />
            ))}
          </View>
        </Animated.View>
      </GestureDetector>

      {/* Mood labels below track */}
      <View
        className="flex-row justify-between mt-3"
        style={{ paddingHorizontal: TRACK_PADDING + THUMB_SIZE / 2 - 8 }}
      >
        <Text variant="label" color="textMuted" style={{ fontSize: 11 }}>
          Struggling
        </Text>
        <Text variant="label" color="textMuted" style={{ fontSize: 11 }}>
          Great
        </Text>
      </View>
    </View>
  );
}
