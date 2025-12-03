import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { formatDistanceToNow, format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { Card, Text, NativeContextMenu, showContextMenuFallback } from '@/src/components/ui';
import type { ContextMenuAction } from '@/src/components/ui';
import { colors, spacing, borderRadius } from '@/src/constants/theme';
import type { JournalEntry } from '@/src/types/journal';

interface JournalCardProps {
  entry: JournalEntry;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
}

const MOOD_EMOJIS: Record<number, string> = {
  1: '😔',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😊',
};

export function JournalCard({ entry, onPress, onEdit, onDelete, onShare }: JournalCardProps) {
  const timeAgo = formatDistanceToNow(entry.createdAt, { addSuffix: true });
  const fullDate = format(entry.createdAt, 'MMM d, yyyy • h:mm a');

  // Get preview text (first 150 chars)
  const preview = entry.content.length > 150
    ? entry.content.substring(0, 150).trim() + '...'
    : entry.content;

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
      showContextMenuFallback(entry.title || 'Journal Entry', contextMenuActions);
    }
  };

  const cardContent = (
    <Pressable onPress={onPress} onLongPress={handleLongPress} delayLongPress={400}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {entry.title ? (
              <Text variant="bodyMedium" color="textPrimary" numberOfLines={1}>
                {entry.title}
              </Text>
            ) : (
              <Text variant="caption" color="textMuted">
                Untitled Entry
              </Text>
            )}
            <Text variant="caption" color="textMuted">
              {timeAgo}
            </Text>
          </View>
          {entry.mood && (
            <View
              style={[
                styles.moodBadge,
                { backgroundColor: colors.mood[entry.mood] },
              ]}
            >
              <Text style={styles.moodEmoji}>{MOOD_EMOJIS[entry.mood]}</Text>
            </View>
          )}
        </View>

        <Text
          variant="body"
          color="textSecondary"
          numberOfLines={3}
          style={styles.preview}
        >
          {preview}
        </Text>

        {entry.tags.length > 0 && (
          <View style={styles.tags}>
            {entry.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text variant="label" color="textSecondary">
                  #{tag}
                </Text>
              </View>
            ))}
            {entry.tags.length > 3 && (
              <Text variant="label" color="textMuted">
                +{entry.tags.length - 3}
              </Text>
            )}
          </View>
        )}

        <View style={styles.footer}>
          <Text variant="caption" color="textMuted">
            {fullDate}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </View>
      </Card>
    </Pressable>
  );

  return (
    <NativeContextMenu
      title={entry.title || 'Journal Entry'}
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flex: 1,
    marginRight: spacing.sm,
  },
  moodBadge: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodEmoji: {
    fontSize: 18,
  },
  preview: {
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  tag: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
});
