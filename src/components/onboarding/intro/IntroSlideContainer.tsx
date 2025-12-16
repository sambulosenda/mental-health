import { PropsWithChildren } from 'react';
import { View, Text, useWindowDimensions, StyleSheet } from 'react-native';
import { colors, darkColors } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';

type Props = {
  title: string;
  description: string;
};

export function IntroSlideContainer({
  title,
  description,
  children,
}: PropsWithChildren<Props>) {
  const { width } = useWindowDimensions();
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;

  return (
    <View style={[styles.container, { width }]}>
      <View style={styles.visualContainer}>{children}</View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: themeColors.textPrimary }]}>
          {title}
        </Text>
        <Text style={[styles.description, { color: themeColors.textSecondary }]}>
          {description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
  },
  visualContainer: {
    flex: 1,
    height: '50%',
  },
  textContainer: {
    height: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.8,
  },
  description: {
    fontSize: 18,
    lineHeight: 26,
    marginTop: 16,
    textAlign: 'center',
    maxWidth: 320,
  },
});
