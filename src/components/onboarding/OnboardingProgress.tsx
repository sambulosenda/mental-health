import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, darkColors } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;

  return (
    <View
      className="flex-row justify-center items-center gap-2 py-4"
      accessibilityRole="progressbar"
      accessibilityLabel={`Step ${currentStep + 1} of ${totalSteps}`}
      accessibilityValue={{ min: 1, max: totalSteps, now: currentStep + 1 }}
    >
      {Array.from({ length: totalSteps }).map((_, index) => (
        <ProgressDot
          key={index}
          isActive={index === currentStep}
          isCompleted={index < currentStep}
          primaryColor={themeColors.primary}
          borderColor={themeColors.border}
        />
      ))}
    </View>
  );
}

interface ProgressDotProps {
  isActive: boolean;
  isCompleted: boolean;
  primaryColor: string;
  borderColor: string;
}

function ProgressDot({ isActive, isCompleted, primaryColor, borderColor }: ProgressDotProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    width: withSpring(isActive ? 24 : 8, { damping: 15, stiffness: 200 }),
    backgroundColor: isActive || isCompleted ? primaryColor : borderColor,
  }));

  return (
    <Animated.View
      style={[
        {
          height: 8,
          borderRadius: 4,
        },
        animatedStyle,
      ]}
    />
  );
}
