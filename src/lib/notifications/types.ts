import type { NotificationRequest } from 'expo-notifications';
import type { ReminderType, ReminderConfig, SmartRemindersSettings } from '@/src/types/settings';

export interface ScheduleResult {
  success: boolean;
  failed: ReminderType[];
}

export interface NotificationService {
  /** Initialize the notification handler - call once at app startup */
  initialize(): void;

  /** Request notification permissions from the user */
  requestPermissions(): Promise<boolean>;

  /** Schedule a single reminder type */
  schedule(
    type: ReminderType,
    config: ReminderConfig,
    streakNotificationsEnabled: boolean
  ): Promise<boolean>;

  /** Schedule all reminders based on settings */
  scheduleAll(settings: SmartRemindersSettings): Promise<ScheduleResult>;

  /** Cancel a specific reminder type (primary + follow-up) */
  cancel(type: ReminderType): Promise<void>;

  /** Cancel all scheduled reminders */
  cancelAll(): Promise<void>;

  /** Get all currently scheduled reminders */
  getScheduled(): Promise<NotificationRequest[]>;
}

// Notification data payload types
export const NotificationActions = {
  mood: 'mood',
  exercise: 'exercise',
  journal: 'journal',
} as const;

export type NotificationAction = (typeof NotificationActions)[keyof typeof NotificationActions];

export interface NotificationData {
  type: string;
  action: NotificationAction;
  isFollowUp?: boolean;
}
