import { useState, useMemo } from 'react';
import { View, Pressable } from 'react-native';
import { CartesianChart, Line } from 'victory-native';
import { Text, Card } from '@/src/components/ui';
import { colors, darkColors, spacing } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import type { DailyMoodSummary } from '@/src/types/mood';
import { format, subDays } from 'date-fns';

interface MoodTrendChartProps {
  summaries: DailyMoodSummary[];
  isLoading?: boolean;
}

type TimeRange = 7 | 30;

export function MoodTrendChart({ summaries, isLoading }: MoodTrendChartProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
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
    <Card className="p-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text variant="h3" color="textPrimary">
          Mood Trends
        </Text>
        <View
          className="flex-row rounded-lg p-0.5"
          style={{ backgroundColor: themeColors.surfaceElevated }}
        >
          <Pressable
            className="px-4 py-1 rounded-md"
            style={timeRange === 7 ? { backgroundColor: themeColors.primary } : undefined}
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
            className="px-4 py-1 rounded-md"
            style={timeRange === 30 ? { backgroundColor: themeColors.primary } : undefined}
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
        <View className="h-[200px] justify-center items-center">
          <Text variant="body" color="textMuted">
            Loading...
          </Text>
        </View>
      ) : !hasData ? (
        <View className="h-[200px] justify-center items-center px-6">
          <Text variant="body" color="textMuted" center>
            No mood data for this period.{'\n'}Start tracking to see trends.
          </Text>
        </View>
      ) : (
        <>
          <View style={{ height: 200, marginHorizontal: -spacing.sm }}>
            <CartesianChart
              data={chartData}
              xKey="day"
              yKeys={['avgMood']}
              domain={{ y: [0, 5.5] }}
              axisOptions={{
                font: null,
                tickCount: { x: timeRange === 7 ? 7 : 6, y: 5 },
                lineColor: themeColors.border,
                labelColor: themeColors.textMuted,
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
                  color={themeColors.primary}
                  strokeWidth={3}
                  curveType="natural"
                  animate={{ type: 'spring', duration: 300 }}
                />
              )}
            </CartesianChart>
          </View>

          {stats && (
            <View
              className="flex-row justify-around items-center mt-4 pt-4 border-t"
              style={{ borderTopColor: themeColors.border }}
            >
              <View className="items-center">
                <Text variant="h3" color="primary">
                  {stats.avg.toFixed(1)}
                </Text>
                <Text variant="caption" color="textSecondary">
                  Average
                </Text>
              </View>
              <View
                className="w-px h-8"
                style={{ backgroundColor: themeColors.divider }}
              />
              <View className="items-center">
                <Text variant="h3" color="primary">
                  {stats.days}
                </Text>
                <Text variant="caption" color="textSecondary">
                  Days tracked
                </Text>
              </View>
              <View
                className="w-px h-8"
                style={{ backgroundColor: themeColors.divider }}
              />
              <View className="items-center">
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
