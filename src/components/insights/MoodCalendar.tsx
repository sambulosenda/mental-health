import { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Card } from '@/src/components/ui';
import { colors, spacing, moodLabels } from '@/src/constants/theme';
import type { DailyMoodSummary } from '@/src/types/mood';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
} from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

interface MoodCalendarProps {
  summaries: DailyMoodSummary[];
  isLoading?: boolean;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getMoodColor(avgMood: number | null): string {
  if (avgMood === null) return colors.surfaceElevated;
  const rounded = Math.round(avgMood);
  return colors.mood[rounded] ?? colors.surfaceElevated;
}

function getMoodOpacity(avgMood: number | null): number {
  if (avgMood === null) return 0.3;
  return 0.5 + (avgMood / 5) * 0.5;
}

export function MoodCalendar({ summaries, isLoading }: MoodCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const calendarData = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Create a map for quick lookup
    const summaryMap = new Map(summaries.map((s) => [s.date, s]));

    return days.map((date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const summary = summaryMap.get(dateStr);
      return {
        date,
        dateStr,
        dayOfMonth: format(date, 'd'),
        avgMood: summary?.averageMood ?? null,
        entries: summary?.entries ?? [],
        isToday: isToday(date),
      };
    });
  }, [currentMonth, summaries]);

  // Calculate start padding (empty cells before first day)
  const startPadding = getDay(startOfMonth(currentMonth));

  const selectedDayData = selectedDay
    ? calendarData.find((d) => d.dateStr === selectedDay)
    : null;

  const monthStats = useMemo(() => {
    const daysWithData = calendarData.filter((d) => d.avgMood !== null);
    if (daysWithData.length === 0) return null;

    const avg = daysWithData.reduce((sum, d) => sum + (d.avgMood ?? 0), 0) / daysWithData.length;
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    daysWithData.forEach((d) => {
      if (d.avgMood !== null) {
        const rounded = Math.round(d.avgMood) as 1 | 2 | 3 | 4 | 5;
        distribution[rounded]++;
      }
    });

    return { avg, daysTracked: daysWithData.length, distribution };
  }, [calendarData]);

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}
          style={styles.navButton}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textSecondary} />
        </Pressable>
        <Text variant="h3" color="textPrimary">
          {format(currentMonth, 'MMMM yyyy')}
        </Text>
        <Pressable
          onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}
          style={styles.navButton}
          disabled={isSameMonth(currentMonth, new Date())}
        >
          <Ionicons
            name="chevron-forward"
            size={24}
            color={isSameMonth(currentMonth, new Date()) ? colors.border : colors.textSecondary}
          />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text variant="body" color="textMuted">Loading...</Text>
        </View>
      ) : (
        <>
          <View style={styles.weekdayRow}>
            {WEEKDAYS.map((day, i) => (
              <View key={i} style={styles.weekdayCell}>
                <Text variant="label" color="textMuted">
                  {day}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.grid}>
            {/* Empty padding cells */}
            {Array.from({ length: startPadding }).map((_, i) => (
              <View key={`pad-${i}`} style={styles.dayCell} />
            ))}

            {/* Day cells */}
            {calendarData.map((day) => (
              <Pressable
                key={day.dateStr}
                style={[
                  styles.dayCell,
                  {
                    backgroundColor: getMoodColor(day.avgMood),
                    opacity: getMoodOpacity(day.avgMood),
                  },
                  day.isToday && styles.todayCell,
                  selectedDay === day.dateStr && styles.selectedCell,
                ]}
                onPress={() => setSelectedDay(day.dateStr === selectedDay ? null : day.dateStr)}
              >
                <Text
                  variant="caption"
                  color={day.avgMood !== null ? 'textPrimary' : 'textMuted'}
                  style={day.isToday && styles.todayText}
                >
                  {day.dayOfMonth}
                </Text>
              </Pressable>
            ))}
          </View>

          {selectedDayData && selectedDayData.avgMood !== null && (
            <View style={styles.selectedInfo}>
              <Text variant="captionMedium" color="primary">
                {format(selectedDayData.date, 'EEEE, MMM d')}
              </Text>
              <Text variant="body" color="textPrimary">
                Avg: {selectedDayData.avgMood.toFixed(1)} ({moodLabels[Math.round(selectedDayData.avgMood)]?.label})
              </Text>
              <Text variant="caption" color="textSecondary">
                {selectedDayData.entries.length} check-in{selectedDayData.entries.length !== 1 ? 's' : ''}
              </Text>
            </View>
          )}

          <View style={styles.legend}>
            <Text variant="label" color="textMuted" style={styles.legendLabel}>
              Less
            </Text>
            {[1, 2, 3, 4, 5].map((mood) => (
              <View
                key={mood}
                style={[styles.legendItem, { backgroundColor: colors.mood[mood] }]}
              />
            ))}
            <Text variant="label" color="textMuted" style={styles.legendLabel}>
              Better
            </Text>
          </View>

          {monthStats && (
            <View style={styles.monthStats}>
              <View style={styles.statItem}>
                <Text variant="bodyMedium" color="primary">
                  {monthStats.avg.toFixed(1)}
                </Text>
                <Text variant="label" color="textMuted">
                  Avg
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="bodyMedium" color="primary">
                  {monthStats.daysTracked}
                </Text>
                <Text variant="label" color="textMuted">
                  Days
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
  navButton: {
    padding: spacing.xs,
  },
  loadingContainer: {
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 2,
  },
  todayCell: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  todayText: {
    fontWeight: '700',
  },
  selectedCell: {
    borderWidth: 2,
    borderColor: colors.primaryDark,
  },
  selectedInfo: {
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 8,
    alignItems: 'center',
    gap: spacing.xs,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  legendLabel: {
    marginHorizontal: spacing.xs,
  },
  legendItem: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  monthStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
});
