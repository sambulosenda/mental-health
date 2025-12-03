import { useEffect } from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { haptics } from '@/src/utils/haptics';
import { colors, spacing } from '@/src/constants/theme';

type IconName = keyof typeof Ionicons.glyphMap;

const TAB_CONFIG: Record<string, { icon: IconName; iconFocused: IconName; label: string }> = {
  index: { icon: 'home-outline', iconFocused: 'home', label: 'Home' },
  track: { icon: 'add-circle-outline', iconFocused: 'add-circle', label: 'Track' },
  journal: { icon: 'book-outline', iconFocused: 'book', label: 'Journal' },
  insights: { icon: 'analytics-outline', iconFocused: 'analytics', label: 'Insights' },
  profile: { icon: 'person-outline', iconFocused: 'person', label: 'Profile' },
};

function TabBarIcon({
  routeName,
  focused,
  color,
}: {
  routeName: string;
  focused: boolean;
  color: string;
}) {
  const scale = useSharedValue(focused ? 1 : 0.9);

  useEffect(() => {
    scale.value = withSpring(focused ? 1 : 0.9, {
      damping: 12,
      stiffness: 200,
    });
  }, [focused, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const config = TAB_CONFIG[routeName];
  if (!config) return null;

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons
        name={focused ? config.iconFocused : config.icon}
        size={24}
        color={color}
      />
    </Animated.View>
  );
}

export function AnimatedTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || spacing.md }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = TAB_CONFIG[route.name]?.label || route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            haptics.selection();
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          haptics.medium();
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tab}
          >
            <TabBarIcon
              routeName={route.name}
              focused={isFocused}
              color={isFocused ? colors.primary : colors.textMuted}
            />
            <Animated.Text
              style={[
                styles.label,
                { color: isFocused ? colors.primary : colors.textMuted },
              ]}
            >
              {label}
            </Animated.Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingTop: spacing.sm,
    borderTopWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
});
