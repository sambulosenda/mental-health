import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useSubscriptionStore } from '@/src/stores';

export type PremiumFeature = 'ai_chat' | 'exercises' | 'meditations' | 'export';

export function usePremiumFeature(feature?: PremiumFeature) {
  const router = useRouter();
  const { isPremium, isInitialized } = useSubscriptionStore();

  const requirePremium = useCallback(
    (onAllowed: () => void) => {
      if (!isInitialized) {
        // Still loading, allow access (will re-check)
        onAllowed();
        return;
      }

      if (isPremium) {
        onAllowed();
      } else {
        // Show paywall
        router.push('/(modals)/paywall');
      }
    },
    [isPremium, isInitialized, router]
  );

  const checkPremium = useCallback((): boolean => {
    if (!isInitialized) return true; // Allow while loading
    return isPremium;
  }, [isPremium, isInitialized]);

  return {
    isPremium,
    isLoading: !isInitialized,
    requirePremium,
    checkPremium,
  };
}
