import { useEffect, useState, useCallback, useRef } from 'react';
import { View, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button } from '@/src/components/ui';
import { colors, darkColors } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import { playBell } from '@/src/lib/meditation';
import {
  playMeditationAudio,
  pauseMeditationAudio,
  resumeMeditationAudio,
  stopMeditationAudio,
  isMeditationPlaying,
} from '@/src/lib/meditation/meditationVoice';
import type { ExerciseStep } from '@/src/types/exercise';

interface AudioMeditationStepProps {
  step: ExerciseStep;
  meditationId: string;
  onComplete: () => void;
  accentColor?: string;
}

// Track which meditations have started playing to avoid restarting on subsequent steps
const playedMeditations = new Set<string>();

export function AudioMeditationStep({
  step,
  meditationId,
  onComplete,
  accentColor,
}: AudioMeditationStepProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const color = accentColor || themeColors.primary;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const sessionKeyRef = useRef<string>(`${meditationId}-${Date.now()}`);

  // Check if this is a subsequent step (audio already playing/played)
  const isSubsequentStep = step.id !== 'intro' && playedMeditations.has(meditationId);

  // Breathing animation for visual feedback
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.3);

  const startPulseAnimation = useCallback(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 2000 }),
        withTiming(0.3, { duration: 2000 })
      ),
      -1,
      false
    );
  }, [pulseScale, pulseOpacity]);

  const stopPulseAnimation = useCallback(() => {
    cancelAnimation(pulseScale);
    cancelAnimation(pulseOpacity);
    pulseScale.value = withTiming(1);
    pulseOpacity.value = withTiming(0.3);
  }, [pulseScale, pulseOpacity]);

  // If this is a subsequent step and audio already played, auto-complete
  useEffect(() => {
    if (isSubsequentStep) {
      // Small delay so user sees the step briefly
      const timer = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isSubsequentStep, onComplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't stop audio on unmount - it should keep playing through steps
      stopPulseAnimation();
    };
  }, [stopPulseAnimation]);

  // Clear played meditations when component for 'intro' step unmounts (meditation ended)
  useEffect(() => {
    if (step.id === 'intro') {
      return () => {
        // Clear the tracking when intro step unmounts (user left or completed)
        playedMeditations.delete(meditationId);
      };
    }
  }, [step.id, meditationId]);

  const handleStart = async () => {
    setHasStarted(true);
    setIsPlaying(true);
    setIsPaused(false);
    playedMeditations.add(meditationId);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    playBell('start');
    startPulseAnimation();

    await playMeditationAudio(meditationId, () => {
      // Audio finished
      setIsPlaying(false);
      setIsComplete(true);
      stopPulseAnimation();
      playBell('end');
    });
  };

  const handlePause = async () => {
    setIsPaused(true);
    await pauseMeditationAudio();
    stopPulseAnimation();
  };

  const handleResume = async () => {
    setIsPaused(false);
    await resumeMeditationAudio();
    startPulseAnimation();
  };

  const handleStop = async () => {
    setIsPlaying(false);
    setIsPaused(false);
    await stopMeditationAudio();
    stopPulseAnimation();
    playedMeditations.delete(meditationId);
  };

  const pulseCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const pulseGlowStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
    transform: [{ scale: pulseScale.value * 1.3 }],
  }));

  // If subsequent step, show minimal UI while auto-advancing
  if (isSubsequentStep) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <View
          className="w-36 h-36 rounded-full items-center justify-center"
          style={{ backgroundColor: color }}
        >
          <Ionicons name="musical-notes" size={48} color="white" />
        </View>
        <Text variant="body" color="textMuted" center className="mt-6">
          Continuing meditation...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center px-6">
      <Text variant="h2" color="textPrimary" center className="mb-2">
        {step.title}
      </Text>
      <Text variant="body" color="textSecondary" center className="mb-8">
        {step.content}
      </Text>

      {/* Main visual area */}
      <View className="items-center justify-center mb-8" style={{ height: 220 }}>
        {isPlaying && !isPaused ? (
          <>
            {/* Animated glow */}
            <Animated.View
              className="absolute w-44 h-44 rounded-full"
              style={[{ backgroundColor: color }, pulseGlowStyle]}
            />
            <Animated.View
              className="w-36 h-36 rounded-full items-center justify-center"
              style={[{ backgroundColor: color }, pulseCircleStyle]}
            >
              <Ionicons name="musical-notes" size={48} color="white" />
            </Animated.View>
          </>
        ) : (
          <View
            className="w-36 h-36 rounded-full items-center justify-center"
            style={{ backgroundColor: color }}
          >
            {isComplete ? (
              <Ionicons name="checkmark" size={48} color="white" />
            ) : isPaused ? (
              <Ionicons name="pause" size={48} color="white" />
            ) : (
              <Ionicons name="play" size={48} color="white" />
            )}
          </View>
        )}
      </View>

      {/* Status text */}
      <Text variant="body" color="textMuted" center className="mb-6">
        {isComplete
          ? 'Meditation complete'
          : isPlaying
          ? isPaused
            ? 'Paused'
            : 'Playing guided meditation...'
          : 'Pre-recorded voice guidance'}
      </Text>

      {/* Controls */}
      {!hasStarted && !isComplete && (
        <Button onPress={handleStart} style={{ backgroundColor: color }}>
          Begin Meditation
        </Button>
      )}

      {isPlaying && !isComplete && (
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
              Stop
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
