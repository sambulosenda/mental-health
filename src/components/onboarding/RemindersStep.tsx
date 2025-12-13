import { useState, memo, useCallback } from 'react';
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

interface ReminderCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  subtitle: string;
  enabled: boolean;
  time: string;
  onToggle: (enabled: boolean) => void;
  onTimePress: () => void;
}

const ReminderCard = memo(function ReminderCard({
  icon,
  iconColor,
  title,
  subtitle,
  enabled,
  time,
  onToggle,
  onTimePress,
}: ReminderCardProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;

  const handleToggle = useCallback((value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle(value);
  }, [onToggle]);

  return (
    <View
      className="rounded-2xl p-4"
      style={{ backgroundColor: themeColors.surfaceElevated }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-3">
          <View
            className="w-10 h-10 rounded-full justify-center items-center"
            style={{ backgroundColor: iconColor }}
          >
            <Ionicons name={icon} size={20} color={themeColors.textPrimary} />
          </View>
          <View>
            <Text variant="bodyMedium" color="textPrimary">
              {title}
            </Text>
            <Text variant="caption" color="textSecondary">
              {subtitle}
            </Text>
          </View>
        </View>
        <Switch
          value={enabled}
          onValueChange={handleToggle}
          trackColor={{ false: themeColors.border, true: themeColors.primary }}
          thumbColor="#FFFFFF"
        />
      </View>
      {enabled && (
        <Pressable
          onPress={onTimePress}
          className="flex-row items-center justify-between py-2 px-3 rounded-lg"
          style={{ backgroundColor: themeColors.background }}
        >
          <Text variant="body" color="textSecondary">
            Remind me at
          </Text>
          <Text variant="bodyMedium" color="textPrimary">
            {formatTimeDisplay(time)}
          </Text>
        </Pressable>
      )}
    </View>
  );
});

export function RemindersStep({
  reminders,
  onRemindersChange,
  onNext,
  onBack,
}: RemindersStepProps) {
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showJournalPicker, setShowJournalPicker] = useState(false);

  const handleMoodToggle = useCallback((enabled: boolean) => {
    onRemindersChange({ ...reminders, moodEnabled: enabled });
  }, [reminders, onRemindersChange]);

  const handleJournalToggle = useCallback((enabled: boolean) => {
    onRemindersChange({ ...reminders, journalEnabled: enabled });
  }, [reminders, onRemindersChange]);

  const handleMoodTimeChange = useCallback((date: Date) => {
    onRemindersChange({ ...reminders, moodTime: formatTime(date) });
  }, [reminders, onRemindersChange]);

  const handleJournalTimeChange = useCallback((date: Date) => {
    onRemindersChange({ ...reminders, journalTime: formatTime(date) });
  }, [reminders, onRemindersChange]);

  const openMoodPicker = useCallback(() => setShowMoodPicker(true), []);
  const closeMoodPicker = useCallback(() => setShowMoodPicker(false), []);
  const openJournalPicker = useCallback(() => setShowJournalPicker(true), []);
  const closeJournalPicker = useCallback(() => setShowJournalPicker(false), []);

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
          <ReminderCard
            icon="happy-outline"
            iconColor={colors.mood[3]}
            title="Mood Check-in"
            subtitle="Track how you feel"
            enabled={reminders.moodEnabled}
            time={reminders.moodTime}
            onToggle={handleMoodToggle}
            onTimePress={openMoodPicker}
          />
          <ReminderCard
            icon="book-outline"
            iconColor={colors.mood[4]}
            title="Evening Journal"
            subtitle="Reflect on your day"
            enabled={reminders.journalEnabled}
            time={reminders.journalTime}
            onToggle={handleJournalToggle}
            onTimePress={openJournalPicker}
          />
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
        onClose={closeMoodPicker}
      />

      <NativeTimePicker
        value={parseTime(reminders.journalTime)}
        onChange={handleJournalTimeChange}
        visible={showJournalPicker}
        onClose={closeJournalPicker}
      />
    </View>
  );
}
