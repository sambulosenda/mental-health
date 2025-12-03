import { useState, useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { CartesianChart, Line } from 'victory-native';
import { Text, Card } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants/theme';
import type { DailyMoodSummary } from '@/src/types/mood';
import { format, subDays } from 'date-fns';

interface MoodTrendChartProps {
  summaries: DailyMoodSummary[];
  isLoading?: boolean;
}

type TimeRange = 7 | 30;

export function MoodTrendChart({ summaries, isLoading }: MoodTrendChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>(7);

  const chartData = useMemo(() => {
    const today = new Date();
    const data: { day: number; avgMood: number; date: string; label: string }[] = [];

    for (let i = timeRange - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const summary = summaries.find((s) => s.date === dateStr);

      data.push({
        day: timeRange - i,
        avgMood: summary?.averageMood ?? 0,
        date: dateStr,
        label: format(date, timeRange === 7 ? 'EEE' : 'd'),
      });
    }

    return data;
  }, [summaries, timeRange]);

  const hasData = chartData.some((d) => d.avgMood > 0);

  const stats = useMemo(() => {
    const validEntries = chartData.filter((d) => d.avgMood > 0);
    if (validEntries.length === 0) return null;

    const avg = validEntries.reduce((sum, d) => sum + d.avgMood, 0) / validEntries.length;
    const min = Math.min(...validEntries.map((d) => d.avgMood));
    const max = Math.max(...validEntries.map((d) => d.avgMood));

    // Trend calculation
    const firstHalf = validEntries.slice(0, Math.floor(validEntries.length / 2));
    const secondHalf = validEntries.slice(Math.floor(validEntries.length / 2));
    const firstAvg = firstHalf.length > 0
      ? firstHalf.reduce((sum, d) => sum + d.avgMood, 0) / firstHalf.length
      : 0;
    const secondAvg = secondHalf.length > 0
      ? secondHalf.reduce((sum, d) => sum + d.avgMood, 0) / secondHalf.length
      : 0;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (secondAvg - firstAvg > 0.3) trend = 'up';
    else if (firstAvg - secondAvg > 0.3) trend = 'down';

    return { avg, min, max, trend, days: validEntries.length };
  }, [chartData]);

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text variant="h3" color="textPrimary">
          Mood Trends
        </Text>
        <View style={styles.toggleContainer}>
          <Pressable
            style={[styles.toggle, timeRange === 7 && styles.toggleActive]}
            onPress={() => setTimeRange(7)}
          >
            <Text
              variant="label"
              color={timeRange === 7 ? 'textInverse' : 'textSecondary'}
            >
              7D
            </Text>
          </Pressable>
          <Pressable
            style={[styles.toggle, timeRange === 30 && styles.toggleActive]}
            onPress={() => setTimeRange(30)}
          >
            <Text
              variant="label"
              color={timeRange === 30 ? 'textInverse' : 'textSecondary'}
            >
              30D
            </Text>
          </Pressable>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text variant="body" color="textMuted">
            Loading...
          </Text>
        </View>
      ) : !hasData ? (
        <View style={styles.emptyContainer}>
          <Text variant="body" color="textMuted" center>
            No mood data for this period.{'\n'}Start tracking to see trends.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.chartContainer}>
            <CartesianChart
              data={chartData}
              xKey="day"
              yKeys={['avgMood']}
              domain={{ y: [0, 5.5] }}
              axisOptions={{
                font: null,
                tickCount: { x: timeRange === 7 ? 7 : 6, y: 5 },
                lineColor: colors.border,
                labelColor: colors.textMuted,
                formatXLabel: (val) => {
                  const item = chartData.find((d) => d.day === val);
                  return item?.label ?? '';
                },
                formatYLabel: (val) => (val === 0 ? '' : String(Math.round(val))),
              }}
            >
              {({ points }) => (
                <Line
                  points={points.avgMood.filter((p) => p.y !== null && (p.yValue ?? 0) > 0)}
                  color={colors.primary}
                  strokeWidth={3}
                  curveType="natural"
                  animate={{ type: 'spring', duration: 300 }}
                />
              )}
            </CartesianChart>
          </View>

          {stats && (
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text variant="h3" color="primary">
                  {stats.avg.toFixed(1)}
                </Text>
                <Text variant="caption" color="textSecondary">
                  Average
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text variant="h3" color="primary">
                  {stats.days}
                </Text>
                <Text variant="caption" color="textSecondary">
                  Days tracked
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text variant="h3" color={stats.trend === 'up' ? 'success' : stats.trend === 'down' ? 'error' : 'primary'}>
                  {stats.trend === 'up' ? '↑' : stats.trend === 'down' ? '↓' : '→'}
                </Text>
                <Text variant="caption" color="textSecondary">
                  Trend
                </Text>
              </View>
            </View>
          )}
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 8,
    padding: 2,
  },
  toggle: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  toggleActive: {
    backgroundColor: colors.primary,
  },
  chartContainer: {
    height: 200,
    marginHorizontal: -spacing.sm,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.divider,
  },
});
