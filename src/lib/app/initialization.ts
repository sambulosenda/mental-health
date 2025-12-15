import { initializeDatabase } from '@/src/lib/database';
import { getNotificationService } from '@/src/lib/notifications';
import { useSubscriptionStore } from '@/src/stores';
import BootSplash from 'react-native-bootsplash';

/**
 * Initialize all app services.
 * Called once on app startup.
 */
export async function initializeApp(): Promise<void> {
  try {
    // Initialize notification service (sets up handler)
    getNotificationService().initialize();

    // Initialize database and subscriptions in parallel
    await Promise.all([
      initializeDatabase(),
      useSubscriptionStore.getState().initialize(),
    ]);
  } catch (error) {
    console.error('Failed to initialize app:', error);
    throw error;
  }
}

/**
 * Hide native splash screen with fade animation.
 */
export async function hideSplash(): Promise<void> {
  await BootSplash.hide({ fade: true });
}
