import { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { startOfWeek, endOfWeek, subWeeks, format } from 'date-fns';
import { Text, Card, Button } from '@/src/components/ui';
import { MoodAnimation } from '@/src/components/mood';
import { useMoodStore, useJournalStore, useExerciseStore } from '@/src/stores';
import { useGamificationStore } from '@/src/stores/useGamificationStore';
import { colors, darkColors, spacing, moodLabels } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import type { MoodEntry } from '@/src/types/mood';

interface WeeklySummaryData {
  weekStart: Date;
  weekEnd: Date;
  moodEntries: MoodEntry[];
  averageMood: number | null;
  moodTrend: 'up' | 'down' | 'stable' | null;
  journalCount: number;
  exerciseCount: number;
  streakDays: number;
  topActivities: string[];
  moodDistribution: Record<number, number>;
}

export default function WeeklySummaryScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;

  const { entries, loadEntries } = useMoodStore();
  const { entries: journalEntries, loadEntries: loadJournalEntries } = useJournalStore();
  const { recentSessions, loadRecentSessions } = useExerciseStore();
  const { streaks } = useGamificationStore();

  const [summary, setSummary] = useState<WeeklySummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const calculateSummary = useCallback(async () => {
    setIsLoading(true);

    // Get last week's date range
    const now = new Date();
    const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

    // Filter mood entries for last week
    const weekMoods = entries.filter((entry) => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= lastWeekStart && entryDate <= lastWeekEnd;
    });

    // Calculate average mood
    const avgMood = weekMoods.length > 0
      ? weekMoods.reduce((sum, e) => sum + e.mood, 0) / weekMoods.length
      : null;

    // Calculate mood distribution
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    weekMoods.forEach((e) => {
      distribution[e.mood] = (distribution[e.mood] || 0) + 1;
    });

    // Calculate trend (compare first half to second half of week)
    let trend: 'up' | 'down' | 'stable' | null = null;
    if (weekMoods.length >= 4) {
      const midpoint = Math.floor(weekMoods.length / 2);
      const firstHalf = weekMoods.slice(0, midpoint);
      const secondHalf = weekMoods.slice(midpoint);
      const firstAvg = firstHalf.reduce((sum, e) => sum + e.mood, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, e) => sum + e.mood, 0) / secondHalf.length;
      const diff = secondAvg - firstAvg;
      if (diff > 0.3) trend = 'up';
      else if (diff < -0.3) trend = 'down';
      else trend = 'stable';
    }

    // Count journals for the week
    const weekJournals = journalEntries.filter((entry) => {
      const entryDate = new Date(entry.createdAt);
      return entryDate >= lastWeekStart && entryDate <= lastWeekEnd;
    });

    // Count exercises for the week
    const weekExercises = recentSessions.filter((session) => {
      const sessionDate = new Date(session.completedAt || session.startedAt);
      return session.status === 'completed' && sessionDate >= lastWeekStart && sessionDate <= lastWeekEnd;
    });

    // Get top activities
    const activityCounts: Record<string, number> = {};
    weekMoods.forEach((entry) => {
      entry.activities?.forEach((activity) => {
        activityCounts[activity] = (activityCounts[activity] || 0) + 1;
      });
    });
    const topActivities = Object.entries(activityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([activity]) => activity);

    setSummary({
      weekStart: lastWeekStart,
      weekEnd: lastWeekEnd,
      moodEntries: weekMoods,
      averageMood: avgMood,
      moodTrend: trend,
      journalCount: weekJournals.length,
      exerciseCount: weekExercises.length,
      streakDays: streaks.overall.currentStreak,
      topActivities,
      moodDistribution: distribution,
    });

    setIsLoading(false);
  }, [entries, journalEntries, recentSessions, streaks]);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadEntries(), loadJournalEntries(), loadRecentSessions()]);
      calculateSummary();
    };
    loadData();
  }, []);

  useEffect(() => {
    if (entries.length > 0) {
      calculateSummary();
    }
  }, [entries, calculateSummary]);

  if (isLoading || !summary) {
    return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const dateRange = `${format(summary.weekStart, 'MMM d')} - ${format(summary.weekEnd, 'MMM d')}`;
  const roundedMood = summary.averageMood ? Math.round(summary.averageMood) as 1 | 2 | 3 | 4 | 5 : null;

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`} edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="items-center mb-6">
          <Text variant="h2" color="textPrimary" center>
            Weekly Summary
          </Text>
          <Text variant="caption" color="textMuted" className="mt-1">
            {dateRange}
          </Text>
        </View>

        {/* Average Mood Card */}
        {roundedMood && (
          <Card className="mb-4 items-center py-6">
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-3"
              style={{ backgroundColor: colors.mood[roundedMood] }}
            >
              <MoodAnimation mood={roundedMood} size={48} loop={false} />
            </View>
            <Text variant="h3" color="textPrimary">
              Average Mood: {moodLabels[roundedMood].label}
            </Text>
            <Text variant="caption" color="textSecondary" className="mt-1">
              {summary.averageMood?.toFixed(1)} / 5
            </Text>
            {summary.moodTrend && (
              <View className="flex-row items-center mt-2">
                <Ionicons
                  name={
                    summary.moodTrend === 'up'
                      ? 'trending-up'
                      : summary.moodTrend === 'down'
                        ? 'trending-down'
                        : 'remove'
                  }
                  size={16}
                  color={
                    summary.moodTrend === 'up'
                      ? themeColors.success
                      : summary.moodTrend === 'down'
                        ? themeColors.error
                        : themeColors.textMuted
                  }
                />
                <Text
                  variant="caption"
                  className="ml-1"
                  style={{
                    color:
                      summary.moodTrend === 'up'
                        ? themeColors.success
                        : summary.moodTrend === 'down'
                          ? themeColors.error
                          : themeColors.textMuted,
                  }}
                >
                  {summary.moodTrend === 'up'
                    ? 'Improving'
                    : summary.moodTrend === 'down'
                      ? 'Declining'
                      : 'Stable'}
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* Stats Grid */}
        <View className="flex-row gap-3 mb-4">
          <Card className="flex-1 items-center py-4">
            <Ionicons name="happy-outline" size={24} color={themeColors.primary} />
            <Text variant="h2" color="textPrimary" className="mt-2">
              {summary.moodEntries.length}
            </Text>
            <Text variant="caption" color="textMuted">Check-ins</Text>
          </Card>
          <Card className="flex-1 items-center py-4">
            <Ionicons name="book-outline" size={24} color={themeColors.warning} />
            <Text variant="h2" color="textPrimary" className="mt-2">
              {summary.journalCount}
            </Text>
            <Text variant="caption" color="textMuted">Journal</Text>
          </Card>
          <Card className="flex-1 items-center py-4">
            <Ionicons name="fitness-outline" size={24} color={themeColors.success} />
            <Text variant="h2" color="textPrimary" className="mt-2">
              {summary.exerciseCount}
            </Text>
            <Text variant="caption" color="textMuted">Exercises</Text>
          </Card>
        </View>

        {/* Streak */}
        {summary.streakDays > 0 && (
          <Card className="mb-4">
            <View className="flex-row items-center">
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: '#FFF3E0' }}
              >
                <Ionicons name="flame" size={28} color="#FF6B35" />
              </View>
              <View>
                <Text variant="h3" color="textPrimary">
                  {summary.streakDays} Day Streak
                </Text>
                <Text variant="caption" color="textMuted">
                  Keep it going!
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Top Activities */}
        {summary.topActivities.length > 0 && (
          <Card className="mb-4">
            <Text variant="bodyMedium" color="textPrimary" className="mb-3">
              Top Activities
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {summary.topActivities.map((activity) => (
                <View
                  key={activity}
                  className="px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: isDark ? `${themeColors.primary}30` : `${themeColors.primary}15` }}
                >
                  <Text variant="caption" style={{ color: themeColors.primary }}>
                    {activity}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Empty State */}
        {summary.moodEntries.length === 0 && (
          <Card className="items-center py-8">
            <Ionicons name="calendar-outline" size={48} color={themeColors.textMuted} />
            <Text variant="body" color="textSecondary" center className="mt-4">
              No data for last week. Start tracking to see your weekly summary!
            </Text>
          </Card>
        )}

        {/* Close Button */}
        <Button variant="secondary" onPress={() => router.back()} className="mt-4">
          Close
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
