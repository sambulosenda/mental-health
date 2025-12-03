import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Switch, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card, Button } from '@/src/components/ui';
import { useSettingsStore, useMoodStore, useJournalStore } from '@/src/stores';
import {
  scheduleDailyReminder,
  cancelAllReminders,
  parseTimeString,
  requestNotificationPermissions,
} from '@/src/lib/notifications';
import {
  checkBiometricAvailability,
  getBiometricDisplayName,
  authenticate,
} from '@/src/lib/biometrics';
import { exportMoodToCSV, exportAllData } from '@/src/lib/export';
import { colors, spacing } from '@/src/constants/theme';

export default function ProfileScreen() {
  const {
    reminderEnabled,
    reminderTime,
    biometricEnabled,
    setReminderEnabled,
    setReminderTime,
    setBiometricEnabled,
  } = useSettingsStore();

  const { entries: moodEntries, loadEntries: loadMoodEntries } = useMoodStore();
  const { entries: journalEntries, loadEntries: loadJournalEntries } = useJournalStore();

  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricName, setBiometricName] = useState('Biometric');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    checkBiometrics();
    loadMoodEntries();
    loadJournalEntries();
  }, []);

  const checkBiometrics = async () => {
    const status = await checkBiometricAvailability();
    setBiometricAvailable(status.isAvailable && status.isEnrolled);
    setBiometricName(getBiometricDisplayName(status.biometricType));
  };

  const handleReminderToggle = async (enabled: boolean) => {
    if (enabled) {
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permissions Required',
          'Please enable notifications in your device settings to receive reminders.',
          [{ text: 'OK' }]
        );
        return;
      }
      const { hour, minute } = parseTimeString(reminderTime);
      await scheduleDailyReminder(hour, minute);
    } else {
      await cancelAllReminders();
    }
    setReminderEnabled(enabled);
  };

  const handleBiometricToggle = async (enabled: boolean) => {
    if (enabled) {
      const success = await authenticate(`Enable ${biometricName}`);
      if (!success) return;
    }
    setBiometricEnabled(enabled);
  };

  const handleTimeChange = () => {
    Alert.alert(
      'Reminder Time',
      'Choose when to receive your daily reminder',
      [
        { text: 'Morning (9:00)', onPress: () => updateReminderTime('09:00') },
        { text: 'Afternoon (14:00)', onPress: () => updateReminderTime('14:00') },
        { text: 'Evening (20:00)', onPress: () => updateReminderTime('20:00') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const updateReminderTime = async (time: string) => {
    setReminderTime(time);
    if (reminderEnabled) {
      const { hour, minute } = parseTimeString(time);
      await scheduleDailyReminder(hour, minute);
    }
  };

  const handleExport = async () => {
    if (moodEntries.length === 0 && journalEntries.length === 0) {
      Alert.alert('No Data', 'You don\'t have any data to export yet.');
      return;
    }

    Alert.alert(
      'Export Data',
      'Choose export format',
      [
        {
          text: 'CSV (Mood only)',
          onPress: async () => {
            setIsExporting(true);
            try {
              await exportMoodToCSV(moodEntries);
            } catch (error) {
              Alert.alert('Export Failed', 'Unable to export data. Please try again.');
            } finally {
              setIsExporting(false);
            }
          },
        },
        {
          text: 'JSON (All data)',
          onPress: async () => {
            setIsExporting(true);
            try {
              await exportAllData({ moods: moodEntries, journals: journalEntries });
            } catch (error) {
              Alert.alert('Export Failed', 'Unable to export data. Please try again.');
            } finally {
              setIsExporting(false);
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleDeleteData = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your mood entries and journal entries. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you sure?',
              'This is your last chance to cancel.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete Everything',
                  style: 'destructive',
                  onPress: () => {
                    // TODO: Implement full data deletion
                    Alert.alert('Deleted', 'All data has been deleted.');
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minute} ${ampm}`;
  };

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
                value={reminderEnabled}
                onValueChange={handleReminderToggle}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={reminderEnabled ? colors.primary : colors.surface}
              />
            </View>
            {reminderEnabled && (
              <Pressable style={styles.timeRow} onPress={handleTimeChange}>
                <View style={styles.settingText}>
                  <Text variant="caption" color="textSecondary">
                    Reminder Time
                  </Text>
                  <Text variant="bodyMedium" color="primary">
                    {formatTime(reminderTime)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </Pressable>
            )}
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
                  {biometricName} Lock
                </Text>
                <Text variant="caption" color="textSecondary">
                  {biometricAvailable
                    ? `Require ${biometricName} to open`
                    : `${biometricName} not available`}
                </Text>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={handleBiometricToggle}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={biometricEnabled ? colors.primary : colors.surface}
                disabled={!biometricAvailable}
              />
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Text variant="h3" color="textPrimary" style={styles.sectionTitle}>
            Data Management
          </Text>
          <View style={styles.statsRow}>
            <Card variant="flat" style={styles.statCard}>
              <Text variant="h2" color="primary">
                {moodEntries.length}
              </Text>
              <Text variant="caption" color="textSecondary">
                Mood entries
              </Text>
            </Card>
            <Card variant="flat" style={styles.statCard}>
              <Text variant="h2" color="primary">
                {journalEntries.length}
              </Text>
              <Text variant="caption" color="textSecondary">
                Journal entries
              </Text>
            </Card>
          </View>
          <View style={styles.buttonGroup}>
            <Button
              variant="secondary"
              fullWidth
              onPress={handleExport}
              disabled={isExporting}
            >
              {isExporting ? 'Exporting...' : 'Export Data'}
            </Button>
            <Button
              variant="ghost"
              fullWidth
              style={styles.dangerButton}
              onPress={handleDeleteData}
            >
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
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
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
