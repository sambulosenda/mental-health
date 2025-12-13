import { useMemo, useState } from 'react';
import { View, Pressable } from 'react-native';
import { Text, Card } from '@/src/components/ui';
import { colors, darkColors, moodLabels, borderRadius } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
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

// Get mood color with dark mode support
function getMoodColor(avgMood: number | null, isDark: boolean): string {
  if (avgMood === null) return 'transparent';
  const rounded = Math.round(avgMood) as 1 | 2 | 3 | 4 | 5;
  return isDark ? darkColors.mood[rounded] : colors.mood[rounded];
}

// Adjust opacity for dark mode visibility
function getMoodOpacity(avgMood: number | null, isDark: boolean): number {
  if (avgMood === null) return isDark ? 0.2 : 0.15;
  // Higher base opacity in dark mode for visibility
  const base = isDark ? 0.6 : 0.5;
  return base + (avgMood / 5) * (isDark ? 0.4 : 0.5);
}

export function MoodCalendar({ summaries, isLoading }: MoodCalendarProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const calendarData = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

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
    <Card padding="md">
      <View className="flex-row justify-between items-center mb-5">
        <Pressable
          onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}
          style={{
            width: 40,
            height: 40,
            borderRadius: borderRadius.md,
            backgroundColor: isDark ? themeColors.surface : themeColors.surfaceElevated,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="chevron-back" size={20} color={themeColors.textSecondary} />
        </Pressable>
        <Text variant="h3" color="textPrimary">
          {format(currentMonth, 'MMMM yyyy')}
        </Text>
        <Pressable
          onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}
          disabled={isSameMonth(currentMonth, new Date())}
          style={{
            width: 40,
            height: 40,
            borderRadius: borderRadius.md,
            backgroundColor: isDark ? themeColors.surface : themeColors.surfaceElevated,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isSameMonth(currentMonth, new Date()) ? 0.4 : 1,
          }}
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color={themeColors.textSecondary}
          />
        </Pressable>
      </View>

      {isLoading ? (
        <View className="h-[280px] justify-center items-center">
          <Text variant="body" color="textMuted">Loading...</Text>
        </View>
      ) : (
        <>
          <View className="flex-row mb-2">
            {WEEKDAYS.map((day, i) => (
              <View key={i} style={{ width: '14.28%', alignItems: 'center', paddingVertical: 8 }}>
                <Text variant="label" color="textMuted" style={{ fontSize: 11 }}>
                  {day}
                </Text>
              </View>
            ))}
          </View>

          <View className="flex-row flex-wrap">
            {Array.from({ length: startPadding }).map((_, i) => (
              <View key={`pad-${i}`} style={{ width: '14.28%', aspectRatio: 1, padding: 2 }} />
            ))}

            {calendarData.map((day) => {
              const hasMood = day.avgMood !== null;
              const isSelected = selectedDay === day.dateStr;

              return (
                <View key={day.dateStr} style={{ width: '14.28%', aspectRatio: 1, padding: 2 }}>
                  <Pressable
                    style={{
                      flex: 1,
                      backgroundColor: hasMood
                        ? getMoodColor(day.avgMood, isDark)
                        : isDark ? themeColors.surface : themeColors.surfaceElevated,
                      opacity: hasMood ? getMoodOpacity(day.avgMood, isDark) : 1,
                      borderRadius: borderRadius.sm,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: day.isToday || isSelected ? 2 : isDark ? 1 : 0,
                      borderColor: day.isToday
                        ? themeColors.primary
                        : isSelected
                          ? themeColors.primaryDark
                          : themeColors.border,
                    }}
                    onPress={() => setSelectedDay(day.dateStr === selectedDay ? null : day.dateStr)}
                  >
                    <Text
                      variant="caption"
                      style={{
                        color: hasMood ? themeColors.textPrimary : themeColors.textMuted,
                        fontWeight: day.isToday ? '700' : '400',
                        fontSize: 13,
                      }}
                    >
                      {day.dayOfMonth}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>

          {selectedDayData && selectedDayData.avgMood !== null && (
            <View
              className="mt-4 items-center"
              style={{
                backgroundColor: isDark ? themeColors.surface : themeColors.surfaceElevated,
                borderRadius: borderRadius.md,
                padding: 12,
                gap: 4,
              }}
            >
              <Text variant="captionMedium" color="textPrimary">
                {format(selectedDayData.date, 'EEEE, MMM d')}
              </Text>
              <Text variant="body" color="textPrimary">
                Avg: {selectedDayData.avgMood.toFixed(1)} ({moodLabels[Math.round(selectedDayData.avgMood)]?.label})
              </Text>
              <Text variant="caption" color="textMuted">
                {selectedDayData.entries.length} check-in{selectedDayData.entries.length !== 1 ? 's' : ''}
              </Text>
            </View>
          )}

          <View
            className="flex-row items-center justify-center mt-5 pt-4"
            style={{
              borderTopWidth: 1,
              borderTopColor: isDark ? themeColors.border : 'rgba(0,0,0,0.06)',
              gap: 6,
            }}
          >
            <Text variant="label" color="textMuted" style={{ marginRight: 4 }}>
              Low
            </Text>
            {[1, 2, 3, 4, 5].map((mood) => (
              <View
                key={mood}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  backgroundColor: isDark ? darkColors.mood[mood as 1|2|3|4|5] : colors.mood[mood as 1|2|3|4|5],
                }}
              />
            ))}
            <Text variant="label" color="textMuted" style={{ marginLeft: 4 }}>
              High
            </Text>
          </View>

          {monthStats && (
            <View className="flex-row mt-4" style={{ gap: 16 }}>
              <View
                className="flex-1 items-center py-3"
                style={{
                  backgroundColor: isDark ? themeColors.surface : themeColors.surfaceElevated,
                  borderRadius: borderRadius.md,
                }}
              >
                <Text variant="h3" color="textPrimary">
                  {monthStats.avg.toFixed(1)}
                </Text>
                <Text variant="label" color="textMuted" className="mt-1">
                  Average
                </Text>
              </View>
              <View
                className="flex-1 items-center py-3"
                style={{
                  backgroundColor: isDark ? themeColors.surface : themeColors.surfaceElevated,
                  borderRadius: borderRadius.md,
                }}
              >
                <Text variant="h3" color="textPrimary">
                  {monthStats.daysTracked}
                </Text>
                <Text variant="label" color="textMuted" className="mt-1">
                  Days Tracked
                </Text>
              </View>
            </View>
          )}
        </>
      )}
    </Card>
  );
}
