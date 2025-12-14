import {
  followUpMessages,
  formatStreakMessage,
  getMessagePool,
  getRandomMessage,
  streakMessages,
} from '@/src/constants/reminderMessages';
import type { ReminderConfig, ReminderType, SmartRemindersSettings } from '@/src/types/settings';
import * as Notifications from 'expo-notifications';
import { calculateStreaks } from '../streaks';
import type { NotificationService, ScheduleResult } from './types';

// Notification identifiers
const NOTIFICATION_IDS = {
  mood: 'mood-reminder',
  moodFollowUp: 'mood-followup',
  exercise: 'exercise-reminder',
  exerciseFollowUp: 'exercise-followup',
  journal: 'journal-reminder',
  journalFollowUp: 'journal-followup',
} as const;

type NotificationIdKey = keyof typeof NOTIFICATION_IDS;

/**
 * Parse time string (HH:mm) to hour/minute with validation
 */
export function parseTimeString(time: string): { hour: number; minute: number } {
  const trimmed = time?.trim();

  if (!trimmed) {
    throw new Error('Invalid time string: empty or undefined');
  }

  const parts = trimmed.split(':');

  if (parts.length !== 2) {
    throw new Error(`Invalid time format "${time}": expected HH:mm`);
  }

  const [hourStr, minuteStr] = parts;
  const numericPattern = /^\d{1,2}$/;

  if (!numericPattern.test(hourStr) || !numericPattern.test(minuteStr)) {
    throw new Error(`Invalid time format "${time}": hour and minute must be numeric`);
  }

  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  if (hour < 0 || hour > 23) {
    throw new Error(`Invalid hour "${hourStr}": must be between 0 and 23`);
  }

  if (minute < 0 || minute > 59) {
    throw new Error(`Invalid minute "${minuteStr}": must be between 0 and 59`);
  }

  return { hour, minute };
}

/**
 * Validate that follow-up time is after primary time
 */
function validateFollowUpTime(primaryTime: string, followUpTime: string): void {
  const primary = parseTimeString(primaryTime);
  const followUp = parseTimeString(followUpTime);

  const primaryMinutes = primary.hour * 60 + primary.minute;
  const followUpMinutes = followUp.hour * 60 + followUp.minute;

  if (followUpMinutes <= primaryMinutes) {
    throw new Error(
      `Follow-up time (${followUpTime}) must be after primary reminder time (${primaryTime})`
    );
  }
}

/**
 * Create the Expo Notifications service implementation
 */
export function createExpoNotificationService(): NotificationService {
  let isInitialized = false;

  const initialize = (): void => {
    if (isInitialized) return;

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    isInitialized = true;
  };

  const requestPermissions = async (): Promise<boolean> => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  };

  const scheduleReminderWithFollowUp = async (
    type: ReminderType,
    config: ReminderConfig,
    streak: number
  ): Promise<void> => {
    const { hour, minute } = parseTimeString(config.time);
    const messagePool = getMessagePool(type);

    // Select message based on streak
    const message =
      streak > 1
        ? formatStreakMessage(getRandomMessage(streakMessages), streak)
        : getRandomMessage(messagePool);

    // Schedule primary reminder
    await Notifications.scheduleNotificationAsync({
      identifier: NOTIFICATION_IDS[type],
      content: {
        title: message.title,
        body: message.body,
        sound: true,
        data: {
          type: `${type}-reminder`,
          action: type,
        } as Record<string, unknown>,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

    // Schedule follow-up if enabled
    if (config.followUpEnabled) {
      validateFollowUpTime(config.time, config.followUpTime);

      const { hour: followHour, minute: followMinute } = parseTimeString(config.followUpTime);
      const followUpMsg = getRandomMessage(followUpMessages[type]);
      const followUpKey = `${type}FollowUp` as NotificationIdKey;

      await Notifications.scheduleNotificationAsync({
        identifier: NOTIFICATION_IDS[followUpKey],
        content: {
          title: followUpMsg.title,
          body: followUpMsg.body,
          sound: true,
          data: {
            type: `${type}-followup`,
            action: type,
            isFollowUp: true,
          } as Record<string, unknown>,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: followHour,
          minute: followMinute,
        },
      });
    }
  };

  const cancel = async (type: ReminderType): Promise<void> => {
    const followUpKey = `${type}FollowUp` as NotificationIdKey;

    await Promise.all([
      Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDS[type]),
      Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDS[followUpKey]),
    ]);
  };

  const cancelAll = async (): Promise<void> => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  const schedule = async (
    type: ReminderType,
    config: ReminderConfig,
    streakNotificationsEnabled: boolean
  ): Promise<boolean> => {
    await cancel(type);

    if (!config.enabled) return true;

    const hasPermission = await requestPermissions();
    if (!hasPermission) return false;

    try {
      let streak = 0;
      if (streakNotificationsEnabled) {
        try {
          streak = (await calculateStreaks())[type];
        } catch (streakError) {
          if (__DEV__) console.warn(`Failed to calculate streak for ${type}:`, streakError);
        }
      }

      await scheduleReminderWithFollowUp(type, config, streak);
      return true;
    } catch (error) {
      if (__DEV__) console.error(`Failed to schedule ${type} reminder:`, error);
      return false;
    }
  };

  const scheduleAll = async (settings: SmartRemindersSettings): Promise<ScheduleResult> => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      return { success: false, failed: ['mood', 'exercise', 'journal'] };
    }

    await cancelAll();

    let streaks = null;
    if (settings.streakNotificationsEnabled) {
      try {
        streaks = await calculateStreaks();
      } catch (error) {
        if (__DEV__) console.warn('Failed to calculate streaks:', error);
      }
    }

    const types: ReminderType[] = ['mood', 'exercise', 'journal'];
    const failed: ReminderType[] = [];

    for (const type of types) {
      if (settings[type].enabled) {
        try {
          await scheduleReminderWithFollowUp(
            type,
            settings[type],
            streaks ? streaks[type] : 0
          );
        } catch (error) {
          if (__DEV__) console.error(`Failed to schedule ${type} reminder:`, error);
          failed.push(type);
        }
      }
    }

    return {
      success: failed.length === 0,
      failed,
    };
  };

  const getScheduled = async () => {
    return Notifications.getAllScheduledNotificationsAsync();
  };

  return {
    initialize,
    requestPermissions,
    schedule,
    scheduleAll,
    cancel,
    cancelAll,
    getScheduled,
  };
}

// Singleton instance for app-wide use
let defaultService: NotificationService | null = null;

export function getNotificationService(): NotificationService {
  if (!defaultService) {
    defaultService = createExpoNotificationService();
  }
  return defaultService;
}
