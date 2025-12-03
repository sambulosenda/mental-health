import { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card, Button, NativePicker } from '@/src/components/ui';
import { MoodTrendChart, MoodCalendar, InsightList } from '@/src/components/insights';
import type { Insight } from '@/src/components/insights';
import { useMoodStore, useJournalStore } from '@/src/stores';
import { detectPatterns } from '@/src/lib/insights';
import { useAIInsights } from '@/src/lib/ai';
import { colors, spacing } from '@/src/constants/theme';
import type { DailyMoodSummary } from '@/src/types/mood';

const TIME_RANGES = ['Week', 'Month', 'Year'] as const;
const DAYS_MAP = { Week: 7, Month: 30, Year: 365 } as const;

export default function InsightsScreen() {
  const { entries, loadEntries, getDailySummaries } = useMoodStore();
  const { entries: journalEntries, loadEntries: loadJournalEntries } = useJournalStore();
  const [summaries, setSummaries] = useState<DailyMoodSummary[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRangeIndex, setTimeRangeIndex] = useState(1); // Default to Month

  const selectedRange = TIME_RANGES[timeRangeIndex];
  const daysToFetch = DAYS_MAP[selectedRange];

  // AI Insights
  const {
    state: aiState,
    insights: aiInsights,
    error: aiError,
    isModelReady,
    generateInsights,
  } = useAIInsights({
    moodEntries: entries,
    moodSummaries: summaries,
    journalEntries,
  });

  const loadData = useCallback(async () => {
    try {
      await Promise.all([loadEntries(), loadJournalEntries()]);
      const dailySummaries = await getDailySummaries(daysToFetch);
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
  }, [loadEntries, loadJournalEntries, getDailySummaries, entries, daysToFetch]);

  useEffect(() => {
    loadData();
  }, [daysToFetch]);

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

        <View style={styles.pickerContainer}>
          <NativePicker
            options={[...TIME_RANGES]}
            selectedIndex={timeRangeIndex}
            onSelect={setTimeRangeIndex}
          />
        </View>

        <View style={styles.section}>
          <MoodTrendChart summaries={summaries} isLoading={isLoading} />
        </View>

        <View style={styles.section}>
          <Text variant="h3" color="textPrimary" style={styles.sectionTitle}>
            {selectedRange} Overview
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
          <Text variant="h3" color="textPrimary" style={styles.sectionTitle}>
            AI Insights
          </Text>
          {!isModelReady ? (
            <Card variant="outlined" style={styles.aiCard}>
              <View style={styles.aiLoadingRow}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text variant="body" color="textSecondary" style={styles.aiLoadingText}>
                  Loading AI model...
                </Text>
              </View>
              <Text variant="caption" color="textMuted" style={styles.aiText}>
                First-time setup may take a moment while the model downloads.
              </Text>
            </Card>
          ) : aiState === 'generating' ? (
            <Card variant="outlined" style={styles.aiCard}>
              <View style={styles.aiLoadingRow}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text variant="body" color="textSecondary" style={styles.aiLoadingText}>
                  Analyzing your patterns...
                </Text>
              </View>
            </Card>
          ) : aiInsights.length > 0 ? (
            <View>
              <InsightList insights={aiInsights} />
              <Button
                variant="ghost"
                size="small"
                onPress={generateInsights}
                style={styles.refreshButton}
              >
                Refresh AI Insights
              </Button>
            </View>
          ) : (
            <Card variant="outlined" style={styles.aiCard}>
              <Ionicons name="sparkles" size={24} color={colors.primary} />
              <Text variant="body" color="textSecondary" style={styles.aiText}>
                {aiError || 'Generate personalized insights based on your mood and journal entries.'}
              </Text>
              <Button
                variant="secondary"
                size="small"
                onPress={generateInsights}
                disabled={entries.length < 3}
                style={styles.generateButton}
              >
                Generate AI Insights
              </Button>
              {entries.length < 3 && (
                <Text variant="caption" color="textMuted" style={styles.aiHint}>
                  Need at least 3 mood entries
                </Text>
              )}
            </Card>
          )}
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
  pickerContainer: {
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  aiCard: {
    padding: spacing.md,
    alignItems: 'center',
  },
  aiText: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  aiLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiLoadingText: {
    marginLeft: spacing.sm,
  },
  generateButton: {
    marginTop: spacing.md,
  },
  refreshButton: {
    marginTop: spacing.sm,
    alignSelf: 'center',
  },
  aiHint: {
    marginTop: spacing.xs,
  },
});
