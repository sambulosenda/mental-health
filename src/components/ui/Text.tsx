import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { colors, typography } from '@/src/constants/theme';

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
  const textColor = color in colors ? colors[color as keyof typeof colors] : color;

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
