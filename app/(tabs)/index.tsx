import { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card, Button } from '@/src/components/ui';
import { MoodCard } from '@/src/components/mood';
import { useMoodStore } from '@/src/stores';
import { colors, spacing } from '@/src/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { todayEntries, entries, loadTodayEntries, loadEntries } = useMoodStore();

  useEffect(() => {
    loadTodayEntries();
    loadEntries();
  }, []);

  const today = new Date();
  const greeting = getGreeting();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const latestMood = todayEntries[0];
  const recentEntries = entries.slice(0, 5);

  // Calculate weekly average
  const weekEntries = entries.filter((e) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return e.timestamp >= weekAgo;
  });
  const weeklyAverage =
    weekEntries.length > 0
      ? weekEntries.reduce((sum, e) => sum + e.mood, 0) / weekEntries.length
      : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text variant="h1" color="textPrimary">
            {greeting}
          </Text>
          <Text variant="body" color="textSecondary" style={styles.date}>
            {formattedDate}
          </Text>
        </View>

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
          <Pressable onPress={() => router.navigate('/(tabs)/track')}>
            <Card style={styles.promptCard}>
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
          </Pressable>
        )}

        {weeklyAverage !== null && (
          <View style={styles.section}>
            <Text variant="h3" color="textPrimary" style={styles.sectionTitle}>
              This Week
            </Text>
            <Card variant="flat">
              <View style={styles.weeklyStats}>
                <View style={styles.statItem}>
                  <Text variant="h2" color="primary">
                    {weeklyAverage.toFixed(1)}
                  </Text>
                  <Text variant="caption" color="textSecondary">
                    Avg. Mood
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text variant="h2" color="primary">
                    {weekEntries.length}
                  </Text>
                  <Text variant="caption" color="textSecondary">
                    Check-ins
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text variant="h2" color="primary">
                    {todayEntries.length}
                  </Text>
                  <Text variant="caption" color="textSecondary">
                    Today
                  </Text>
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
              {recentEntries.map((entry) => (
                <MoodCard key={entry.id} entry={entry} />
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
      </ScrollView>
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
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  date: {
    marginTop: spacing.xs,
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
  weeklyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.divider,
  },
  recentList: {
    gap: spacing.sm,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    marginBottom: spacing.md,
  },
});
