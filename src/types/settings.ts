// Smart Reminders
export type ReminderType = 'mood' | 'exercise' | 'journal';

// User Profile (collected during onboarding)
export type UserGoal =
  | 'reduce_stress'
  | 'track_mood'
  | 'build_habits'
  | 'self_reflection'
  | 'manage_anxiety'
  | 'improve_sleep';

export interface UserProfile {
  name: string;
  goals: UserGoal[];
}

export interface ReminderConfig {
  enabled: boolean;
  time: string; // HH:mm format
  followUpEnabled: boolean;
  followUpTime: string; // HH:mm format
}

export interface SmartRemindersSettings {
  mood: ReminderConfig;
  exercise: ReminderConfig;
  journal: ReminderConfig;
  streakNotificationsEnabled: boolean;
}

export interface AppSettings {
  // Smart Reminders (replaces old reminderEnabled/reminderTime)
  smartReminders: SmartRemindersSettings;

  // Privacy
  passcodeEnabled: boolean;
  biometricEnabled: boolean;

  // Appearance
  theme: 'light' | 'dark' | 'system';

  // Onboarding
  hasCompletedOnboarding: boolean;
  userProfile: UserProfile | null;

  // Legal
  hasAcceptedDisclaimer: boolean;

  // Insights
  insightDepth: 'brief' | 'detailed';
  insightTone: 'empathetic' | 'professional';

  // Content filters
  contentFilters: ContentFilters;
}

export const defaultSmartReminders: SmartRemindersSettings = {
  mood: { enabled: false, time: '09:00', followUpEnabled: true, followUpTime: '14:00' },
  exercise: { enabled: false, time: '10:00', followUpEnabled: false, followUpTime: '17:00' },
  journal: { enabled: false, time: '20:00', followUpEnabled: false, followUpTime: '21:00' },
  streakNotificationsEnabled: true,
};

export interface ExportOptions {
  format: 'csv' | 'json';
  dateRange: 'all' | 'month' | 'week';
  includeJournal: boolean;
  includeMood: boolean;
}

// Content filtering
export type DurationFilter = 'all' | '5' | '10' | '15+';

export interface ContentFilters {
  sleepStoriesDuration: DurationFilter;
  meditationsDuration: DurationFilter;
}
