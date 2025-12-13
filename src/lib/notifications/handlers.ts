import * as Notifications from 'expo-notifications';
import type { Router } from 'expo-router';
import { isValidReminderType, ROUTES } from '@/src/constants/config';
import { hasCompletedToday } from '@/src/lib/streaks';
import type { ReminderType } from '@/src/types/settings';
import type { AppRoute } from '@/src/types/navigation';

// Map reminder types to routes
const REMINDER_ROUTES: Record<ReminderType, AppRoute> = {
  mood: ROUTES.TRACK,
  exercise: ROUTES.TABS,
  journal: ROUTES.JOURNAL,
};

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
      console.warn(`Invalid reminder type in notification: ${data.action}`);
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
 */
export function handleNotificationResponse(
  response: Notifications.NotificationResponse,
  router: Router
): void {
  const data = response.notification.request.content.data;
  const action = data?.action;

  if (action) {
    if (!isValidReminderType(action)) {
      console.warn(`Invalid reminder type in notification response: ${action}`);
      return;
    }

    const route = REMINDER_ROUTES[action];
    if (route) {
      // Type assertion needed for expo-router's strict route typing
      router.push(route as '/(tabs)');
    }
  }
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
