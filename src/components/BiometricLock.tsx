import { useEffect, useState, useCallback } from 'react';
import { View, AppState, type AppStateStatus } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button } from '@/src/components/ui';
import { colors, darkColors } from '@/src/constants/theme';
import { authenticate, checkBiometricAvailability, getBiometricDisplayName } from '@/src/lib/biometrics';
import { useSettingsStore } from '@/src/stores';
import { useTheme } from '@/src/contexts/ThemeContext';

interface BiometricLockProps {
  children: React.ReactNode;
}

export function BiometricLock({ children }: BiometricLockProps) {
  const { biometricEnabled } = useSettingsStore();
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const [isLocked, setIsLocked] = useState(biometricEnabled);
  const [biometricName, setBiometricName] = useState('Biometric');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    async function checkBiometric() {
      const status = await checkBiometricAvailability();
      setBiometricName(getBiometricDisplayName(status.biometricType));
    }
    checkBiometric();
  }, []);

  useEffect(() => {
    if (biometricEnabled && isLocked) {
      handleAuthenticate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [biometricEnabled]);

  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && biometricEnabled && isLocked) {
        handleAuthenticate();
      } else if (nextAppState === 'background' && biometricEnabled) {
        setIsLocked(true);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [biometricEnabled, isLocked]
  );

  const handleAuthenticate = async () => {
    if (isAuthenticating) return;

    setIsAuthenticating(true);
    try {
      const success = await authenticate();
      if (success) {
        setIsLocked(false);
      }
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (!biometricEnabled || !isLocked) {
    return <>{children}</>;
  }

  return (
    <View
      className="flex-1 justify-center items-center p-8"
      style={{ backgroundColor: themeColors.background }}
    >
      <View className="items-center max-w-[300px]">
        <View
          className="w-[100px] h-[100px] rounded-full justify-center items-center mb-8"
          style={{ backgroundColor: themeColors.primaryLight }}
        >
          <Ionicons name="lock-closed" size={48} color={themeColors.textOnAccent} />
        </View>
        <Text variant="h2" color="textPrimary" center className="mb-2">
          Softmind is Locked
        </Text>
        <Text variant="body" color="textSecondary" center className="mb-8">
          Use {biometricName} to unlock and access your data
        </Text>
        <Button
          onPress={handleAuthenticate}
          disabled={isAuthenticating}
          className="min-w-[200px]"
        >
          {isAuthenticating ? 'Authenticating...' : `Unlock with ${biometricName}`}
        </Button>
      </View>
    </View>
  );
}
