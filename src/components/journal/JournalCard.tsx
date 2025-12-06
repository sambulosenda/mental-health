import { View, Pressable, Platform } from 'react-native';
import { formatDistanceToNow, format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { Card, Text, NativeContextMenu, showContextMenuFallback } from '@/src/components/ui';
import type { ContextMenuAction } from '@/src/components/ui';
import { MoodAnimation } from '@/src/components/mood/MoodAnimation';
import { colors, darkColors } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import type { JournalEntry } from '@/src/types/journal';

interface JournalCardProps {
  entry: JournalEntry;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
}

export function JournalCard({ entry, onPress, onEdit, onDelete, onShare }: JournalCardProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const timeAgo = formatDistanceToNow(entry.createdAt, { addSuffix: true });
  const fullDate = format(entry.createdAt, 'MMM d, yyyy • h:mm a');

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
    if (Platform.OS !== 'ios') {
      showContextMenuFallback(entry.title || 'Journal Entry', contextMenuActions);
    }
  };

  const cardContent = (
    <Pressable onPress={onPress} onLongPress={handleLongPress} delayLongPress={400}>
      <Card className="mb-2">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1 mr-2">
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
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.mood[entry.mood] }}
            >
              <MoodAnimation mood={entry.mood as 1 | 2 | 3 | 4 | 5} size={16} loop={false} />
            </View>
          )}
        </View>

        <Text
          variant="body"
          color="textSecondary"
          numberOfLines={3}
          className="mb-2"
          style={{ lineHeight: 22 }}
        >
          {preview}
        </Text>

        {entry.tags.length > 0 && (
          <View className="flex-row flex-wrap gap-1 mb-2">
            {entry.tags.slice(0, 3).map((tag, index) => (
              <View
                key={index}
                className={`px-2 py-0.5 rounded-sm ${isDark ? 'bg-surface-dark-elevated' : 'bg-surface-elevated'}`}
              >
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

        <View
          className="flex-row justify-between items-center pt-2 border-t"
          style={{ borderTopColor: themeColors.borderLight }}
        >
          <Text variant="caption" color="textMuted">
            {fullDate}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={themeColors.textMuted} />
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
