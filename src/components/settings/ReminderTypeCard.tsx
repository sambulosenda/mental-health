import { useState } from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Host, Switch } from '@expo/ui/swift-ui';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { Text, Card, NativeTimePicker } from '@/src/components/ui';
import { colors, darkColors } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import type { ReminderConfig } from '@/src/types/settings';

interface ReminderTypeCardProps {
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  config: ReminderConfig;
  onToggle: (enabled: boolean) => void;
  onTimeChange: (time: string) => void;
  onFollowUpToggle: (enabled: boolean) => void;
  onFollowUpTimeChange: (time: string) => void;
}

export function ReminderTypeCard({
  label,
  description,
  icon,
  config,
  onToggle,
  onTimeChange,
  onFollowUpToggle,
  onFollowUpTimeChange,
}: ReminderTypeCardProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showFollowUpTimePicker, setShowFollowUpTimePicker] = useState(false);

  const parseTimeToDate = (time: string): Date => {
    const [hour, minute] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date;
  };

  const formatDateToTime = (date: Date): string => {
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${hour}:${minute}`;
  };

  const formatTimeDisplay = (time: string): string => {
    const [hour, minute] = time.split(':');
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minute} ${ampm}`;
  };

  return (
    <Card variant="flat" className="mb-2">
      {/* Main toggle row */}
      <View className="flex-row items-center">
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: themeColors.primaryLight }}
        >
          <Ionicons name={icon} size={20} color={themeColors.textInverse} />
        </View>
        <View className="flex-1 mr-3">
          <Text variant="bodyMedium" color="textPrimary">
            {label}
          </Text>
          <Text variant="caption" color="textSecondary">
            {description}
          </Text>
        </View>
        <Host matchContents>
          <Switch
            value={config.enabled}
            onValueChange={onToggle}
            label={label}
            variant="switch"
          />
        </Host>
      </View>

      {/* Expanded options when enabled */}
      {config.enabled && (
        <Animated.View
          entering={FadeInDown.duration(200)}
          exiting={FadeOutUp.duration(200)}
          className="mt-3 pt-3"
        >
          {/* Time selector */}
          <Pressable
            className="flex-row items-center justify-between py-1"
            onPress={() => setShowTimePicker(true)}
          >
            <Text variant="caption" color="textSecondary">
              Reminder Time
            </Text>
            <View className="flex-row items-center gap-1">
              <Text variant="bodyMedium" color="primary">
                {formatTimeDisplay(config.time)}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={themeColors.textMuted}
              />
            </View>
          </Pressable>

          {/* Follow-up toggle */}
          <View className="flex-row items-center justify-between py-2">
            <View className="flex-1 mr-3">
              <Text variant="caption" color="textSecondary">
                Gentle follow-up if missed
              </Text>
            </View>
            <Host matchContents>
              <Switch
                value={config.followUpEnabled}
                onValueChange={onFollowUpToggle}
                label="Follow-up"
                variant="switch"
              />
            </Host>
          </View>

          {/* Follow-up time selector */}
          {config.followUpEnabled && (
            <Animated.View entering={FadeInDown.duration(200)}>
              <Pressable
                className="flex-row items-center justify-between py-1"
                onPress={() => setShowFollowUpTimePicker(true)}
              >
                <Text variant="caption" color="textSecondary">
                  Follow-up Time
                </Text>
                <View className="flex-row items-center gap-1">
                  <Text variant="bodyMedium" color="primary">
                    {formatTimeDisplay(config.followUpTime)}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={themeColors.textMuted}
                  />
                </View>
              </Pressable>
            </Animated.View>
          )}
        </Animated.View>
      )}

      {/* Time pickers */}
      <NativeTimePicker
        value={parseTimeToDate(config.time)}
        onChange={(date) => onTimeChange(formatDateToTime(date))}
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
      />
      <NativeTimePicker
        value={parseTimeToDate(config.followUpTime)}
        onChange={(date) => onFollowUpTimeChange(formatDateToTime(date))}
        visible={showFollowUpTimePicker}
        onClose={() => setShowFollowUpTimePicker(false)}
      />
    </Card>
  );
}
