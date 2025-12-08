import { useState, useMemo } from 'react';
import { View, Pressable } from 'react-native';
import { CartesianChart, Line, useChartPressState } from 'victory-native';
import { Text, Card } from '@/src/components/ui';
import { colors, darkColors, spacing } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import { GAD7_TEMPLATE, PHQ9_TEMPLATE, SEVERITY_CONFIG } from '@/src/constants/assessments';
import { ScoreInterpretation } from '@/src/components/assessments';
import type { AssessmentSession, AssessmentType } from '@/src/types/assessment';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface AssessmentTrendChartProps {
  gad7History: AssessmentSession[];
  phq9History: AssessmentSession[];
  isLoading?: boolean;
}

export function AssessmentTrendChart({
  gad7History,
  phq9History,
  isLoading,
}: AssessmentTrendChartProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<AssessmentType>('gad7');

  const template = selectedType === 'gad7' ? GAD7_TEMPLATE : PHQ9_TEMPLATE;
  const history = selectedType === 'gad7' ? gad7History : phq9History;
  const accentColor = template.color;

  const chartData = useMemo(() => {
    if (history.length === 0) return [];

    // Filter valid sessions and sort oldest-first before assigning indexes
    const validSessions = history
      .filter((s) => s.completedAt && s.totalScore !== undefined)
      .sort((a, b) => a.completedAt!.getTime() - b.completedAt!.getTime()); // Oldest first

    return validSessions.map((session, index) => ({
      index: index + 1,
      score: session.totalScore!,
      date: session.completedAt!,
      severity: session.severity,
      label: format(session.completedAt!, 'MMM d'),
    }));
  }, [history]);

  const hasData = chartData.length > 0;
  // Get latest valid session from chartData (already filtered for totalScore)
  const latestValidSession = hasData ? chartData[chartData.length - 1] : null;

  const stats = useMemo(() => {
    if (chartData.length === 0) return null;

    const scores = chartData.map((d) => d.score);
    const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const latest = chartData[chartData.length - 1]?.score ?? 0;
    const previous = chartData.length > 1 ? chartData[chartData.length - 2]?.score : null;

    let trend: 'improving' | 'worsening' | 'stable' = 'stable';
    if (previous !== null) {
      const diff = latest - previous;
      if (diff <= -2) trend = 'improving';
      else if (diff >= 2) trend = 'worsening';
    }

    return { avg, latest, trend, count: chartData.length };
  }, [chartData]);

  return (
    <Card className="p-4">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text variant="h3" color="textPrimary">
          Assessment Trends
        </Text>
        <View
          className="flex-row rounded-lg p-0.5"
          style={{ backgroundColor: themeColors.surfaceElevated }}
        >
          <Pressable
            className="px-3 py-1 rounded-md"
            style={selectedType === 'gad7' ? { backgroundColor: GAD7_TEMPLATE.color } : undefined}
            onPress={() => setSelectedType('gad7')}
          >
            <Text
              variant="label"
              style={{ color: selectedType === 'gad7' ? '#FFFFFF' : themeColors.textSecondary }}
            >
              GAD-7
            </Text>
          </Pressable>
          <Pressable
            className="px-3 py-1 rounded-md"
            style={selectedType === 'phq9' ? { backgroundColor: PHQ9_TEMPLATE.color } : undefined}
            onPress={() => setSelectedType('phq9')}
          >
            <Text
              variant="label"
              style={{ color: selectedType === 'phq9' ? '#FFFFFF' : themeColors.textSecondary }}
            >
              PHQ-9
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
          <View
            className="w-12 h-12 rounded-full items-center justify-center mb-3"
            style={{ backgroundColor: `${accentColor}20` }}
          >
            <Ionicons name={template.icon as any} size={24} color={accentColor} />
          </View>
          <Text variant="body" color="textMuted" center className="mb-4">
            No {template.name} assessments yet.
          </Text>
          <Pressable
            onPress={() => router.push(`/assessment-session?type=${selectedType}`)}
            className="px-4 py-2 rounded-xl"
            style={{ backgroundColor: accentColor }}
          >
            <Text variant="bodyMedium" style={{ color: '#FFFFFF' }}>
              Take {template.name}
            </Text>
          </Pressable>
        </View>
      ) : (
        <>
          {/* Chart */}
          <View style={{ height: 180, marginHorizontal: -spacing.sm }}>
            <CartesianChart
              data={chartData}
              xKey="index"
              yKeys={['score']}
              domain={{ y: [0, template.scoringInfo.maxScore + 2] }}
              axisOptions={{
                font: null,
                tickCount: { x: Math.min(chartData.length, 6), y: 5 },
                lineColor: themeColors.border,
                labelColor: themeColors.textMuted,
                formatXLabel: (val) => {
                  const item = chartData.find((d) => d.index === val);
                  return item?.label ?? '';
                },
                formatYLabel: (val) => String(Math.round(val)),
              }}
            >
              {({ points }) => (
                <Line
                  points={points.score}
                  color={accentColor}
                  strokeWidth={3}
                  curveType="natural"
                  animate={{ type: 'spring', duration: 300 }}
                />
              )}
            </CartesianChart>
          </View>

          {/* Latest Result */}
          {latestValidSession && (
            <View
              className="flex-row items-center justify-between mt-4 pt-4 border-t"
              style={{ borderTopColor: themeColors.border }}
            >
              <View>
                <Text variant="caption" color="textMuted" className="mb-1">
                  Latest Score
                </Text>
                <View className="flex-row items-center gap-2">
                  <Text variant="h2" style={{ color: accentColor }}>
                    {latestValidSession.score}
                  </Text>
                  <Text variant="caption" color="textMuted">
                    / {template.scoringInfo.maxScore}
                  </Text>
                </View>
              </View>

              {latestValidSession.severity && (
                <View className="items-end">
                  <Text variant="caption" color="textMuted" className="mb-1">
                    Severity
                  </Text>
                  <ScoreInterpretation severity={latestValidSession.severity} compact />
                </View>
              )}

              {stats && stats.count > 1 && (
                <View className="items-end">
                  <Text variant="caption" color="textMuted" className="mb-1">
                    Trend
                  </Text>
                  <View className="flex-row items-center gap-1">
                    <Ionicons
                      name={
                        stats.trend === 'improving'
                          ? 'trending-down'
                          : stats.trend === 'worsening'
                            ? 'trending-up'
                            : 'remove-outline'
                      }
                      size={16}
                      color={
                        stats.trend === 'improving'
                          ? colors.success
                          : stats.trend === 'worsening'
                            ? colors.error
                            : themeColors.textMuted
                      }
                    />
                    <Text
                      variant="caption"
                      style={{
                        color:
                          stats.trend === 'improving'
                            ? colors.success
                            : stats.trend === 'worsening'
                              ? colors.error
                              : themeColors.textMuted,
                      }}
                    >
                      {stats.trend === 'improving'
                        ? 'Improving'
                        : stats.trend === 'worsening'
                          ? 'Worsening'
                          : 'Stable'}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </>
      )}
    </Card>
  );
}
