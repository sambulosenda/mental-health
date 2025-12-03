import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '@/src/constants/theme';

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
    <Animated.View style={[styles.header, headerStyle, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Animated.Text style={[styles.title, titleStyle]}>{title}</Animated.Text>
        {subtitle && (
          <Animated.Text style={[styles.subtitle, subtitleStyle]}>
            {subtitle}
          </Animated.Text>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    zIndex: 100,
    justifyContent: 'flex-end',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    transformOrigin: 'left center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
