import { FC } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { colors, darkColors } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';

interface DotProps {
  index: number;
  activeIndex: SharedValue<number>;
}

const Dot: FC<DotProps> = ({ index, activeIndex }) => {
  const { isDark } = useTheme();
  const activeColor = isDark ? darkColors.primary : colors.primary;
  const inactiveColor = isDark ? '#4a5568' : '#cbd5e0';

  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        activeIndex.get(),
        [index - 1, index, index + 1],
        [inactiveColor, activeColor, inactiveColor]
      ),
    };
  });

  return <Animated.View style={[styles.dot, animatedStyle]} />;
};

interface PaginationDotsProps {
  numberOfDots: number;
  activeIndex: SharedValue<number>;
}

export function PaginationDots({ numberOfDots, activeIndex }: PaginationDotsProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: numberOfDots }, (_, index) => (
        <Dot key={index} index={index} activeIndex={activeIndex} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
