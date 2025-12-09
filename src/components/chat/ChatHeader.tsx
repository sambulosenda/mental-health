import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
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

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const handleEnd = async () => {
    if (!onEnd) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onEnd();
  };

  const title = type === 'checkin' ? 'Check-in' : 'Chat';

  return (
    <View
      style={{
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 0.5,
        borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      }}
    >
      {/* Left - Close button */}
      <Pressable
        onPress={handleClose}
        hitSlop={12}
        style={({ pressed }) => ({
          opacity: pressed ? 0.6 : 1,
          padding: 4,
        })}
        accessibilityLabel="Close"
        accessibilityRole="button"
      >
        <Ionicons
          name="chevron-down"
          size={28}
          color={themeColors.textSecondary}
        />
      </Pressable>

      {/* Center - Title */}
      <Text
        variant="bodyMedium"
        color="textPrimary"
        style={{ letterSpacing: -0.3 }}
      >
        {title}
      </Text>

      {/* Right - Done button */}
      {onEnd ? (
        <Pressable
          onPress={handleEnd}
          hitSlop={12}
          style={({ pressed }) => ({
            opacity: pressed ? 0.6 : 1,
            paddingVertical: 6,
            paddingHorizontal: 12,
            backgroundColor: themeColors.primary,
            borderRadius: 16,
          })}
          accessibilityLabel="Done"
          accessibilityRole="button"
        >
          <Text
            variant="captionMedium"
            style={{ color: themeColors.textInverse }}
          >
            Done
          </Text>
        </Pressable>
      ) : (
        <View style={{ width: 60 }} />
      )}
    </View>
  );
}
