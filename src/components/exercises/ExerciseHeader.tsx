import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Text } from '@/src/components/ui';
import { colors, darkColors } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';

interface ExerciseHeaderProps {
  title: string;
  currentStep: number;
  totalSteps: number;
  onClose: () => void;
  onBack?: () => void;
  canGoBack?: boolean;
  accentColor?: string;
}

export function ExerciseHeader({
  title,
  currentStep,
  totalSteps,
  onClose,
  onBack,
  canGoBack,
  accentColor,
}: ExerciseHeaderProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const color = accentColor || themeColors.primary;

  const progress = (currentStep + 1) / totalSteps;

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const handleBack = async () => {
    if (onBack && canGoBack) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onBack();
    }
  };

  const progressStyle = useAnimatedStyle(() => ({
    width: withSpring(`${progress * 100}%`, { damping: 15, stiffness: 100 }),
  }));

  return (
    <View className="px-4 pt-2 pb-4">
      {/* Top row: back, title, close */}
      <View className="flex-row items-center justify-between mb-4">
        <Pressable
          onPress={handleBack}
          disabled={!canGoBack}
          className="w-10 h-10 items-center justify-center"
          style={{ opacity: canGoBack ? 1 : 0.3 }}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={themeColors.textPrimary}
          />
        </Pressable>

        <Text variant="bodyMedium" color="textPrimary">
          {title}
        </Text>

        <Pressable
          onPress={handleClose}
          className="w-10 h-10 items-center justify-center"
        >
          <Ionicons name="close" size={24} color={themeColors.textPrimary} />
        </Pressable>
      </View>

      {/* Progress bar */}
      <View className="flex-row items-center gap-3">
        <View
          className="flex-1 h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: themeColors.border }}
        >
          <Animated.View
            className="h-full rounded-full"
            style={[{ backgroundColor: color }, progressStyle]}
          />
        </View>

        <Text variant="caption" color="textMuted">
          {currentStep + 1}/{totalSteps}
        </Text>
      </View>
    </View>
  );
}
