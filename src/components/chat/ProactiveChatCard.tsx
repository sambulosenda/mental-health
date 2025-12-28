import { memo, useCallback } from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Card, Text } from '@/src/components/ui';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useProactiveTriggerStore } from '@/src/stores';
import { colors, darkColors } from '@/src/constants/theme';
import type { ProactiveTriggerType } from '@/src/lib/insights';

interface ProactiveChatCardProps {
  onPress?: () => void;
}

const TRIGGER_ICONS: Record<ProactiveTriggerType, keyof typeof Ionicons.glyphMap> = {
  struggling: 'heart',
  inactive: 'hand-left',
  tough_day_ahead: 'calendar',
  mood_dip: 'trending-down',
  check_in_after_exercise: 'chatbubble-ellipses',
};

const TRIGGER_COLORS: Record<ProactiveTriggerType, { bg: string; icon: string }> = {
  struggling: { bg: '#EF444420', icon: '#EF4444' },
  inactive: { bg: '#8B5CF620', icon: '#8B5CF6' },
  tough_day_ahead: { bg: '#F5920020', icon: '#F59200' },
  mood_dip: { bg: '#3B82F620', icon: '#3B82F6' },
  check_in_after_exercise: { bg: '#10B98120', icon: '#10B981' },
};

function ProactiveChatCardComponent({ onPress }: ProactiveChatCardProps) {
  const router = useRouter();
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;

  const { activeTriggers, dismissTrigger } = useProactiveTriggerStore();

  // Get the top priority trigger
  const trigger = activeTriggers[0];

  const handlePress = useCallback(() => {
    if (!trigger) return;

    if (onPress) {
      onPress();
    } else {
      // Navigate to chat with context
      // Encode the context as base64 to safely pass in URL
      const encodedContext = encodeURIComponent(trigger.chatContext);
      router.push(`/chat?type=chat&context=${encodedContext}`);
    }
  }, [trigger, onPress, router]);

  const handleDismiss = useCallback(() => {
    if (trigger) {
      dismissTrigger(trigger.id);
    }
  }, [trigger, dismissTrigger]);

  if (!trigger) {
    return null;
  }

  const triggerColors = TRIGGER_COLORS[trigger.type];
  const triggerIcon = TRIGGER_ICONS[trigger.type];

  return (
    <Card className="mb-4 overflow-hidden">
      <View className="flex-row items-start">
        <View
          className="w-10 h-10 rounded-xl items-center justify-center mr-3"
          style={{ backgroundColor: triggerColors.bg }}
        >
          <Ionicons name={triggerIcon} size={20} color={triggerColors.icon} />
        </View>

        <Pressable className="flex-1" onPress={handlePress}>
          <Text variant="bodyMedium" color="textPrimary" className="mb-1">
            {trigger.title}
          </Text>
          <Text variant="caption" color="textSecondary" numberOfLines={2}>
            {trigger.message}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleDismiss}
          className="p-2 -mr-2 -mt-1"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={18} color={themeColors.textMuted} />
        </Pressable>
      </View>

      <Pressable
        onPress={handlePress}
        className="flex-row items-center justify-center mt-4 py-2.5 rounded-xl"
        style={{ backgroundColor: isDark ? `${themeColors.primary}20` : `${themeColors.primary}10` }}
      >
        <Ionicons name="chatbubble-outline" size={16} color={themeColors.primary} />
        <Text
          variant="bodyMedium"
          style={{ color: themeColors.primary, marginLeft: 8 }}
        >
          {"Let's talk"}
        </Text>
      </Pressable>
    </Card>
  );
}

export const ProactiveChatCard = memo(ProactiveChatCardComponent);
