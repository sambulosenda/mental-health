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

const SLIDE_INDEX = 1;

const BENEFITS = [
  {
    icon: 'analytics-outline' as const,
    label: 'Track Mood',
    color: '#5B8A72',
  },
  {
    icon: 'book-outline' as const,
    label: 'Journal',
    color: '#7BA393',
  },
  {
    icon: 'leaf-outline' as const,
    label: 'Mindfulness',
    color: '#9BC3B3',
  },
];

interface BenefitCardProps {
  index: number;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
}

const BenefitCard: FC<BenefitCardProps> = ({ index, icon, label, color }) => {
  const { width: screenWidth } = useWindowDimensions();
  const { activeIndex } = useContext(AnimatedIndexContext);
  const { isDark } = useTheme();

  const cardColor = isDark ? darkColors.surfaceElevated : '#fff';

  const rStyle = useAnimatedStyle(() => {
    // Cards slide in from right when approaching this slide
    const translateX = interpolate(
      activeIndex.get(),
      [SLIDE_INDEX - 1, SLIDE_INDEX, SLIDE_INDEX + 1],
      [screenWidth * 0.3 * (index + 1), 0, -screenWidth * 0.5],
      Extrapolation.CLAMP
    );

    // Staggered scale animation
    const scale = interpolate(
      activeIndex.get(),
      [SLIDE_INDEX - 0.5, SLIDE_INDEX, SLIDE_INDEX + 0.5],
      [0.8, 1, 0.95],
      Extrapolation.CLAMP
    );

    // Slight rotation based on position
    const rotate = interpolate(
      activeIndex.get(),
      [SLIDE_INDEX - 1, SLIDE_INDEX],
      [index === 1 ? 0 : (index === 0 ? -5 : 5), 0],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX: withSpring(translateX, SPRING_CONFIG) },
        { scale: withSpring(scale, SPRING_CONFIG) },
        { rotate: withSpring(`${rotate}deg`, SPRING_CONFIG) },
      ],
    };
  });

  // Get position based on index
  const getPosition = () => {
    switch (index) {
      case 0: return { top: '15%' as const, left: '8%' as const };
      case 1: return { top: '35%' as const, left: '32%' as const };
      default: return { top: '55%' as const, left: '12%' as const };
    }
  };

  const position = getPosition();

  return (
    <Animated.View
      style={[
        styles.benefitCard,
        { backgroundColor: cardColor, top: position.top, left: position.left },
        rStyle,
      ]}
    >
      <View style={[styles.benefitIconWrap, { backgroundColor: color }]}>
        <Ionicons name={icon} size={28} color="#fff" />
      </View>
      <Text style={[styles.benefitLabel, { color: isDark ? darkColors.textPrimary : colors.textPrimary }]}>
        {label}
      </Text>
    </Animated.View>
  );
};

export function BenefitsSlide() {
  return (
    <View style={styles.container}>
      {BENEFITS.map((benefit, index) => (
        <BenefitCard
          key={benefit.label}
          index={index}
          icon={benefit.icon}
          label={benefit.label}
          color={benefit.color}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  benefitCard: {
    position: 'absolute',
    width: '52%',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  benefitIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitLabel: {
    fontSize: 17,
    fontWeight: '600',
  },
});
