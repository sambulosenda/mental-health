import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const handleEnd = async () => {
    if (!onEnd) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onEnd();
  };

  const title = type === 'checkin' ? 'Quick Check-in' : 'Chat with Zen';
  const subtitle = type === 'checkin' ? 'How are you feeling?' : 'Your wellness companion';

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
  );
}
