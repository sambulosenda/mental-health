import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  detectProactiveTriggers,
  createExerciseFollowUpTrigger,
  type ProactiveTrigger,
} from '@/src/lib/insights';
import { useMoodStore } from './useMoodStore';

interface ProactiveTriggerState {
  /** Currently active triggers (not dismissed) */
  activeTriggers: ProactiveTrigger[];

  /** IDs of triggers that have been dismissed (to avoid reshowing) */
  dismissedTriggerIds: string[];

  /** Last time triggers were checked */
  lastCheckedAt: Date | null;

  /** Loading state */
  isLoading: boolean;

  /** Actions */
  checkForTriggers: () => Promise<void>;
  dismissTrigger: (triggerId: string) => void;
  addExerciseFollowUp: (exerciseName: string) => void;
  clearExpiredTriggers: () => void;
  getTopTrigger: () => ProactiveTrigger | null;
}

export const useProactiveTriggerStore = create<ProactiveTriggerState>()(
  persist(
    (set, get) => ({
      activeTriggers: [],
      dismissedTriggerIds: [],
      lastCheckedAt: null,
      isLoading: false,

      checkForTriggers: async () => {
        set({ isLoading: true });

        try {
          const moodStore = useMoodStore.getState();

          // Load mood data if not already loaded
          if (moodStore.entries.length === 0) {
            await moodStore.loadEntries();
          }

          const entries = moodStore.entries;
          const summaries = await moodStore.getDailySummaries(30);

          // Get last check-in date
          const lastCheckInAt = entries.length > 0 ? entries[0].timestamp : undefined;

          // Detect triggers
          const allTriggers = detectProactiveTriggers({
            entries,
            summaries,
            lastCheckInAt,
          });

          // Filter out dismissed triggers and expired triggers
          const now = new Date();
          const { dismissedTriggerIds } = get();

          const activeTriggers = allTriggers.filter((trigger) => {
            // Skip if dismissed
            if (dismissedTriggerIds.includes(trigger.id)) return false;

            // Skip if expired
            if (trigger.expiresAt && trigger.expiresAt < now) return false;

            return true;
          });

          set({
            activeTriggers,
            lastCheckedAt: now,
            isLoading: false,
          });
        } catch (error) {
          console.error('Failed to check for proactive triggers:', error);
          set({ isLoading: false });
        }
      },

      dismissTrigger: (triggerId) => {
        set((state) => ({
          activeTriggers: state.activeTriggers.filter((t) => t.id !== triggerId),
          dismissedTriggerIds: [...state.dismissedTriggerIds, triggerId],
        }));
      },

      addExerciseFollowUp: (exerciseName) => {
        const trigger = createExerciseFollowUpTrigger(exerciseName, new Date());
        const { dismissedTriggerIds } = get();

        // Don't add if already dismissed
        if (dismissedTriggerIds.includes(trigger.id)) return;

        set((state) => ({
          activeTriggers: [...state.activeTriggers, trigger],
        }));
      },

      clearExpiredTriggers: () => {
        const now = new Date();
        set((state) => ({
          activeTriggers: state.activeTriggers.filter(
            (t) => !t.expiresAt || t.expiresAt >= now
          ),
          // Also clean up old dismissed IDs (older than 7 days in the ID)
          dismissedTriggerIds: state.dismissedTriggerIds.slice(-50), // Keep last 50
        }));
      },

      getTopTrigger: () => {
        const { activeTriggers } = get();
        return activeTriggers.length > 0 ? activeTriggers[0] : null;
      },
    }),
    {
      name: 'proactive-triggers',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        dismissedTriggerIds: state.dismissedTriggerIds,
        lastCheckedAt: state.lastCheckedAt,
      }),
    }
  )
);
