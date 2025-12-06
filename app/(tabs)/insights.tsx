import { useEffect, useState, useCallback } from 'react';
import { View, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { Text, Card, Button, NativePicker, AnimatedHeader } from '@/src/components/ui';
import { MoodTrendChart, MoodCalendar, InsightList } from '@/src/components/insights';
import type { Insight } from '@/src/components/insights';
import { useMoodStore, useJournalStore } from '@/src/stores';
import { detectPatterns } from '@/src/lib/insights';
import { useAIInsights } from '@/src/lib/ai';
import { colors, darkColors, spacing } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import type { DailyMoodSummary } from '@/src/types/mood';

const HEADER_EXPANDED_HEIGHT = 120;

const TIME_RANGES = ['Week', 'Month', 'Year'] as const;
const DAYS_MAP = { Week: 7, Month: 30, Year: 365 } as const;

export default function InsightsScreen() {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const insets = useSafeAreaInsets();
  const { entries, loadEntries, getDailySummaries } = useMoodStore();

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });
  const { entries: journalEntries, loadEntries: loadJournalEntries } = useJournalStore();
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
      await Promise.all([loadEntries(), loadJournalEntries()]);
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
  }, [loadEntries, loadJournalEntries, getDailySummaries, entries, daysToFetch]);

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
