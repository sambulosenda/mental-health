import { BiometricLock } from '@/src/components/BiometricLock';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';
import { TransitionStack, CalmPresets, DimOverlay } from '@/src/components/navigation/TransitionStack';
import { AnimatedSplash } from '@/src/components/splash/AnimatedSplash';
import { colors, darkColors } from '@/src/constants/theme';
import { ThemeProvider, useTheme } from '@/src/contexts/ThemeContext';
import { useRouteProtection } from '@/src/hooks/useRouteProtection';
import { initializeApp, hideSplash } from '@/src/lib/app/initialization';
import { setupNotificationListeners } from '@/src/lib/notifications/handlers';
import { initSentry, captureException } from '@/src/lib/sentry';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

// Initialize Sentry as early as possible
initSentry();

function RootLayoutContent() {
  const [isReady, setIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;

  const onSplashAnimationComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  // Initialize app services
  useEffect(() => {
    async function prepare() {
      try {
        await initializeApp();
      } catch (error) {
        captureException(error as Error, { context: 'app_initialization' });
      } finally {
        setIsReady(true);
        await hideSplash();
      }
    }
    prepare();
  }, []);

  // Set up notification handlers
  useEffect(() => {
    return setupNotificationListeners(router);
  }, [router]);

  // Handle route protection (onboarding flow)
  useRouteProtection(isReady);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <SafeAreaProvider>
          <BiometricLock>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <View style={{ flex: 1 }}>
              <TransitionStack
                screenOptions={{
                  overlay: DimOverlay,
                  overlayMode: 'screen',
                }}
              >
                <TransitionStack.Screen
                  name="onboarding"
                  options={{
                    ...CalmPresets.SlideHorizontal(),
                    overlayShown: false,
                  }}
                />
                <TransitionStack.Screen
                  name="(tabs)"
                  options={{
                    overlayShown: false,
                  }}
                />
                <TransitionStack.Screen
                  name="chat"
                  options={{
                    ...CalmPresets.SlideHorizontal(),
                  }}
                />
                <TransitionStack.Screen
                  name="(modals)"
                  options={{
                    ...CalmPresets.SlideFromBottom(),
                  }}
                />
                <TransitionStack.Screen
                  name="paywall"
                  options={{
                    ...CalmPresets.ElasticCard(),
                  }}
                />
              </TransitionStack>
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
    <ErrorBoundary>
      <ThemeProvider>
        <RootLayoutContent />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

