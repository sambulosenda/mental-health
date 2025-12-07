import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/src/components/ui';
import { colors, darkColors } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import type { ExerciseStep } from '@/src/types/exercise';

interface InstructionStepProps {
  step: ExerciseStep;
  accentColor?: string;
}

export function InstructionStep({ step, accentColor }: InstructionStepProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;

  return (
    <Animated.View entering={FadeIn.duration(300)} className="flex-1 px-6 py-4">
      <View
        className="w-16 h-16 rounded-full items-center justify-center mb-6 self-center"
        style={{ backgroundColor: accentColor ? `${accentColor}20` : themeColors.primaryLight }}
      >
        <Ionicons
          name="information-circle-outline"
          size={32}
          color={accentColor || themeColors.primary}
        />
      </View>

      <Text variant="h2" color="textPrimary" center className="mb-4">
        {step.title}
      </Text>

      <Text variant="body" color="textSecondary" className="leading-6">
        {step.content}
      </Text>
    </Animated.View>
  );
}
