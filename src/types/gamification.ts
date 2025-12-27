export type StreakType = 'mood' | 'journal' | 'exercise' | 'overall';

export interface UserStreak {
  id: string;
  type: StreakType;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null; // YYYY-MM-DD
  streakStartDate: string | null;
  updatedAt: Date;
}

export type BadgeCategory =
  | 'milestone' // Entry counts: 1, 10, 50, 100, etc.
  | 'streak' // Streak achievements: 3, 7, 14, 30, etc.
  | 'explorer' // Trying all features, activities
  | 'consistency' // Weekly/monthly consistency
  | 'growth' // Mood improvement over time
  | 'special'; // Seasonal, first-of-kind achievements

export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type BadgeRequirement =
  | { type: 'entry_count'; entryType: 'mood' | 'journal' | 'exercise'; count: number }
  | { type: 'streak_days'; streakType: StreakType; days: number }
  | { type: 'total_days_tracked'; days: number }
  | { type: 'activities_used'; count: number }
  | { type: 'all_moods_logged' } // Log all 5 mood levels at least once
  | { type: 'mood_improvement'; percentage: number }
  | { type: 'first_of_kind'; action: string };

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string; // Ionicons name
  category: BadgeCategory;
  rarity: BadgeRarity;
  requirement: BadgeRequirement;
}

export interface EarnedBadge {
  id: string;
  badgeId: string;
  earnedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface GamificationStats {
  streaks: Record<StreakType, UserStreak>;
  earnedBadges: EarnedBadge[];
  totalDaysTracked: number;
  streakProtectionsRemaining: number;
}
