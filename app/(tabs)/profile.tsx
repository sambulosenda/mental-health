import { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, Modal, Linking, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Host, Switch } from '@expo/ui/swift-ui';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { Text, Card, AnimatedHeader } from '@/src/components/ui';
import { ReminderTypeCard } from '@/src/components/settings';
import { useSettingsStore, useMoodStore, useJournalStore, useSubscriptionStore } from '@/src/stores';
import { requestNotificationPermissions } from '@/src/lib/notifications';
import {
  checkBiometricAvailability,
  getBiometricDisplayName,
  authenticate,
} from '@/src/lib/biometrics';
import { exportMoodToCSV, exportAllData } from '@/src/lib/export';
import { sendSMSInvites } from '@/src/lib/share';
import { ContactPicker } from '@/src/components/share/ContactPicker';
import { colors, darkColors, spacing, borderRadius } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';

const HEADER_EXPANDED_HEIGHT = 110;

type ThemeColors = typeof colors | typeof darkColors;

// Apple-style settings row
function SettingsRow({
  icon,
  iconColor,
  iconBg,
  label,
  value,
  onPress,
  showChevron = true,
  rightElement,
  isLast = false,
  themeColors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  rightElement?: React.ReactNode;
  isLast?: boolean;
  themeColors: ThemeColors;
}) {
  const content = (
    <View style={styles.settingsRow}>
      <View style={[styles.settingsIconContainer, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={[styles.settingsContent, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColors.divider }]}>
        <Text variant="body" color="textPrimary" style={styles.settingsLabel}>
          {label}
        </Text>
        <View style={styles.settingsRight}>
          {value && (
            <Text variant="body" color="textSecondary" style={styles.settingsValue}>
              {value}
            </Text>
          )}
          {rightElement}
          {showChevron && !rightElement && (
            <Ionicons name="chevron-forward" size={18} color={themeColors.textMuted} />
          )}
        </View>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
        {content}
      </Pressable>
    );
  }

  return content;
}

export default function ProfileScreen() {
  const router = useRouter();
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
  const { isPremium, customerInfo } = useSubscriptionStore();
  const { mode, setMode, isDark } = useTheme();

  const themeColors = isDark ? darkColors : colors;

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricName, setBiometricName] = useState('Biometric');
  const [, setIsExporting] = useState(false);
  const [, setIsDeleting] = useState(false);
  const [showContactPicker, setShowContactPicker] = useState(false);

  useEffect(() => {
    checkBiometrics();
    loadMoodEntries();
    loadJournalEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      Alert.alert('Reminder Error', 'Failed to schedule reminder. Please try again.', [{ text: 'OK' }]);
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
    if (!isPremium) {
      router.push('/paywall');
      return;
    }

    if (moodEntries.length === 0 && journalEntries.length === 0) {
      Alert.alert('No Data', 'You don\'t have any data to export yet.');
      return;
    }

    Alert.alert('Export Data', 'Choose export format', [
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
    ]);
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
            Alert.alert('Are you sure?', 'This is your last chance to cancel.', [
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
            ]);
          },
        },
      ]
    );
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

  const getThemeModeLabel = () => {
    if (mode === 'system') return 'System';
    if (mode === 'dark') return 'Dark';
    return 'Light';
  };

  const cycleTheme = () => {
    const modes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
    const currentIndex = modes.indexOf(mode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setMode(modes[nextIndex]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <AnimatedHeader
        scrollY={scrollY}
        title="Settings"
        subtitle="Preferences and data"
        showThemeToggle
      />
      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: HEADER_EXPANDED_HEIGHT }]}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {/* Subscription Card */}
        <View style={styles.section}>
          <Text variant="h3" color="textPrimary" style={styles.sectionTitle}>
            Subscription
          </Text>
          <Card variant="flat" padding="sm" style={styles.groupedCard}>
            {isPremium ? (
              <>
                <SettingsRow
                  icon="checkmark-circle"
                  iconColor="#fff"
                  iconBg={themeColors.success}
                  label="Premium"
                  value={customerInfo?.entitlements.active['premium']?.expirationDate
                    ? `Renews ${format(new Date(customerInfo.entitlements.active['premium'].expirationDate), 'MMM d')}`
                    : 'Active'}
                  onPress={() => Linking.openURL('https://apps.apple.com/account/subscriptions')}
                  themeColors={themeColors}
                  isLast
                />
              </>
            ) : (
              <SettingsRow
                icon="star"
                iconColor="#fff"
                iconBg={themeColors.primary}
                label="Upgrade to Premium"
                value="Unlock all features"
                onPress={() => router.push('/paywall')}
                themeColors={themeColors}
                isLast
              />
            )}
          </Card>
        </View>

        {/* Your Data */}
        <View style={styles.section}>
          <Text variant="h3" color="textPrimary" style={styles.sectionTitle}>
            Your Data
          </Text>
          <View style={styles.statsContainer}>
            <View style={[styles.statBox, { backgroundColor: themeColors.surfaceElevated }]}>
              <Text variant="h2" color="textPrimary">{moodEntries.length}</Text>
              <Text variant="caption" color="textSecondary">Moods</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: themeColors.surfaceElevated }]}>
              <Text variant="h2" color="textPrimary">{journalEntries.length}</Text>
              <Text variant="caption" color="textSecondary">Journals</Text>
            </View>
          </View>
          <Card variant="flat" padding="sm" style={styles.groupedCard}>
            <SettingsRow
              icon="download-outline"
              iconColor="#fff"
              iconBg={themeColors.primary}
              label={isPremium ? 'Export Data' : 'Export Data'}
              value={!isPremium ? 'Premium' : undefined}
              onPress={handleExport}
              themeColors={themeColors}
              isLast
            />
          </Card>
        </View>

        {/* Reminders */}
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
            label="Exercise"
            description="Time for a quick mental exercise"
            icon="fitness-outline"
            config={smartReminders.exercise}
            onToggle={(enabled) => handleReminderToggle('exercise', enabled)}
            onTimeChange={(time) => setReminderTime('exercise', time)}
            onFollowUpToggle={(enabled) => setFollowUpEnabled('exercise', enabled)}
            onFollowUpTimeChange={(time) => setFollowUpTime('exercise', time)}
          />
          <ReminderTypeCard
            label="Journal"
            description="Reflect on your day"
            icon="book-outline"
            config={smartReminders.journal}
            onToggle={(enabled) => handleReminderToggle('journal', enabled)}
            onTimeChange={(time) => setReminderTime('journal', time)}
            onFollowUpToggle={(enabled) => setFollowUpEnabled('journal', enabled)}
            onFollowUpTimeChange={(time) => setFollowUpTime('journal', time)}
          />
          <Card variant="flat" padding="sm" style={styles.groupedCard}>
            <View style={styles.settingsRow}>
              <View style={[styles.settingsIconContainer, { backgroundColor: '#FF9500' }]}>
                <Ionicons name="flame" size={18} color="#fff" />
              </View>
              <View style={styles.settingsContent}>
                <Text variant="body" color="textPrimary" style={styles.settingsLabel}>
                  Streak Motivation
                </Text>
                <Host matchContents>
                  <Switch
                    value={smartReminders.streakNotificationsEnabled}
                    onValueChange={setStreakNotificationsEnabled}
                    label="Streak notifications"
                    variant="switch"
                  />
                </Host>
              </View>
            </View>
          </Card>
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <Text variant="h3" color="textPrimary" style={styles.sectionTitle}>
            Appearance
          </Text>
          <Card variant="flat" padding="sm" style={styles.groupedCard}>
            <SettingsRow
              icon={isDark ? 'moon' : 'sunny'}
              iconColor="#fff"
              iconBg={isDark ? '#5856D6' : '#FF9500'}
              label="Theme"
              value={getThemeModeLabel()}
              onPress={cycleTheme}
              themeColors={themeColors}
              isLast
            />
          </Card>
        </View>

        {/* Privacy & Security */}
        <View style={styles.section}>
          <Text variant="h3" color="textPrimary" style={styles.sectionTitle}>
            Privacy & Security
          </Text>
          <Card variant="flat" padding="sm" style={styles.groupedCard}>
            {biometricAvailable && (
              <View style={[styles.settingsRow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColors.divider }]}>
                <View style={[styles.settingsIconContainer, { backgroundColor: themeColors.success }]}>
                  <Ionicons
                    name={biometricName.toLowerCase().includes('face') ? 'scan' : 'finger-print'}
                    size={18}
                    color="#fff"
                  />
                </View>
                <View style={styles.settingsContent}>
                  <Text variant="body" color="textPrimary" style={styles.settingsLabel}>
                    {biometricName} Lock
                  </Text>
                  <Host matchContents>
                    <Switch
                      value={biometricEnabled}
                      onValueChange={handleBiometricToggle}
                      label={`${biometricName} Lock`}
                      variant="switch"
                    />
                  </Host>
                </View>
              </View>
            )}
            <SettingsRow
              icon="trash-outline"
              iconColor="#fff"
              iconBg={themeColors.error}
              label="Delete All Data"
              onPress={handleDeleteData}
              themeColors={themeColors}
              isLast
            />
          </Card>
        </View>

        {/* Share */}
        <View style={styles.section}>
          <Text variant="h3" color="textPrimary" style={styles.sectionTitle}>
            Share
          </Text>
          <Card variant="flat" padding="sm" style={styles.groupedCard}>
            <SettingsRow
              icon="heart"
              iconColor="#fff"
              iconBg="#FF2D55"
              label="Invite Friends"
              value="Share via SMS"
              onPress={() => setShowContactPicker(true)}
              themeColors={themeColors}
              isLast
            />
          </Card>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text variant="h3" color="textPrimary" style={styles.sectionTitle}>
            Support
          </Text>
          <Card variant="flat" padding="sm" style={styles.groupedCard}>
            <SettingsRow
              icon="mail-outline"
              iconColor="#fff"
              iconBg="#5856D6"
              label="Contact"
              onPress={() => Linking.openURL('mailto:support@getsoftmind.com')}
              themeColors={themeColors}
              isLast
            />
          </Card>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text variant="h3" color="textPrimary" style={styles.sectionTitle}>
            Legal
          </Text>
          <Card variant="flat" padding="sm" style={styles.groupedCard}>
            <SettingsRow
              icon="document-text-outline"
              iconColor="#fff"
              iconBg="#8E8E93"
              label="Privacy Policy"
              onPress={() => Linking.openURL('https://getsoftmind.com/privacy')}
              themeColors={themeColors}
            />
            <SettingsRow
              icon="newspaper-outline"
              iconColor="#fff"
              iconBg="#8E8E93"
              label="Terms of Service"
              onPress={() => Linking.openURL('https://getsoftmind.com/terms')}
              themeColors={themeColors}
              isLast
            />
          </Card>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text variant="h3" color="textPrimary" style={styles.sectionTitle}>
            About
          </Text>
          <Card variant="flat" padding="sm" style={styles.groupedCard}>
            <SettingsRow
              icon="leaf"
              iconColor="#fff"
              iconBg={themeColors.primary}
              label="Softmind"
              value="Version 1.0.0"
              showChevron={false}
              themeColors={themeColors}
              isLast
            />
          </Card>
          <Text variant="caption" color="textMuted" style={styles.footer}>
            Your emotional wellness companion. All data is stored locally on your device and never shared.
          </Text>
        </View>

        <View style={styles.bottomPadding} />
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
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  groupedCard: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    overflow: 'hidden',
  },

  // Settings row styles
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.md,
    minHeight: 48,
  },
  settingsIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingRight: spacing.md,
    marginLeft: spacing.md,
  },
  settingsLabel: {
    flex: 1,
  },
  settingsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  settingsValue: {
    marginRight: spacing.xs,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },

  // Footer
  footer: {
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Bottom padding
  bottomPadding: {
    height: spacing.xxl,
  },
});
