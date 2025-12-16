import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useSettingsStore } from '@/src/stores';
import { ROUTES } from '@/src/constants/config';

/**
 * Hook to handle route protection based on onboarding status.
 * Redirects users to onboarding if not completed, or to tabs if already done.
 */
export function useRouteProtection(isReady: boolean) {
  const { hasCompletedOnboarding } = useSettingsStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!isReady) return;

    const inOnboarding = segments[0] === 'onboarding';

    // Dev mode: set to true to force onboarding for testing
    const forceOnboarding = __DEV__ && false;

    const shouldShowOnboarding = forceOnboarding || !hasCompletedOnboarding;

    if (shouldShowOnboarding && !inOnboarding) {
      router.replace(ROUTES.ONBOARDING);
    } else if (!shouldShowOnboarding && inOnboarding) {
      router.replace(ROUTES.TABS);
    }
  }, [isReady, hasCompletedOnboarding, segments, router]);
}
