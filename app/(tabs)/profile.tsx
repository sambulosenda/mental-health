import { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Host, Switch } from '@expo/ui/swift-ui';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { Text, Card, Button, ThemeToggleButton, AnimatedHeader } from '@/src/components/ui';
import { ReminderTypeCard } from '@/src/components/settings';
import { useSettingsStore, useMoodStore, useJournalStore } from '@/src/stores';
import { requestNotificationPermissions } from '@/src/lib/notifications';
import {
  checkBiometricAvailability,
  getBiometricDisplayName,
  authenticate,
} from '@/src/lib/biometrics';
import { exportMoodToCSV, exportAllData } from '@/src/lib/export';
import { sendSMSInvites } from '@/src/lib/share';
import { ContactPicker } from '@/src/components/share/ContactPicker';
import { colors, darkColors, spacing } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';

const HEADER_EXPANDED_HEIGHT = 120;

export default function ProfileScreen() {
  const {
    smartReminders,
    biometricEnabled,
    setReminderEnabled,
    setReminderTime,
    setFollowUpEnabled,
    setFollowUpTime,
    setStreakNotificationsEnabled,
    setBiometricEnabled,
  } = useSettingsStore();

  const { entries: moodEntries, loadEntries: loadMoodEntries, clearEntries: clearMoodEntries } = useMoodStore();
  const { entries: journalEntries, loadEntries: loadJournalEntries, clearEntries: clearJournalEntries } = useJournalStore();
  const { mode, isDark } = useTheme();

  const themeColors = isDark ? darkColors : colors;

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricName, setBiometricName] = useState('Biometric');
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showContactPicker, setShowContactPicker] = useState(false);

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

  const handleReminderToggle = async (type: 'mood' | 'exercise' | 'journal', enabled: boolean) => {
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
    }
    try {
      await setReminderEnabled(type, enabled);
    } catch {
      Alert.alert(
        'Reminder Error',
        'Failed to schedule reminder. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleBiometricToggle = async (enabled: boolean) => {
    if (enabled) {
      const success = await authenticate(`Enable ${biometricName}`);
      if (!success) return;
    }
    setBiometricEnabled(enabled);
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
            } catch {
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
            } catch {
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
    if (moodEntries.length === 0 && journalEntries.length === 0) {
      Alert.alert('No Data', 'You don\'t have any data to delete.');
      return;
    }

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
                  onPress: async () => {
                    setIsDeleting(true);
                    try {
                      await clearMoodEntries();
                      await clearJournalEntries();
                      Alert.alert('Deleted', 'All data has been deleted.');
                    } catch {
                      Alert.alert('Error', 'Failed to delete data. Please try again.');
                    } finally {
                      setIsDeleting(false);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleShareApp = () => {
    setShowContactPicker(true);
  };

  const handleContactsSelected = async (contacts: { id: string; name: string; phoneNumber: string }[]) => {
    setShowContactPicker(false);
    if (contacts.length === 0) return;

    const phoneNumbers = contacts.map((c) => c.phoneNumber);
    const success = await sendSMSInvites(phoneNumbers);

    if (!success) {
      Alert.alert('Unable to Send', 'SMS is not available on this device.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <AnimatedHeader
        scrollY={scrollY}
        title="Profile"
        subtitle="Settings and privacy"
        showThemeToggle
      />
      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: HEADER_EXPANDED_HEIGHT },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <View style={styles.section}>
          <Text variant="h3" color="textPrimary" style={styles.sectionTitle}>
            Reminders
          </Text>

          <ReminderTypeCard
            label="Mood Check-in"
            description="Daily reminder to log how you feel"
            icon="happy-outline"
            config={smartReminders.mood}
            onToggle={(enabled) => handleReminderToggle('mood', enabled)}
            onTimeChange={(time) => setReminderTime('mood', time)}
            onFollowUpToggle={(enabled) => setFollowUpEnabled('mood', enabled)}
            onFollowUpTimeChange={(time) => setFollowUpTime('mood', time)}
          />

          <ReminderTypeCard
            label="Exercise Reminder"
            description="Time for a quick mental exercise"
            icon="fitness-outline"
            config={smartReminders.exercise}
            onToggle={(enabled) => handleReminderToggle('exercise', enabled)}
            onTimeChange={(time) => setReminderTime('exercise', time)}
            onFollowUpToggle={(enabled) => setFollowUpEnabled('exercise', enabled)}
            onFollowUpTimeChange={(time) => setFollowUpTime('exercise', time)}
          />

          <ReminderTypeCard
            label="Journal Reminder"
            description="Reflect on your day"
            icon="book-outline"
            config={smartReminders.journal}
            onToggle={(enabled) => handleReminderToggle('journal', enabled)}
            onTimeChange={(time) => setReminderTime('journal', time)}
            onFollowUpToggle={(enabled) => setFollowUpEnabled('journal', enabled)}
            onFollowUpTimeChange={(time) => setFollowUpTime('journal', time)}
          />

          {/* Streak notifications toggle */}
          <Card variant="flat" style={styles.streakCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingText}>
                <Text variant="bodyMedium" color="textPrimary">
                  Streak Motivation
                </Text>
                <Text variant="caption" color="textSecondary">
                  Include streak info in reminders
                </Text>
              </View>
              <Host matchContents>
                <Switch
                  value={smartReminders.streakNotificationsEnabled}
                  onValueChange={setStreakNotificationsEnabled}
                  label="Streak notifications"
                  variant="switch"
                />
              </Host>
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Text variant="h3" color="textPrimary" style={styles.sectionTitle}>
            Appearance
          </Text>
          <Card variant="flat">
            <View style={styles.settingRow}>
              <View style={styles.settingText}>
                <Text variant="bodyMedium" color="textPrimary">
                  Theme
                </Text>
                <Text variant="caption" color="textSecondary">
                  {mode === 'system' ? 'Using device setting' : mode === 'dark' ? 'Dark mode' : 'Light mode'}
                </Text>
              </View>
              <ThemeToggleButton size="medium" />
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Text variant="h3" color="textPrimary" style={styles.sectionTitle}>
            Privacy & Security
          </Text>
          <Card variant="flat">
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
              {biometricAvailable && (
                <Host matchContents>
                  <Switch
                    value={biometricEnabled}
                    onValueChange={handleBiometricToggle}
                    label={`${biometricName} Lock`}
                    variant="switch"
                  />
                </Host>
              )}
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Text variant="h3" color="textPrimary" style={styles.sectionTitle}>
            Data Management
          </Text>
          <View style={styles.statsRow}>
            <Card variant="flat" style={styles.statCard}>
              <Text variant="h2" color="textPrimary">
                {moodEntries.length}
              </Text>
              <Text variant="caption" color="textSecondary">
                Mood entries
              </Text>
            </Card>
            <Card variant="flat" style={styles.statCard}>
              <Text variant="h2" color="textPrimary">
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
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete All Data'}
            </Button>
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="h3" color="textPrimary" style={styles.sectionTitle}>
            Invite Friends
          </Text>
          <Card variant="flat">
            <Text variant="bodyMedium" color="textPrimary">
              Share Softmind
            </Text>
            <Text variant="caption" color="textSecondary" style={styles.shareDescription}>
              Help friends take care of their mental wellness by sharing the app with them.
            </Text>
            <Button
              variant="secondary"
              fullWidth
              onPress={handleShareApp}
              style={styles.shareButton}
            >
              Invite via SMS
            </Button>
          </Card>
        </View>

        <View style={styles.section}>
          <Text variant="h3" color="textPrimary" style={styles.sectionTitle}>
            About
          </Text>
          <Card variant="flat">
            <Text variant="bodyMedium" color="textPrimary">
              Softmind
            </Text>
            <Text variant="caption" color="textSecondary">
              Version 1.0.0
            </Text>
            <Text variant="caption" color="textMuted" style={styles.aboutText}>
              Your emotional wellness companion. All data is stored locally on your device and never shared.
            </Text>
          </Card>
        </View>
      </Animated.ScrollView>

      <Modal
        visible={showContactPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowContactPicker(false)}
      >
        <ContactPicker
          onSelect={handleContactsSelected}
          onClose={() => setShowContactPicker(false)}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
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
  streakCard: {
    marginTop: spacing.xs,
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
  shareDescription: {
    marginTop: spacing.xs,
  },
  shareButton: {
    marginTop: spacing.md,
  },
});
