import { create } from 'zustand';
import type { MoodEntry, DailyMoodSummary } from '@/src/types/mood';
import type { ActivityTagId } from '@/src/constants/theme';
import {
  createMoodEntry,
  getAllMoodEntries,
  getMoodEntriesForDate,
  getMoodEntriesForLastDays,
  deleteMoodEntry,
  deleteAllMoodEntries,
} from '@/src/lib/database';

interface MoodState {
  // Data
  entries: MoodEntry[];
  todayEntries: MoodEntry[];
  isLoading: boolean;
  error: string | null;

  // Draft entry (for the track screen)
  draftMood: (1 | 2 | 3 | 4 | 5) | null;
  draftActivities: ActivityTagId[];
  draftNote: string;

  // Actions
  setDraftMood: (mood: 1 | 2 | 3 | 4 | 5) => void;
  toggleDraftActivity: (activity: ActivityTagId) => void;
  setDraftNote: (note: string) => void;
  clearDraft: () => void;

  // CRUD operations
  loadEntries: () => Promise<void>;
  loadTodayEntries: () => Promise<void>;
  saveMoodEntry: () => Promise<MoodEntry | null>;
  removeEntry: (id: string) => Promise<void>;

  // Helpers
  getEntriesForLastDays: (days: number) => Promise<MoodEntry[]>;
  getDailySummaries: (days: number) => Promise<DailyMoodSummary[]>;
  clearEntries: () => Promise<void>;
}

export const useMoodStore = create<MoodState>((set, get) => ({
  // Initial state
  entries: [],
  todayEntries: [],
  isLoading: false,
  error: null,
  draftMood: null,
  draftActivities: [],
  draftNote: '',

  // Draft actions
  setDraftMood: (mood) => set({ draftMood: mood }),

  toggleDraftActivity: (activity) => {
    const current = get().draftActivities;
    if (current.includes(activity)) {
      set({ draftActivities: current.filter((a) => a !== activity) });
    } else {
      set({ draftActivities: [...current, activity] });
    }
  },

  setDraftNote: (note) => set({ draftNote: note }),

  clearDraft: () => set({ draftMood: null, draftActivities: [], draftNote: '' }),

  // Load all entries
  loadEntries: async () => {
    set({ isLoading: true, error: null });
    try {
      const entries = await getAllMoodEntries();
      set({ entries, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load entries',
        isLoading: false,
      });
    }
  },

  // Load today's entries
  loadTodayEntries: async () => {
    try {
      const todayEntries = await getMoodEntriesForDate(new Date());
      set({ todayEntries });
    } catch (error) {
      console.error('Failed to load today entries:', error);
    }
  },

  // Save a new mood entry from draft
  saveMoodEntry: async () => {
    const { draftMood, draftActivities, draftNote } = get();

    if (!draftMood) {
      set({ error: 'Please select a mood' });
      return null;
    }

    set({ isLoading: true, error: null });
    try {
      const entry = await createMoodEntry({
        mood: draftMood,
        activities: draftActivities.length > 0 ? draftActivities : undefined,
        note: draftNote || undefined,
      });

      // Update state
      set((state) => ({
        entries: [entry, ...state.entries],
        todayEntries: [entry, ...state.todayEntries],
        isLoading: false,
        draftMood: null,
        draftActivities: [],
        draftNote: '',
      }));

      return entry;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to save entry',
        isLoading: false,
      });
      return null;
    }
  },

  // Remove an entry
  removeEntry: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteMoodEntry(id);
      set((state) => ({
        entries: state.entries.filter((e) => e.id !== id),
        todayEntries: state.todayEntries.filter((e) => e.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete entry',
        isLoading: false,
      });
    }
  },

  // Get entries for last N days
  getEntriesForLastDays: async (days) => {
    return getMoodEntriesForLastDays(days);
  },

  // Get daily summaries for charts
  getDailySummaries: async (days) => {
    const entries = await getMoodEntriesForLastDays(days);
    const summaryMap = new Map<string, MoodEntry[]>();

    // Group by date
    entries.forEach((entry) => {
      const dateKey = entry.timestamp.toISOString().split('T')[0];
      if (!summaryMap.has(dateKey)) {
        summaryMap.set(dateKey, []);
      }
      summaryMap.get(dateKey)!.push(entry);
    });

    // Convert to summaries
    const summaries: DailyMoodSummary[] = [];
    summaryMap.forEach((dayEntries, date) => {
      const avgMood =
        dayEntries.reduce((sum, e) => sum + e.mood, 0) / dayEntries.length;
      summaries.push({
        date,
        entries: dayEntries,
        averageMood: Math.round(avgMood * 10) / 10,
      });
    });

    // Sort by date descending
    return summaries.sort((a, b) => b.date.localeCompare(a.date));
  },

  // Clear all entries
  clearEntries: async () => {
    set({ isLoading: true, error: null });
    try {
      await deleteAllMoodEntries();
      set({ entries: [], todayEntries: [], isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to clear entries',
        isLoading: false,
      });
    }
  },
}));
