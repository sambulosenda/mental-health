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

  const validatedTotal = Math.max(1, totalSteps);
  const validatedStep = Math.max(0, Math.min(currentStep, validatedTotal - 1));

  return (
    <View
      className="flex-row justify-center items-center gap-2 py-4"
      accessibilityRole="progressbar"
      accessibilityLabel={`Step ${validatedStep + 1} of ${validatedTotal}`}
      accessibilityValue={{ min: 1, max: validatedTotal, now: validatedStep + 1 }}
    >
      {Array.from({ length: validatedTotal }).map((_, index) => (
        <ProgressDot
          key={index}
          isActive={index === validatedStep}
          isCompleted={index < validatedStep}
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
