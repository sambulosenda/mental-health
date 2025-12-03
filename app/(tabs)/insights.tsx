import { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card } from '@/src/components/ui';
import { MoodTrendChart, MoodCalendar, InsightList } from '@/src/components/insights';
import type { Insight } from '@/src/components/insights';
import { useMoodStore } from '@/src/stores';
import { detectPatterns } from '@/src/lib/insights';
import { colors, spacing } from '@/src/constants/theme';
import type { DailyMoodSummary } from '@/src/types/mood';

export default function InsightsScreen() {
  const { entries, loadEntries, getDailySummaries } = useMoodStore();
  const [summaries, setSummaries] = useState<DailyMoodSummary[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      await loadEntries();
      const dailySummaries = await getDailySummaries(30);
      setSummaries(dailySummaries);

      // Detect patterns
      const detectedInsights = detectPatterns({
        entries,
        summaries: dailySummaries,
      });
      setInsights(detectedInsights);
    } catch (error) {
      console.error('Failed to load insights:', error);
    } finally {
      setIsLoading(false);
    }
  }, [loadEntries, getDailySummaries, entries]);

  useEffect(() => {
    loadData();
  }, []);

  // Re-run pattern detection when entries change
  useEffect(() => {
    if (summaries.length > 0) {
      const detectedInsights = detectPatterns({
        entries,
        summaries,
      });
      setInsights(detectedInsights);
    }
  }, [entries, summaries]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <Text variant="h1" color="textPrimary">
            Insights
          </Text>
          <Text variant="body" color="textSecondary" style={styles.subtitle}>
            Discover patterns in your emotional journey
          </Text>
        </View>

        <View style={styles.section}>
          <MoodTrendChart summaries={summaries} isLoading={isLoading} />
        </View>

        <View style={styles.section}>
          <Text variant="h3" color="textPrimary" style={styles.sectionTitle}>
            Monthly Overview
          </Text>
          <MoodCalendar summaries={summaries} isLoading={isLoading} />
        </View>

        <View style={styles.section}>
          <Text variant="h3" color="textPrimary" style={styles.sectionTitle}>
            Patterns & Insights
          </Text>
          <InsightList
            insights={insights}
            emptyMessage="Track your mood for at least a week to discover patterns and insights."
          />
        </View>

        <View style={styles.section}>
          <Card variant="outlined" style={styles.aiCard}>
            <Text variant="captionMedium" color="primary">
              Coming Soon
            </Text>
            <Text variant="body" color="textSecondary" style={styles.aiText}>
              AI-powered insights will analyze your patterns to provide personalized recommendations.
            </Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
  subtitle: {
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  aiCard: {
    padding: spacing.md,
  },
  aiText: {
    marginTop: spacing.xs,
  },
});
