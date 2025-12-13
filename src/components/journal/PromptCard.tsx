import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { Text } from '@/src/components/ui';
import { colors, darkColors, borderRadius, getCardShadow } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import type { JournalPrompt } from '@/src/types/journal';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PromptCardProps {
  prompt: JournalPrompt;
  onPress: () => void;
}

// Category-specific design configurations
const CATEGORY_CONFIG: Record<string, {
  icon: keyof typeof Ionicons.glyphMap;
  colors: [string, string];
  darkColors: [string, string];
  accentColor: string;
  darkAccentColor: string;
}> = {
  reflection: {
    icon: 'telescope-outline',
    colors: ['#E8F4F8', '#D4EBF2'],
    darkColors: ['#1A2830', '#152228'],
    accentColor: '#3B8EA5',
    darkAccentColor: '#5EADC4',
  },
  gratitude: {
    icon: 'heart-outline',
    colors: ['#FDF6E3', '#FAECD0'],
    darkColors: ['#2A2518', '#221E14'],
    accentColor: '#D4915C',
    darkAccentColor: '#E8B480',
  },
  growth: {
    icon: 'leaf-outline',
    colors: ['#E8F5E9', '#D4EED6'],
    darkColors: ['#1A2C1E', '#152418'],
    accentColor: '#5B8A72',
    darkAccentColor: '#7BA393',
  },
  emotion: {
    icon: 'water-outline',
    colors: ['#F3E8F5', '#E8D6EC'],
    darkColors: ['#251A28', '#1E1520'],
    accentColor: '#9C6AA8',
    darkAccentColor: '#B88BC4',
  },
};

const DEFAULT_CONFIG = {
  icon: 'bulb-outline' as keyof typeof Ionicons.glyphMap,
  colors: ['#F5F5F5', '#EBEBEB'] as [string, string],
  darkColors: ['#252525', '#1E1E1E'] as [string, string],
  accentColor: '#5B8A72',
  darkAccentColor: '#7BA393',
};

export function PromptCard({ prompt, onPress }: PromptCardProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const pressed = useSharedValue(0);

  const config = CATEGORY_CONFIG[prompt.category] || DEFAULT_CONFIG;
  const gradientColors = isDark ? config.darkColors : config.colors;
  const accentColor = isDark ? config.darkAccentColor : config.accentColor;

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(pressed.value, [0, 1], [1, 0.98]);
    return { transform: [{ scale }] };
  });

  const handlePressIn = () => {
    pressed.value = withSpring(1, { damping: 20, stiffness: 400 });
  };

  const handlePressOut = () => {
    pressed.value = withSpring(0, { damping: 20, stiffness: 400 });
  };

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
    >
      <View
        style={[
          {
            borderRadius: borderRadius.lg,
            overflow: 'hidden',
            marginBottom: 12,
            ...getCardShadow(isDark),
            borderWidth: isDark ? 1 : 0.5,
            borderColor: isDark ? themeColors.border : 'rgba(0,0,0,0.06)',
          },
        ]}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: 16 }}
        >
          {/* Category header */}
          <View className="flex-row items-center gap-2 mb-3">
            <View
              className="w-8 h-8 rounded-lg items-center justify-center"
              style={{
                backgroundColor: isDark ? `${accentColor}30` : `${accentColor}20`,
              }}
            >
              <Ionicons name={config.icon} size={18} color={accentColor} />
            </View>
            <Text
              variant="label"
              style={{
                color: accentColor,
                letterSpacing: 0.8,
              }}
            >
              {prompt.category.toUpperCase()}
            </Text>
          </View>

          {/* Prompt text */}
          <Text
            variant="body"
            color="textPrimary"
            style={{
              lineHeight: 26,
              fontSize: 17,
              letterSpacing: -0.2,
            }}
          >
            {prompt.text}
          </Text>

          {/* Footer with action hint */}
          <View className="flex-row items-center justify-end mt-4">
            <View className="flex-row items-center gap-1">
              <Text
                variant="caption"
                style={{ color: accentColor }}
              >
                Start writing
              </Text>
              <Ionicons name="arrow-forward" size={14} color={accentColor} />
            </View>
          </View>
        </LinearGradient>
      </View>
    </AnimatedPressable>
  );
}
