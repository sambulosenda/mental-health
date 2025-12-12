import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
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
import { colors, darkColors } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useVoiceRecognition } from '@/src/hooks/useVoiceRecognition';
import { Text } from '@/src/components/ui';

interface VoiceButtonProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

export function VoiceButton({ onTranscription, disabled }: VoiceButtonProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
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
      <View
        className="w-12 h-12 rounded-full items-center justify-center border-2"
        style={{
          backgroundColor: themeColors.surface,
          borderColor: themeColors.border,
        }}
      >
        <Ionicons name="mic-off" size={24} color={themeColors.textMuted} />
      </View>
    );
  }

  return (
    <View className="items-center">
      {partialTranscript ? (
        <View
          className="absolute bottom-14 px-2 py-1 rounded-lg max-w-[200px]"
          style={{
            backgroundColor: themeColors.surfaceElevated,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
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
          className="w-12 h-12 rounded-full items-center justify-center border-2"
          style={[
            {
              backgroundColor: isRecording
                ? themeColors.errorLight
                : themeColors.surfaceElevated,
              borderColor: isRecording || state === 'error'
                ? themeColors.error
                : themeColors.border,
              opacity: disabled ? 0.5 : 1,
            },
            animatedStyle,
          ]}
        >
          <Ionicons
            name={isRecording ? 'stop' : 'mic'}
            size={24}
            color={isRecording || state === 'error' ? '#B91C1C' : themeColors.iconPrimary}
          />
        </Animated.View>
      </Pressable>

      {error ? (
        <Text variant="caption" color="error" center className="mt-1">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
