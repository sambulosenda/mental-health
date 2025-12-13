import {
  Pressable,
  PressableProps,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors, darkColors, borderRadius } from '@/src/constants/theme';
import { Text } from './Text';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  className?: string;
  children: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  className,
  children,
  onPress,
  ...props
}: ButtonProps) {
  const { isDark } = useTheme();
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(pressed.value, [0, 1], [1, 0.97]);
    const opacity = interpolate(pressed.value, [0, 1], [1, 0.9]);
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const handlePressIn = () => {
    pressed.value = withSpring(1, { damping: 20, stiffness: 400 });
  };

  const handlePressOut = () => {
    pressed.value = withSpring(0, { damping: 20, stiffness: 400 });
  };

  const handlePress = async (e: any) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(e);
  };

  const isDisabled = disabled || loading;
  const themeColors = isDark ? darkColors : colors;

  // Size configurations with refined proportions
  const sizeConfig = {
    sm: { height: 40, paddingHorizontal: 16, fontSize: 'captionMedium' as const },
    md: { height: 48, paddingHorizontal: 20, fontSize: 'bodyMedium' as const },
    lg: { height: 56, paddingHorizontal: 28, fontSize: 'bodyMedium' as const },
  }[size];

  // Variant styles with refined visuals
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: themeColors.primary,
          // Subtle shadow for depth
          shadowColor: themeColors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.3 : 0.2,
          shadowRadius: 8,
          elevation: 3,
        };
      case 'secondary':
        return {
          backgroundColor: isDark ? themeColors.surface : themeColors.surfaceElevated,
          borderWidth: 1.5,
          borderColor: isDark ? themeColors.primary : `${colors.primary}40`,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
        };
      case 'danger':
        return {
          backgroundColor: themeColors.error,
          shadowColor: themeColors.error,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 3,
        };
    }
  };

  const getTextColor = () => {
    if (variant === 'primary' || variant === 'danger') {
      return themeColors.textInverse;
    }
    return themeColors.primary;
  };

  return (
    <AnimatedPressable
      style={[
        {
          height: sizeConfig.height,
          paddingHorizontal: sizeConfig.paddingHorizontal,
          borderRadius: borderRadius.md,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isDisabled ? 0.5 : 1,
          ...(fullWidth && { width: '100%' }),
        },
        getVariantStyles(),
        animatedStyle,
        style,
      ]}
      disabled={isDisabled}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={getTextColor()}
        />
      ) : (
        <Text
          variant={sizeConfig.fontSize}
          style={{
            color: getTextColor(),
            letterSpacing: 0.3,
          }}
        >
          {children}
        </Text>
      )}
    </AnimatedPressable>
  );
}
