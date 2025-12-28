import { useEffect, useState, useCallback, useRef } from 'react';
import { View, Pressable, type LayoutChangeEvent } from 'react-native';
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
  createAudioPlayer,
  formatTime,
  playBell,
  type AudioController,
  type AudioState,
} from '@/src/lib/meditation';

interface AudioSleepStepProps {
  step: ExerciseStep;
  onComplete: () => void;
  accentColor?: string;
}

export function AudioSleepStep({ step, onComplete, accentColor }: AudioSleepStepProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const color = accentColor || themeColors.primary;

  const [audioState, setAudioState] = useState<AudioState>({
    isLoaded: false,
    isPlaying: false,
    isPaused: false,
    positionMs: 0,
    durationMs: 0,
    isBuffering: false,
    error: null,
  });
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const controllerRef = useRef<AudioController | null>(null);
  const progressBarWidthRef = useRef(0);
  const mountedRef = useRef(true);

  const handleProgressBarLayout = useCallback((event: LayoutChangeEvent) => {
    progressBarWidthRef.current = event.nativeEvent.layout.width;
  }, []);

  // Pulsing animation for playing state
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

  const initializePlayer = useCallback(async () => {
    if (!step.audioUrl) {
      setLoadError('No audio URL provided');
      return;
    }

    try {
      const controller = await createAudioPlayer(step.audioUrl, {
        onPlaybackStatusUpdate: (state) => {
          setAudioState(state);
        },
        onComplete: () => {
          setIsComplete(true);
          stopPulseAnimation();
          playBell('end');
        },
        onError: (error) => {
          console.error('Audio playback error:', error);
          setLoadError('Failed to load audio. Try again or use text version.');
          stopPulseAnimation();
        },
      });

      controllerRef.current = controller;
    } catch (error) {
      console.error('Failed to initialize audio player:', error);
      setLoadError('Failed to load audio. Try again or use text version.');
    }
  }, [step.audioUrl, stopPulseAnimation]);

  useEffect(() => {
    mountedRef.current = true;

    const init = async () => {
      await initializePlayer();
      // Check ref after async operation to handle unmount during init
      if (!mountedRef.current && controllerRef.current) {
        controllerRef.current.unload();
        controllerRef.current = null;
      }
    };

    init();

    return () => {
      mountedRef.current = false;
      controllerRef.current?.unload();
    };
  }, [initializePlayer]);

  const handleStart = async () => {
    if (!controllerRef.current) {
      await initializePlayer();
    }
    if (!controllerRef.current) {
      setLoadError('Unable to load audio');
      return;
    }
    setHasStarted(true);
    startPulseAnimation();
    playBell('start');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    controllerRef.current.play();
  };

  const handlePause = () => {
    controllerRef.current?.pause();
    stopPulseAnimation();
  };

  const handleResume = () => {
    controllerRef.current?.resume();
    startPulseAnimation();
  };

  const handleStop = () => {
    controllerRef.current?.stop();
    setHasStarted(false);
    stopPulseAnimation();
  };

  const handleSeek = async (positionMs: number) => {
    await controllerRef.current?.seekTo(positionMs);
  };

  const pulseCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const pulseGlowStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
    transform: [{ scale: pulseScale.value * 1.2 }],
  }));

  const progress = audioState.durationMs > 0
    ? audioState.positionMs / audioState.durationMs
    : 0;

  return (
    <View className="flex-1 items-center justify-center px-6">
      <Text variant="h2" color="textPrimary" center className="mb-2">
        {step.title}
      </Text>
      <Text variant="body" color="textSecondary" center className="mb-8">
        {step.content}
      </Text>

      {/* Main visual area */}
      <View className="items-center justify-center mb-6" style={{ height: 200 }}>
        {audioState.isPlaying && !audioState.isPaused ? (
          <>
            {/* Pulsing circle for playing state */}
            <Animated.View
              className="absolute w-40 h-40 rounded-full"
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
            ) : audioState.isBuffering ? (
              <Ionicons name="hourglass" size={48} color="white" />
            ) : hasStarted && audioState.isPaused ? (
              <Ionicons name="pause" size={48} color="white" />
            ) : (
              <Ionicons name="moon" size={48} color="white" />
            )}
          </View>
        )}
      </View>

      {/* Progress bar */}
      {hasStarted && !isComplete && (
        <View className="w-full px-4 mb-4">
          <Pressable
            onLayout={handleProgressBarLayout}
            onPress={(e) => {
              const { locationX } = e.nativeEvent;
              const width = progressBarWidthRef.current;
              if (width <= 0 || audioState.durationMs <= 0) return;
              const seekPosition = Math.max(0, Math.min(
                (locationX / width) * audioState.durationMs,
                audioState.durationMs
              ));
              handleSeek(seekPosition);
            }}
            className="h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: `${color}30` }}
          >
            <View
              className="h-full rounded-full"
              style={{
                backgroundColor: color,
                width: `${progress * 100}%`,
              }}
            />
          </Pressable>
          <View className="flex-row justify-between mt-2">
            <Text variant="caption" color="textMuted">
              {formatTime(audioState.positionMs)}
            </Text>
            <Text variant="caption" color="textMuted">
              {formatTime(audioState.durationMs)}
            </Text>
          </View>
        </View>
      )}

      {/* Status text */}
      {audioState.isBuffering && (
        <Text variant="caption" color="textMuted" center className="mb-4">
          Loading...
        </Text>
      )}

      {/* Error message */}
      {loadError && (
        <View className="bg-amber-100 dark:bg-amber-900/30 px-4 py-2 rounded-lg mb-4">
          <Text variant="caption" color="textSecondary" center>
            {loadError}
          </Text>
        </View>
      )}

      {/* Controls */}
      {!hasStarted && !isComplete && !loadError && (
        <Button onPress={handleStart} style={{ backgroundColor: color }}>
          Begin
        </Button>
      )}

      {/* Show skip button when there's an error */}
      {loadError && !isComplete && (
        <Button onPress={onComplete} style={{ backgroundColor: color }}>
          Skip to Continue
        </Button>
      )}

      {hasStarted && !isComplete && (
        <View className="flex-row items-center gap-4">
          <Pressable
            onPress={audioState.isPaused ? handleResume : handlePause}
            className="w-14 h-14 rounded-full items-center justify-center"
            style={{ backgroundColor: color }}
          >
            <Ionicons name={audioState.isPaused ? 'play' : 'pause'} size={28} color="white" />
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
