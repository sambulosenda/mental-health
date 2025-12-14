import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases, {
  CustomerInfo,
  PurchasesPackage,
  PurchasesOffering,
} from 'react-native-purchases';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { ENTITLEMENT_ID } from '@/src/constants/config';

// In-flight initialization promise to prevent concurrent calls
let initializationPromise: Promise<void> | null = null;
let customerInfoListener: ((info: CustomerInfo) => void) | null = null;

interface SubscriptionState {
  // State
  isInitialized: boolean;
  isPremium: boolean;
  customerInfo: CustomerInfo | null;
  currentOffering: PurchasesOffering | null;
  isLoading: boolean;
  error: string | null;

  // Cache for offline access
  cachedPremiumStatus: boolean;
  lastSyncTime: number | null;

  // Actions
  initialize: () => Promise<void>;
  checkPremiumStatus: () => Promise<boolean>;
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  loadOfferings: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      // Initial state
      isInitialized: false,
      isPremium: false,
      customerInfo: null,
      currentOffering: null,
      isLoading: false,
      error: null,
      cachedPremiumStatus: false,
      lastSyncTime: null,

      initialize: async () => {
        // Already initialized
        if (get().isInitialized) return;

        // Concurrent call - await existing initialization
        if (initializationPromise) {
          await initializationPromise;
          return;
        }

        // Start initialization - store promise before any async work
        initializationPromise = (async () => {
          try {
            const apiKey = Platform.select({
              ios: Constants.expoConfig?.extra?.revenueCatApiKeyIOS,
              android: Constants.expoConfig?.extra?.revenueCatApiKeyAndroid,
            });

            if (!apiKey) {
              if (__DEV__) console.warn('RevenueCat API key not configured');
              set({ isInitialized: true, isPremium: get().cachedPremiumStatus });
              return;
            }

            await Purchases.configure({ apiKey });

            // Only add listener if not already registered
            if (!customerInfoListener) {
              customerInfoListener = (info: CustomerInfo) => {
                const isPremium = !!info.entitlements.active[ENTITLEMENT_ID];
                set({
                  customerInfo: info,
                  isPremium,
                  cachedPremiumStatus: isPremium,
                  lastSyncTime: Date.now(),
                });
              };
              Purchases.addCustomerInfoUpdateListener(customerInfoListener);
            }

            // Initial check
            await get().checkPremiumStatus();
            await get().loadOfferings();

            set({ isInitialized: true });
          } catch (error) {
            if (__DEV__) console.error('Failed to initialize RevenueCat:', error);
            // Fall back to cached status
            set({
              isInitialized: true,
              isPremium: get().cachedPremiumStatus,
            });
          }
        })();

        await initializationPromise;
      },

      checkPremiumStatus: async () => {
        try {
          const customerInfo = await Purchases.getCustomerInfo();
          const isPremium = !!customerInfo.entitlements.active[ENTITLEMENT_ID];

          set({
            customerInfo,
            isPremium,
            cachedPremiumStatus: isPremium,
            lastSyncTime: Date.now(),
          });

          return isPremium;
        } catch (error) {
          if (__DEV__) console.error('Failed to check premium status:', error);
          return get().cachedPremiumStatus;
        }
      },

      purchasePackage: async (pkg) => {
        set({ isLoading: true, error: null });

        try {
          const { customerInfo } = await Purchases.purchasePackage(pkg);
          const isPremium = !!customerInfo.entitlements.active[ENTITLEMENT_ID];

          set({
            customerInfo,
            isPremium,
            cachedPremiumStatus: isPremium,
            lastSyncTime: Date.now(),
            isLoading: false,
          });

          return isPremium;
        } catch (error: unknown) {
          const purchaseError = error as { userCancelled?: boolean; message?: string };
          if (purchaseError.userCancelled) {
            set({ isLoading: false });
            return false;
          }

          const message = purchaseError.message || 'Purchase failed';
          set({ error: message, isLoading: false });
          return false;
        }
      },

      restorePurchases: async () => {
        set({ isLoading: true, error: null });

        try {
          const customerInfo = await Purchases.restorePurchases();
          const isPremium = !!customerInfo.entitlements.active[ENTITLEMENT_ID];

          set({
            customerInfo,
            isPremium,
            cachedPremiumStatus: isPremium,
            lastSyncTime: Date.now(),
            isLoading: false,
          });

          return isPremium;
        } catch (error: unknown) {
          const restoreError = error as { message?: string };
          const message = restoreError.message || 'Restore failed';
          set({ error: message, isLoading: false });
          return false;
        }
      },

      loadOfferings: async () => {
        try {
          const offerings = await Purchases.getOfferings();
          set({ currentOffering: offerings.current });
        } catch (error) {
          if (__DEV__) console.error('Failed to load offerings:', error);
        }
      },

      clearError: () => set({ error: null }),

      reset: () => {
        // Clean up listener
        if (customerInfoListener) {
          Purchases.removeCustomerInfoUpdateListener(customerInfoListener);
          customerInfoListener = null;
        }
        initializationPromise = null;

        set({
          isInitialized: false,
          isPremium: false,
          customerInfo: null,
          currentOffering: null,
          isLoading: false,
          error: null,
        });
      },
    }),
    {
      name: 'softmind-subscription',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        cachedPremiumStatus: state.cachedPremiumStatus,
        lastSyncTime: state.lastSyncTime,
      }),
    }
  )
);
