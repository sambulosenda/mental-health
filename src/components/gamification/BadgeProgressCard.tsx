import { useEffect, useState, useCallback } from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Text } from '@/src/components/ui';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useGamificationStore } from '@/src/stores/useGamificationStore';
import { BADGE_DEFINITIONS, BADGE_RARITY_COLORS } from '@/src/constants/badges';
import { colors, darkColors } from '@/src/constants/theme';
import type { BadgeDefinition } from '@/src/types/gamification';

interface BadgeProgressCardProps {
  onPress?: () => void;
  maxBadges?: number;
}

interface BadgeWithProgress {
  badge: BadgeDefinition;
  progress: number;
}

export function BadgeProgressCard({ onPress, maxBadges = 2 }: BadgeProgressCardProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const { earnedBadges, getBadgeProgress } = useGamificationStore();
  const [upcomingBadges, setUpcomingBadges] = useState<BadgeWithProgress[]>([]);

  const loadProgress = useCallback(async () => {
    const earnedIds = new Set(earnedBadges.map((b) => b.badgeId));
    const unearned = BADGE_DEFINITIONS.filter((b) => !earnedIds.has(b.id));

    // Get progress for all unearned badges
    const withProgress: BadgeWithProgress[] = await Promise.all(
      unearned.map(async (badge) => ({
        badge,
        progress: await getBadgeProgress(badge.id),
      }))
    );

    // Sort by progress (closest to completion first) and take top N
    const sorted = withProgress
      .filter((b) => b.progress > 0 && b.progress < 100)
      .sort((a, b) => b.progress - a.progress)
      .slice(0, maxBadges);

    setUpcomingBadges(sorted);
  }, [earnedBadges, getBadgeProgress, maxBadges]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  if (upcomingBadges.length === 0) {
    return null;
  }

  return (
    <Pressable onPress={onPress}>
      <Card>
        <View className="flex-row items-center justify-between mb-3">
          <Text variant="bodyMedium" color="textPrimary">
            Badge Progress
          </Text>
          <View className="flex-row items-center">
            <Ionicons name="ribbon-outline" size={16} color={themeColors.textMuted} />
            <Text variant="caption" color="textMuted" className="ml-1">
              {earnedBadges.length} earned
            </Text>
          </View>
        </View>

        <View className="gap-3">
          {upcomingBadges.map(({ badge, progress }) => (
            <View key={badge.id} className="flex-row items-center">
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: `${BADGE_RARITY_COLORS[badge.rarity]}20` }}
              >
                <Ionicons
                  name={badge.icon as any}
                  size={20}
                  color={BADGE_RARITY_COLORS[badge.rarity]}
                />
              </View>
              <View className="flex-1">
                <Text variant="caption" color="textPrimary" numberOfLines={1}>
                  {badge.name}
                </Text>
                <View className="flex-row items-center mt-1">
                  <View
                    className="flex-1 h-1.5 rounded-full overflow-hidden mr-2"
                    style={{ backgroundColor: themeColors.border }}
                  >
                    <View
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: BADGE_RARITY_COLORS[badge.rarity],
                        width: `${progress}%`,
                      }}
                    />
                  </View>
                  <Text variant="label" color="textMuted" style={{ minWidth: 32 }}>
                    {progress}%
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </Card>
    </Pressable>
  );
}
