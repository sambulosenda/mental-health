import type { BadgeDefinition, BadgeRarity } from '@/src/types/gamification';

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // --- MILESTONE BADGES: Mood ---
  {
    id: 'first_mood',
    name: 'First Step',
    description: 'Logged your first mood',
    icon: 'footsteps',
    category: 'milestone',
    rarity: 'common',
    requirement: { type: 'entry_count', entryType: 'mood', count: 1 },
  },
  {
    id: 'mood_10',
    name: 'Getting Started',
    description: 'Logged 10 moods',
    icon: 'happy-outline',
    category: 'milestone',
    rarity: 'common',
    requirement: { type: 'entry_count', entryType: 'mood', count: 10 },
  },
  {
    id: 'mood_50',
    name: 'Mood Tracker',
    description: 'Logged 50 moods',
    icon: 'happy',
    category: 'milestone',
    rarity: 'uncommon',
    requirement: { type: 'entry_count', entryType: 'mood', count: 50 },
  },
  {
    id: 'mood_100',
    name: 'Self-Awareness Champion',
    description: 'Logged 100 moods',
    icon: 'ribbon',
    category: 'milestone',
    rarity: 'rare',
    requirement: { type: 'entry_count', entryType: 'mood', count: 100 },
  },
  {
    id: 'mood_365',
    name: 'Year of Reflection',
    description: 'Logged 365 moods',
    icon: 'trophy',
    category: 'milestone',
    rarity: 'epic',
    requirement: { type: 'entry_count', entryType: 'mood', count: 365 },
  },

  // --- MILESTONE BADGES: Journal ---
  {
    id: 'first_journal',
    name: 'Dear Diary',
    description: 'Wrote your first journal entry',
    icon: 'book-outline',
    category: 'milestone',
    rarity: 'common',
    requirement: { type: 'entry_count', entryType: 'journal', count: 1 },
  },
  {
    id: 'journal_10',
    name: 'Storyteller',
    description: 'Wrote 10 journal entries',
    icon: 'book',
    category: 'milestone',
    rarity: 'uncommon',
    requirement: { type: 'entry_count', entryType: 'journal', count: 10 },
  },
  {
    id: 'journal_50',
    name: 'Reflective Writer',
    description: 'Wrote 50 journal entries',
    icon: 'library',
    category: 'milestone',
    rarity: 'rare',
    requirement: { type: 'entry_count', entryType: 'journal', count: 50 },
  },

  // --- MILESTONE BADGES: Exercise ---
  {
    id: 'first_exercise',
    name: 'Mind Explorer',
    description: 'Completed your first exercise',
    icon: 'fitness-outline',
    category: 'milestone',
    rarity: 'common',
    requirement: { type: 'entry_count', entryType: 'exercise', count: 1 },
  },
  {
    id: 'exercise_10',
    name: 'Wellness Seeker',
    description: 'Completed 10 exercises',
    icon: 'fitness',
    category: 'milestone',
    rarity: 'uncommon',
    requirement: { type: 'entry_count', entryType: 'exercise', count: 10 },
  },
  {
    id: 'exercise_50',
    name: 'Mindfulness Master',
    description: 'Completed 50 exercises',
    icon: 'medal',
    category: 'milestone',
    rarity: 'rare',
    requirement: { type: 'entry_count', entryType: 'exercise', count: 50 },
  },

  // --- STREAK BADGES ---
  {
    id: 'streak_3',
    name: 'Building Momentum',
    description: '3-day streak',
    icon: 'flame-outline',
    category: 'streak',
    rarity: 'common',
    requirement: { type: 'streak_days', streakType: 'overall', days: 3 },
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: '7-day streak',
    icon: 'flame',
    category: 'streak',
    rarity: 'uncommon',
    requirement: { type: 'streak_days', streakType: 'overall', days: 7 },
  },
  {
    id: 'streak_14',
    name: 'Habit Former',
    description: '14-day streak',
    icon: 'bonfire-outline',
    category: 'streak',
    rarity: 'rare',
    requirement: { type: 'streak_days', streakType: 'overall', days: 14 },
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: '30-day streak',
    icon: 'bonfire',
    category: 'streak',
    rarity: 'epic',
    requirement: { type: 'streak_days', streakType: 'overall', days: 30 },
  },
  {
    id: 'streak_100',
    name: 'Centurion',
    description: '100-day streak',
    icon: 'star',
    category: 'streak',
    rarity: 'legendary',
    requirement: { type: 'streak_days', streakType: 'overall', days: 100 },
  },

  // --- EXPLORER BADGES ---
  {
    id: 'mood_spectrum',
    name: 'Full Spectrum',
    description: 'Logged all 5 mood levels',
    icon: 'color-palette',
    category: 'explorer',
    rarity: 'uncommon',
    requirement: { type: 'all_moods_logged' },
  },
  {
    id: 'activity_explorer',
    name: 'Activity Explorer',
    description: 'Used 5 different activity tags',
    icon: 'compass',
    category: 'explorer',
    rarity: 'uncommon',
    requirement: { type: 'activities_used', count: 5 },
  },
  {
    id: 'activity_master',
    name: 'Activity Master',
    description: 'Used all 10 activity tags',
    icon: 'globe',
    category: 'explorer',
    rarity: 'rare',
    requirement: { type: 'activities_used', count: 10 },
  },

  // --- CONSISTENCY BADGES ---
  {
    id: 'week_complete',
    name: 'Complete Week',
    description: 'Tracked every day for a week',
    icon: 'calendar-outline',
    category: 'consistency',
    rarity: 'uncommon',
    requirement: { type: 'total_days_tracked', days: 7 },
  },
  {
    id: 'month_complete',
    name: 'Complete Month',
    description: 'Tracked 30 days total',
    icon: 'calendar',
    category: 'consistency',
    rarity: 'rare',
    requirement: { type: 'total_days_tracked', days: 30 },
  },
  {
    id: 'quarter_complete',
    name: 'Quarterly Champion',
    description: 'Tracked 90 days total',
    icon: 'calendar-number',
    category: 'consistency',
    rarity: 'epic',
    requirement: { type: 'total_days_tracked', days: 90 },
  },

  // --- GROWTH BADGES ---
  {
    id: 'mood_up_10',
    name: 'Rising Tide',
    description: '10% mood improvement over 2 weeks',
    icon: 'trending-up',
    category: 'growth',
    rarity: 'rare',
    requirement: { type: 'mood_improvement', percentage: 10 },
  },
  {
    id: 'mood_up_25',
    name: 'Transformation',
    description: '25% mood improvement over a month',
    icon: 'arrow-up-circle',
    category: 'growth',
    rarity: 'epic',
    requirement: { type: 'mood_improvement', percentage: 25 },
  },
  {
    id: 'comeback_kid',
    name: 'Comeback Kid',
    description: 'Returned after a break and built a new streak',
    icon: 'refresh',
    category: 'growth',
    rarity: 'rare',
    requirement: { type: 'first_of_kind', action: 'comeback_streak' },
  },
];

export const BADGE_RARITY_COLORS: Record<BadgeRarity, string> = {
  common: '#8E8E93',
  uncommon: '#5B8A72', // Primary green
  rare: '#5856D6', // Purple
  epic: '#FF9500', // Orange
  legendary: '#FFD700', // Gold
};

export const BADGE_CATEGORIES = [
  { id: 'milestone', label: 'Milestones', icon: 'flag' },
  { id: 'streak', label: 'Streaks', icon: 'flame' },
  { id: 'explorer', label: 'Explorer', icon: 'compass' },
  { id: 'consistency', label: 'Consistency', icon: 'calendar' },
  { id: 'growth', label: 'Growth', icon: 'trending-up' },
] as const;

export function getBadgeById(id: string): BadgeDefinition | undefined {
  return BADGE_DEFINITIONS.find((b) => b.id === id);
}

export function getBadgesByCategory(category: string): BadgeDefinition[] {
  return BADGE_DEFINITIONS.filter((b) => b.category === category);
}
