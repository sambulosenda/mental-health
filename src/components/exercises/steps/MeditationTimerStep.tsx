import { useEffect, useState, useCallback, useRef } from 'react';
import { View, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button } from '@/src/components/ui';
import { colors, darkColors } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import type { ExerciseStep } from '@/src/types/exercise';
import { playBell } from '@/src/lib/meditation';

interface MeditationTimerStepProps {
  step: ExerciseStep;
  onComplete: () => void;
  accentColor?: string;
}

export function MeditationTimerStep({ step, onComplete, accentColor }: MeditationTimerStepProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const color = accentColor || themeColors.primary;

  const totalDuration = step.duration || 300; // default 5 minutes
  const intervalBell = step.intervalBellSeconds || 60; // default bell every minute
  const showBreathingGuide = step.showBreathingGuide ?? true;

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(totalDuration);
  const [isComplete, setIsComplete] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Breathing animation
  const breathScale = useSharedValue(1);
  const breathOpacity = useSharedValue(0.3);

  const startBreathAnimation = useCallback(() => {
    if (!showBreathingGuide) return;

    breathScale.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    breathOpacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 4000 }),
        withTiming(0.2, { duration: 4000 })
      ),
      -1,
      false
    );
  }, [showBreathingGuide, breathScale, breathOpacity]);

  const stopBreathAnimation = useCallback(() => {
    cancelAnimation(breathScale);
    cancelAnimation(breathOpacity);
    breathScale.value = withTiming(1);
    breathOpacity.value = withTiming(0.3);
  }, [breathScale, breathOpacity]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, []);

  useEffect(() => {
    if (!isRunning || isPaused) {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;

        // Check for interval bell
        if (intervalBell > 0) {
          const elapsed = totalDuration - next;
          if (elapsed > 0 && elapsed % intervalBell === 0 && next > 0) {
            playBell('interval');
          }
        }

        // Check for completion
        if (next <= 0) {
          setIsRunning(false);
          setIsComplete(true);
          clearTimer();
          stopBreathAnimation();
          playBell('end');
          return 0;
        }

        return next;
      });
    }, 1000);

    return () => clearTimer();
  }, [isRunning, isPaused, intervalBell, totalDuration, stopBreathAnimation]);

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
    playBell('start');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startBreathAnimation();
  };

  const handlePause = () => {
    setIsPaused(true);
    stopBreathAnimation();
  };

  const handleResume = () => {
    setIsPaused(false);
    startBreathAnimation();
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    setSecondsLeft(totalDuration);
    clearTimer();
    stopBreathAnimation();
  };

  const progress = 1 - secondsLeft / totalDuration;

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: breathOpacity.value,
    transform: [{ scale: breathScale.value * 1.2 }],
  }));

  return (
    <View className="flex-1 items-center justify-center px-6">
      <Text variant="h2" color="textPrimary" center className="mb-2">
        {step.title}
      </Text>
      <Text variant="body" color="textSecondary" center className="mb-8">
        {step.content}
      </Text>

      {/* Timer circle */}
      <View className="items-center justify-center mb-8" style={{ height: 240 }}>
        {showBreathingGuide && isRunning && !isPaused ? (
          <>
            {/* Animated breathing circle */}
            <Animated.View
              className="absolute w-44 h-44 rounded-full"
              style={[{ backgroundColor: color }, glowStyle]}
            />
            <Animated.View
              className="w-40 h-40 rounded-full items-center justify-center"
              style={[{ backgroundColor: color }, circleStyle]}
            >
              <Text variant="h1" style={{ color: 'white', fontSize: 36 }}>
                {formatTime(secondsLeft)}
              </Text>
            </Animated.View>
          </>
        ) : (
          /* Static circle */
          <View
            className="w-40 h-40 rounded-full items-center justify-center"
            style={{ backgroundColor: color }}
          >
            {isComplete ? (
              <Ionicons name="checkmark" size={56} color="white" />
            ) : (
              <Text variant="h1" style={{ color: 'white', fontSize: 36 }}>
                {formatTime(secondsLeft)}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Progress bar */}
      {isRunning && !isComplete && (
        <View className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full mb-4 overflow-hidden">
          <View
            className="h-full rounded-full"
            style={{
              backgroundColor: color,
              width: `${progress * 100}%`,
            }}
          />
        </View>
      )}

      {/* Status text */}
      <Text variant="caption" color="textMuted" center className="mb-6">
        {isComplete
          ? 'Meditation complete'
          : isRunning
          ? isPaused
            ? 'Paused'
            : showBreathingGuide
            ? 'Follow the breath'
            : 'Meditate in silence'
          : `${Math.round(totalDuration / 60)} minute session`}
      </Text>

      {/* Controls */}
      {!isRunning && !isComplete && (
        <Button onPress={handleStart} style={{ backgroundColor: color }}>
          Begin
        </Button>
      )}

      {isRunning && !isComplete && (
        <View className="flex-row items-center gap-4">
          <Pressable
            onPress={isPaused ? handleResume : handlePause}
            className="w-14 h-14 rounded-full items-center justify-center"
            style={{ backgroundColor: color }}
          >
            <Ionicons name={isPaused ? 'play' : 'pause'} size={28} color="white" />
          </Pressable>
          <Pressable onPress={handleStop}>
            <Text variant="bodyMedium" color="textMuted">
              End early
            </Text>
          </Pressable>
        </View>
      )}

      {isComplete && (
        <Button onPress={onComplete} style={{ backgroundColor: color }}>
          Continue
        </Button>
      )}
    </View>
  );
}
