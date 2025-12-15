import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

const SENTRY_DSN = Constants.expoConfig?.extra?.sentryDsn;

export function initSentry() {
  if (!SENTRY_DSN) {
    if (__DEV__) {
      console.log('Sentry DSN not configured - skipping initialization');
    }
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    debug: __DEV__,
    enabled: !__DEV__,
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    attachScreenshot: true,
    attachViewHierarchy: true,
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 30000,
  });
}

export function captureException(error: Error, context?: Record<string, unknown>) {
  if (__DEV__) {
    console.error('Captured exception:', error, context);
    return;
  }

  Sentry.captureException(error, {
    extra: context,
  });
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  if (__DEV__) {
    console.log(`[${level}] ${message}`);
    return;
  }

  Sentry.captureMessage(message, level);
}

export function setUserContext(userId: string | null) {
  if (userId) {
    Sentry.setUser({ id: userId });
  } else {
    Sentry.setUser(null);
  }
}

export function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, unknown>
) {
  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level: 'info',
  });
}

export { Sentry };
