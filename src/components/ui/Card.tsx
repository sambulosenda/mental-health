import { View, ViewProps, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors, darkColors, spacing, borderRadius } from '@/src/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: 'sm' | 'md' | 'lg';
  onPress?: () => void;
}

export function Card({
  variant = 'elevated',
  padding = 'md',
  onPress,
  style,
  className,
  children,
  ...props
}: CardProps & { className?: string }) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const paddingValue = {
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.lg,
  }[padding];

  const getVariantStyle = () => {
    switch (variant) {
      case 'elevated':
      case 'outlined':
      case 'flat':
      default:
        return {
          backgroundColor: themeColors.surfaceElevated,
        };
    }
  };

  const content = (
    <View
      className={className}
      style={[
        {
          borderRadius: borderRadius.md,
          padding: paddingValue,
        },
        getVariantStyle(),
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={animatedStyle}
        accessibilityRole="button"
      >
        {content}
      </AnimatedPressable>
    );
  }

  return content;
}
