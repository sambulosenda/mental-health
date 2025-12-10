import { useState } from 'react';
import { View, Pressable, Switch } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Text, Button } from '@/src/components/ui';
import { NativeTimePicker } from '@/src/components/ui/NativeDateTimePicker';
import { colors, darkColors } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';

interface ReminderSettings {
  moodEnabled: boolean;
  moodTime: string;
  journalEnabled: boolean;
  journalTime: string;
}

interface RemindersStepProps {
  reminders: ReminderSettings;
  onRemindersChange: (reminders: ReminderSettings) => void;
  onNext: () => void;
  onBack: () => void;
}

function parseTime(time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function formatTimeDisplay(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
}

export function RemindersStep({
  reminders,
  onRemindersChange,
  onNext,
  onBack,
}: RemindersStepProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showJournalPicker, setShowJournalPicker] = useState(false);

  const handleMoodToggle = (enabled: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRemindersChange({ ...reminders, moodEnabled: enabled });
  };

  const handleJournalToggle = (enabled: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRemindersChange({ ...reminders, journalEnabled: enabled });
  };

  const handleMoodTimeChange = (date: Date) => {
    onRemindersChange({ ...reminders, moodTime: formatTime(date) });
  };

  const handleJournalTimeChange = (date: Date) => {
    onRemindersChange({ ...reminders, journalTime: formatTime(date) });
  };

  return (
    <View className="flex-1">
      <View className="flex-1 px-8 pt-4">
        <Animated.View entering={FadeIn.duration(400)}>
          <Text variant="h1" color="textPrimary" center className="mb-3">
            Set your reminders
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(400)}>
          <Text
            variant="body"
            color="textSecondary"
            center
            className="mb-8"
          >
            Gentle nudges to help you stay consistent
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(350).duration(400)}
          className="gap-4"
        >
          {/* Mood Reminder */}
          <View
            className="rounded-2xl p-4"
            style={{ backgroundColor: themeColors.surfaceElevated }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-3">
                <View
                  className="w-10 h-10 rounded-full justify-center items-center"
                  style={{ backgroundColor: colors.mood[3] }}
                >
                  <Ionicons name="happy-outline" size={20} color={themeColors.textPrimary} />
                </View>
                <View>
                  <Text variant="bodyMedium" color="textPrimary">
                    Mood Check-in
                  </Text>
                  <Text variant="caption" color="textSecondary">
                    Track how you feel
                  </Text>
                </View>
              </View>
              <Switch
                value={reminders.moodEnabled}
                onValueChange={handleMoodToggle}
                trackColor={{ false: themeColors.border, true: themeColors.primary }}
                thumbColor="#FFFFFF"
                accessibilityLabel="Enable mood check-in reminder"
                accessibilityRole="switch"
              />
            </View>
            {reminders.moodEnabled && (
              <Pressable
                onPress={() => setShowMoodPicker(true)}
                className="flex-row items-center justify-between py-2 px-3 rounded-lg"
                style={{ backgroundColor: themeColors.background }}
              >
                <Text variant="body" color="textSecondary">
                  Remind me at
                </Text>
                <Text variant="bodyMedium" color="primary">
                  {formatTimeDisplay(reminders.moodTime)}
                </Text>
              </Pressable>
            )}
          </View>

          {/* Journal Reminder */}
          <View
            className="rounded-2xl p-4"
            style={{ backgroundColor: themeColors.surfaceElevated }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-3">
                <View
                  className="w-10 h-10 rounded-full justify-center items-center"
                  style={{ backgroundColor: colors.mood[4] }}
                >
                  <Ionicons name="book-outline" size={20} color={themeColors.textPrimary} />
                </View>
                <View>
                  <Text variant="bodyMedium" color="textPrimary">
                    Evening Journal
                  </Text>
                  <Text variant="caption" color="textSecondary">
                    Reflect on your day
                  </Text>
                </View>
              </View>
              <Switch
                value={reminders.journalEnabled}
                onValueChange={handleJournalToggle}
                trackColor={{ false: themeColors.border, true: themeColors.primary }}
                thumbColor="#FFFFFF"
                accessibilityLabel="Enable evening journal reminder"
                accessibilityRole="switch"
              />
            </View>
            {reminders.journalEnabled && (
              <Pressable
                onPress={() => setShowJournalPicker(true)}
                className="flex-row items-center justify-between py-2 px-3 rounded-lg"
                style={{ backgroundColor: themeColors.background }}
              >
                <Text variant="body" color="textSecondary">
                  Remind me at
                </Text>
                <Text variant="bodyMedium" color="primary">
                  {formatTimeDisplay(reminders.journalTime)}
                </Text>
              </Pressable>
            )}
          </View>
        </Animated.View>
      </View>

      <View className="px-8 pb-8 gap-3">
        <Button onPress={onNext} fullWidth>
          Continue
        </Button>
        <Button variant="ghost" onPress={onBack} fullWidth>
          Back
        </Button>
      </View>

      <NativeTimePicker
        value={parseTime(reminders.moodTime)}
        onChange={handleMoodTimeChange}
        visible={showMoodPicker}
        onClose={() => setShowMoodPicker(false)}
      />

      <NativeTimePicker
        value={parseTime(reminders.journalTime)}
        onChange={handleJournalTimeChange}
        visible={showJournalPicker}
        onClose={() => setShowJournalPicker(false)}
      />
    </View>
  );
}
