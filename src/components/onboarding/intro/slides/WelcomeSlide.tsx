import { FC, useContext } from 'react';
import { View, useWindowDimensions, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  withSpring,
} from 'react-native-reanimated';
import { AnimatedIndexContext } from '../AnimatedIndexContext';
import { SPRING_CONFIG } from '../constants';
import { colors, darkColors } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';

const SLIDE_INDEX = 0;

// Card positioned on the left
const LeftCard: FC = () => {
  const { width: screenWidth } = useWindowDimensions();
  const { activeIndex } = useContext(AnimatedIndexContext);
  const { isDark } = useTheme();

  const rStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      activeIndex.get(),
      [SLIDE_INDEX, SLIDE_INDEX + 1],
      [0, -screenWidth],
      Extrapolation.CLAMP
    );
    const rotate = interpolate(
      activeIndex.get(),
      [SLIDE_INDEX, SLIDE_INDEX + 0.5],
      [-8, -2],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      activeIndex.get(),
      [SLIDE_INDEX, SLIDE_INDEX + 0.5],
      [1, 0.95],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX: withSpring(translateX, SPRING_CONFIG) },
        { rotate: withSpring(`${rotate}deg`, SPRING_CONFIG) },
        { scale: withSpring(scale, SPRING_CONFIG) },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.card,
        styles.leftCard,
        { backgroundColor: isDark ? '#2d4a5a' : '#7BA393' },
        rStyle,
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: isDark ? '#3d5a6a' : '#9BC3B3' }]}>
        <Ionicons name="happy-outline" size={32} color={isDark ? '#fff' : '#fff'} />
      </View>
      <View style={[styles.pill, { backgroundColor: 'rgba(255,255,255,0.25)' }]} />
    </Animated.View>
  );
};

// Card positioned in the center
const CenterCard: FC = () => {
  const { width: screenWidth } = useWindowDimensions();
  const { activeIndex } = useContext(AnimatedIndexContext);
  const { isDark } = useTheme();

  const rStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      activeIndex.get(),
      [SLIDE_INDEX, SLIDE_INDEX + 1],
      [0, -screenWidth * 0.8],
      Extrapolation.CLAMP
    );
    const rotate = interpolate(
      activeIndex.get(),
      [SLIDE_INDEX, SLIDE_INDEX + 0.5],
      [0, 3],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      activeIndex.get(),
      [SLIDE_INDEX, SLIDE_INDEX + 0.5],
      [1, 0.98],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX: withSpring(translateX, SPRING_CONFIG) },
        { rotate: withSpring(`${rotate}deg`, SPRING_CONFIG) },
        { scale: withSpring(scale, SPRING_CONFIG) },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.card,
        styles.centerCard,
        { backgroundColor: isDark ? darkColors.primary : colors.primary },
        rStyle,
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
        <Ionicons name="heart-outline" size={32} color="#fff" />
      </View>
      <View style={[styles.pill, { backgroundColor: 'rgba(255,255,255,0.25)' }]} />
    </Animated.View>
  );
};

// Card positioned on the right
const RightCard: FC = () => {
  const { width: screenWidth } = useWindowDimensions();
  const { activeIndex } = useContext(AnimatedIndexContext);
  const { isDark } = useTheme();

  const rStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      activeIndex.get(),
      [SLIDE_INDEX, SLIDE_INDEX + 1],
      [0, -screenWidth * 0.6],
      Extrapolation.CLAMP
    );
    const rotate = interpolate(
      activeIndex.get(),
      [SLIDE_INDEX, SLIDE_INDEX + 0.5],
      [8, 2],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      activeIndex.get(),
      [SLIDE_INDEX, SLIDE_INDEX + 0.5],
      [1, 0.95],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX: withSpring(translateX, SPRING_CONFIG) },
        { rotate: withSpring(`${rotate}deg`, SPRING_CONFIG) },
        { scale: withSpring(scale, SPRING_CONFIG) },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.card,
        styles.rightCard,
        { backgroundColor: isDark ? '#4a3d5a' : '#D4915C' },
        rStyle,
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
        <Ionicons name="journal-outline" size={32} color="#fff" />
      </View>
      <View style={[styles.pill, { backgroundColor: 'rgba(255,255,255,0.25)' }]} />
    </Animated.View>
  );
};

export function WelcomeSlide() {
  return (
    <View style={styles.container}>
      <LeftCard />
      <CenterCard />
      <RightCard />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    position: 'absolute',
    width: '38%',
    aspectRatio: 1 / 1.3,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  leftCard: {
    top: '20%',
    left: '5%',
    zIndex: 1,
  },
  centerCard: {
    top: '15%',
    left: '31%',
    zIndex: 3,
  },
  rightCard: {
    top: '20%',
    right: '5%',
    zIndex: 2,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    height: 16,
    width: 64,
    borderRadius: 8,
  },
});
