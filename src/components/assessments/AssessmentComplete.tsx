import { View, Linking, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { Text, Button } from '@/src/components/ui';
import { colors, darkColors, spacing, borderRadius } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { SEVERITY_CONFIG, ASSESSMENT_CITATIONS } from '@/src/constants/assessments';
import type { AssessmentTemplate, SeverityLevel } from '@/src/types/assessment';

const MAX_CONTENT_WIDTH = 500;

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
  const { width } = useWindowDimensions();

  // Calculate content width for iPad - center content with max width
  const contentWidth = Math.min(width - spacing.lg * 2, MAX_CONTENT_WIDTH);
  const isLargeScreen = width > 600;

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xl,
        alignItems: 'center',
        justifyContent: isLargeScreen ? 'flex-start' : 'center',
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ width: contentWidth, maxWidth: MAX_CONTENT_WIDTH, alignItems: 'center' }}>
        {/* Success Icon */}
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.lg,
            backgroundColor: `${template.color}20`,
          }}
        >
          <Ionicons
            name="checkmark-circle"
            size={48}
            color={template.color}
          />
        </View>

        {/* Title */}
        <Text variant="h2" color="textPrimary" center style={{ marginBottom: spacing.xs }}>
          Assessment Complete
        </Text>

        <Text variant="body" color="textSecondary" center style={{ marginBottom: spacing.xl }}>
          {template.name} Results
        </Text>

        {/* Score Display */}
        <View
          style={{
            width: '100%',
            borderRadius: borderRadius.xl,
            padding: spacing.lg,
            alignItems: 'center',
            marginBottom: spacing.lg,
            backgroundColor: themeColors.surface,
          }}
        >
          {/* Score Circle */}
          <View style={{ alignItems: 'center', marginBottom: spacing.md }}>
            <View
              style={{
                width: 112,
                height: 112,
                borderRadius: 56,
                alignItems: 'center',
                justifyContent: 'center',
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
            style={{
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              borderRadius: borderRadius.lg,
              marginBottom: spacing.md,
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
          style={{
            width: '100%',
            borderRadius: borderRadius.lg,
            padding: spacing.md,
            marginBottom: spacing.md,
            backgroundColor: themeColors.surfaceElevated,
          }}
        >
          <Text variant="captionMedium" color="textMuted" style={{ marginBottom: spacing.sm }}>
            Scoring Guide
          </Text>
          <View style={{ gap: spacing.xs }}>
            {Object.entries(template.scoringInfo.thresholds).map(([level, range]) => (
              <View key={level} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      marginRight: spacing.xs,
                      backgroundColor: SEVERITY_CONFIG[level as SeverityLevel].color,
                    }}
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

        {/* Medical Disclaimer */}
        <View
          style={{
            width: '100%',
            borderRadius: borderRadius.lg,
            padding: spacing.md,
            marginBottom: spacing.md,
            backgroundColor: `${themeColors.warning}15`,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
            <Ionicons name="information-circle" size={16} color={themeColors.warning} />
            <Text variant="caption" style={{ marginLeft: 6, color: themeColors.warning, fontWeight: '600' }}>
              Important
            </Text>
          </View>
          <Text variant="caption" color="textSecondary" style={{ lineHeight: 18 }}>
            This screening tool is for informational purposes only and is not a medical diagnosis.
            Please consult a qualified healthcare provider for professional evaluation and treatment recommendations.
          </Text>
        </View>

        {/* Citation */}
        <Pressable
          onPress={() => {
            const citation = ASSESSMENT_CITATIONS[template.id as keyof typeof ASSESSMENT_CITATIONS];
            if (citation?.url) {
              Linking.openURL(citation.url);
            }
          }}
          style={{
            width: '100%',
            borderRadius: borderRadius.lg,
            padding: spacing.md,
            marginBottom: spacing.lg,
            backgroundColor: themeColors.surfaceElevated,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
            <Ionicons name="document-text-outline" size={14} color={themeColors.textMuted} />
            <Text variant="caption" color="textMuted" style={{ marginLeft: 6, fontWeight: '600' }}>
              Source
            </Text>
          </View>
          {(() => {
            const citation = ASSESSMENT_CITATIONS[template.id as keyof typeof ASSESSMENT_CITATIONS];
            return (
              <Text variant="caption" color="textSecondary" style={{ lineHeight: 16, fontSize: 11 }}>
                {citation.authors} ({citation.year}). {citation.title}. {citation.journal}, {citation.volume}, {citation.pages}.
              </Text>
            );
          })()}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs }}>
            <Text variant="caption" style={{ color: themeColors.primary, fontSize: 11 }}>
              View original study
            </Text>
            <Ionicons name="open-outline" size={12} color={themeColors.primary} style={{ marginLeft: 4 }} />
          </View>
        </Pressable>

        {/* Done Button */}
        <Button onPress={onDone} style={{ width: '100%' }}>
          Done
        </Button>
      </View>
    </ScrollView>
  );
}
