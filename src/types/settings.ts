export interface AppSettings {
  // Notifications
  reminderEnabled: boolean;
  reminderTime: string; // HH:mm format

  // Privacy
  passcodeEnabled: boolean;
  biometricEnabled: boolean;

  // Appearance
  theme: 'light' | 'dark' | 'system';

  // Onboarding
  hasCompletedOnboarding: boolean;

  // Insights
  insightDepth: 'brief' | 'detailed';
  insightTone: 'empathetic' | 'professional';
}

export interface ExportOptions {
  format: 'csv' | 'json';
  dateRange: 'all' | 'month' | 'week';
  includeJournal: boolean;
  includeMood: boolean;
}
