import { memo } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { Text, Card } from '@/src/components/ui';
import { colors, darkColors, moodLabels } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import { EXERCISE_TEMPLATES } from '@/src/constants/exercises';
import { MEDITATION_TEMPLATES } from '@/src/constants/meditations';
import { SLEEP_STORY_TEMPLATES } from '@/src/constants/sleepStories';
import type { ExerciseSession, ExerciseTemplate } from '@/src/types/exercise';

const ALL_TEMPLATES = [...EXERCISE_TEMPLATES, ...MEDITATION_TEMPLATES, ...SLEEP_STORY_TEMPLATES];

function getTemplate(templateId: string): ExerciseTemplate | undefined {
  return ALL_TEMPLATES.find((t) => t.id === templateId);
}

interface ExerciseHistoryItemProps {
  session: ExerciseSession;
}

const ExerciseHistoryItem = memo(function ExerciseHistoryItem({ session }: ExerciseHistoryItemProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const template = getTemplate(session.templateId);

  if (!template) return null;

  const moodDelta = session.moodBefore && session.moodAfter
    ? session.moodAfter - session.moodBefore
    : null;

  const moodDeltaColor = moodDelta !== null
    ? moodDelta > 0
      ? themeColors.success
      : moodDelta < 0
        ? themeColors.error
        : themeColors.textMuted
    : themeColors.textMuted;

  return (
    <Card padding="sm">
      <View className="flex-row items-center">
        <View
          className="w-10 h-10 rounded-xl items-center justify-center mr-3"
          style={{ backgroundColor: template.color ? `${template.color}${isDark ? '30' : '15'}` : `${themeColors.primary}${isDark ? '30' : '15'}` }}
        >
          <Ionicons
            name={(template.icon as any) || 'fitness-outline'}
            size={20}
            color={template.color || themeColors.primary}
          />
        </View>
        <View className="flex-1">
          <Text variant="caption" color="textPrimary" numberOfLines={1}>
            {template.name}
          </Text>
          <Text variant="label" color="textMuted">
            {formatDistanceToNow(session.completedAt || session.startedAt, { addSuffix: true })}
          </Text>
        </View>
        {moodDelta !== null && (
          <View className="flex-row items-center">
            <Ionicons
              name={moodDelta > 0 ? 'arrow-up' : moodDelta < 0 ? 'arrow-down' : 'remove'}
              size={14}
              color={moodDeltaColor}
            />
            <Text variant="caption" style={{ color: moodDeltaColor, marginLeft: 2 }}>
              {Math.abs(moodDelta)}
            </Text>
          </View>
        )}
        {session.moodAfter && !moodDelta && (
          <View
            className="w-6 h-6 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.mood[session.moodAfter] }}
          >
            <Text variant="label" style={{ color: '#fff', fontSize: 10 }}>
              {session.moodAfter}
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
});

interface ExerciseHistoryListProps {
  sessions: ExerciseSession[];
  maxItems?: number;
}

export function ExerciseHistoryList({ sessions, maxItems = 5 }: ExerciseHistoryListProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;

  const completedSessions = sessions
    .filter((s) => s.status === 'completed')
    .slice(0, maxItems);

  if (completedSessions.length === 0) {
    return (
      <Card variant="flat" className="py-8 px-6 items-center">
        <View
          className="w-12 h-12 rounded-xl items-center justify-center mb-4"
          style={{ backgroundColor: isDark ? `${darkColors.primary}30` : `${colors.primary}15` }}
        >
          <Ionicons name="fitness-outline" size={24} color={themeColors.primary} />
        </View>
        <Text variant="body" color="textSecondary" center style={{ maxWidth: 260 }}>
          Complete exercises to see your history here
        </Text>
      </Card>
    );
  }

  return (
    <View className="gap-2">
      {completedSessions.map((session) => (
        <ExerciseHistoryItem key={session.id} session={session} />
      ))}
    </View>
  );
}
