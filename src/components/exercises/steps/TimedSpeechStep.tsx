import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
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
import {
  createMeditationSpeaker,
  type SpeechController,
  playBell,
} from '@/src/lib/meditation';

interface TimedSpeechStepProps {
  step: ExerciseStep;
  onComplete: () => void;
  accentColor?: string;
}

export function TimedSpeechStep({ step, onComplete, accentColor }: TimedSpeechStepProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const color = accentColor || themeColors.primary;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isInPause, setIsInPause] = useState(false);
  const [showBreathCue, setShowBreathCue] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const controllerRef = useRef<SpeechController | null>(null);

  const segments = useMemo(() => step.speechSegments || [], [step.speechSegments]);
  const totalSegments = segments.length;

  // Breathing animation for pause cues
  const breathScale = useSharedValue(1);
  const breathOpacity = useSharedValue(0.3);

  const startBreathAnimation = useCallback(() => {
    breathScale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    breathOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 4000 }),
        withTiming(0.3, { duration: 4000 })
      ),
      -1,
      false
    );
  }, [breathScale, breathOpacity]);

  const stopBreathAnimation = useCallback(() => {
    cancelAnimation(breathScale);
    cancelAnimation(breathOpacity);
    breathScale.value = withTiming(1);
    breathOpacity.value = withTiming(0.3);
  }, [breathScale, breathOpacity]);

  const initializeSpeaker = useCallback(async () => {
    if (segments.length === 0) return;

    const controller = await createMeditationSpeaker(
      segments,
      step.voiceConfig || { rate: 0.85, pitch: 1.0 },
      {
        onSegmentStart: (index, text) => {
          setCurrentSegmentIndex(index);
          setCurrentText(text);
          setIsInPause(false);
          setShowBreathCue(false);
          stopBreathAnimation();
        },
        onPauseStart: (duration, breathCue) => {
          setIsInPause(true);
          setShowBreathCue(breathCue);
          if (breathCue) {
            startBreathAnimation();
          }
        },
        onPauseEnd: () => {
          setIsInPause(false);
          setShowBreathCue(false);
          stopBreathAnimation();
        },
        onComplete: () => {
          setIsPlaying(false);
          setIsComplete(true);
          stopBreathAnimation();
          playBell('end');
        },
        onError: (err) => {
          console.error('Speech error:', err);
          setIsPlaying(false);
          setError('Voice guidance unavailable. You can still continue manually.');
          stopBreathAnimation();
        },
      }
    );

    controllerRef.current = controller;
  }, [segments, step.voiceConfig, startBreathAnimation, stopBreathAnimation]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      await initializeSpeaker();
      // If unmounted during init, stop the orphaned speaker
      if (!mounted && controllerRef.current) {
        controllerRef.current.stop();
        controllerRef.current = null;
      }
    };

    init();

    return () => {
      mounted = false;
      controllerRef.current?.stop();
    };
  }, [initializeSpeaker]);

  const handleStart = async () => {
    if (!controllerRef.current) {
      await initializeSpeaker();
    }
    // Check controller exists after initialization attempt
    if (!controllerRef.current) {
      setError('Voice guidance unavailable. You can still continue manually.');
      return;
    }
    setIsPlaying(true);
    setIsPaused(false);
    playBell('start');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    controllerRef.current.play();
  };

  const handlePause = () => {
    setIsPaused(true);
    controllerRef.current?.pause();
    stopBreathAnimation();
  };

  const handleResume = () => {
    setIsPaused(false);
    controllerRef.current?.resume();
    if (showBreathCue) {
      startBreathAnimation();
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentSegmentIndex(0);
    setCurrentText('');
    controllerRef.current?.stop();
    stopBreathAnimation();
  };

  const breathCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathScale.value }],
  }));

  const breathGlowStyle = useAnimatedStyle(() => ({
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

      {/* Main visual area */}
      <View className="items-center justify-center mb-8" style={{ height: 220 }}>
        {showBreathCue && isPlaying && !isPaused ? (
          <>
            {/* Breathing circle for pause cues */}
            <Animated.View
              className="absolute w-40 h-40 rounded-full"
              style={[{ backgroundColor: color }, breathGlowStyle]}
            />
            <Animated.View
              className="w-36 h-36 rounded-full items-center justify-center"
              style={[{ backgroundColor: color }, breathCircleStyle]}
            >
              <Text variant="body" style={{ color: 'white' }}>
                Breathe
              </Text>
            </Animated.View>
          </>
        ) : (
          /* Static circle with status */
          <View
            className="w-36 h-36 rounded-full items-center justify-center"
            style={{ backgroundColor: color }}
          >
            {isComplete ? (
              <Ionicons name="checkmark" size={48} color="white" />
            ) : isPlaying ? (
              <Ionicons name={isPaused ? 'pause' : 'volume-high'} size={48} color="white" />
            ) : (
              <Ionicons name="play" size={48} color="white" />
            )}
          </View>
        )}
      </View>

      {/* Current speech text */}
      {isPlaying && currentText && !isInPause && (
        <View className="px-4 mb-4" style={{ minHeight: 60 }}>
          <Text variant="body" color="textPrimary" center style={{ fontStyle: 'italic' }}>
            {`"${currentText}"`}
          </Text>
        </View>
      )}

      {/* Pause indicator */}
      {isPlaying && isInPause && !showBreathCue && (
        <Text variant="body" color="textMuted" center className="mb-4">
          ...
        </Text>
      )}

      {/* Progress */}
      <Text variant="caption" color="textMuted" center className="mb-6">
        {isComplete
          ? 'Complete'
          : isPlaying
          ? `${currentSegmentIndex + 1} of ${totalSegments}`
          : `${totalSegments} segments`}
      </Text>

      {/* Error message */}
      {error && (
        <View className="bg-amber-100 dark:bg-amber-900/30 px-4 py-2 rounded-lg mb-4">
          <Text variant="caption" color="textSecondary" center>
            {error}
          </Text>
        </View>
      )}

      {/* Controls */}
      {!isPlaying && !isComplete && !error && (
        <Button onPress={handleStart} style={{ backgroundColor: color }}>
          Begin
        </Button>
      )}

      {/* Show skip button when there's an error */}
      {error && !isComplete && (
        <Button onPress={onComplete} style={{ backgroundColor: color }}>
          Skip to Continue
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
