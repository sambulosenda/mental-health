import type { ReminderType } from '@/src/types/settings';

// RevenueCat
export const ENTITLEMENT_ID = 'premium';

// Reminder types
export const VALID_REMINDER_TYPES: readonly ReminderType[] = [
  'mood',
  'exercise',
  'journal',
] as const;

export function isValidReminderType(value: unknown): value is ReminderType {
  return (
    typeof value === 'string' &&
    VALID_REMINDER_TYPES.includes(value as ReminderType)
  );
}

// Routes
export const ROUTES = {
  TABS: '/(tabs)',
  TRACK: '/(tabs)/track',
  JOURNAL: '/(tabs)/journal',
  INSIGHTS: '/(tabs)/insights',
  PROFILE: '/(tabs)/profile',
  CHAT: '/chat',
  CHAT_CHECKIN: '/chat?type=checkin',
  EXERCISE_SESSION: '/(modals)/exercise-session',
  WEEKLY_SUMMARY: '/(modals)/weekly-summary',
  PAYWALL: '/paywall',
  ONBOARDING: '/onboarding',
  CRISIS: '/crisis',
  ACHIEVEMENTS: '/(modals)/achievements',
} as const;

// App info
export const APP_NAME = 'Softmind';
export const APP_VERSION = '1.0.0';
