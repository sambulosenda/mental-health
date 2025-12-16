import { FC, useContext } from 'react';
import { View, Text, useWindowDimensions, StyleSheet } from 'react-native';
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

const SLIDE_INDEX = 2;

const ShieldIcon: FC = () => {
  const { width: screenWidth } = useWindowDimensions();
  const { activeIndex } = useContext(AnimatedIndexContext);
  const { isDark } = useTheme();

  const rStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      activeIndex.get(),
      [SLIDE_INDEX - 1, SLIDE_INDEX],
      [40, 0],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      activeIndex.get(),
      [SLIDE_INDEX - 1, SLIDE_INDEX, SLIDE_INDEX + 0.5],
      [0.7, 1, 0.95],
      Extrapolation.CLAMP
    );
    const rotate = interpolate(
      activeIndex.get(),
      [SLIDE_INDEX - 1, SLIDE_INDEX],
      [-10, 0],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateY: withSpring(translateY, SPRING_CONFIG) },
        { scale: withSpring(scale, SPRING_CONFIG) },
        { rotate: withSpring(`${rotate}deg`, SPRING_CONFIG) },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.shieldContainer,
        { backgroundColor: isDark ? darkColors.primary : colors.primary },
        rStyle,
      ]}
    >
      <Ionicons name="shield-checkmark" size={80} color="#fff" />
    </Animated.View>
  );
};

const PrivacyCard: FC<{ index: number; icon: keyof typeof Ionicons.glyphMap; text: string }> = ({
  index,
  icon,
  text,
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const { activeIndex } = useContext(AnimatedIndexContext);
  const { isDark } = useTheme();

  const rStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      activeIndex.get(),
      [SLIDE_INDEX - 1, SLIDE_INDEX],
      [screenWidth * 0.3 * (index + 1), 0],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      activeIndex.get(),
      [SLIDE_INDEX - 0.5, SLIDE_INDEX],
      [0, 1],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateX: withSpring(translateX, SPRING_CONFIG) }],
      opacity,
    };
  });

  const positionStyle = index === 0
    ? { top: '58%' as const, left: '10%' as const }
    : { top: '72%' as const, right: '10%' as const };

  return (
    <Animated.View
      style={[
        styles.privacyCard,
        {
          backgroundColor: isDark ? darkColors.surfaceElevated : '#fff',
          ...positionStyle,
        },
        rStyle,
      ]}
    >
      <View style={[styles.privacyIcon, { backgroundColor: isDark ? '#3d5a4a' : '#E8F5E9' }]}>
        <Ionicons name={icon} size={22} color={isDark ? '#9BC3B3' : colors.primary} />
      </View>
      <Text style={[styles.privacyText, { color: isDark ? darkColors.textSecondary : colors.textSecondary }]}>
        {text}
      </Text>
    </Animated.View>
  );
};

export function PrivacySlide() {
  return (
    <View style={styles.container}>
      <ShieldIcon />
      <PrivacyCard index={0} icon="phone-portrait-outline" text="Stored locally on device" />
      <PrivacyCard index={1} icon="lock-closed-outline" text="Your data, your control" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  shieldContainer: {
    position: 'absolute',
    top: '18%',
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  privacyCard: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  privacyIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
