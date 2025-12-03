import { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, AppState, type AppStateStatus } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants/theme';
import { authenticate, checkBiometricAvailability, getBiometricDisplayName } from '@/src/lib/biometrics';
import { useSettingsStore } from '@/src/stores';

interface BiometricLockProps {
  children: React.ReactNode;
}

export function BiometricLock({ children }: BiometricLockProps) {
  const { biometricEnabled } = useSettingsStore();
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
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [biometricEnabled]);

  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && biometricEnabled && isLocked) {
        handleAuthenticate();
      } else if (nextAppState === 'background' && biometricEnabled) {
        setIsLocked(true);
      }
    },
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
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="lock-closed" size={48} color={colors.primary} />
        </View>
        <Text variant="h2" color="textPrimary" center style={styles.title}>
          DaySi is Locked
        </Text>
        <Text variant="body" color="textSecondary" center style={styles.subtitle}>
          Use {biometricName} to unlock and access your data
        </Text>
        <Button
          onPress={handleAuthenticate}
          disabled={isAuthenticating}
          style={styles.button}
        >
          {isAuthenticating ? 'Authenticating...' : `Unlock with ${biometricName}`}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    marginBottom: spacing.sm,
  },
  subtitle: {
    marginBottom: spacing.xl,
  },
  button: {
    minWidth: 200,
  },
});
