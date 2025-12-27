import { View, ViewProps, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors, darkColors, spacing, borderRadius, pressAnimation } from '@/src/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
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
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(pressed.value, [0, 1], [1, pressAnimation.scale]);
    return {
      transform: [{ scale: scaleValue }],
    };
  });

  const handlePressIn = () => {
    pressed.value = withSpring(1, pressAnimation.springConfig);
  };

  const handlePressOut = () => {
    pressed.value = withSpring(0, pressAnimation.springConfig);
  };

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const paddingValue = {
    none: 0,
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.lg,
  }[padding];

  // Refined iOS-style shadows
  const getShadowStyle = () => {
    if (isDark) {
      // Subtle inner glow effect for dark mode
      return {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 2,
      };
    }
    // Refined multi-layer shadow for light mode (iOS style)
    return {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    };
  };

  const getVariantStyle = () => {
    const baseStyle = {
      backgroundColor: themeColors.surfaceElevated,
    };

    switch (variant) {
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: isDark ? themeColors.border : 'rgba(0,0,0,0.06)',
        };
      case 'elevated':
        return {
          ...baseStyle,
          ...getShadowStyle(),
        };
      case 'flat':
      default:
        return baseStyle;
    }
  };

  const content = (
    <View
      className={className}
      style={[
        {
          borderRadius: borderRadius.lg,
          padding: paddingValue,
          // Add subtle border for definition in light mode
          ...(variant !== 'outlined' && !isDark && {
            borderWidth: 0.5,
            borderColor: 'rgba(0,0,0,0.04)',
          }),
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
