import { useEffect } from 'react';
import { View, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button } from '@/src/components/ui';
import { colors, darkColors } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useBreathing, DEFAULT_BREATHING_CONFIG } from '@/src/hooks/useBreathing';
import type { ExerciseStep, BreathingPhase } from '@/src/types/exercise';

interface BreathingStepProps {
  step: ExerciseStep;
  onComplete: () => void;
  accentColor?: string;
}

export function BreathingStep({ step, onComplete, accentColor }: BreathingStepProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const color = accentColor || themeColors.primary;

  // Use config from step or fall back to default box breathing
  const config = step.breathingConfig || DEFAULT_BREATHING_CONFIG;
  const totalDuration = step.duration || 120;
  const enableVoice = step.enableVoiceGuidance ?? false;
  const enableHaptics = step.enableHaptics ?? true;

  const {
    isRunning,
    currentPhase,
    phaseSecondsLeft,
    cyclesCompleted,
    totalCycles,
    start,
    stop,
  } = useBreathing({
    config,
    totalDurationSeconds: totalDuration,
    enableVoice,
    enableHaptics,
    onComplete,
  });

  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.3);

  // Get current phase duration for animation
  const phaseDurationMs = (currentPhase?.durationSeconds || 4) * 1000;

  // Animate the circle based on phase
  useEffect(() => {
    if (!isRunning || !currentPhase) {
      scale.value = withTiming(1, { duration: 300 });
      opacity.value = withTiming(0.3, { duration: 300 });
      return;
    }

    const phaseName = currentPhase.name as BreathingPhase;

    switch (phaseName) {
      case 'inhale':
        scale.value = withTiming(1.5, { duration: phaseDurationMs, easing: Easing.inOut(Easing.ease) });
        opacity.value = withTiming(0.6, { duration: phaseDurationMs });
        break;
      case 'hold-in':
        // Hold at expanded - no animation change
        break;
      case 'exhale':
        scale.value = withTiming(1, { duration: phaseDurationMs, easing: Easing.inOut(Easing.ease) });
        opacity.value = withTiming(0.3, { duration: phaseDurationMs });
        break;
      case 'hold-out':
        // Hold at contracted - no animation change
        break;
    }

    return () => {
      cancelAnimation(scale);
      cancelAnimation(opacity);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPhase, isRunning, phaseDurationMs]);

  const handleStop = () => {
    stop();
    cancelAnimation(scale);
    cancelAnimation(opacity);
    scale.value = withTiming(1);
    opacity.value = withTiming(0.3);
  };

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value * 1.2 }],
  }));

  const isComplete = cyclesCompleted >= totalCycles && !isRunning;

  return (
    <View className="flex-1 items-center justify-center px-6">
      <Text variant="h2" color="textPrimary" center className="mb-2">
        {step.title}
      </Text>
      <Text variant="body" color="textSecondary" center className="mb-8">
        {step.content}
      </Text>

      {/* Breathing circle */}
      <View className="items-center justify-center mb-8" style={{ height: 220 }}>
        {/* Glow */}
        <Animated.View
          className="absolute w-40 h-40 rounded-full"
          style={[{ backgroundColor: color }, glowStyle]}
        />

        {/* Main circle */}
        <Animated.View
          className="w-36 h-36 rounded-full items-center justify-center"
          style={[{ backgroundColor: color }, circleStyle]}
        >
          {isRunning ? (
            <View className="items-center">
              <Text variant="h1" style={{ color: 'white', fontSize: 40 }}>
                {phaseSecondsLeft}
              </Text>
            </View>
          ) : isComplete ? (
            <Ionicons name="checkmark" size={48} color="white" />
          ) : (
            <Ionicons name="play" size={48} color="white" />
          )}
        </Animated.View>
      </View>

      {/* Phase label */}
      {isRunning && currentPhase && (
        <Text variant="h3" color="textPrimary" center className="mb-2">
          {currentPhase.label}
        </Text>
      )}

      {/* Progress */}
      <Text variant="caption" color="textMuted" center className="mb-6">
        {isComplete
          ? 'Exercise complete!'
          : isRunning
          ? `Cycle ${cyclesCompleted + 1} of ${totalCycles}`
          : `${totalCycles} cycles • ${Math.round(totalDuration / 60)} minutes`}
      </Text>

      {/* Controls */}
      {!isRunning && !isComplete && (
        <Button onPress={start} style={{ backgroundColor: color }}>
          Start Breathing
        </Button>
      )}

      {isRunning && (
        <Pressable onPress={handleStop}>
          <Text variant="bodyMedium" color="textMuted">
            Tap to stop
          </Text>
        </Pressable>
      )}

      {isComplete && (
        <Button onPress={onComplete} style={{ backgroundColor: color }}>
          Continue
        </Button>
      )}
    </View>
  );
}
