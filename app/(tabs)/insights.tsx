import { useEffect, useState, useCallback } from 'react';
import { View, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { Text, Card, Button, NativePicker, AnimatedHeader } from '@/src/components/ui';
import { MoodTrendChart, MoodCalendar, InsightList, InsightSources } from '@/src/components/insights';
import type { Insight } from '@/src/components/insights';
import { useMoodStore, useJournalStore, useExerciseStore } from '@/src/stores';
import { detectPatterns } from '@/src/lib/insights';
import { useAIInsights } from '@/src/lib/ai';
import { colors, darkColors, spacing } from '@/src/constants/theme';
import { EXERCISE_TEMPLATES } from '@/src/constants/exercises';
import { useTheme } from '@/src/contexts/ThemeContext';
import type { DailyMoodSummary } from '@/src/types/mood';
import { useRouter } from 'expo-router';

const HEADER_EXPANDED_HEIGHT = 110;
const MIN_ENTRIES_FOR_INSIGHTS = 3;

const TIME_RANGES = ['Week', 'Month', 'Year'] as const;
const DAYS_MAP = { Week: 7, Month: 30, Year: 365 } as const;

function EmptyInsightsState({ entriesCount, onTrackMood }: { entriesCount: number; onTrackMood: () => void }) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const remaining = Math.max(0, MIN_ENTRIES_FOR_INSIGHTS - entriesCount);
  const progress = Math.min(1, entriesCount / MIN_ENTRIES_FOR_INSIGHTS);

  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <View
        className="w-20 h-20 rounded-full items-center justify-center mb-6"
        style={{ backgroundColor: `${themeColors.primary}15` }}
      >
        <Ionicons name="analytics" size={40} color={themeColors.primary} />
      </View>
      <Text variant="h2" color="textPrimary" center className="mb-2">
        Unlock Your Insights
      </Text>
      <Text variant="body" color="textSecondary" center className="mb-6">
        Track your mood daily to discover patterns and get personalized insights about your emotional well-being.
      </Text>

      {/* Progress indicator */}
      <View className="w-full mb-6">
        <View className="flex-row justify-between mb-2">
          <Text variant="caption" color="textMuted">Progress</Text>
          <Text variant="caption" color="textPrimary">
            {entriesCount} / {MIN_ENTRIES_FOR_INSIGHTS} check-ins
          </Text>
        </View>
        <View
          className="h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: themeColors.border }}
        >
          <View
            className="h-full rounded-full"
            style={{
              backgroundColor: themeColors.primary,
              width: `${progress * 100}%`,
            }}
          />
        </View>
        {remaining > 0 && (
          <Text variant="caption" color="textMuted" className="mt-2 text-center">
            {remaining} more {remaining === 1 ? 'check-in' : 'check-ins'} to unlock insights
          </Text>
        )}
      </View>

      <Button variant="primary" onPress={onTrackMood}>
        Track Your Mood
      </Button>
    </View>
  );
}

export default function InsightsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const { entries, loadEntries, getDailySummaries } = useMoodStore();

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });
  const { entries: journalEntries, loadEntries: loadJournalEntries } = useJournalStore();
  const { recentSessions, loadRecentSessions } = useExerciseStore();
  const [summaries, setSummaries] = useState<DailyMoodSummary[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRangeIndex, setTimeRangeIndex] = useState(1);

  const selectedRange = TIME_RANGES[timeRangeIndex];
  const daysToFetch = DAYS_MAP[selectedRange];

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
      await Promise.all([
        loadEntries(),
        loadJournalEntries(),
        loadRecentSessions(),
      ]);
      const dailySummaries = await getDailySummaries(daysToFetch);
      setSummaries(dailySummaries);

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
  }, [loadEntries, loadJournalEntries, loadRecentSessions, getDailySummaries, entries, daysToFetch]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daysToFetch]);

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

  const handleTrackMood = useCallback(() => {
    router.push('/(tabs)/track');
  }, [router]);

  // Show empty state for new users with few entries
  const showEmptyState = !isLoading && entries.length < MIN_ENTRIES_FOR_INSIGHTS;

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`} edges={['top']}>
      <AnimatedHeader
        scrollY={scrollY}
        title="Insights"
        subtitle={showEmptyState ? undefined : "Discover patterns in your emotional journey"}
        showThemeToggle
      />
      {showEmptyState ? (
        <EmptyInsightsState entriesCount={entries.length} onTrackMood={handleTrackMood} />
      ) : (
      <Animated.ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.xxl,
          paddingTop: HEADER_EXPANDED_HEIGHT,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={themeColors.primary}
          />
        }
      >
        <View className="mb-6">
          <NativePicker
            options={[...TIME_RANGES]}
            selectedIndex={timeRangeIndex}
            onSelect={setTimeRangeIndex}
          />
        </View>

        <View className="mb-6">
          <MoodTrendChart summaries={summaries} isLoading={isLoading} />
        </View>

        <View className="mb-6">
          <Text variant="h3" color="textPrimary" className="mb-4">
            {selectedRange} Overview
          </Text>
          <MoodCalendar summaries={summaries} isLoading={isLoading} />
        </View>

        <View className="mb-6">
          <Text variant="h3" color="textPrimary" className="mb-4">
            Patterns & Insights
          </Text>
          <InsightList
            insights={insights}
            emptyMessage="Track your mood for at least a week to discover patterns and insights."
          />
        </View>

        {/* Exercise Stats */}
        <View className="mb-6">
          <Text variant="h3" color="textPrimary" className="mb-4">
            Exercise Activity
          </Text>
          {(() => {
            const completed = recentSessions.filter(s => s.status === 'completed');
            if (completed.length === 0) {
              return (
                <Card variant="flat" className="p-4 items-center">
                  <Ionicons name="fitness-outline" size={32} color={themeColors.textMuted} />
                  <Text variant="body" color="textMuted" center className="mt-2">
                    Complete exercises to see your stats here
                  </Text>
                </Card>
              );
            }

            // Calculate stats
            const withMoodData = completed.filter(s => s.moodBefore && s.moodAfter);
            const avgMoodDelta = withMoodData.length > 0
              ? withMoodData.reduce((sum, s) => sum + ((s.moodAfter || 0) - (s.moodBefore || 0)), 0) / withMoodData.length
              : null;

            // Most used exercise
            const exerciseCounts: Record<string, number> = {};
            completed.forEach(s => {
              exerciseCounts[s.templateId] = (exerciseCounts[s.templateId] || 0) + 1;
            });
            const topExerciseId = Object.entries(exerciseCounts)
              .sort((a, b) => b[1] - a[1])[0]?.[0];
            const topExercise = EXERCISE_TEMPLATES.find(t => t.id === topExerciseId);

            return (
              <Card variant="flat">
                <View className="flex-row justify-between">
                  <View className="items-center flex-1">
                    <Text variant="h2" color="textPrimary">{completed.length}</Text>
                    <Text variant="caption" color="textMuted">Completed</Text>
                  </View>
                  <View className="items-center flex-1">
                    <Text variant="h2" color="textPrimary">
                      {avgMoodDelta !== null ? (avgMoodDelta > 0 ? '+' : '') + avgMoodDelta.toFixed(1) : '-'}
                    </Text>
                    <Text variant="caption" color="textMuted">Avg Mood Δ</Text>
                  </View>
                  <View className="items-center flex-1">
                    <View
                      className="w-10 h-10 rounded-xl items-center justify-center mb-1"
                      style={{ backgroundColor: topExercise?.color ? `${topExercise.color}${isDark ? '30' : '15'}` : `${themeColors.primary}${isDark ? '30' : '15'}` }}
                    >
                      <Ionicons
                        name={(topExercise?.icon as any) || 'fitness-outline'}
                        size={18}
                        color={topExercise?.color || themeColors.primary}
                      />
                    </View>
                    <Text variant="caption" color="textMuted" numberOfLines={1}>
                      {topExercise?.name.split(' ')[0] || 'None'}
                    </Text>
                  </View>
                </View>
              </Card>
            );
          })()}
        </View>

        <View className="mb-6">
          <Text variant="h3" color="textPrimary" className="mb-4">
            AI Insights
          </Text>
          {!isModelReady ? (
            <Card variant="flat" className="p-4 items-center">
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color={themeColors.primary} />
                <Text variant="body" color="textSecondary" className="ml-2">
                  Loading AI model...
                </Text>
              </View>
              <Text variant="caption" color="textMuted" className="mt-2 text-center">
                First-time setup may take a moment while the model downloads.
              </Text>
            </Card>
          ) : aiState === 'generating' ? (
            <Card variant="flat" className="p-4 items-center">
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color={themeColors.primary} />
                <Text variant="body" color="textSecondary" className="ml-2">
                  Analyzing your patterns...
                </Text>
              </View>
            </Card>
          ) : aiInsights.length > 0 ? (
            <View>
              <InsightList insights={aiInsights} />
              <Button
                variant="ghost"
                size="sm"
                onPress={generateInsights}
                className="mt-2 self-center"
              >
                Refresh AI Insights
              </Button>
            </View>
          ) : (
            <Card variant="flat" className="p-4 items-center">
              <Ionicons name="sparkles" size={24} color={themeColors.primary} />
              <Text variant="body" color="textSecondary" className="mt-2 text-center">
                {aiError || 'Generate personalized insights based on your mood and journal entries.'}
              </Text>
              <Button
                variant="secondary"
                size="sm"
                onPress={generateInsights}
                disabled={entries.length < 3}
                className="mt-4"
              >
                Generate AI Insights
              </Button>
              {entries.length < 3 && (
                <Text variant="caption" color="textMuted" className="mt-1">
                  Need at least 3 mood entries
                </Text>
              )}
            </Card>
          )}
          <InsightSources />
        </View>
      </Animated.ScrollView>
      )}
    </SafeAreaView>
  );
}
