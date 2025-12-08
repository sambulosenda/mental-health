import type { MoodEntry, DailyMoodSummary } from '@/src/types/mood';
import type { Insight } from '@/src/components/insights/InsightCard';
import { activityTags } from '@/src/constants/theme';
import { format, getDay, parseISO } from 'date-fns';

interface PatternDetectionInput {
  entries: MoodEntry[];
  summaries: DailyMoodSummary[];
}

export function detectPatterns({ entries, summaries }: PatternDetectionInput): Insight[] {
  const insights: Insight[] = [];

  if (entries.length < 3) {
    return insights;
  }

  // Streak detection
  const streakInsight = detectStreak(summaries);
  if (streakInsight) insights.push(streakInsight);

  // Trend detection
  const trendInsight = detectTrend(summaries);
  if (trendInsight) insights.push(trendInsight);

  // Day of week patterns
  const dayPatterns = detectDayPatterns(entries);
  insights.push(...dayPatterns);

  // Activity correlations
  const activityInsights = detectActivityCorrelations(entries);
  insights.push(...activityInsights);

  // Time of day patterns
  const timeInsights = detectTimePatterns(entries);
  insights.push(...timeInsights);

  // Best/worst day
  const extremeInsights = detectExtremes(summaries);
  insights.push(...extremeInsights);

  return insights.slice(0, 6); // Limit to 6 insights
}

function detectStreak(summaries: DailyMoodSummary[]): Insight | null {
  if (summaries.length < 2) return null;

  // Sort by date ascending
  const sorted = [...summaries].sort((a, b) => a.date.localeCompare(b.date));

  let currentStreak = 0;
  let checkDate = new Date();
  checkDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < sorted.length; i++) {
    const expectedDate = format(checkDate, 'yyyy-MM-dd');
    if (sorted[sorted.length - 1 - i]?.date === expectedDate) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  if (currentStreak >= 3) {
    return {
      id: 'streak',
      type: 'streak',
      title: `${currentStreak} Day Streak!`,
      description: `You've tracked your mood ${currentStreak} days in a row. Keep it up!`,
      priority: currentStreak >= 7 ? 'high' : 'medium',
    };
  }

  return null;
}

function detectTrend(summaries: DailyMoodSummary[]): Insight | null {
  if (summaries.length < 5) return null;

  const sorted = [...summaries].sort((a, b) => a.date.localeCompare(b.date));
  const recent = sorted.slice(-7);

  if (recent.length < 3) return null;

  const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
  const secondHalf = recent.slice(Math.floor(recent.length / 2));

  const firstAvg = firstHalf.reduce((sum, s) => sum + s.averageMood, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, s) => sum + s.averageMood, 0) / secondHalf.length;

  const diff = secondAvg - firstAvg;

  if (diff > 0.5) {
    return {
      id: 'trend-up',
      type: 'pattern',
      title: 'Mood Improving',
      description: `Your mood has been trending upward. Great progress!`,
      icon: 'trending-up',
      priority: 'high',
    };
  } else if (diff < -0.5) {
    return {
      id: 'trend-down',
      type: 'suggestion',
      title: 'Mood Dip Detected',
      description: `Your mood has dipped recently. Consider what might be affecting you.`,
      icon: 'trending-down',
      priority: 'high',
    };
  }

  return null;
}

function detectDayPatterns(entries: MoodEntry[]): Insight[] {
  const dayMoods: Record<number, number[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };

  entries.forEach((entry) => {
    const day = getDay(entry.timestamp);
    dayMoods[day].push(entry.mood);
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayAverages = Object.entries(dayMoods)
    .filter(([_, moods]) => moods.length >= 2)
    .map(([day, moods]) => ({
      day: Number(day),
      avg: moods.reduce((a, b) => a + b, 0) / moods.length,
      count: moods.length,
    }));

  if (dayAverages.length < 3) return [];

  const overallAvg = dayAverages.reduce((sum, d) => sum + d.avg, 0) / dayAverages.length;
  const insights: Insight[] = [];

  // Find best day
  const bestDay = dayAverages.reduce((best, curr) => (curr.avg > best.avg ? curr : best));
  if (bestDay.avg - overallAvg > 0.3) {
    insights.push({
      id: 'best-day',
      type: 'pattern',
      title: `${dayNames[bestDay.day]}s Are Your Best`,
      description: `You tend to feel better on ${dayNames[bestDay.day]}s (avg: ${bestDay.avg.toFixed(1)}).`,
      icon: 'sunny',
    });
  }

  // Find challenging day
  const worstDay = dayAverages.reduce((worst, curr) => (curr.avg < worst.avg ? curr : worst));
  if (overallAvg - worstDay.avg > 0.3) {
    insights.push({
      id: 'worst-day',
      type: 'trigger',
      title: `${dayNames[worstDay.day]}s Can Be Tough`,
      description: `${dayNames[worstDay.day]}s tend to be more challenging for you.`,
      icon: 'cloudy',
    });
  }

  return insights;
}

function detectActivityCorrelations(entries: MoodEntry[]): Insight[] {
  const activityMoods: Record<string, number[]> = {};

  entries.forEach((entry) => {
    entry.activities.forEach((activity) => {
      if (!activityMoods[activity]) activityMoods[activity] = [];
      activityMoods[activity].push(entry.mood);
    });
  });

  const insights: Insight[] = [];
  const overallAvg = entries.reduce((sum, e) => sum + e.mood, 0) / entries.length;

  Object.entries(activityMoods).forEach(([activity, moods]) => {
    if (moods.length < 3) return;

    const avg = moods.reduce((a, b) => a + b, 0) / moods.length;
    const tag = activityTags.find((t) => t.id === activity);

    if (avg - overallAvg > 0.5) {
      insights.push({
        id: `activity-${activity}`,
        type: 'pattern',
        title: `${tag?.label ?? activity} Boosts Your Mood`,
        description: `When you do ${tag?.label.toLowerCase() ?? activity}, your mood averages ${avg.toFixed(1)}.`,
        icon: tag?.icon as any ?? 'checkmark',
      });
    }
  });

  return insights.slice(0, 2);
}

function detectTimePatterns(entries: MoodEntry[]): Insight[] {
  const timeOfDayMoods: { morning: number[]; afternoon: number[]; evening: number[] } = {
    morning: [],
    afternoon: [],
    evening: [],
  };

  entries.forEach((entry) => {
    const hour = entry.timestamp.getHours();
    if (hour < 12) {
      timeOfDayMoods.morning.push(entry.mood);
    } else if (hour < 17) {
      timeOfDayMoods.afternoon.push(entry.mood);
    } else {
      timeOfDayMoods.evening.push(entry.mood);
    }
  });

  const insights: Insight[] = [];
  const periods = Object.entries(timeOfDayMoods).filter(([_, moods]) => moods.length >= 3);

  if (periods.length < 2) return [];

  const periodAverages = periods.map(([period, moods]) => ({
    period,
    avg: moods.reduce((a, b) => a + b, 0) / moods.length,
    count: moods.length,
  }));

  const best = periodAverages.reduce((b, c) => (c.avg > b.avg ? c : b));
  const worst = periodAverages.reduce((b, c) => (c.avg < b.avg ? c : b));

  if (best.avg - worst.avg > 0.5) {
    insights.push({
      id: 'time-pattern',
      type: 'pattern',
      title: `Best in the ${best.period.charAt(0).toUpperCase() + best.period.slice(1)}`,
      description: `You tend to feel better in the ${best.period} (avg: ${best.avg.toFixed(1)}).`,
      icon: best.period === 'morning' ? 'sunny' : best.period === 'afternoon' ? 'partly-sunny' : 'moon',
    });
  }

  return insights;
}

function detectExtremes(summaries: DailyMoodSummary[]): Insight[] {
  if (summaries.length < 3) return [];

  const sorted = [...summaries].sort((a, b) => b.averageMood - a.averageMood);
  const best = sorted[0];
  // const worst = sorted[sorted.length - 1]; // Reserved for future "worst day" insight

  const insights: Insight[] = [];

  if (best.averageMood >= 4.5) {
    const date = parseISO(best.date);
    insights.push({
      id: 'best-day-ever',
      type: 'milestone',
      title: 'Peak Day',
      description: `${format(date, 'EEEE, MMM d')} was your best day recently (${best.averageMood.toFixed(1)})!`,
    });
  }

  return insights;
}
