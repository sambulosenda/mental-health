import { View, ViewProps, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/src/contexts/ThemeContext';

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

  const paddingClass = {
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  }[padding];

  const variantClass = {
    elevated: isDark
      ? 'bg-surface-dark shadow-md'
      : 'bg-surface shadow-md',
    outlined: isDark
      ? 'bg-surface-dark border border-border-dark'
      : 'bg-surface border border-border',
    flat: isDark
      ? 'bg-surface-dark-elevated'
      : 'bg-surface-elevated',
  }[variant];

  const content = (
    <View
      className={`rounded-lg ${paddingClass} ${variantClass} ${className || ''}`}
      style={style}
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
