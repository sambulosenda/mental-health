import { View, TextInput } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Text } from '@/src/components/ui';
import { colors, darkColors, spacing } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import type { ExerciseStep } from '@/src/types/exercise';

interface TextInputStepProps {
  step: ExerciseStep;
  value: string;
  onChange: (value: string) => void;
  accentColor?: string;
}

export function TextInputStep({ step, value, onChange, accentColor }: TextInputStepProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;

  return (
    <KeyboardAwareScrollView
      bottomOffset={80}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}
    >
      <Animated.View entering={FadeIn.duration(300)}>
        <Text variant="h2" color="textPrimary" className="mb-3">
          {step.title}
        </Text>

        <Text variant="body" color="textSecondary" className="mb-6">
          {step.content}
        </Text>

        <View
          className="rounded-2xl p-4"
          style={{
            backgroundColor: themeColors.surfaceElevated,
            borderWidth: 1,
            borderColor: value ? (accentColor || themeColors.primary) : themeColors.border,
          }}
        >
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder={step.placeholder}
            placeholderTextColor={themeColors.textMuted}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            style={{
              color: themeColors.textPrimary,
              fontSize: 16,
              minHeight: 150,
              lineHeight: 24,
            }}
          />
        </View>

        {step.required && !value && (
          <Text variant="caption" color="textMuted" className="mt-2">
            This field is required
          </Text>
        )}
      </Animated.View>
    </KeyboardAwareScrollView>
  );
}
