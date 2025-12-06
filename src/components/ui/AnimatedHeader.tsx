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

interface AnimatedHeaderProps {
  scrollY: SharedValue<number>;
  title: string;
  subtitle?: string;
  collapsedHeight?: number;
  expandedHeight?: number;
}

export function AnimatedHeader({
  scrollY,
  title,
  subtitle,
  collapsedHeight = 60,
  expandedHeight = 120,
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

  const titleStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [0, 50],
      [1, 0.85],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      scrollY.value,
      [0, 50],
      [0, -8],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ scale }, { translateY }],
    };
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
          justifyContent: 'flex-end',
          paddingTop: insets.top,
        },
        headerStyle,
      ]}
    >
      <View className="px-6 pb-2">
        <Animated.Text
          style={[
            typography.h1,
            { color: themeColors.textPrimary, transformOrigin: 'left center' },
            titleStyle,
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
    </Animated.View>
  );
}
