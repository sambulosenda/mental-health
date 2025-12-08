import { View, Pressable } from 'react-native';
import { Text } from '@/src/components/ui';
import { colors, darkColors } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { formatDistanceToNow } from 'date-fns';
import type { AssessmentTemplate, AssessmentSession } from '@/src/types/assessment';
import { ScoreInterpretation } from './ScoreInterpretation';

interface AssessmentCardProps {
  template: AssessmentTemplate;
  lastSession?: AssessmentSession | null;
  isDue?: boolean;
  onPress: () => void;
}

export function AssessmentCard({
  template,
  lastSession,
  isDue,
  onPress,
}: AssessmentCardProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const accentColor = template.color;

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const lastTakenText = lastSession?.completedAt
    ? `${formatDistanceToNow(lastSession.completedAt, { addSuffix: true })}`
    : 'Never taken';

  return (
    <Pressable
      onPress={handlePress}
      className="rounded-2xl p-4 flex-1"
      style={{ backgroundColor: themeColors.surface }}
    >
      {/* Header with icon and due badge */}
      <View className="flex-row items-start justify-between mb-3">
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          <Ionicons
            name={template.icon as any}
            size={20}
            color={accentColor}
          />
        </View>

        {isDue && (
          <View
            className="px-2 py-1 rounded-full"
            style={{ backgroundColor: `${accentColor}15` }}
          >
            <Text
              variant="caption"
              style={{ color: accentColor, fontWeight: '600', fontSize: 10 }}
            >
              Due
            </Text>
          </View>
        )}
      </View>

      {/* Title */}
      <Text variant="bodyMedium" color="textPrimary">
        {template.name}
      </Text>

      {/* Description */}
      <Text variant="caption" color="textSecondary" className="mt-1" numberOfLines={1}>
        {template.description}
      </Text>

      {/* Last score or last taken */}
      <View className="mt-3 flex-row items-center justify-between">
        {lastSession?.severity ? (
          <ScoreInterpretation severity={lastSession.severity} compact />
        ) : (
          <Text variant="caption" color="textMuted">
            {lastTakenText}
          </Text>
        )}

        {lastSession?.totalScore !== undefined && (
          <Text variant="caption" color="textMuted">
            {lastSession.totalScore}/{template.scoringInfo.maxScore}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
