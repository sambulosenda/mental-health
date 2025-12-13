import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { useSubscriptionStore } from '@/src/stores';

export type PremiumFeature = 'ai_chat' | 'exercises' | 'meditations' | 'export';

export function usePremiumFeature() {
  const router = useRouter();
  const { isPremium, isInitialized, cachedPremiumStatus } = useSubscriptionStore(
    useShallow((state) => ({
      isPremium: state.isPremium,
      isInitialized: state.isInitialized,
      cachedPremiumStatus: state.cachedPremiumStatus,
    }))
  );

  const requirePremium = useCallback(
    (onAllowed: () => void) => {
      const effectiveStatus = isInitialized ? isPremium : cachedPremiumStatus;

      if (effectiveStatus) {
        onAllowed();
      } else {
        router.push('/paywall');
      }
    },
    [isPremium, isInitialized, cachedPremiumStatus, router]
  );

  const checkPremium = useCallback((): boolean => {
    return isInitialized ? isPremium : cachedPremiumStatus;
  }, [isPremium, isInitialized, cachedPremiumStatus]);

  return {
    isPremium,
    isLoading: !isInitialized,
    requirePremium,
    checkPremium,
  };
}
