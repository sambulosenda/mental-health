// Mock database queries before importing
jest.mock('../../lib/database/queries/mood', () => ({
  getMoodEntriesForDate: jest.fn(),
  getMoodEntriesForLastDays: jest.fn(),
}));

jest.mock('../../lib/database/queries/journal', () => ({
  getJournalEntriesForLastDays: jest.fn(),
}));

jest.mock('../../lib/database/queries/exercise', () => ({
  getRecentExerciseSessions: jest.fn(),
}));

import { normalizeToDay, calculateConsecutiveDays, STREAK_WINDOW_DAYS } from '../../lib/streaks';

describe('streaks', () => {
  describe('normalizeToDay', () => {
    it('should normalize time to start of day', () => {
      const date = new Date('2024-01-15T14:30:45.123Z');
      const normalized = normalizeToDay(date);

      expect(normalized.getHours()).toBe(0);
      expect(normalized.getMinutes()).toBe(0);
      expect(normalized.getSeconds()).toBe(0);
      expect(normalized.getMilliseconds()).toBe(0);
    });

    it('should preserve the date', () => {
      const date = new Date('2024-01-15T14:30:45.123Z');
      const normalized = normalizeToDay(date);

      expect(normalized.getFullYear()).toBe(date.getFullYear());
      expect(normalized.getMonth()).toBe(date.getMonth());
      expect(normalized.getDate()).toBe(date.getDate());
    });

    it('should not mutate original date', () => {
      const date = new Date('2024-01-15T14:30:45.123Z');
      const originalTime = date.getTime();
      normalizeToDay(date);

      expect(date.getTime()).toBe(originalTime);
    });
  });

  describe('calculateConsecutiveDays', () => {
    // Helper to create dates relative to today
    const daysAgo = (n: number): Date => {
      const date = new Date();
      date.setDate(date.getDate() - n);
      return date;
    };

    it('should return 0 for empty array', () => {
      expect(calculateConsecutiveDays([])).toBe(0);
    });

    it('should return 1 for entry today only', () => {
      const timestamps = [new Date()];
      expect(calculateConsecutiveDays(timestamps)).toBe(1);
    });

    it('should return 1 for entry yesterday only', () => {
      const timestamps = [daysAgo(1)];
      expect(calculateConsecutiveDays(timestamps)).toBe(1);
    });

    it('should return 0 for entries more than 1 day ago (streak broken)', () => {
      const timestamps = [daysAgo(2)];
      expect(calculateConsecutiveDays(timestamps)).toBe(0);
    });

    it('should count consecutive days correctly', () => {
      const timestamps = [
        daysAgo(0), // today
        daysAgo(1), // yesterday
        daysAgo(2), // 2 days ago
      ];
      expect(calculateConsecutiveDays(timestamps)).toBe(3);
    });

    it('should stop counting at gap in streak', () => {
      const timestamps = [
        daysAgo(0), // today
        daysAgo(1), // yesterday
        // gap at 2 days ago
        daysAgo(3), // 3 days ago
        daysAgo(4), // 4 days ago
      ];
      expect(calculateConsecutiveDays(timestamps)).toBe(2);
    });

    it('should handle multiple entries on same day', () => {
      const today = new Date();
      const timestamps = [
        new Date(today.setHours(9, 0, 0)),
        new Date(today.setHours(12, 0, 0)),
        new Date(today.setHours(18, 0, 0)),
      ];
      expect(calculateConsecutiveDays(timestamps)).toBe(1);
    });

    it('should start streak from today if today has entry', () => {
      const timestamps = [
        daysAgo(0), // today
        daysAgo(1), // yesterday
        daysAgo(2), // 2 days ago
      ];
      expect(calculateConsecutiveDays(timestamps)).toBe(3);
    });

    it('should start streak from yesterday if today has no entry', () => {
      const timestamps = [
        daysAgo(1), // yesterday
        daysAgo(2), // 2 days ago
        daysAgo(3), // 3 days ago
      ];
      expect(calculateConsecutiveDays(timestamps)).toBe(3);
    });

    it('should handle unordered timestamps', () => {
      const timestamps = [
        daysAgo(2),
        daysAgo(0),
        daysAgo(1),
      ];
      expect(calculateConsecutiveDays(timestamps)).toBe(3);
    });
  });

  describe('STREAK_WINDOW_DAYS', () => {
    it('should be 30 days', () => {
      expect(STREAK_WINDOW_DAYS).toBe(30);
    });
  });
});
