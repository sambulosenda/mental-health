import { View, Pressable } from 'react-native';
import { Text } from '@/src/components/ui';
import { colors, darkColors } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import { LIKERT_OPTIONS } from '@/src/constants/assessments';
import type { LikertValue } from '@/src/types/assessment';
import * as Haptics from 'expo-haptics';

interface LikertQuestionProps {
  questionText: string;
  questionNumber: number;
  totalQuestions: number;
  selectedValue: LikertValue | undefined;
  onSelect: (value: LikertValue) => void;
  accentColor?: string;
}

export function LikertQuestion({
  questionText,
  questionNumber,
  totalQuestions,
  selectedValue,
  onSelect,
  accentColor,
}: LikertQuestionProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const accent = accentColor || themeColors.primary;

  const handleSelect = async (value: LikertValue) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(value);
  };

  return (
    <View className="flex-1 px-6">
      {/* Question Counter */}
      <Text variant="caption" color="textMuted" className="mb-2">
        Question {questionNumber} of {totalQuestions}
      </Text>

      {/* Question Text */}
      <Text variant="h3" color="textPrimary" className="mb-8">
        {questionText}
      </Text>

      {/* Likert Options */}
      <View className="gap-3">
        {LIKERT_OPTIONS.map((option) => {
          const isSelected = selectedValue === option.value;

          return (
            <Pressable
              key={option.value}
              onPress={() => handleSelect(option.value)}
              className="rounded-2xl p-4 flex-row items-center"
              style={{
                backgroundColor: isSelected
                  ? `${accent}15`
                  : themeColors.surface,
                borderWidth: 2,
                borderColor: isSelected ? accent : 'transparent',
              }}
            >
              {/* Radio indicator */}
              <View
                className="w-6 h-6 rounded-full mr-4 items-center justify-center"
                style={{
                  borderWidth: 2,
                  borderColor: isSelected ? accent : themeColors.textMuted,
                  backgroundColor: isSelected ? accent : 'transparent',
                }}
              >
                {isSelected && (
                  <View
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: '#FFFFFF' }}
                  />
                )}
              </View>

              {/* Label */}
              <View className="flex-1">
                <Text
                  variant="bodyMedium"
                  style={{ color: isSelected ? accent : themeColors.textPrimary }}
                >
                  {option.label}
                </Text>
              </View>

              {/* Score indicator */}
              <View
                className="w-8 h-8 rounded-full items-center justify-center"
                style={{
                  backgroundColor: isSelected ? accent : `${themeColors.textMuted}20`,
                }}
              >
                <Text
                  variant="caption"
                  style={{
                    color: isSelected ? '#FFFFFF' : themeColors.textMuted,
                    fontWeight: '600',
                  }}
                >
                  {option.shortLabel}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
