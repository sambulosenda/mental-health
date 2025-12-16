import { useEffect, useState, useCallback } from 'react';
import { View, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
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
import type { ExerciseStep } from '@/src/types/exercise';

interface BreathingStepProps {
  step: ExerciseStep;
  onComplete: () => void;
  accentColor?: string;
}

type BreathingPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out';

const PHASE_DURATION = 4000; // 4 seconds per phase
const PHASES: BreathingPhase[] = ['inhale', 'hold-in', 'exhale', 'hold-out'];
const PHASE_LABELS: Record<BreathingPhase, string> = {
  'inhale': 'Breathe In',
  'hold-in': 'Hold',
  'exhale': 'Breathe Out',
  'hold-out': 'Hold',
};

export function BreathingStep({ step, onComplete, accentColor }: BreathingStepProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const color = accentColor || themeColors.primary;

  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<BreathingPhase>('inhale');
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(4);

  const totalDuration = step.duration || 120; // default 2 minutes
  // Ensure at least 1 cycle even if duration < 16
  const totalCycles = Math.max(1, Math.floor(totalDuration / 16)); // 16 seconds per full box cycle

  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.3);

  const updatePhase = useCallback((newPhase: BreathingPhase) => {
    setPhase(newPhase);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const incrementCycle = useCallback(() => {
    setCyclesCompleted(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    let phaseIndex = 0;
    let secondsInPhase = 4;

    // Countdown timer
    const countdownInterval = setInterval(() => {
      secondsInPhase -= 1;
      if (secondsInPhase > 0) {
        setSecondsLeft(secondsInPhase);
      } else {
        secondsInPhase = 4;
        setSecondsLeft(4);
        phaseIndex = (phaseIndex + 1) % 4;
        updatePhase(PHASES[phaseIndex]);

        // Completed a full cycle
        if (phaseIndex === 0) {
          incrementCycle();
        }
      }
    }, 1000);

    return () => {
      clearInterval(countdownInterval);
    };
  }, [isRunning, updatePhase, incrementCycle]);

  // Animate the circle based on phase
  useEffect(() => {
    if (!isRunning) {
      scale.value = 1;
      opacity.value = 0.3;
      return;
    }

    switch (phase) {
      case 'inhale':
        scale.value = withTiming(1.5, { duration: PHASE_DURATION, easing: Easing.inOut(Easing.ease) });
        opacity.value = withTiming(0.6, { duration: PHASE_DURATION });
        break;
      case 'hold-in':
        // Hold at expanded
        break;
      case 'exhale':
        scale.value = withTiming(1, { duration: PHASE_DURATION, easing: Easing.inOut(Easing.ease) });
        opacity.value = withTiming(0.3, { duration: PHASE_DURATION });
        break;
      case 'hold-out':
        // Hold at contracted
        break;
    }

    // Cleanup animations on unmount or when isRunning changes
    return () => {
      cancelAnimation(scale);
      cancelAnimation(opacity);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, isRunning]);

  // Check if exercise is complete
  useEffect(() => {
    if (cyclesCompleted >= totalCycles && isRunning) {
      setIsRunning(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [cyclesCompleted, totalCycles, isRunning]);

  const handleStart = () => {
    setIsRunning(true);
    setCyclesCompleted(0);
    setPhase('inhale');
    setSecondsLeft(4);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleStop = () => {
    setIsRunning(false);
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

  const isComplete = cyclesCompleted >= totalCycles;

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
                {secondsLeft}
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
      {isRunning && (
        <Text variant="h3" color="textPrimary" center className="mb-2">
          {PHASE_LABELS[phase]}
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
        <Button onPress={handleStart} style={{ backgroundColor: color }}>
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
