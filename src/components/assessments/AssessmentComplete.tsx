import { View } from 'react-native';
import { Text, Button } from '@/src/components/ui';
import { colors, darkColors } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { SEVERITY_CONFIG } from '@/src/constants/assessments';
import type { AssessmentTemplate, SeverityLevel } from '@/src/types/assessment';

interface AssessmentCompleteProps {
  template: AssessmentTemplate;
  totalScore: number;
  severity: SeverityLevel;
  onDone: () => void;
}

const SEVERITY_DESCRIPTIONS: Record<SeverityLevel, Record<'gad7' | 'phq9', string>> = {
  minimal: {
    gad7: 'Your anxiety symptoms are minimal. Continue practicing self-care and healthy habits.',
    phq9: 'Your depression symptoms are minimal. Keep up your positive routines.',
  },
  mild: {
    gad7: 'You may be experiencing mild anxiety. Consider relaxation techniques and mindfulness.',
    phq9: 'You may be experiencing mild depression. Staying active and connected can help.',
  },
  moderate: {
    gad7: 'You may be experiencing moderate anxiety. Consider speaking with a mental health professional.',
    phq9: 'You may be experiencing moderate depression. Professional support could be helpful.',
  },
  severe: {
    gad7: 'Your anxiety symptoms appear significant. We recommend consulting a mental health professional.',
    phq9: 'Your depression symptoms appear significant. Please consider reaching out to a mental health professional.',
  },
};

export function AssessmentComplete({
  template,
  totalScore,
  severity,
  onDone,
}: AssessmentCompleteProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const severityConfig = SEVERITY_CONFIG[severity];
  const description = SEVERITY_DESCRIPTIONS[severity][template.id];

  // Calculate percentage for the gauge
  const percentage = (totalScore / template.scoringInfo.maxScore) * 100;

  return (
    <View className="flex-1 px-6 items-center justify-center">
      {/* Success Icon */}
      <View
        className="w-20 h-20 rounded-full items-center justify-center mb-6"
        style={{ backgroundColor: `${template.color}20` }}
      >
        <Ionicons
          name="checkmark-circle"
          size={48}
          color={template.color}
        />
      </View>

      {/* Title */}
      <Text variant="h2" color="textPrimary" center className="mb-2">
        Assessment Complete
      </Text>

      <Text variant="body" color="textSecondary" center className="mb-8">
        {template.name} Results
      </Text>

      {/* Score Display */}
      <View
        className="w-full rounded-2xl p-6 items-center mb-6"
        style={{ backgroundColor: themeColors.surface }}
      >
        {/* Score Circle */}
        <View className="items-center mb-4">
          <View
            className="w-28 h-28 rounded-full items-center justify-center"
            style={{
              borderWidth: 6,
              borderColor: severityConfig.color,
              backgroundColor: isDark ? severityConfig.darkBgColor : severityConfig.bgColor,
            }}
          >
            <Text
              variant="h1"
              style={{ color: severityConfig.color, fontSize: 36 }}
            >
              {totalScore}
            </Text>
            <Text variant="caption" color="textMuted">
              of {template.scoringInfo.maxScore}
            </Text>
          </View>
        </View>

        {/* Severity Badge */}
        <View
          className="px-4 py-2 rounded-xl mb-4"
          style={{
            backgroundColor: isDark ? severityConfig.darkBgColor : severityConfig.bgColor,
          }}
        >
          <Text
            variant="bodyMedium"
            style={{ color: severityConfig.color, fontWeight: '700' }}
          >
            {severityConfig.label} {template.id === 'gad7' ? 'Anxiety' : 'Depression'}
          </Text>
        </View>

        {/* Description */}
        <Text variant="body" color="textSecondary" center>
          {description}
        </Text>
      </View>

      {/* Threshold Legend */}
      <View
        className="w-full rounded-xl p-4 mb-8"
        style={{ backgroundColor: themeColors.surfaceElevated }}
      >
        <Text variant="captionMedium" color="textMuted" className="mb-3">
          Scoring Guide
        </Text>
        <View className="gap-2">
          {Object.entries(template.scoringInfo.thresholds).map(([level, range]) => (
            <View key={level} className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: SEVERITY_CONFIG[level as SeverityLevel].color }}
                />
                <Text variant="caption" color="textSecondary">
                  {SEVERITY_CONFIG[level as SeverityLevel].label}
                </Text>
              </View>
              <Text variant="caption" color="textMuted">
                {range[0]}-{range[1]}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Done Button */}
      <Button onPress={onDone} className="w-full">
        Done
      </Button>
    </View>
  );
}
