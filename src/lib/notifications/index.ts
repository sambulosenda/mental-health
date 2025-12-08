// Re-export types
// ============================================================================
// Backward-compatible exports (delegate to service singleton)
// These maintain the existing API while using the new service internally
// ============================================================================

import { getNotificationService } from './expo-notification.service';
import type { ReminderType, ReminderConfig, SmartRemindersSettings } from '@/src/types/settings';

export type { NotificationService, ScheduleResult, NotificationData } from './types';
export { NotificationActions } from './types';

// Re-export service
export {
  createExpoNotificationService,
  getNotificationService,
  parseTimeString,
} from './expo-notification.service';

/** @deprecated Use getNotificationService().requestPermissions() instead */
export async function requestNotificationPermissions(): Promise<boolean> {
  return getNotificationService().requestPermissions();
}

/** @deprecated Use getNotificationService().scheduleAll() instead */
export async function scheduleAllReminders(
  settings: SmartRemindersSettings
): Promise<boolean> {
  const result = await getNotificationService().scheduleAll(settings);
  return result.success;
}

/** @deprecated Use getNotificationService().schedule() instead */
export async function scheduleReminder(
  type: ReminderType,
  config: ReminderConfig,
  streakNotificationsEnabled: boolean
): Promise<boolean> {
  return getNotificationService().schedule(type, config, streakNotificationsEnabled);
}

/** @deprecated Use getNotificationService().cancel() instead */
export async function cancelReminder(type: ReminderType): Promise<void> {
  return getNotificationService().cancel(type);
}

/** @deprecated Use getNotificationService().cancelAll() instead */
export async function cancelAllReminders(): Promise<void> {
  return getNotificationService().cancelAll();
}

/** @deprecated Use getNotificationService().getScheduled() instead */
export async function getScheduledReminders() {
  return getNotificationService().getScheduled();
}

/**
 * @deprecated Legacy function - use scheduleReminder with SmartRemindersSettings instead
 */
export async function scheduleDailyReminder(
  hour: number,
  minute: number
): Promise<string | null> {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    throw new Error(`Invalid hour: ${hour}, must be integer between 0-23`);
  }
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
    throw new Error(`Invalid minute: ${minute}, must be integer between 0-59`);
  }

  const service = getNotificationService();
  const hasPermission = await service.requestPermissions();
  if (!hasPermission) return null;

  await service.cancelAll();

  // Import Notifications only for legacy function
  const Notifications = await import('expo-notifications');

  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'How are you feeling?',
        body: 'Take a moment to check in with yourself and log your mood.',
        sound: true,
        data: { type: 'mood-reminder' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

    return identifier;
  } catch (error) {
    console.error('Failed to schedule daily reminder:', error);
    return null;
  }
}
