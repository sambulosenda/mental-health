import { View, Pressable, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/src/components/ui';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useGamificationStore } from '@/src/stores/useGamificationStore';
import { BADGE_DEFINITIONS, BADGE_RARITY_COLORS } from '@/src/constants/badges';
import type { BadgeDefinition } from '@/src/types/gamification';
import { colors, darkColors } from '@/src/constants/theme';

interface BadgeGridProps {
  maxItems?: number;
  onBadgePress?: (badge: BadgeDefinition, isEarned: boolean) => void;
  showLocked?: boolean;
  category?: string;
}

const HORIZONTAL_PADDING = 32; // spacing.lg * 2
const GAP = 16;
const COLUMNS = 4;

export function BadgeGrid({
  maxItems,
  onBadgePress,
  showLocked = true,
  category,
}: BadgeGridProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const { hasBadge } = useGamificationStore();
  const { width: screenWidth } = useWindowDimensions();

  const itemWidth = Math.floor((screenWidth - HORIZONTAL_PADDING - GAP * (COLUMNS - 1)) / COLUMNS);

  // Filter badges by category if specified
  let badges = category
    ? BADGE_DEFINITIONS.filter((b) => b.category === category)
    : BADGE_DEFINITIONS;

  // Sort: earned first, then by rarity
  const rarityOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
  badges = [...badges].sort((a, b) => {
    const aEarned = hasBadge(a.id);
    const bEarned = hasBadge(b.id);
    if (aEarned !== bEarned) return aEarned ? -1 : 1;
    return rarityOrder[a.rarity] - rarityOrder[b.rarity];
  });

  // Apply max items limit
  if (maxItems) {
    badges = badges.slice(0, maxItems);
  }

  // Filter out locked if not showing them
  if (!showLocked) {
    badges = badges.filter((b) => hasBadge(b.id));
  }

  if (badges.length === 0) {
    return (
      <View className="items-center py-4">
        <Ionicons
          name="ribbon-outline"
          size={32}
          color={themeColors.textMuted}
        />
        <Text variant="body" color="textMuted" className="mt-2">
          No badges earned yet
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-row flex-wrap justify-between" style={{ rowGap: GAP }}>
      {badges.map((badge) => {
        const isEarned = hasBadge(badge.id);
        return (
          <BadgeItem
            key={badge.id}
            badge={badge}
            isEarned={isEarned}
            onPress={() => onBadgePress?.(badge, isEarned)}
            itemWidth={itemWidth}
          />
        );
      })}
      {/* Add invisible spacers for last row alignment */}
      {badges.length % COLUMNS !== 0 &&
        Array.from({ length: COLUMNS - (badges.length % COLUMNS) }).map((_, i) => (
          <View key={`spacer-${i}`} style={{ width: itemWidth }} />
        ))}
    </View>
  );
}

interface BadgeItemProps {
  badge: BadgeDefinition;
  isEarned: boolean;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
  itemWidth?: number;
}

export function BadgeItem({ badge, isEarned, onPress, size = 'medium', itemWidth }: BadgeItemProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;

  const sizeConfig = {
    small: { containerSize: 48, icon: 20 },
    medium: { containerSize: 56, icon: 28 },
    large: { containerSize: 80, icon: 36 },
  };

  const config = sizeConfig[size];
  const rarityColor = BADGE_RARITY_COLORS[badge.rarity];
  const bgColor = isEarned ? `${rarityColor}20` : themeColors.surfaceElevated;
  const iconColor = isEarned ? rarityColor : themeColors.textMuted;

  // Use itemWidth if provided, otherwise fall back to auto width
  const containerWidth = itemWidth ?? (size === 'large' ? 80 : 72);
  const textMaxWidth = itemWidth ? itemWidth - 4 : (size === 'large' ? 80 : 64);

  return (
    <Pressable onPress={onPress} style={{ width: containerWidth }}>
      <View className="items-center">
        <View
          className="rounded-full items-center justify-center"
          style={{
            width: config.containerSize,
            height: config.containerSize,
            backgroundColor: bgColor,
            borderWidth: isEarned ? 2 : 1,
            borderColor: isEarned ? rarityColor : themeColors.border,
          }}
        >
          <Ionicons
            name={(isEarned ? badge.icon : `${badge.icon}-outline`) as any}
            size={config.icon}
            color={iconColor}
          />
          {!isEarned && (
            <View
              className="absolute bottom-0 right-0 w-4 h-4 rounded-full items-center justify-center"
              style={{ backgroundColor: themeColors.surface }}
            >
              <Ionicons
                name="lock-closed"
                size={10}
                color={themeColors.textMuted}
              />
            </View>
          )}
        </View>
        {size !== 'small' && (
          <Text
            variant="label"
            color={isEarned ? 'textPrimary' : 'textMuted'}
            className="mt-1 text-center"
            numberOfLines={2}
            style={{ maxWidth: textMaxWidth }}
          >
            {badge.name}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
