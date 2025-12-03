import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius } from '@/src/constants/theme';
import { useVoiceRecognition } from '@/src/hooks/useVoiceRecognition';
import { Text } from '@/src/components/ui';

interface VoiceButtonProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

export function VoiceButton({ onTranscription, disabled }: VoiceButtonProps) {
  const {
    state,
    partialTranscript,
    error,
    isAvailable,
    startListening,
    stopListening,
    cancelListening,
  } = useVoiceRecognition({
    onTranscription,
  });

  const isRecording = state === 'listening';
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (isRecording) {
      // Pulse animation while recording
      scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.7, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
    } else {
      cancelAnimation(scale);
      cancelAnimation(opacity);
      scale.value = withTiming(1, { duration: 200 });
      opacity.value = withTiming(1, { duration: 200 });
    }
  }, [isRecording, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (isRecording) {
      await stopListening();
    } else {
      await startListening();
    }
  };

  const handleLongPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await cancelListening();
  };

  if (!isAvailable) {
    return (
      <View style={[styles.button, styles.unavailable]}>
        <Ionicons name="mic-off" size={24} color={colors.textMuted} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {partialTranscript ? (
        <View style={styles.transcriptBubble}>
          <Text variant="caption" color="textSecondary" numberOfLines={2}>
            {partialTranscript}
          </Text>
        </View>
      ) : null}

      <Pressable
        onPress={handlePress}
        onLongPress={handleLongPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={isRecording ? 'Stop recording' : 'Start voice input'}
        accessibilityHint={isRecording ? 'Double tap to stop' : 'Double tap to start recording, long press to cancel'}
        accessibilityState={{ disabled }}
      >
        <Animated.View
          style={[
            styles.button,
            isRecording && styles.recording,
            disabled && styles.disabled,
            state === 'error' && styles.error,
            animatedStyle,
          ]}
        >
          <Ionicons
            name={isRecording ? 'stop' : 'mic'}
            size={24}
            color={isRecording ? colors.error : state === 'error' ? colors.error : colors.primary}
          />
        </Animated.View>
      </Pressable>

      {error ? (
        <Text variant="caption" color="error" style={styles.errorText}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  recording: {
    backgroundColor: colors.errorLight,
    borderColor: colors.error,
  },
  disabled: {
    opacity: 0.5,
  },
  unavailable: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  error: {
    borderColor: colors.error,
  },
  transcriptBubble: {
    position: 'absolute',
    bottom: 56,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    maxWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorText: {
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
