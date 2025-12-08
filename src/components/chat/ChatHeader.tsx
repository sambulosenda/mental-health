import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '@/src/components/ui';
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors, darkColors, spacing } from '@/src/constants/theme';
import type { ConversationType } from '@/src/types/chat';

interface ChatHeaderProps {
  type: ConversationType;
  onClose: () => void;
  onEnd?: () => void;
}

export function ChatHeader({ type, onClose, onEnd }: ChatHeaderProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const handleEnd = async () => {
    if (!onEnd) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onEnd();
  };

  const handleCrisisPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/crisis');
  };

  const title = type === 'checkin' ? '2-min Check-in' : 'Talk it out';
  const subtitle = type === 'checkin' ? 'Quick mood check' : 'I\'m here to listen';

  return (
    <View
      style={{
        paddingTop: insets.top + spacing.sm,
        paddingBottom: spacing.md,
        paddingHorizontal: spacing.md,
        backgroundColor: themeColors.surface,
        borderBottomWidth: 1,
        borderBottomColor: themeColors.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Pressable
        onPress={handleClose}
        hitSlop={8}
        accessibilityLabel="Close chat"
        accessibilityRole="button"
      >
        <Ionicons name="close" size={28} color={themeColors.textSecondary} />
      </Pressable>

      <View className="flex-1 items-center mx-4">
        <Text variant="bodyMedium" color="textPrimary">
          {title}
        </Text>
        <Text variant="caption" color="textMuted">
          {subtitle}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Pressable
          onPress={handleCrisisPress}
          hitSlop={8}
          accessibilityLabel="Crisis support resources"
          accessibilityRole="button"
        >
          <Ionicons name="heart-outline" size={22} color={themeColors.textMuted} />
        </Pressable>

        {onEnd ? (
          <Pressable
            onPress={handleEnd}
            hitSlop={8}
            accessibilityLabel="End conversation"
            accessibilityRole="button"
          >
            <Ionicons name="checkmark-done" size={24} color={themeColors.primary} />
          </Pressable>
        ) : (
          <View style={{ width: 28 }} />
        )}
      </View>
    </View>
  );
}
