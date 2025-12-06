import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { colors, darkColors, typography } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';

type TextVariant = keyof typeof typography;

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: keyof typeof colors | string;
  center?: boolean;
}

export function Text({
  variant = 'body',
  color = 'textPrimary',
  center,
  style,
  children,
  ...props
}: TextProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;

  const textColor = color in themeColors ? themeColors[color as keyof typeof themeColors] : color;

  return (
    <RNText
      style={[
        typography[variant],
        { color: textColor as string },
        center && styles.center,
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  center: {
    textAlign: 'center',
  },
});
