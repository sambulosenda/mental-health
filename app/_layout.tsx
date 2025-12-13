import { BiometricLock } from '@/src/components/BiometricLock';
import { AnimatedSplash } from '@/src/components/splash/AnimatedSplash';
import { colors, darkColors } from '@/src/constants/theme';
import { ThemeProvider, useTheme } from '@/src/contexts/ThemeContext';
import { useRouteProtection } from '@/src/hooks/useRouteProtection';
import { initializeApp, hideSplash } from '@/src/lib/app/initialization';
import { setupNotificationListeners } from '@/src/lib/notifications/handlers';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

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
        console.error('Failed to initialize app:', error);
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

