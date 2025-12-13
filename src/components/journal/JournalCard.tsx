import { View, Pressable, Platform } from 'react-native';
import { format, isToday, isYesterday } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Text, NativeContextMenu, showContextMenuFallback } from '@/src/components/ui';
import type { ContextMenuAction } from '@/src/components/ui';
import { MoodAnimation } from '@/src/components/mood/MoodAnimation';
import { colors, darkColors, borderRadius, getCardShadow, moodLabels } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import type { JournalEntry } from '@/src/types/journal';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
  const pressed = useSharedValue(0);

  // Smart date formatting
  const getSmartDate = () => {
    if (isToday(entry.createdAt)) {
      return format(entry.createdAt, "'Today at' h:mm a");
    } else if (isYesterday(entry.createdAt)) {
      return format(entry.createdAt, "'Yesterday at' h:mm a");
    }
    return format(entry.createdAt, 'MMM d, yyyy');
  };

  // Dynamic preview length based on content
  const previewLength = entry.title ? 120 : 180;
  const preview = entry.content.length > previewLength
    ? entry.content.substring(0, previewLength).trim() + '...'
    : entry.content;

  // Mood-influenced colors
  const moodColor = entry.mood ? colors.mood[entry.mood] : null;
  const moodTextColor = entry.mood ? colors.moodText[entry.mood] : null;

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(pressed.value, [0, 1], [1, 0.98]);
    return { transform: [{ scale }] };
  });

  const handlePressIn = () => {
    pressed.value = withSpring(1, { damping: 20, stiffness: 400 });
  };

  const handlePressOut = () => {
    pressed.value = withSpring(0, { damping: 20, stiffness: 400 });
  };

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

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
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLongPress={handleLongPress}
      delayLongPress={400}
      style={animatedStyle}
    >
      <View
        style={[
          {
            borderRadius: borderRadius.lg,
            backgroundColor: themeColors.surfaceElevated,
            overflow: 'hidden',
            ...getCardShadow(isDark),
            // Subtle border
            borderWidth: isDark ? 0 : 0.5,
            borderColor: 'rgba(0,0,0,0.04)',
          },
        ]}
      >
        {/* Mood accent bar on left edge */}
        {moodColor && (
          <View
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 4,
              backgroundColor: moodColor,
              borderTopLeftRadius: borderRadius.lg,
              borderBottomLeftRadius: borderRadius.lg,
            }}
          />
        )}

        {/* Card content with mood-influenced background tint */}
        <View
          style={[
            {
              padding: 16,
              paddingLeft: moodColor ? 20 : 16,
            },
            moodColor && {
              backgroundColor: isDark
                ? `${moodColor}08`
                : `${moodColor}05`,
            },
          ]}
        >
          {/* Header: Title + Mood indicator */}
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-1 mr-3">
              {entry.title ? (
                <Text
                  variant="bodyMedium"
                  color="textPrimary"
                  numberOfLines={1}
                  style={{ fontSize: 17, letterSpacing: -0.3 }}
                >
                  {entry.title}
                </Text>
              ) : (
                <Text variant="caption" color="textMuted" style={{ fontStyle: 'italic' }}>
                  Untitled reflection
                </Text>
              )}
              <Text variant="caption" color="textMuted" className="mt-0.5">
                {getSmartDate()}
              </Text>
            </View>

            {/* Enhanced mood indicator */}
            {entry.mood && moodColor && moodTextColor && (
              <View className="items-center">
                <View
                  className="w-11 h-11 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: isDark ? `${moodColor}30` : `${moodColor}20`,
                    borderWidth: 2,
                    borderColor: moodColor,
                  }}
                >
                  <MoodAnimation mood={entry.mood as 1 | 2 | 3 | 4 | 5} size={22} loop={false} />
                </View>
                <Text
                  variant="label"
                  style={{
                    color: moodTextColor,
                    fontSize: 9,
                    marginTop: 4,
                    letterSpacing: 0.5,
                  }}
                >
                  {moodLabels[entry.mood].label.toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Content preview with refined typography */}
          <Text
            variant="body"
            color="textSecondary"
            numberOfLines={3}
            style={{
              lineHeight: 24,
              letterSpacing: -0.1,
            }}
          >
            {preview}
          </Text>

          {/* Tags with refined styling */}
          {entry.tags.length > 0 && (
            <View className="flex-row flex-wrap gap-1.5 mt-3">
              {entry.tags.slice(0, 3).map((tag, index) => (
                <View
                  key={index}
                  className="px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor: isDark
                      ? themeColors.surfaceElevated
                      : `${themeColors.primary}10`,
                    borderWidth: 1,
                    borderColor: isDark
                      ? themeColors.border
                      : `${themeColors.primary}20`,
                  }}
                >
                  <Text
                    variant="label"
                    style={{
                      color: themeColors.primary,
                      fontSize: 11,
                      letterSpacing: 0.2,
                    }}
                  >
                    {tag}
                  </Text>
                </View>
              ))}
              {entry.tags.length > 3 && (
                <View className="px-2 py-1">
                  <Text variant="label" color="textMuted" style={{ fontSize: 11 }}>
                    +{entry.tags.length - 3} more
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Footer with word count */}
          <View className="flex-row items-center justify-between mt-4 pt-3 border-t"
            style={{ borderTopColor: isDark ? themeColors.border : 'rgba(0,0,0,0.05)' }}
          >
            <View className="flex-row items-center gap-3">
              <View className="flex-row items-center gap-1">
                <Ionicons name="document-text-outline" size={14} color={themeColors.textMuted} />
                <Text variant="caption" color="textMuted">
                  {entry.content.split(/\s+/).length} words
                </Text>
              </View>
            </View>
            <View className="flex-row items-center gap-1">
              <Text variant="caption" style={{ color: themeColors.primary }}>
                Read more
              </Text>
              <Ionicons name="arrow-forward" size={14} color={themeColors.primary} />
            </View>
          </View>
        </View>
      </View>
    </AnimatedPressable>
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
