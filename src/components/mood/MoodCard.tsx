import { View, StyleSheet } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { Card, Text } from '@/src/components/ui';
import { colors, spacing, borderRadius, moodLabels, activityTags } from '@/src/constants/theme';
import type { MoodEntry } from '@/src/types/mood';

interface MoodCardProps {
  entry: MoodEntry;
  compact?: boolean;
}

const MOOD_EMOJIS: Record<number, string> = {
  1: '😔',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😊',
};

export function MoodCard({ entry, compact = false }: MoodCardProps) {
  const timeAgo = formatDistanceToNow(entry.timestamp, { addSuffix: true });
  const activityLabels = entry.activities
    .map((id) => activityTags.find((t) => t.id === id)?.label)
    .filter(Boolean);

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View
          style={[styles.moodDot, { backgroundColor: colors.mood[entry.mood] }]}
        >
          <Text style={styles.compactEmoji}>{MOOD_EMOJIS[entry.mood]}</Text>
        </View>
        <View style={styles.compactContent}>
          <Text variant="captionMedium" color="textPrimary">
            {moodLabels[entry.mood].label}
          </Text>
          <Text variant="caption" color="textMuted">
            {timeAgo}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View
          style={[styles.moodBadge, { backgroundColor: colors.mood[entry.mood] }]}
        >
          <Text style={styles.emoji}>{MOOD_EMOJIS[entry.mood]}</Text>
        </View>
        <View style={styles.headerText}>
          <Text variant="bodyMedium" color="textPrimary">
            {moodLabels[entry.mood].label}
          </Text>
          <Text variant="caption" color="textSecondary">
            {timeAgo}
          </Text>
        </View>
      </View>

      {activityLabels.length > 0 && (
        <View style={styles.activities}>
          {activityLabels.map((label, index) => (
            <View key={index} style={styles.activityChip}>
              <Text variant="label" color="textSecondary">
                {label}
              </Text>
            </View>
          ))}
        </View>
      )}

      {entry.note && (
        <Text variant="body" color="textSecondary" style={styles.note}>
          {entry.note}
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodBadge: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 24,
  },
  headerText: {
    marginLeft: spacing.md,
  },
  activities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  activityChip: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  note: {
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  moodDot: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactEmoji: {
    fontSize: 16,
  },
  compactContent: {
    marginLeft: spacing.sm,
  },
});
