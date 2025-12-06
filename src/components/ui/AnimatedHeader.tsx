import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, darkColors, spacing, typography } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import { ThemeToggleButton } from './ThemeToggleButton';

interface AnimatedHeaderProps {
  scrollY: SharedValue<number>;
  title: string;
  subtitle?: string;
  collapsedHeight?: number;
  expandedHeight?: number;
  showThemeToggle?: boolean;
}

export function AnimatedHeader({
  scrollY,
  title,
  subtitle,
  collapsedHeight = 60,
  expandedHeight = 120,
  showThemeToggle = false,
}: AnimatedHeaderProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const insets = useSafeAreaInsets();
  const totalCollapsed = collapsedHeight + insets.top;
  const totalExpanded = expandedHeight + insets.top;

  const headerStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, totalExpanded - totalCollapsed],
      [totalExpanded, totalCollapsed],
      Extrapolation.CLAMP
    );
    return { height };
  });

  const scrollDistance = totalExpanded - totalCollapsed;

  const collapsedTitleStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [scrollDistance - 20, scrollDistance],
      [30, 0],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      scrollY.value,
      [scrollDistance - 20, scrollDistance],
      [0, 1],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  const expandedTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, scrollDistance * 0.5],
      [1, 0],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 30], [1, 0], Extrapolation.CLAMP),
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, 30],
          [0, -10],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  const borderStyle = useAnimatedStyle(() => ({
    borderBottomWidth: interpolate(
      scrollY.value,
      [0, 10],
      [0, 0.5],
      Extrapolation.CLAMP
    ),
    borderBottomColor: themeColors.border,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: themeColors.background,
          zIndex: 100,
          paddingTop: insets.top,
        },
        headerStyle,
        borderStyle,
      ]}
    >
      {/* Collapsed title - slides up when scrolled */}
      <View className="absolute left-0 right-0 overflow-hidden" style={{ top: insets.top, height: collapsedHeight }}>
        <View className="flex-1 justify-center px-6">
          <Animated.Text
            style={[
              typography.bodyMedium,
              { color: themeColors.textPrimary, textAlign: 'center' },
              collapsedTitleStyle,
            ]}
          >
            {title}
          </Animated.Text>
        </View>
      </View>

      {/* Expanded title - fades out when scrolling */}
      <View className="flex-1 justify-end px-6 pb-2">
        <Animated.Text
          style={[
            typography.h1,
            { color: themeColors.textPrimary },
            expandedTitleStyle,
          ]}
        >
          {title}
        </Animated.Text>
        {subtitle && (
          <Animated.Text
            style={[
              typography.body,
              { color: themeColors.textSecondary, marginTop: spacing.xs },
              subtitleStyle,
            ]}
          >
            {subtitle}
          </Animated.Text>
        )}
      </View>

      {/* Theme toggle - top right, vertically centered in collapsed header */}
      {showThemeToggle && (
        <View
          className="absolute right-4 justify-center"
          style={{ top: insets.top, height: collapsedHeight, zIndex: 10 }}
        >
          <ThemeToggleButton size="small" />
        </View>
      )}
    </Animated.View>
  );
}
