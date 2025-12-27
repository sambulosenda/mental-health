import { useEffect, useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card } from '@/src/components/ui';
import { BadgeGrid, BadgeItem } from '@/src/components/gamification';
import { useGamificationStore } from '@/src/stores/useGamificationStore';
import { BADGE_CATEGORIES, BADGE_RARITY_COLORS, getBadgeById, getBadgesByCategory } from '@/src/constants/badges';
import { colors, darkColors, spacing, borderRadius } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import type { BadgeDefinition } from '@/src/types/gamification';

export default function AchievementsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;

  const { streaks, earnedBadges, loadGamificationData, hasBadge, getBadgeProgress } = useGamificationStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<BadgeDefinition | null>(null);
  const [badgeProgress, setBadgeProgress] = useState<number>(0);

  useEffect(() => {
    loadGamificationData();
  }, []);

  useEffect(() => {
    if (selectedBadge) {
      getBadgeProgress(selectedBadge.id).then(setBadgeProgress);
    }
  }, [selectedBadge]);

  const handleBadgePress = (badge: BadgeDefinition) => {
    setSelectedBadge(badge);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={themeColors.textPrimary} />
        </Pressable>
        <Text variant="h2" color="textPrimary">Achievements</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Streak Summary */}
        <View style={styles.streakSummary}>
          <View style={[styles.streakCard, { backgroundColor: themeColors.surface }]}>
            <View style={[styles.streakIcon, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="flame" size={28} color="#FF6B35" />
            </View>
            <View style={styles.streakInfo}>
              <Text variant="h1" style={{ color: '#FF6B35' }}>
                {streaks.overall.currentStreak}
              </Text>
              <Text variant="caption" color="textSecondary">
                Current Streak
              </Text>
            </View>
          </View>

          <View style={[styles.streakCard, { backgroundColor: themeColors.surface }]}>
            <View style={[styles.streakIcon, { backgroundColor: `${themeColors.primary}20` }]}>
              <Ionicons name="trophy" size={28} color={themeColors.primary} />
            </View>
            <View style={styles.streakInfo}>
              <Text variant="h1" color="textPrimary">
                {streaks.overall.longestStreak}
              </Text>
              <Text variant="caption" color="textSecondary">
                Longest Streak
              </Text>
            </View>
          </View>
        </View>

        {/* Badge Stats */}
        <View style={[styles.statsBar, { backgroundColor: themeColors.surface }]}>
          <View style={styles.statItem}>
            <Text variant="h3" color="textPrimary">{earnedBadges.length}</Text>
            <Text variant="label" color="textSecondary">Earned</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: themeColors.divider }]} />
          <View style={styles.statItem}>
            <Text variant="h3" color="textMuted">{BADGE_CATEGORIES.reduce((sum, c) => sum + getBadgesByCategory(c.id).length, 0) - earnedBadges.length}</Text>
            <Text variant="label" color="textSecondary">Remaining</Text>
          </View>
        </View>

        {/* Category Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          <Pressable
            onPress={() => setSelectedCategory(null)}
            style={[
              styles.categoryChip,
              {
                backgroundColor: selectedCategory === null ? themeColors.primary : themeColors.surface,
              },
            ]}
          >
            <Text
              variant="caption"
              style={{
                color: selectedCategory === null ? '#fff' : themeColors.textSecondary,
                fontWeight: '600',
              }}
            >
              All
            </Text>
          </Pressable>
          {BADGE_CATEGORIES.map((category) => (
            <Pressable
              key={category.id}
              onPress={() => setSelectedCategory(category.id)}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: selectedCategory === category.id ? themeColors.primary : themeColors.surface,
                },
              ]}
            >
              <Ionicons
                name={category.icon as any}
                size={14}
                color={selectedCategory === category.id ? '#fff' : themeColors.textSecondary}
                style={{ marginRight: 4 }}
              />
              <Text
                variant="caption"
                style={{
                  color: selectedCategory === category.id ? '#fff' : themeColors.textSecondary,
                  fontWeight: '600',
                }}
              >
                {category.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Badge Grid */}
        <View style={styles.badgeSection}>
          <BadgeGrid
            category={selectedCategory ?? undefined}
            showLocked
            onBadgePress={(badge) => handleBadgePress(badge)}
          />
        </View>
      </ScrollView>

      {/* Badge Detail Modal - outside ScrollView so overlay covers full screen */}
      {selectedBadge && (
        <Pressable
          style={styles.badgeOverlay}
          onPress={() => setSelectedBadge(null)}
        >
          <Pressable style={[styles.badgeDetail, { backgroundColor: themeColors.surface }]}>
            <BadgeItem
              badge={selectedBadge}
              isEarned={hasBadge(selectedBadge.id)}
              size="large"
            />
            <Text variant="h3" color="textPrimary" style={{ marginTop: spacing.md }}>
              {selectedBadge.name}
            </Text>
            <View
              style={[
                styles.rarityBadge,
                { backgroundColor: `${BADGE_RARITY_COLORS[selectedBadge.rarity]}20` },
              ]}
            >
              <Text
                variant="label"
                style={{ color: BADGE_RARITY_COLORS[selectedBadge.rarity] }}
              >
                {selectedBadge.rarity.charAt(0).toUpperCase() + selectedBadge.rarity.slice(1)}
              </Text>
            </View>
            <Text variant="body" color="textSecondary" style={{ textAlign: 'center', marginTop: spacing.sm }}>
              {selectedBadge.description}
            </Text>

            {!hasBadge(selectedBadge.id) && (
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { backgroundColor: themeColors.divider }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: BADGE_RARITY_COLORS[selectedBadge.rarity],
                        width: `${badgeProgress}%`,
                      },
                    ]}
                  />
                </View>
                <Text variant="caption" color="textMuted" style={{ marginTop: spacing.xs }}>
                  {badgeProgress}% complete
                </Text>
              </View>
            )}

            <Pressable
              onPress={() => setSelectedBadge(null)}
              style={[styles.closeDetailButton, { backgroundColor: themeColors.primaryLight }]}
            >
              <Text variant="bodyMedium" style={{ color: '#fff' }}>
                Close
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 44,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  streakSummary: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  streakCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  streakIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  categoryScroll: {
    marginTop: spacing.lg,
    marginHorizontal: -spacing.lg,
  },
  categoryContainer: {
    paddingLeft: spacing.lg,
    paddingRight: spacing.xl,
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  badgeSection: {
    marginTop: spacing.lg,
  },
  badgeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeDetail: {
    width: '85%',
    maxWidth: 320,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
  },
  rarityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  progressContainer: {
    width: '100%',
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  closeDetailButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
});
