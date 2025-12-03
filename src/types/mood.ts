import type { ActivityTagId } from '@/src/constants/theme';

export interface MoodEntry {
  id: string;
  mood: 1 | 2 | 3 | 4 | 5;
  timestamp: Date;
  activities: ActivityTagId[];
  note?: string;
  createdAt: Date;
}

export interface MoodSummary {
  averageMood: number;
  totalEntries: number;
  moodDistribution: Record<number, number>;
  topActivities: { id: ActivityTagId; count: number }[];
  trend: 'improving' | 'declining' | 'stable';
}

export interface DailyMoodSummary {
  date: string; // YYYY-MM-DD
  entries: MoodEntry[];
  averageMood: number;
}
