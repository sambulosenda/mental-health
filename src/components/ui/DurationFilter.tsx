import React, { memo, useCallback } from 'react';
import { ScrollView, Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { Text } from './Text';
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors, darkColors } from '@/src/constants/theme';

export type DurationFilterValue = 'all' | '5' | '10' | '15+';

interface DurationFilterOption {
  value: DurationFilterValue;
  label: string;
}

const FILTER_OPTIONS: DurationFilterOption[] = [
  { value: 'all', label: 'All' },
  { value: '5', label: '5 min' },
  { value: '10', label: '10 min' },
  { value: '15+', label: '15+ min' },
];

interface DurationFilterProps {
  value: DurationFilterValue;
  onChange: (value: DurationFilterValue) => void;
  counts?: Record<DurationFilterValue, number>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface FilterChipProps {
  option: DurationFilterOption;
  isSelected: boolean;
  count?: number;
  onPress: () => void;
  themeColors: typeof colors | typeof darkColors;
}

const FilterChip = memo(function FilterChip({
  option,
  isSelected,
  count,
  onPress,
  themeColors,
}: FilterChipProps) {
  const handlePress = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      isSelected ? 1 : 0,
      [0, 1],
      [themeColors.surfaceElevated, themeColors.primary]
    );

    return {
      backgroundColor,
      transform: [{ scale: withSpring(isSelected ? 1 : 0.98) }],
    };
  }, [isSelected, themeColors]);

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={animatedStyle}
      className="px-4 py-2 rounded-full mr-2 flex-row items-center"
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={`Filter by ${option.label}${count !== undefined ? `, ${count} items` : ''}`}
    >
      <Text
        variant="bodyMedium"
        style={{
          color: isSelected ? '#FFFFFF' : themeColors.textSecondary,
          fontWeight: isSelected ? '600' : '400',
        }}
      >
        {option.label}
      </Text>
      {count !== undefined && (
        <View
          className="ml-1.5 px-1.5 rounded-full"
          style={{
            backgroundColor: isSelected
              ? 'rgba(255,255,255,0.2)'
              : themeColors.divider,
          }}
        >
          <Text
            variant="caption"
            style={{
              color: isSelected ? '#FFFFFF' : themeColors.textMuted,
              fontSize: 10,
            }}
          >
            {count}
          </Text>
        </View>
      )}
    </AnimatedPressable>
  );
});

export const DurationFilter = memo(function DurationFilter({
  value,
  onChange,
  counts,
}: DurationFilterProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
    >
      {FILTER_OPTIONS.map((option) => (
        <FilterChip
          key={option.value}
          option={option}
          isSelected={value === option.value}
          count={counts?.[option.value]}
          onPress={() => onChange(option.value)}
          themeColors={themeColors}
        />
      ))}
    </ScrollView>
  );
});

/**
 * Utility function to filter items by duration
 */
export function filterByDuration<T extends { duration: number }>(
  items: T[],
  filter: DurationFilterValue
): T[] {
  switch (filter) {
    case '5':
      return items.filter((item) => item.duration <= 5);
    case '10':
      return items.filter((item) => item.duration > 5 && item.duration <= 10);
    case '15+':
      return items.filter((item) => item.duration >= 15);
    case 'all':
    default:
      return items;
  }
}

/**
 * Utility function to count items per duration bucket
 */
export function countByDuration<T extends { duration: number }>(
  items: T[]
): Record<DurationFilterValue, number> {
  return {
    all: items.length,
    '5': items.filter((item) => item.duration <= 5).length,
    '10': items.filter((item) => item.duration > 5 && item.duration <= 10).length,
    '15+': items.filter((item) => item.duration >= 15).length,
  };
}
