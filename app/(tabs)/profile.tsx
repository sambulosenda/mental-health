import { useEffect, useState } from 'react';
import { View, Alert, Modal, Linking, Pressable } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Host, Switch } from '@expo/ui/swift-ui';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { Text, Card, AnimatedHeader, SegmentedControl } from '@/src/components/ui';
import { ReminderTypeCard } from '@/src/components/settings';
import { BadgeGrid } from '@/src/components/gamification';
import { useSettingsStore, useMoodStore, useJournalStore, useSubscriptionStore } from '@/src/stores';
import { useGamificationStore } from '@/src/stores/useGamificationStore';
import { requestNotificationPermissions } from '@/src/lib/notifications';
import {
  checkBiometricAvailability,
  getBiometricDisplayName,
  authenticate,
} from '@/src/lib/biometrics';
import { exportMoodToCSV, exportAllData } from '@/src/lib/export';
import { sendSMSInvites } from '@/src/lib/share';
import { ContactPicker } from '@/src/components/share/ContactPicker';
import { colors, darkColors } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';

const HEADER_EXPANDED_HEIGHT = 110;

type ThemeColors = typeof colors | typeof darkColors;

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
    <View className="flex-row items-center pl-3 min-h-[48px]">
      <View
        className="w-[30px] h-[30px] rounded-[7px] items-center justify-center"
        style={{ backgroundColor: iconBg }}
      >
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View
        className="flex-1 flex-row items-center justify-between py-2 pr-3 ml-3"
        style={!isLast ? { borderBottomWidth: 0.5, borderBottomColor: themeColors.divider } : undefined}
      >
        <Text variant="body" color="textPrimary" className="flex-1">
          {label}
        </Text>
        <View className="flex-row items-center gap-1">
          {value && (
            <Text variant="body" color="textSecondary" className="mr-1">
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
  const { streaks, earnedBadges, loadGamificationData } = useGamificationStore();
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
    loadGamificationData();
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


  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`}
      edges={['top']}
    >
      <AnimatedHeader
        scrollY={scrollY}
        title="Settings"
        subtitle="Preferences and data"
        showThemeToggle
      />
      <Animated.ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: HEADER_EXPANDED_HEIGHT, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {/* SECTION 1: Account */}
        <View className="mb-4">
          <Text variant="h3" color="textPrimary" className="mb-3">
            Account
          </Text>
          <Card variant="flat" padding="none" className="overflow-hidden">
            {isPremium ? (
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
            ) : (
              <SettingsRow
                icon="star"
                iconColor="#fff"
                iconBg={themeColors.primary}
                label="Go Premium"
                value="Unlock all features"
                onPress={() => router.push('/paywall')}
                themeColors={themeColors}
                isLast
              />
            )}
          </Card>
        </View>

        {/* SECTION 2: Reminders */}
        <View className="mb-4">
          <Text variant="h3" color="textPrimary" className="mb-3">
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
          <Card variant="flat" padding="none" className="overflow-hidden">
            <View className="flex-row items-center pl-3 min-h-[48px]">
              <View className="w-[30px] h-[30px] rounded-[7px] items-center justify-center bg-orange-500">
                <Ionicons name="flame" size={18} color="#fff" />
              </View>
              <View className="flex-1 flex-row items-center justify-between py-2 pr-3 ml-3">
                <Text variant="body" color="textPrimary" className="flex-1">
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

        {/* SECTION 4: Preferences */}
        <View className="mb-4">
          <Text variant="h3" color="textPrimary" className="mb-3">
            Preferences
          </Text>
          <Card variant="flat" padding="none" className="overflow-hidden">
            {/* Theme selector */}
            <View className="flex-row items-center pl-3 min-h-[48px]">
              <View
                className="w-[30px] h-[30px] rounded-[7px] items-center justify-center"
                style={{ backgroundColor: isDark ? '#5856D6' : '#FF9500' }}
              >
                <Ionicons name={isDark ? 'moon' : 'sunny'} size={18} color="#fff" />
              </View>
              <View
                className="flex-1 flex-row items-center justify-between py-2 pr-3 ml-3"
                style={biometricAvailable ? { borderBottomWidth: 0.5, borderBottomColor: themeColors.divider } : undefined}
              >
                <Text variant="body" color="textPrimary">
                  Theme
                </Text>
                <SegmentedControl
                  value={mode}
                  onValueChange={(v) => setMode(v as 'light' | 'dark' | 'system')}
                  className="rounded-lg p-0.5"
                  style={{ backgroundColor: isDark ? themeColors.surface : themeColors.divider }}
                >
                  <SegmentedControl.Indicator className="rounded-md" style={{ backgroundColor: themeColors.surfaceElevated }} />
                  <SegmentedControl.Item value="light" className="px-2.5 py-1 z-10">
                    <Text variant="caption" style={{ color: mode === 'light' ? themeColors.textPrimary : themeColors.textMuted }}>
                      Light
                    </Text>
                  </SegmentedControl.Item>
                  <SegmentedControl.Item value="dark" className="px-2.5 py-1 z-10">
                    <Text variant="caption" style={{ color: mode === 'dark' ? themeColors.textPrimary : themeColors.textMuted }}>
                      Dark
                    </Text>
                  </SegmentedControl.Item>
                  <SegmentedControl.Item value="system" className="px-2.5 py-1 z-10">
                    <Text variant="caption" style={{ color: mode === 'system' ? themeColors.textPrimary : themeColors.textMuted }}>
                      Auto
                    </Text>
                  </SegmentedControl.Item>
                </SegmentedControl>
              </View>
            </View>
            {biometricAvailable && (
              <View className="flex-row items-center pl-3 min-h-[48px]">
                <View
                  className="w-[30px] h-[30px] rounded-[7px] items-center justify-center"
                  style={{ backgroundColor: themeColors.success }}
                >
                  <Ionicons
                    name={biometricName.toLowerCase().includes('face') ? 'scan' : 'finger-print'}
                    size={18}
                    color="#fff"
                  />
                </View>
                <View className="flex-1 flex-row items-center justify-between py-2 pr-3 ml-3">
                  <Text variant="body" color="textPrimary" className="flex-1">
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
          </Card>
        </View>

        {/* SECTION 5: Data & Privacy */}
        <View className="mb-4">
          <Text variant="h3" color="textPrimary" className="mb-3">
            Data & Privacy
          </Text>
          <Card variant="flat" padding="none" className="overflow-hidden">
            <SettingsRow
              icon="download-outline"
              iconColor="#fff"
              iconBg={themeColors.primary}
              label="Export Data"
              value={!isPremium ? 'Premium' : undefined}
              onPress={handleExport}
              themeColors={themeColors}
              isLast
            />
          </Card>
          {/* Delete Data - separate card with warning styling */}
          <Pressable
            onPress={handleDeleteData}
            className="mt-3 rounded-xl p-4 flex-row items-center justify-center"
            style={{ backgroundColor: `${themeColors.error}10` }}
          >
            <Ionicons name="trash-outline" size={18} color={themeColors.error} />
            <Text variant="body" style={{ color: themeColors.error, marginLeft: 8 }}>
              Delete All Data
            </Text>
          </Pressable>
        </View>

        {/* SECTION 6: About */}
        <View className="mb-4">
          <Text variant="h3" color="textPrimary" className="mb-3">
            About
          </Text>
          <Card variant="flat" padding="none" className="overflow-hidden">
            <SettingsRow
              icon="heart"
              iconColor="#fff"
              iconBg="#FF2D55"
              label="Invite Friends"
              onPress={() => setShowContactPicker(true)}
              themeColors={themeColors}
            />
            <SettingsRow
              icon="mail-outline"
              iconColor="#fff"
              iconBg="#5856D6"
              label="Contact Support"
              onPress={() => Linking.openURL('mailto:support@getsoftmind.com')}
              themeColors={themeColors}
            />
            <SettingsRow
              icon="book"
              iconColor="#fff"
              iconBg="#10B981"
              label="Research & Sources"
              onPress={() => router.push('/(modals)/sources' as any)}
              themeColors={themeColors}
            />
            <SettingsRow
              icon="information-circle-outline"
              iconColor="#fff"
              iconBg={themeColors.warning}
              label="Wellness Disclaimer"
              onPress={() => router.push('/(modals)/sources' as any)}
              themeColors={themeColors}
            />
            <SettingsRow
              icon="document-text-outline"
              iconColor="#fff"
              iconBg="#8E8E93"
              label="Privacy Policy"
              onPress={() => WebBrowser.openBrowserAsync('https://getsoftmind.com/privacy')}
              themeColors={themeColors}
            />
            <SettingsRow
              icon="newspaper-outline"
              iconColor="#fff"
              iconBg="#8E8E93"
              label="Terms of Use"
              onPress={() => WebBrowser.openBrowserAsync('https://getsoftmind.com/terms')}
              themeColors={themeColors}
            />
            <SettingsRow
              icon="leaf"
              iconColor="#fff"
              iconBg={themeColors.primary}
              label="Softmind"
              value={`v${Constants.expoConfig?.version ?? '1.0.0'}`}
              showChevron={false}
              themeColors={themeColors}
              isLast
            />
          </Card>
          <Text variant="caption" color="textMuted" className="mt-3 mx-3 text-center">
            All data is stored locally on your device.
          </Text>
        </View>

        <View className="h-8" />
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
