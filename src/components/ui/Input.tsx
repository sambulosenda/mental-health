import {
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { useState } from 'react';
import { typography, colors, darkColors } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Text } from './Text';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  className?: string;
}

export function Input({
  label,
  error,
  helper,
  style,
  className,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const baseClass = isDark
    ? 'bg-surface-dark-elevated border-border-dark'
    : 'bg-surface-elevated border-border';

  const focusedClass = isFocused
    ? isDark
      ? 'border-primary bg-surface-dark'
      : 'border-primary bg-surface'
    : '';

  const errorClass = error ? 'border-error' : '';

  return (
    <View className={`w-full ${className || ''}`}>
      {label && (
        <Text variant="captionMedium" color="textSecondary" className="mb-1">
          {label}
        </Text>
      )}
      <TextInput
        className={`rounded-md border-[1.5px] px-4 py-3 ${baseClass} ${focusedClass} ${errorClass}`}
        style={[
          typography.body,
          { color: themeColors.textPrimary },
          style,
        ]}
        placeholderTextColor={themeColors.textMuted}
        onFocus={handleFocus}
        onBlur={handleBlur}
        accessibilityLabel={label}
        {...props}
      />
      {(error || helper) && (
        <Text
          variant="caption"
          color={error ? 'error' : 'textMuted'}
          className="mt-1"
        >
          {error || helper}
        </Text>
      )}
    </View>
  );
}
