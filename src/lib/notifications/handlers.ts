import * as Notifications from 'expo-notifications';
import type { Router } from 'expo-router';
import { isValidReminderType, ROUTES } from '@/src/constants/config';
import { hasCompletedToday } from '@/src/lib/streaks';
import type { ReminderType } from '@/src/types/settings';
import type { AppRoute } from '@/src/types/navigation';

// Map reminder types to routes
const REMINDER_ROUTES: Record<ReminderType, AppRoute> = {
  mood: ROUTES.TRACK,
  exercise: ROUTES.EXERCISE_SESSION,
  journal: ROUTES.JOURNAL,
};

// Extended notification actions beyond reminder types
type NotificationAction = ReminderType | 'chat' | 'checkin' | 'achievements' | 'insights' | 'weekly_summary';

const EXTENDED_ROUTES: Record<NotificationAction, string> = {
  mood: ROUTES.TRACK,
  exercise: ROUTES.EXERCISE_SESSION,
  journal: ROUTES.JOURNAL,
  chat: ROUTES.CHAT,
  checkin: ROUTES.CHAT_CHECKIN,
  achievements: ROUTES.ACHIEVEMENTS,
  insights: ROUTES.INSIGHTS,
  weekly_summary: ROUTES.WEEKLY_SUMMARY,
};

function isValidNotificationAction(value: unknown): value is NotificationAction {
  return typeof value === 'string' && value in EXTENDED_ROUTES;
}

/**
 * Handle notification received while app is foregrounded.
 * Dismisses follow-up notifications if user already completed the action.
 */
export async function handleNotificationReceived(
  notification: Notifications.Notification
): Promise<void> {
  const data = notification.request.content.data;

  if (data?.isFollowUp && data?.action) {
    if (!isValidReminderType(data.action)) {
      if (__DEV__) console.warn(`Invalid reminder type in notification: ${data.action}`);
      return;
    }

    const completed = await hasCompletedToday(data.action);
    if (completed) {
      await Notifications.dismissNotificationAsync(notification.request.identifier);
    }
  }
}

/**
 * Handle notification tap - navigate to appropriate screen.
 * Supports extended actions beyond reminder types.
 */
export function handleNotificationResponse(
  response: Notifications.NotificationResponse,
  router: Router
): void {
  const data = response.notification.request.content.data;
  const action = data?.action;

  if (!action) return;

  // Handle extended actions (chat, checkin, achievements, etc.)
  if (isValidNotificationAction(action)) {
    let route = EXTENDED_ROUTES[action];

    // Handle exercise with optional templateId
    if (action === 'exercise' && data?.templateId) {
      route = `${route}?templateId=${data.templateId}`;
    }

    // Type assertion needed for expo-router's strict route typing
    router.push(route as '/(tabs)');
    return;
  }

  // Fallback for unknown actions
  if (__DEV__) console.warn(`Unknown notification action: ${action}`);
}

/**
 * Set up notification listeners and return cleanup function.
 */
export function setupNotificationListeners(router: Router): () => void {
  const notificationListener = Notifications.addNotificationReceivedListener(
    handleNotificationReceived
  );

  const responseListener = Notifications.addNotificationResponseReceivedListener(
    (response) => handleNotificationResponse(response, router)
  );

  return () => {
    notificationListener.remove();
    responseListener.remove();
  };
}
