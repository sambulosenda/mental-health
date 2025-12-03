import { View, StyleSheet, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Text, Card, Button } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants/theme';

export default function ProfileScreen() {
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text variant="h1" color="textPrimary">
            Profile
          </Text>
          <Text variant="body" color="textSecondary" style={styles.subtitle}>
            Settings and privacy
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="h3" color="textPrimary" style={styles.sectionTitle}>
            Notifications
          </Text>
          <Card variant="outlined">
            <View style={styles.settingRow}>
              <View style={styles.settingText}>
                <Text variant="bodyMedium" color="textPrimary">
                  Daily Reminders
                </Text>
                <Text variant="caption" color="textSecondary">
                  Get reminded to track your mood
                </Text>
              </View>
              <Switch
                value={remindersEnabled}
                onValueChange={setRemindersEnabled}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={remindersEnabled ? colors.primary : colors.surface}
              />
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Text variant="h3" color="textPrimary" style={styles.sectionTitle}>
            Privacy & Security
          </Text>
          <Card variant="outlined">
            <View style={styles.settingRow}>
              <View style={styles.settingText}>
                <Text variant="bodyMedium" color="textPrimary">
                  Biometric Lock
                </Text>
                <Text variant="caption" color="textSecondary">
                  Require Face ID or fingerprint to open
                </Text>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={biometricEnabled ? colors.primary : colors.surface}
              />
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Text variant="h3" color="textPrimary" style={styles.sectionTitle}>
            Data Management
          </Text>
          <View style={styles.buttonGroup}>
            <Button variant="secondary" fullWidth>
              Export Data
            </Button>
            <Button variant="ghost" fullWidth style={styles.dangerButton}>
              Delete All Data
            </Button>
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="h3" color="textPrimary" style={styles.sectionTitle}>
            About
          </Text>
          <Card variant="flat">
            <Text variant="bodyMedium" color="textPrimary">
              DaySi
            </Text>
            <Text variant="caption" color="textSecondary">
              Version 1.0.0
            </Text>
            <Text variant="caption" color="textMuted" style={styles.aboutText}>
              Your emotional wellness companion. All data is stored locally on your device and never shared.
            </Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingText: {
    flex: 1,
    marginRight: spacing.md,
  },
  buttonGroup: {
    gap: spacing.sm,
  },
  dangerButton: {
    marginTop: spacing.xs,
  },
  aboutText: {
    marginTop: spacing.sm,
  },
});
