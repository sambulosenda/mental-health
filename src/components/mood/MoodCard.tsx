import { View, Pressable, Platform } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { Card, Text, NativeContextMenu, showContextMenuFallback } from '@/src/components/ui';
import type { ContextMenuAction } from '@/src/components/ui';
import { MoodAnimation } from './MoodAnimation';
import { colors, moodLabels, activityTags } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
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
  const { isDark } = useTheme();
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
    if (Platform.OS !== 'ios') {
      showContextMenuFallback(moodLabels[entry.mood].label, contextMenuActions);
    }
  };

  if (compact) {
    return (
      <Pressable onPress={onPress} onLongPress={handleLongPress} delayLongPress={400}>
        <View className="flex-row items-center py-2">
          <View
            className="w-8 h-8 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.mood[entry.mood] }}
          >
            <MoodAnimation mood={entry.mood} size={20} loop={false} />
          </View>
          <View className="ml-2">
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
      <Card className="mb-2">
        <View className="flex-row items-center">
          <View
            className="w-11 h-11 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.mood[entry.mood] }}
          >
            <MoodAnimation mood={entry.mood} size={28} loop={false} />
          </View>
          <View className="ml-4">
            <Text variant="bodyMedium" color="textPrimary">
              {moodLabels[entry.mood].label}
            </Text>
            <Text variant="caption" color="textSecondary">
              {timeAgo}
            </Text>
          </View>
        </View>

        {activityLabels.length > 0 && (
          <View className="flex-row flex-wrap mt-4 gap-1">
            {activityLabels.map((label, index) => (
              <View
                key={index}
                className={`px-2 py-1 rounded-sm ${isDark ? 'bg-surface-dark-elevated' : 'bg-surface-elevated'}`}
              >
                <Text variant="label" color="textSecondary">
                  {label}
                </Text>
              </View>
            ))}
          </View>
        )}

        {entry.note && (
          <Text variant="body" color="textSecondary" className="mt-4 italic">
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
