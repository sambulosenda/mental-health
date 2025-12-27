import { create } from 'zustand';
import type { StreakType, UserStreak, EarnedBadge } from '@/src/types/gamification';
import { BADGE_DEFINITIONS, getBadgeById } from '@/src/constants/badges';
import {
  getStreaks,
  updateStreak,
  getEarnedBadges,
  hasBadge,
  awardBadge,
  getStreakProtectionsRemaining,
  useStreakProtection as dbUseStreakProtection,
  getMoodEntryCount,
  getJournalEntryCount,
  getExerciseSessionCount,
  getUniqueMoodsLogged,
  getUniqueActivitiesUsed,
  getUniqueDaysTracked,
} from '@/src/lib/database';

const defaultStreak = (type: StreakType): UserStreak => ({
  id: type,
  type,
  currentStreak: 0,
  longestStreak: 0,
  lastActivityDate: null,
  streakStartDate: null,
  updatedAt: new Date(),
});

interface GamificationState {
  // Data
  streaks: Record<StreakType, UserStreak>;
  earnedBadges: EarnedBadge[];
  streakProtectionsRemaining: number;
  isLoading: boolean;

  // Newly earned badges (for celebration modal)
  pendingCelebrations: EarnedBadge[];

  // Actions
  loadGamificationData: () => Promise<void>;
  recordActivity: (type: 'mood' | 'journal' | 'exercise') => Promise<EarnedBadge[]>;
  checkAndAwardBadges: () => Promise<EarnedBadge[]>;
  useProtection: (reason?: string) => Promise<boolean>;
  dismissCelebration: (badgeId: string) => void;
  clearPendingCelebrations: () => void;

  // Helpers
  hasBadge: (badgeId: string) => boolean;
  getBadgeProgress: (badgeId: string) => Promise<number>;
}

export const useGamificationStore = create<GamificationState>((set, get) => ({
  // Initial state
  streaks: {
    mood: defaultStreak('mood'),
    journal: defaultStreak('journal'),
    exercise: defaultStreak('exercise'),
    overall: defaultStreak('overall'),
  },
  earnedBadges: [],
  streakProtectionsRemaining: 3,
  isLoading: false,
  pendingCelebrations: [],

  loadGamificationData: async () => {
    set({ isLoading: true });
    try {
      const [streaks, earnedBadges, protections] = await Promise.all([
        getStreaks(),
        getEarnedBadges(),
        getStreakProtectionsRemaining(),
      ]);
      set({
        streaks,
        earnedBadges,
        streakProtectionsRemaining: protections,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load gamification data:', error);
      set({ isLoading: false });
    }
  },

  recordActivity: async (type) => {
    const today = new Date().toISOString().split('T')[0];

    // Update specific streak
    const specificStreak = await updateStreak(type, today);

    // Update overall streak if not already done today
    const { streaks } = get();
    let overallStreak = streaks.overall;
    if (overallStreak.lastActivityDate !== today) {
      overallStreak = await updateStreak('overall', today);
    }

    // Update state with new streaks
    set((state) => ({
      streaks: {
        ...state.streaks,
        [type]: specificStreak,
        overall: overallStreak,
      },
    }));

    // Check for new badges
    const newBadges = await get().checkAndAwardBadges();

    if (newBadges.length > 0) {
      set((state) => ({
        pendingCelebrations: [...state.pendingCelebrations, ...newBadges],
      }));
    }

    return newBadges;
  },

  checkAndAwardBadges: async () => {
    const newBadges: EarnedBadge[] = [];
    const { streaks } = get();

    // Get current stats
    const [moodCount, journalCount, exerciseCount, uniqueMoods, uniqueActivities, daysTracked] =
      await Promise.all([
        getMoodEntryCount(),
        getJournalEntryCount(),
        getExerciseSessionCount(),
        getUniqueMoodsLogged(),
        getUniqueActivitiesUsed(),
        getUniqueDaysTracked(),
      ]);

    for (const badge of BADGE_DEFINITIONS) {
      // Skip if already earned
      const alreadyEarned = await hasBadge(badge.id);
      if (alreadyEarned) continue;

      let earned = false;
      const req = badge.requirement;

      switch (req.type) {
        case 'entry_count':
          if (req.entryType === 'mood' && moodCount >= req.count) earned = true;
          if (req.entryType === 'journal' && journalCount >= req.count) earned = true;
          if (req.entryType === 'exercise' && exerciseCount >= req.count) earned = true;
          break;

        case 'streak_days':
          const streak = streaks[req.streakType];
          if (streak.currentStreak >= req.days || streak.longestStreak >= req.days) {
            earned = true;
          }
          break;

        case 'total_days_tracked':
          if (daysTracked >= req.days) earned = true;
          break;

        case 'activities_used':
          if (uniqueActivities.length >= req.count) earned = true;
          break;

        case 'all_moods_logged':
          if (uniqueMoods.length >= 5) earned = true;
          break;

        case 'mood_improvement':
          // Skip for now - requires more complex calculation
          break;

        case 'first_of_kind':
          // Handle special badges
          if (req.action === 'comeback_streak') {
            // Award if user had a streak, lost it, and now has 3+ days again
            const overall = streaks.overall;
            if (overall.longestStreak >= 7 && overall.currentStreak >= 3 && overall.currentStreak < overall.longestStreak) {
              earned = true;
            }
          }
          break;
      }

      if (earned) {
        const earnedBadge = await awardBadge(badge.id);
        newBadges.push(earnedBadge);
      }
    }

    // Update earned badges in state
    if (newBadges.length > 0) {
      set((state) => ({
        earnedBadges: [...newBadges, ...state.earnedBadges],
      }));
    }

    return newBadges;
  },

  useProtection: async (reason) => {
    const { streakProtectionsRemaining } = get();
    if (streakProtectionsRemaining <= 0) return false;

    const success = await dbUseStreakProtection(reason);
    if (success) {
      set((state) => ({
        streakProtectionsRemaining: state.streakProtectionsRemaining - 1,
      }));
    }
    return success;
  },

  dismissCelebration: (badgeId) => {
    set((state) => ({
      pendingCelebrations: state.pendingCelebrations.filter((b) => b.badgeId !== badgeId),
    }));
  },

  clearPendingCelebrations: () => {
    set({ pendingCelebrations: [] });
  },

  hasBadge: (badgeId) => {
    const { earnedBadges } = get();
    return earnedBadges.some((b) => b.badgeId === badgeId);
  },

  getBadgeProgress: async (badgeId) => {
    const badge = getBadgeById(badgeId);
    if (!badge) return 0;

    const { streaks } = get();
    const req = badge.requirement;

    switch (req.type) {
      case 'entry_count': {
        let current = 0;
        if (req.entryType === 'mood') current = await getMoodEntryCount();
        if (req.entryType === 'journal') current = await getJournalEntryCount();
        if (req.entryType === 'exercise') current = await getExerciseSessionCount();
        return Math.min(100, Math.round((current / req.count) * 100));
      }

      case 'streak_days': {
        const streak = streaks[req.streakType];
        const best = Math.max(streak.currentStreak, streak.longestStreak);
        return Math.min(100, Math.round((best / req.days) * 100));
      }

      case 'total_days_tracked': {
        const days = await getUniqueDaysTracked();
        return Math.min(100, Math.round((days / req.days) * 100));
      }

      case 'activities_used': {
        const activities = await getUniqueActivitiesUsed();
        return Math.min(100, Math.round((activities.length / req.count) * 100));
      }

      case 'all_moods_logged': {
        const moods = await getUniqueMoodsLogged();
        return Math.min(100, Math.round((moods.length / 5) * 100));
      }

      default:
        return 0;
    }
  },
}));
