import { useEffect, useState, useCallback } from 'react';
import { View, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { Text, Card, Button, NativePicker, AnimatedHeader } from '@/src/components/ui';
import { MoodTrendChart, MoodCalendar, InsightList, AssessmentTrendChart } from '@/src/components/insights';
import type { Insight } from '@/src/components/insights';
import { useMoodStore, useJournalStore, useExerciseStore, useAssessmentStore } from '@/src/stores';
import { detectPatterns } from '@/src/lib/insights';
import { useAIInsights } from '@/src/lib/ai';
import { colors, darkColors, spacing } from '@/src/constants/theme';
import { EXERCISE_TEMPLATES } from '@/src/constants/exercises';
import { useTheme } from '@/src/contexts/ThemeContext';
import type { DailyMoodSummary } from '@/src/types/mood';

const HEADER_EXPANDED_HEIGHT = 120;

const TIME_RANGES = ['Week', 'Month', 'Year'] as const;
const DAYS_MAP = { Week: 7, Month: 30, Year: 365 } as const;

export default function InsightsScreen() {
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
  const {
    gad7History,
    phq9History,
    loadAssessmentHistory,
  } = useAssessmentStore();
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
        loadAssessmentHistory('gad7', daysToFetch),
        loadAssessmentHistory('phq9', daysToFetch),
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
  }, [loadEntries, loadJournalEntries, loadRecentSessions, loadAssessmentHistory, getDailySummaries, entries, daysToFetch]);

  useEffect(() => {
    loadData();
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

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`} edges={['top']}>
      <AnimatedHeader
        scrollY={scrollY}
        title="Insights"
        subtitle="Discover patterns in your emotional journey"
        showThemeToggle
      />
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
          <AssessmentTrendChart
            gad7History={gad7History}
            phq9History={phq9History}
            isLoading={isLoading}
          />
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
                    <Text variant="h2" color="primary">{completed.length}</Text>
                    <Text variant="caption" color="textMuted">Completed</Text>
                  </View>
                  <View className="items-center flex-1">
                    <Text variant="h2" color={avgMoodDelta && avgMoodDelta > 0 ? 'primary' : 'textPrimary'}>
                      {avgMoodDelta !== null ? (avgMoodDelta > 0 ? '+' : '') + avgMoodDelta.toFixed(1) : '-'}
                    </Text>
                    <Text variant="caption" color="textMuted">Avg Mood Δ</Text>
                  </View>
                  <View className="items-center flex-1">
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mb-1"
                      style={{ backgroundColor: topExercise?.color ? `${topExercise.color}20` : themeColors.primaryLight }}
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
            <Card variant="outlined" className="p-4 items-center">
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
            <Card variant="outlined" className="p-4 items-center">
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
            <Card variant="outlined" className="p-4 items-center">
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
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}
