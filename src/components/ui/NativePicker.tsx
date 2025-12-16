import { View, StyleSheet, Pressable, LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Text } from './Text';

interface NativePickerProps {
  options: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  variant?: 'segmented' | 'wheel';
}

export function NativePicker({
  options,
  selectedIndex,
  onSelect,
}: NativePickerProps) {
  const { isDark } = useTheme();
  const [containerWidth, setContainerWidth] = useState(0);

  const optionWidth = containerWidth > 0 ? (containerWidth - 4) / options.length : 0;
  const indicatorPosition = useSharedValue(0);

  useEffect(() => {
    if (optionWidth > 0) {
      indicatorPosition.value = withSpring(selectedIndex * optionWidth, {
        damping: 20,
        stiffness: 300,
        mass: 0.8,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex, optionWidth]);

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: indicatorPosition.value }],
      width: optionWidth,
    };
  });

  const handleLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
          borderColor: isDark ? '#334155' : '#e2e8f0',
        },
      ]}
      onLayout={handleLayout}
    >
      {/* Animated selection indicator */}
      {containerWidth > 0 && (
        <Animated.View
          style={[
            styles.indicator,
            {
              backgroundColor: isDark ? '#475569' : '#fff',
              shadowColor: isDark ? '#000' : '#64748b',
            },
            animatedIndicatorStyle,
          ]}
        />
      )}

      {/* Options */}
      {options.map((option, index) => {
        const isSelected = index === selectedIndex;

        return (
          <Pressable
            key={index}
            style={styles.option}
            onPress={() => onSelect(index)}
          >
            <Text
              variant="bodyMedium"
              style={[
                styles.optionText,
                {
                  color: isSelected
                    ? isDark ? '#f1f5f9' : '#1e293b'
                    : isDark ? '#94a3b8' : '#64748b',
                  fontWeight: isSelected ? '600' : '500',
                },
              ]}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 2,
    position: 'relative',
    borderWidth: 0,
  },
  indicator: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    left: 2,
    borderRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  option: {
    flex: 1,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  optionText: {
    fontSize: 13,
  },
});
