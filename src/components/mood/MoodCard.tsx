import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { Card, Text, NativeContextMenu, showContextMenuFallback } from '@/src/components/ui';
import type { ContextMenuAction } from '@/src/components/ui';
import { MoodAnimation } from './MoodAnimation';
import { colors, spacing, borderRadius, moodLabels, activityTags } from '@/src/constants/theme';
import type { MoodEntry } from '@/src/types/mood';

interface MoodCardProps {
  entry: MoodEntry;
  compact?: boolean;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
}

export function MoodCard({ entry, compact = false, onPress, onEdit, onDelete, onShare }: MoodCardProps) {
  const timeAgo = formatDistanceToNow(entry.timestamp, { addSuffix: true });
  const activityLabels = entry.activities
    .map((id) => activityTags.find((t) => t.id === id)?.label)
    .filter(Boolean);

  const contextMenuActions: ContextMenuAction[] = [
    {
      title: 'Edit',
      systemIcon: 'pencil',
      onPress: () => onEdit?.(),
    },
    {
      title: 'Share',
      systemIcon: 'square.and.arrow.up',
      onPress: () => onShare?.(),
    },
    {
      title: 'Delete',
      systemIcon: 'trash',
      destructive: true,
      onPress: () => onDelete?.(),
    },
  ];

  const handleLongPress = () => {
    // Only use fallback on Android - iOS uses native ContextMenu
    if (Platform.OS !== 'ios') {
      showContextMenuFallback(moodLabels[entry.mood].label, contextMenuActions);
    }
  };

  if (compact) {
    return (
      <Pressable onPress={onPress} onLongPress={handleLongPress} delayLongPress={400}>
        <View style={styles.compactContainer}>
          <View
            style={[styles.moodDot, { backgroundColor: colors.mood[entry.mood] }]}
          >
            <MoodAnimation mood={entry.mood} size={20} loop={false} />
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
      </Pressable>
    );
  }

  const cardContent = (
    <Pressable onPress={onPress} onLongPress={handleLongPress} delayLongPress={400}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View
            style={[styles.moodBadge, { backgroundColor: colors.mood[entry.mood] }]}
          >
            <MoodAnimation mood={entry.mood} size={28} loop={false} />
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
    </Pressable>
  );

  return (
    <NativeContextMenu
      title={moodLabels[entry.mood].label}
      actions={contextMenuActions}
    >
      {cardContent}
    </NativeContextMenu>
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
  compactContent: {
    marginLeft: spacing.sm,
  },
});
