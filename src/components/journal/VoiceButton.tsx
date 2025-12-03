import { useState, useRef } from 'react';
import { Pressable, StyleSheet, Alert, Platform } from 'react-native';
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

interface VoiceButtonProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

export function VoiceButton({ onTranscription, disabled }: VoiceButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const startRecording = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRecording(true);

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

    // Note: In a production app, integrate with:
    // - expo-speech-recognition (when available)
    // - @react-native-voice/voice
    // - Or a cloud speech API (Google, AWS, etc.)

    // For MVP, show a placeholder alert
    Alert.alert(
      'Voice Input',
      'Voice-to-text requires native speech recognition integration.\n\nThis feature will be available in a future update.',
      [
        {
          text: 'OK',
          onPress: () => stopRecording(),
        },
      ]
    );
  };

  const stopRecording = () => {
    setIsRecording(false);
    cancelAnimation(scale);
    cancelAnimation(opacity);
    scale.value = withTiming(1, { duration: 200 });
    opacity.value = withTiming(1, { duration: 200 });
  };

  const handlePress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={isRecording ? 'Stop recording' : 'Start voice input'}
      accessibilityState={{ disabled }}
    >
      <Animated.View
        style={[
          styles.button,
          isRecording && styles.recording,
          disabled && styles.disabled,
          animatedStyle,
        ]}
      >
        <Ionicons
          name={isRecording ? 'stop' : 'mic'}
          size={24}
          color={isRecording ? colors.error : colors.primary}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
});
