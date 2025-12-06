import {
  Pressable,
  PressableProps,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Text } from './Text';

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

  const handlePress = async (e: any) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(e);
  };

  const isDisabled = disabled || loading;

  const sizeClass = {
    sm: 'h-9 px-4',
    md: 'h-12 px-6',
    lg: 'h-14 px-8',
  }[size];

  const variantClass = {
    primary: 'bg-primary',
    secondary: isDark
      ? 'bg-surface-dark border-[1.5px] border-primary'
      : 'bg-surface border-[1.5px] border-primary',
    ghost: 'bg-transparent',
    danger: 'bg-error',
  }[variant];

  return (
    <Pressable
      className={`items-center justify-center rounded-md ${sizeClass} ${variantClass} ${fullWidth ? 'w-full' : ''} ${isDisabled ? 'opacity-50' : ''} ${className || ''}`}
      style={style}
      disabled={isDisabled}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#FFFFFF' : '#6B8E8E'}
        />
      ) : (
        <Text
          variant={size === 'sm' ? 'captionMedium' : 'bodyMedium'}
          style={{
            color: variant === 'primary' || variant === 'danger' ? '#FFFFFF' : '#6B8E8E',
            opacity: isDisabled ? 0.7 : 1,
          }}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}
