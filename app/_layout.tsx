import { BiometricLock } from '@/src/components/BiometricLock';
import { AnimatedSplash } from '@/src/components/splash/AnimatedSplash';
import { isValidReminderType, ROUTES } from '@/src/constants/config';
import { colors, darkColors } from '@/src/constants/theme';
import { ThemeProvider, useTheme } from '@/src/contexts/ThemeContext';
import { initializeDatabase } from '@/src/lib/database';
import { getNotificationService } from '@/src/lib/notifications';
import { hasCompletedToday } from '@/src/lib/streaks';
import { useSettingsStore, useSubscriptionStore } from '@/src/stores';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import BootSplash from 'react-native-bootsplash';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

function RootLayoutContent() {
  const [isReady, setIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const { hasCompletedOnboarding } = useSettingsStore();
  const initializeSubscription = useSubscriptionStore((state) => state.initialize);
  const router = useRouter();
  const segments = useSegments();
  const { isDark } = useTheme();
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  const themeColors = isDark ? darkColors : colors;

  const onSplashAnimationComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize notification service (sets up handler)
        getNotificationService().initialize();

        // Initialize database
        await initializeDatabase();

        // Initialize RevenueCat subscription service
        await initializeSubscription();
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        setIsReady(true);
        // Hide the native splash screen once app is ready
        await BootSplash.hide({ fade: true });
      }
    }
    prepare();
  }, [initializeSubscription]);

  // Set up notification handlers
  useEffect(() => {
    // Handle notification received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(
      async (notification) => {
        const data = notification.request.content.data;

        // If it's a follow-up notification, check if user already completed the action
        if (data?.isFollowUp && data?.action) {
          if (!isValidReminderType(data.action)) {
            console.warn(`Invalid reminder type in notification: ${data.action}`);
            return;
          }
          const completed = await hasCompletedToday(data.action);
          if (completed) {
            // Dismiss this notification since the action was already done
            await Notifications.dismissNotificationAsync(
              notification.request.identifier
            );
          }
        }
      }
    );

    // Handle notification tap (user interaction)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        const action = data?.action;

        // Navigate to appropriate screen based on notification type
        if (action) {
          if (!isValidReminderType(action)) {
            console.warn(`Invalid reminder type in notification response: ${action}`);
            return;
          }
          switch (action) {
            case 'mood':
              router.push(ROUTES.TRACK);
              break;
            case 'exercise':
              router.push(ROUTES.TABS);
              break;
            case 'journal':
              router.push(ROUTES.JOURNAL);
              break;
          }
        }
      }
    );

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [router]);

  useEffect(() => {
    if (!isReady) return;

    const inOnboarding = segments[0] === 'onboarding';

    // In dev mode, set to true to force onboarding for testing
    const forceOnboarding = __DEV__ && false;

    if (forceOnboarding && !inOnboarding && !hasCompletedOnboarding) {
      router.replace(ROUTES.ONBOARDING);
    } else if (!hasCompletedOnboarding && !inOnboarding) {
      router.replace(ROUTES.ONBOARDING);
    } else if (hasCompletedOnboarding && inOnboarding) {
      router.replace(ROUTES.TABS);
    }
  }, [isReady, hasCompletedOnboarding, segments]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <SafeAreaProvider>
          <BiometricLock>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <View style={{ flex: 1 }}>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: themeColors.background },
                  animation: 'slide_from_right',
                  animationDuration: 250,
                  gestureEnabled: true,
                  gestureDirection: 'horizontal',
                }}
              >
                <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'fade' }} />
                <Stack.Screen
                  name="chat"
                  options={{
                    headerShown: false,
                    animation: 'slide_from_right',
                    gestureEnabled: true,
                    gestureDirection: 'horizontal',
                  }}
                />
                <Stack.Screen
                  name="(modals)"
                  options={{
                    presentation: 'modal',
                    headerShown: false,
                    animation: 'slide_from_bottom',
                    gestureEnabled: true,
                    gestureDirection: 'vertical',
                  }}
                />
                <Stack.Screen
                  name="paywall"
                  options={{
                    headerShown: false,
                    animation: 'slide_from_bottom',
                  }}
                />
              </Stack>
              {showSplash && (
                <AnimatedSplash
                  isAppReady={isReady}
                  onAnimationComplete={onSplashAnimationComplete}
                />
              )}
            </View>
          </BiometricLock>
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}

