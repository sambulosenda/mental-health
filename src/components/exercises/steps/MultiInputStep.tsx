import { useRef } from 'react';
import { View, TextInput, Keyboard } from 'react-native';
import type { TextInput as TextInputType } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Text } from '@/src/components/ui';
import { colors, darkColors, spacing } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import type { ExerciseStep } from '@/src/types/exercise';

interface MultiInputStepProps {
  step: ExerciseStep;
  values: string[];
  onChange: (values: string[]) => void;
  accentColor?: string;
}

export function MultiInputStep({ step, values, onChange, accentColor }: MultiInputStepProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const inputCount = step.inputCount || 3;
  const inputRefs = useRef<(TextInputType | null)[]>([]);

  const handleInputChange = (index: number, value: string) => {
    // Ensure array is the right length with empty strings for unfilled inputs
    const newValues = Array.from({ length: inputCount }, (_, i) => values[i] || '');
    newValues[index] = value;
    onChange(newValues);
  };

  const handleSubmitEditing = (index: number) => {
    // Focus next input or dismiss keyboard on last
    if (index < inputCount - 1) {
      inputRefs.current[index + 1]?.focus();
    } else {
      Keyboard.dismiss();
    }
  };

  // Ensure we have the right number of values
  const currentValues = Array.from({ length: inputCount }, (_, i) => values[i] || '');

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

        <View className="gap-4">
          {currentValues.map((value, index) => {
            const label = step.inputLabels?.[index];
            const isLongLabel = label && label.length > 3;

            return (
              <Animated.View
                key={index}
                entering={FadeInDown.delay(index * 100).duration(300)}
              >
                {/* Show long labels above the input */}
                {isLongLabel && (
                  <Text
                    variant="bodyMedium"
                    color="textSecondary"
                    className="mb-2 ml-11"
                  >
                    {label}
                  </Text>
                )}

                <View className="flex-row items-center gap-3">
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{ backgroundColor: accentColor ? `${accentColor}20` : themeColors.primaryLight }}
                  >
                    <Text
                      variant="bodyMedium"
                      style={{ color: accentColor || themeColors.primary }}
                    >
                      {isLongLabel ? (index + 1).toString() : (label || (index + 1).toString())}
                    </Text>
                  </View>

                  <View
                    className="flex-1 rounded-xl px-4"
                    style={{
                      backgroundColor: themeColors.surfaceElevated,
                      borderWidth: 1,
                      borderColor: value ? (accentColor || themeColors.primary) : themeColors.border,
                    }}
                  >
                    <TextInput
                      ref={(ref) => { inputRefs.current[index] = ref; }}
                      value={value}
                      onChangeText={(text) => handleInputChange(index, text)}
                      placeholder={step.placeholder}
                      placeholderTextColor={themeColors.textMuted}
                      returnKeyType={index < inputCount - 1 ? 'next' : 'done'}
                      onSubmitEditing={() => handleSubmitEditing(index)}
                      blurOnSubmit={false}
                      style={{
                        color: themeColors.textPrimary,
                        fontSize: 16,
                        height: 44,
                      }}
                    />
                  </View>
                </View>
              </Animated.View>
            );
          })}
        </View>

        {step.required && currentValues.some(v => !v) && (
          <Text variant="caption" color="textMuted" className="mt-4">
            Please fill in all items
          </Text>
        )}
      </Animated.View>
    </KeyboardAwareScrollView>
  );
}
