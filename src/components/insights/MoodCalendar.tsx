import { useMemo, useState } from 'react';
import { View, Pressable } from 'react-native';
import { Text, Card } from '@/src/components/ui';
import { colors, darkColors, spacing, moodLabels } from '@/src/constants/theme';
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

function getMoodColor(avgMood: number | null): string {
  if (avgMood === null) return 'transparent';
  const rounded = Math.round(avgMood);
  return colors.mood[rounded] ?? 'transparent';
}

function getMoodOpacity(avgMood: number | null): number {
  if (avgMood === null) return 0.3;
  return 0.5 + (avgMood / 5) * 0.5;
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
    <Card className="p-4">
      <View className="flex-row justify-between items-center mb-4">
        <Pressable
          onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1"
        >
          <Ionicons name="chevron-back" size={24} color={themeColors.textSecondary} />
        </Pressable>
        <Text variant="h3" color="textPrimary">
          {format(currentMonth, 'MMMM yyyy')}
        </Text>
        <Pressable
          onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1"
          disabled={isSameMonth(currentMonth, new Date())}
        >
          <Ionicons
            name="chevron-forward"
            size={24}
            color={isSameMonth(currentMonth, new Date()) ? themeColors.border : themeColors.textSecondary}
          />
        </Pressable>
      </View>

      {isLoading ? (
        <View className="h-[280px] justify-center items-center">
          <Text variant="body" color="textMuted">Loading...</Text>
        </View>
      ) : (
        <>
          <View className="flex-row mb-1">
            {WEEKDAYS.map((day, i) => (
              <View key={i} className="flex-1 items-center py-1">
                <Text variant="label" color="textMuted">
                  {day}
                </Text>
              </View>
            ))}
          </View>

          <View className="flex-row flex-wrap">
            {Array.from({ length: startPadding }).map((_, i) => (
              <View key={`pad-${i}`} style={{ width: '14.28%', aspectRatio: 1 }} />
            ))}

            {calendarData.map((day) => (
              <Pressable
                key={day.dateStr}
                style={{
                  width: '14.28%',
                  aspectRatio: 1,
                  backgroundColor: day.avgMood !== null ? getMoodColor(day.avgMood) : themeColors.surfaceElevated,
                  opacity: getMoodOpacity(day.avgMood),
                  borderRadius: 8,
                  marginBottom: 2,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: day.isToday || selectedDay === day.dateStr ? 2 : 0,
                  borderColor: day.isToday ? themeColors.primary : themeColors.primaryDark,
                }}
                onPress={() => setSelectedDay(day.dateStr === selectedDay ? null : day.dateStr)}
              >
                <Text
                  variant="caption"
                  color={day.avgMood !== null ? 'textPrimary' : 'textMuted'}
                  style={day.isToday ? { fontWeight: '700' } : undefined}
                >
                  {day.dayOfMonth}
                </Text>
              </Pressable>
            ))}
          </View>

          {selectedDayData && selectedDayData.avgMood !== null && (
            <View
              className="mt-4 p-2 rounded-lg items-center gap-1"
              style={{ backgroundColor: themeColors.surfaceElevated }}
            >
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

          <View
            className="flex-row items-center justify-center gap-1 mt-4 pt-4 border-t"
            style={{ borderTopColor: themeColors.border }}
          >
            <Text variant="label" color="textMuted" className="mx-1">
              Less
            </Text>
            {[1, 2, 3, 4, 5].map((mood) => (
              <View
                key={mood}
                className="w-4 h-4 rounded"
                style={{ backgroundColor: colors.mood[mood] }}
              />
            ))}
            <Text variant="label" color="textMuted" className="mx-1">
              Better
            </Text>
          </View>

          {monthStats && (
            <View className="flex-row justify-around mt-4">
              <View className="items-center">
                <Text variant="bodyMedium" color="primary">
                  {monthStats.avg.toFixed(1)}
                </Text>
                <Text variant="label" color="textMuted">
                  Avg
                </Text>
              </View>
              <View className="items-center">
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
