import { View, Pressable } from 'react-native';
import { ReactNode } from 'react';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, darkColors, typography } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import { ThemeToggleButton } from './ThemeToggleButton';

interface AnimatedHeaderProps {
  scrollY: SharedValue<number>;
  title: string;
  subtitle?: string;
  collapsedHeight?: number;
  expandedHeight?: number;
  showThemeToggle?: boolean;
  rightAction?: ReactNode | {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
  };
}

export function AnimatedHeader({
  scrollY,
  title,
  subtitle,
  collapsedHeight = 56,
  expandedHeight = 110,
  showThemeToggle = false,
  rightAction,
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
      [scrollDistance - 15, scrollDistance],
      [20, 0],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      scrollY.value,
      [scrollDistance - 15, scrollDistance],
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
      [0, scrollDistance * 0.4],
      [1, 0],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      scrollY.value,
      [0, scrollDistance * 0.4],
      [0, -8],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 25], [1, 0], Extrapolation.CLAMP),
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, 25],
          [0, -6],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  const borderOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [scrollDistance - 10, scrollDistance],
      [0, 1],
      Extrapolation.CLAMP
    ),
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
      ]}
    >
      {/* Subtle bottom border that fades in */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 0.5,
            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          },
          borderOpacity,
        ]}
      />

      {/* Collapsed title - slides up when scrolled */}
      <View className="absolute left-0 right-0 overflow-hidden" style={{ top: insets.top, height: collapsedHeight }}>
        <View className="flex-1 justify-center px-6">
          <Animated.Text
            style={[
              {
                ...typography.bodyMedium,
                fontWeight: '600',
                color: themeColors.textPrimary,
                textAlign: 'center',
              },
              collapsedTitleStyle,
            ]}
          >
            {title}
          </Animated.Text>
        </View>
      </View>

      {/* Expanded title - fades out when scrolling */}
      <View className="flex-1 justify-end px-6 pb-3">
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
              {
                ...typography.caption,
                color: themeColors.textSecondary,
                marginTop: 4,
              },
              subtitleStyle,
            ]}
          >
            {subtitle}
          </Animated.Text>
        )}
      </View>

      {/* Right actions - top right, vertically centered in collapsed header */}
      {(showThemeToggle || rightAction) && (
        <View
          className="absolute right-5 justify-center flex-row items-center gap-2"
          style={{ top: insets.top, height: collapsedHeight, zIndex: 10 }}
        >
          {rightAction && (
            typeof rightAction === 'object' && 'icon' in rightAction ? (
              <Pressable
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  rightAction.onPress();
                }}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{
                  backgroundColor: isDark ? `${darkColors.primary}20` : `${colors.primary}15`,
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name={rightAction.icon} size={20} color={themeColors.primary} />
              </Pressable>
            ) : rightAction
          )}
          {showThemeToggle && <ThemeToggleButton size="small" />}
        </View>
      )}
    </Animated.View>
  );
}
