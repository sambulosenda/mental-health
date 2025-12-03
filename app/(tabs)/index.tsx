import { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { format } from 'date-fns';
import { Text, Card, Button, AnimatedHeader, AnimatedListItem, NativeGauge, NativeBottomSheet } from '@/src/components/ui';
import { MoodCard } from '@/src/components/mood';
import { useMoodStore } from '@/src/stores';
import { colors, spacing, moodLabels, activityTags } from '@/src/constants/theme';
import type { MoodEntry } from '@/src/types/mood';

const HEADER_EXPANDED_HEIGHT = 120;

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { todayEntries, entries, loadTodayEntries, loadEntries } = useMoodStore();
  const [selectedEntry, setSelectedEntry] = useState<MoodEntry | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadTodayEntries();
    loadEntries();
  }, []);

  const handleMoodPress = (entry: MoodEntry) => {
    setSelectedEntry(entry);
    setShowDetails(true);
  };

  const today = new Date();
  const greeting = getGreeting();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const latestMood = todayEntries[0];
  const recentEntries = entries.slice(0, 5);

  // Scroll animation
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Calculate weekly stats
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const weekEntries = entries.filter((e) => e.timestamp >= weekAgo);
  const weeklyAverage =
    weekEntries.length > 0
      ? weekEntries.reduce((sum, e) => sum + e.mood, 0) / weekEntries.length
      : null;

  // Count unique days tracked this week
  const uniqueDaysTracked = new Set(
    weekEntries.map((e) => new Date(e.timestamp).toDateString())
  ).size;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AnimatedHeader scrollY={scrollY} title={greeting} subtitle={formattedDate} />
      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: HEADER_EXPANDED_HEIGHT + insets.top },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {latestMood ? (
          <Card style={styles.statusCard}>
            <Text variant="captionMedium" color="primary" style={styles.statusLabel}>
              Latest Check-in
            </Text>
            <MoodCard entry={latestMood} compact />
            <Button
              variant="secondary"
              size="sm"
              onPress={() => router.navigate('/(tabs)/track')}
              style={styles.trackAgainButton}
            >
              Log Another
            </Button>
          </Card>
        ) : (
          <Card style={styles.promptCard} onPress={() => router.navigate('/(tabs)/track')}>
            <Text variant="captionMedium" color="primary" style={styles.promptLabel}>
              Today's Check-in
            </Text>
            <Text variant="h3" color="textPrimary">
              How are you feeling?
            </Text>
            <Text variant="body" color="textSecondary" style={styles.promptHint}>
              Tap to log your first mood of the day
            </Text>
            <Ionicons
              name="add-circle"
              size={32}
              color={colors.primary}
              style={styles.addIcon}
            />
          </Card>
        )}

        {(weeklyAverage !== null || uniqueDaysTracked > 0) && (
          <View style={styles.section}>
            <Text variant="h3" color="textPrimary" style={styles.sectionTitle}>
              This Week
            </Text>
            <Card variant="flat">
              <View style={styles.weeklyStatsWithGauge}>
                <NativeGauge
                  value={uniqueDaysTracked}
                  maxValue={7}
                  label="Days Tracked"
                  size={90}
                />
                <View style={styles.weeklyStatsText}>
                  <View style={styles.statRow}>
                    <Text variant="caption" color="textSecondary">Avg. Mood</Text>
                    <Text variant="bodyMedium" color="primary">
                      {weeklyAverage?.toFixed(1) ?? '-'}
                    </Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text variant="caption" color="textSecondary">Check-ins</Text>
                    <Text variant="bodyMedium" color="primary">
                      {weekEntries.length}
                    </Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text variant="caption" color="textSecondary">Today</Text>
                    <Text variant="bodyMedium" color="primary">
                      {todayEntries.length}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="h3" color="textPrimary">
              Recent Activity
            </Text>
            {entries.length > 5 && (
              <Pressable onPress={() => router.navigate('/(tabs)/insights')}>
                <Text variant="captionMedium" color="primary">
                  See All
                </Text>
              </Pressable>
            )}
          </View>
          {recentEntries.length > 0 ? (
            <View style={styles.recentList}>
              {recentEntries.map((entry, index) => (
                <AnimatedListItem key={entry.id} index={index}>
                  <MoodCard entry={entry} onPress={() => handleMoodPress(entry)} />
                </AnimatedListItem>
              ))}
            </View>
          ) : (
            <Card variant="flat" style={styles.emptyCard}>
              <Ionicons
                name="happy-outline"
                size={48}
                color={colors.textMuted}
                style={styles.emptyIcon}
              />
              <Text variant="body" color="textMuted" center>
                No entries yet.{'\n'}Start tracking your mood to see your activity here.
              </Text>
            </Card>
          )}
        </View>
      </Animated.ScrollView>

      <NativeBottomSheet
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title="Mood Details"
      >
        {selectedEntry && (
          <View style={styles.detailsContent}>
            <View style={styles.detailsHeader}>
              <View style={[styles.moodBadge, { backgroundColor: colors.mood[selectedEntry.mood] }]}>
                <Text style={styles.moodEmoji}>
                  {['', '😔', '😕', '😐', '🙂', '😊'][selectedEntry.mood]}
                </Text>
              </View>
              <View style={styles.detailsHeaderText}>
                <Text variant="h3" color="textPrimary">
                  {moodLabels[selectedEntry.mood].label}
                </Text>
                <Text variant="caption" color="textSecondary">
                  {format(selectedEntry.timestamp, 'EEEE, MMMM d • h:mm a')}
                </Text>
              </View>
            </View>

            {selectedEntry.activities.length > 0 && (
              <View style={styles.detailsSection}>
                <Text variant="captionMedium" color="textMuted" style={styles.detailsLabel}>
                  Activities
                </Text>
                <View style={styles.activitiesList}>
                  {selectedEntry.activities.map((actId) => {
                    const activity = activityTags.find((t) => t.id === actId);
                    return activity ? (
                      <View key={actId} style={styles.activityChip}>
                        <Text variant="caption" color="textSecondary">
                          {activity.label}
                        </Text>
                      </View>
                    ) : null;
                  })}
                </View>
              </View>
            )}

            {selectedEntry.note && (
              <View style={styles.detailsSection}>
                <Text variant="captionMedium" color="textMuted" style={styles.detailsLabel}>
                  Note
                </Text>
                <Text variant="body" color="textSecondary">
                  {selectedEntry.note}
                </Text>
              </View>
            )}
          </View>
        )}
      </NativeBottomSheet>
    </SafeAreaView>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  promptCard: {
    marginBottom: spacing.xl,
  },
  promptLabel: {
    marginBottom: spacing.xs,
  },
  promptHint: {
    marginTop: spacing.sm,
  },
  addIcon: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
  },
  statusCard: {
    marginBottom: spacing.xl,
  },
  statusLabel: {
    marginBottom: spacing.sm,
  },
  trackAgainButton: {
    marginTop: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  weeklyStatsWithGauge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.lg,
  },
  weeklyStatsText: {
    flex: 1,
    gap: spacing.sm,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentList: {
    gap: spacing.md,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    marginBottom: spacing.md,
  },
  detailsContent: {
    paddingTop: spacing.sm,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  moodBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodEmoji: {
    fontSize: 32,
  },
  detailsHeaderText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  detailsSection: {
    marginBottom: spacing.md,
  },
  detailsLabel: {
    marginBottom: spacing.xs,
  },
  activitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  activityChip: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
});
