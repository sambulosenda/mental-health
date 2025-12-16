import {
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
  ActivityIndicator,
  GestureResponderEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors, darkColors, borderRadius } from '@/src/constants/theme';
import { Text } from './Text';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  className?: string;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  children,
  onPress,
  onPressIn,
  onPressOut,
  ...props
}: ButtonProps) {
  const { isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (e: GestureResponderEvent) => {
    scale.value = withSpring(0.97, { damping: 20, stiffness: 400 });
    onPressIn?.(e);
  };

  const handlePressOut = (e: GestureResponderEvent) => {
    scale.value = withSpring(1, { damping: 20, stiffness: 400 });
    onPressOut?.(e);
  };

  const handlePress = async (e: GestureResponderEvent) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(e);
  };

  const isDisabled = disabled || loading;
  const themeColors = isDark ? darkColors : colors;

  // Size configurations with refined proportions
  const sizeConfig = {
    sm: { height: 44, paddingHorizontal: 18, fontSize: 'captionMedium' as const },
    md: { height: 52, paddingHorizontal: 24, fontSize: 'bodyMedium' as const },
    lg: { height: 58, paddingHorizontal: 32, fontSize: 'bodyMedium' as const },
  }[size];

  // Variant styles with refined visuals
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: themeColors.primary,
          shadowColor: themeColors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.4 : 0.25,
          shadowRadius: 12,
          elevation: 4,
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
          shadowOpacity: 0.25,
          shadowRadius: 12,
          elevation: 4,
        };
    }
  };

  const getTextColor = () => {
    if (variant === 'primary' || variant === 'danger') {
      return '#FFFFFF';
    }
    return themeColors.primary;
  };

  return (
    <AnimatedTouchable
      {...props}
      activeOpacity={0.9}
      style={[
        {
          height: sizeConfig.height,
          paddingHorizontal: sizeConfig.paddingHorizontal,
          borderRadius: borderRadius.lg,
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
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={getTextColor()}
        />
      ) : typeof children === 'string' ? (
        <Text
          variant={sizeConfig.fontSize}
          style={{
            color: getTextColor(),
            fontWeight: '600',
            letterSpacing: 0.2,
          }}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </AnimatedTouchable>
  );
}
