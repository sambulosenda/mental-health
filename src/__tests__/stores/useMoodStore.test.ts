// Mock all external dependencies
jest.mock('@/src/lib/database', () => ({
  createMoodEntry: jest.fn(),
  getAllMoodEntries: jest.fn(),
  getMoodEntriesForDate: jest.fn(),
  getMoodEntriesForLastDays: jest.fn(),
  deleteMoodEntry: jest.fn(),
  deleteAllMoodEntries: jest.fn(),
}));

jest.mock('@/src/lib/utils', () => ({
  toDateKey: (date: Date) => date.toISOString().split('T')[0],
  formatErrorMessage: (error: unknown, fallback: string) => fallback,
}));

// Mock __DEV__ global
(global as any).__DEV__ = true;

import { useMoodStore } from '../../stores/useMoodStore';
import * as database from '@/src/lib/database';

describe('useMoodStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useMoodStore.setState({
      entries: [],
      todayEntries: [],
      isLoading: false,
      error: null,
      draftMood: null,
      draftActivities: [],
      draftNote: '',
    });

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('draft actions', () => {
    it('should set draft mood', () => {
      const { setDraftMood } = useMoodStore.getState();

      setDraftMood(4);

      expect(useMoodStore.getState().draftMood).toBe(4);
    });

    it('should toggle draft activity - add', () => {
      const { toggleDraftActivity } = useMoodStore.getState();

      toggleDraftActivity('exercise');

      expect(useMoodStore.getState().draftActivities).toContain('exercise');
    });

    it('should toggle draft activity - remove', () => {
      useMoodStore.setState({ draftActivities: ['exercise', 'work'] });
      const { toggleDraftActivity } = useMoodStore.getState();

      toggleDraftActivity('exercise');

      expect(useMoodStore.getState().draftActivities).not.toContain('exercise');
      expect(useMoodStore.getState().draftActivities).toContain('work');
    });

    it('should set draft note', () => {
      const { setDraftNote } = useMoodStore.getState();

      setDraftNote('Feeling good today');

      expect(useMoodStore.getState().draftNote).toBe('Feeling good today');
    });

    it('should clear draft', () => {
      useMoodStore.setState({
        draftMood: 4,
        draftActivities: ['exercise'],
        draftNote: 'Test note',
      });

      const { clearDraft } = useMoodStore.getState();
      clearDraft();

      const state = useMoodStore.getState();
      expect(state.draftMood).toBeNull();
      expect(state.draftActivities).toEqual([]);
      expect(state.draftNote).toBe('');
    });
  });

  describe('saveMoodEntry', () => {
    it('should return null and set error if no draft mood', async () => {
      const { saveMoodEntry } = useMoodStore.getState();

      const result = await saveMoodEntry();

      expect(result).toBeNull();
      expect(useMoodStore.getState().error).toBe('Please select a mood');
    });

    it('should save entry successfully', async () => {
      const mockEntry = {
        id: '123',
        mood: 4,
        timestamp: new Date(),
        activities: ['exercise'],
        note: 'Test note',
        createdAt: new Date(),
      };

      (database.createMoodEntry as jest.Mock).mockResolvedValue(mockEntry);

      useMoodStore.setState({
        draftMood: 4,
        draftActivities: ['exercise'],
        draftNote: 'Test note',
      });

      const { saveMoodEntry } = useMoodStore.getState();
      const result = await saveMoodEntry();

      expect(result).toEqual(mockEntry);
      expect(database.createMoodEntry).toHaveBeenCalledWith({
        mood: 4,
        activities: ['exercise'],
        note: 'Test note',
      });

      // Check that draft is cleared
      const state = useMoodStore.getState();
      expect(state.draftMood).toBeNull();
      expect(state.draftActivities).toEqual([]);
      expect(state.draftNote).toBe('');
    });

    it('should add new entry to entries list', async () => {
      const existingEntry = {
        id: 'existing',
        mood: 3 as const,
        timestamp: new Date(),
        activities: [] as any[],
        createdAt: new Date(),
      };

      const mockEntry = {
        id: '123',
        mood: 4,
        timestamp: new Date(),
        activities: [],
        createdAt: new Date(),
      };

      (database.createMoodEntry as jest.Mock).mockResolvedValue(mockEntry);

      useMoodStore.setState({
        entries: [existingEntry],
        draftMood: 4,
      });

      const { saveMoodEntry } = useMoodStore.getState();
      await saveMoodEntry();

      const state = useMoodStore.getState();
      expect(state.entries).toHaveLength(2);
      expect(state.entries[0]).toEqual(mockEntry); // New entry at front
    });
  });

  describe('loadEntries', () => {
    it('should load entries from database', async () => {
      const mockEntries = [
        { id: '1', mood: 4, timestamp: new Date(), activities: [], createdAt: new Date() },
        { id: '2', mood: 3, timestamp: new Date(), activities: [], createdAt: new Date() },
      ];

      (database.getAllMoodEntries as jest.Mock).mockResolvedValue(mockEntries);

      const { loadEntries } = useMoodStore.getState();
      await loadEntries();

      expect(useMoodStore.getState().entries).toEqual(mockEntries);
      expect(useMoodStore.getState().isLoading).toBe(false);
    });

    it('should handle error when loading entries', async () => {
      (database.getAllMoodEntries as jest.Mock).mockRejectedValue(new Error('DB error'));

      const { loadEntries } = useMoodStore.getState();
      await loadEntries();

      expect(useMoodStore.getState().error).toBe('Failed to load entries');
      expect(useMoodStore.getState().isLoading).toBe(false);
    });
  });

  describe('removeEntry', () => {
    it('should remove entry from state', async () => {
      const entries = [
        { id: '1', mood: 4 as const, timestamp: new Date(), activities: [] as any[], createdAt: new Date() },
        { id: '2', mood: 3 as const, timestamp: new Date(), activities: [] as any[], createdAt: new Date() },
      ];

      useMoodStore.setState({ entries, todayEntries: entries });
      (database.deleteMoodEntry as jest.Mock).mockResolvedValue(undefined);

      const { removeEntry } = useMoodStore.getState();
      await removeEntry('1');

      expect(useMoodStore.getState().entries).toHaveLength(1);
      expect(useMoodStore.getState().entries[0].id).toBe('2');
    });
  });

  describe('getDailySummaries', () => {
    it('should group entries by date and calculate averages', async () => {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const mockEntries = [
        { id: '1', mood: 4, timestamp: today, activities: [], createdAt: today },
        { id: '2', mood: 2, timestamp: today, activities: [], createdAt: today },
        { id: '3', mood: 5, timestamp: yesterday, activities: [], createdAt: yesterday },
      ];

      (database.getMoodEntriesForLastDays as jest.Mock).mockResolvedValue(mockEntries);

      const { getDailySummaries } = useMoodStore.getState();
      const summaries = await getDailySummaries(7);

      expect(summaries).toHaveLength(2);

      // Find today's summary
      const todaySummary = summaries.find((s) => s.date === today.toISOString().split('T')[0]);
      expect(todaySummary).toBeDefined();
      expect(todaySummary?.averageMood).toBe(3); // (4+2)/2 = 3
      expect(todaySummary?.entries).toHaveLength(2);

      // Find yesterday's summary
      const yesterdaySummary = summaries.find((s) => s.date === yesterday.toISOString().split('T')[0]);
      expect(yesterdaySummary).toBeDefined();
      expect(yesterdaySummary?.averageMood).toBe(5);
    });
  });

  describe('clearEntries', () => {
    it('should clear all entries', async () => {
      useMoodStore.setState({
        entries: [{ id: '1', mood: 4 as const, timestamp: new Date(), activities: [] as any[], createdAt: new Date() }],
        todayEntries: [{ id: '1', mood: 4 as const, timestamp: new Date(), activities: [] as any[], createdAt: new Date() }],
      });

      (database.deleteAllMoodEntries as jest.Mock).mockResolvedValue(undefined);

      const { clearEntries } = useMoodStore.getState();
      await clearEntries();

      expect(useMoodStore.getState().entries).toEqual([]);
      expect(useMoodStore.getState().todayEntries).toEqual([]);
    });
  });
});
