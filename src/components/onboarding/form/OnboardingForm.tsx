import { useState, useCallback, memo } from 'react';
import { View, Pressable, Switch, TextInput, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Text, AnimatedHeader } from '@/src/components/ui';
import { NativeTimePicker } from '@/src/components/ui/NativeDateTimePicker';
import { GoalCard } from '@/src/components/onboarding/GoalCard';
import { GOALS } from '@/src/constants/onboarding';
import { colors, darkColors } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import type { UserGoal } from '@/src/types/settings';

interface ReminderSettings {
  moodEnabled: boolean;
  moodTime: string;
  journalEnabled: boolean;
  journalTime: string;
}

interface OnboardingFormProps {
  onComplete: (data: {
    name: string;
    goals: UserGoal[];
    reminders: ReminderSettings;
  }) => void;
  onBack: () => void;
  title?: string;
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

// iOS-style separator
function Separator({ isDark }: { isDark: boolean }) {
  return (
    <View style={styles.separatorContainer}>
      <View
        style={[
          styles.separator,
          { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' },
        ]}
      />
    </View>
  );
}

interface ReminderRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  enabled: boolean;
  time: string;
  onToggle: (enabled: boolean) => void;
  onTimePress: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

const ReminderRow = memo(function ReminderRow({
  icon,
  title,
  enabled,
  time,
  onToggle,
  onTimePress,
  isFirst,
  isLast,
}: ReminderRowProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;

  const handleToggle = useCallback(
    (value: boolean) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onToggle(value);
    },
    [onToggle]
  );

  return (
    <View
      style={[
        styles.reminderRow,
        {
          backgroundColor: isDark ? themeColors.surfaceElevated : '#FFFFFF',
          borderTopLeftRadius: isFirst ? 12 : 0,
          borderTopRightRadius: isFirst ? 12 : 0,
          borderBottomLeftRadius: isLast && !enabled ? 12 : 0,
          borderBottomRightRadius: isLast && !enabled ? 12 : 0,
        },
      ]}
    >
      <View style={styles.reminderMain}>
        <View
          style={[
            styles.reminderIcon,
            {
              backgroundColor: isDark
                ? 'rgba(123, 163, 147, 0.15)'
                : 'rgba(91, 138, 114, 0.1)',
            },
          ]}
        >
          <Ionicons name={icon} size={20} color={themeColors.primary} />
        </View>
        <Text style={[styles.reminderTitle, { color: themeColors.textPrimary }]}>
          {title}
        </Text>
        <Switch
          value={enabled}
          onValueChange={handleToggle}
          trackColor={{ false: isDark ? '#39393D' : '#E9E9EA', true: themeColors.primary }}
          thumbColor="#FFFFFF"
          ios_backgroundColor={isDark ? '#39393D' : '#E9E9EA'}
        />
      </View>
      {enabled && (
        <Pressable
          onPress={onTimePress}
          style={[
            styles.timeRow,
            {
              borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
              borderBottomLeftRadius: isLast ? 12 : 0,
              borderBottomRightRadius: isLast ? 12 : 0,
            },
          ]}
        >
          <Text style={[styles.timeLabel, { color: themeColors.textSecondary }]}>
            Time
          </Text>
          <View style={styles.timeValue}>
            <Text style={[styles.timeText, { color: themeColors.primary }]}>
              {formatTimeDisplay(time)}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={themeColors.textMuted} />
          </View>
        </Pressable>
      )}
    </View>
  );
});

const HEADER_EXPANDED_HEIGHT = 100;

export function OnboardingForm({ onComplete, onBack, title = 'Personalize' }: OnboardingFormProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const insets = useSafeAreaInsets();

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const [name, setName] = useState('');
  const [goals, setGoals] = useState<UserGoal[]>([]);
  const [reminders, setReminders] = useState<ReminderSettings>({
    moodEnabled: false,
    moodTime: '09:00',
    journalEnabled: false,
    journalTime: '20:00',
  });

  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showJournalPicker, setShowJournalPicker] = useState(false);

  const toggleGoal = useCallback((goalId: UserGoal) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((g) => g !== goalId)
        : [...prev, goalId]
    );
  }, []);

  const handleMoodToggle = useCallback((enabled: boolean) => {
    setReminders((prev) => ({ ...prev, moodEnabled: enabled }));
  }, []);

  const handleJournalToggle = useCallback((enabled: boolean) => {
    setReminders((prev) => ({ ...prev, journalEnabled: enabled }));
  }, []);

  const handleMoodTimeChange = useCallback((date: Date) => {
    setReminders((prev) => ({ ...prev, moodTime: formatTime(date) }));
  }, []);

  const handleJournalTimeChange = useCallback((date: Date) => {
    setReminders((prev) => ({ ...prev, journalTime: formatTime(date) }));
  }, []);

  const hasGoals = goals.length > 0;

  const handleComplete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onComplete({ name: name.trim(), goals, reminders });
  };

  // Background color for grouped sections - match home screen
  const groupBg = isDark ? themeColors.surfaceElevated : themeColors.surface;
  const screenBg = themeColors.background;

  return (
    <View style={[styles.container, { backgroundColor: screenBg }]}>
      <AnimatedHeader
        scrollY={scrollY}
        title={title}
        expandedHeight={HEADER_EXPANDED_HEIGHT}
      />
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: HEADER_EXPANDED_HEIGHT + insets.top },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {/* Name Section */}
        <Animated.View entering={FadeIn.duration(400)}>
          <Text style={[styles.sectionHeader, { color: themeColors.textSecondary }]}>
            YOUR NAME
          </Text>
          <View style={[styles.inputGroup, { backgroundColor: groupBg }]}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Optional"
              placeholderTextColor={themeColors.textMuted}
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={30}
              style={[
                styles.textInput,
                { color: themeColors.textPrimary },
              ]}
            />
          </View>
        </Animated.View>

        {/* Goals Section */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Text style={[styles.sectionHeader, { color: themeColors.textSecondary }]}>
            SELECT YOUR GOALS
          </Text>
          <View style={[styles.group, { backgroundColor: groupBg }]}>
            {GOALS.map((goal, index) => (
              <View key={goal.id}>
                <GoalCard
                  goal={goal}
                  selected={goals.includes(goal.id)}
                  onToggle={() => toggleGoal(goal.id)}
                  isFirst={index === 0}
                  isLast={index === GOALS.length - 1}
                />
                {index < GOALS.length - 1 && <Separator isDark={isDark} />}
              </View>
            ))}
          </View>
          <Text style={[styles.sectionFooter, { color: themeColors.textMuted }]}>
            {hasGoals ? 'Great choices! You can change these later in Settings.' : 'Select goals to personalize your experience, or skip for now.'}
          </Text>
        </Animated.View>

        {/* Reminders Section */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Text style={[styles.sectionHeader, { color: themeColors.textSecondary }]}>
            DAILY REMINDERS
          </Text>
          <View style={[styles.group, { backgroundColor: groupBg }]}>
            <ReminderRow
              icon="sunny-outline"
              title="Morning Check-in"
              enabled={reminders.moodEnabled}
              time={reminders.moodTime}
              onToggle={handleMoodToggle}
              onTimePress={() => setShowMoodPicker(true)}
              isFirst
              isLast={!reminders.moodEnabled && !reminders.journalEnabled}
            />
            {!reminders.moodEnabled && <Separator isDark={isDark} />}
            <ReminderRow
              icon="moon-outline"
              title="Evening Reflection"
              enabled={reminders.journalEnabled}
              time={reminders.journalTime}
              onToggle={handleJournalToggle}
              onTimePress={() => setShowJournalPicker(true)}
              isFirst={false}
              isLast
            />
          </View>
          <Text style={[styles.sectionFooter, { color: themeColors.textMuted }]}>
            Gentle notifications to help you build a consistent practice.
          </Text>
        </Animated.View>
      </Animated.ScrollView>

      {/* Bottom Buttons */}
      <View
        style={[
          styles.bottomButtons,
          {
            backgroundColor: screenBg,
            paddingBottom: Math.max(insets.bottom, 8),
          },
        ]}
      >
        <Pressable
          onPress={handleComplete}
          style={[
            styles.primaryButton,
            { backgroundColor: themeColors.primary },
          ]}
        >
          <Text style={[styles.primaryButtonText, { color: '#FFFFFF' }]}>
            {hasGoals ? 'Continue' : 'Skip for now'}
          </Text>
        </Pressable>
        <Pressable onPress={onBack} style={styles.secondaryButton}>
          <Text style={[styles.secondaryButtonText, { color: themeColors.primary }]}>
            Back
          </Text>
        </Pressable>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 16,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 16,
    marginTop: 20,
  },
  sectionFooter: {
    fontSize: 13,
    letterSpacing: -0.1,
    marginTop: 8,
    marginLeft: 16,
    marginRight: 16,
    lineHeight: 18,
  },
  inputGroup: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  textInput: {
    fontSize: 17,
    paddingVertical: 12,
    paddingHorizontal: 16,
    letterSpacing: -0.4,
  },
  group: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  separatorContainer: {
    paddingLeft: 70,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
  reminderRow: {
    overflow: 'hidden',
  },
  reminderMain: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  reminderIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  reminderTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: -0.4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginLeft: 50,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  timeLabel: {
    fontSize: 17,
    letterSpacing: -0.4,
  },
  timeValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 17,
    letterSpacing: -0.4,
  },
  bottomButtons: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 4,
  },
  primaryButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  secondaryButton: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '500',
    letterSpacing: -0.4,
  },
});
