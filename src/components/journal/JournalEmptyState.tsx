import { useEffect, useState } from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import { Text } from '@/src/components/ui';
import { colors, darkColors, borderRadius } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';

interface JournalEmptyStateProps {
  onStartWriting: () => void;
}

const INSPIRATIONAL_PROMPTS = [
  "What made you smile today?",
  "What's on your mind right now?",
  "Describe your perfect morning.",
  "What are you grateful for?",
  "How are you really feeling?",
  "What would you tell your past self?",
  "What's something you're proud of?",
  "What brings you peace?",
];

export function JournalEmptyState({ onStartWriting }: JournalEmptyStateProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

  // Floating animations for decorative elements
  const float1 = useSharedValue(0);
  const float2 = useSharedValue(0);
  const float3 = useSharedValue(0);
  const promptOpacity = useSharedValue(1);

  useEffect(() => {
    // Gentle floating animation for decorative elements
    float1.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(8, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    float2.value = withDelay(
      500,
      withRepeat(
        withSequence(
          withTiming(10, { duration: 3500, easing: Easing.inOut(Easing.ease) }),
          withTiming(-10, { duration: 3500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    float3.value = withDelay(
      1000,
      withRepeat(
        withSequence(
          withTiming(-6, { duration: 2800, easing: Easing.inOut(Easing.ease) }),
          withTiming(6, { duration: 2800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    // Rotate through prompts
    const interval = setInterval(() => {
      promptOpacity.value = withSequence(
        withTiming(0, { duration: 300 }),
        withTiming(1, { duration: 300 })
      );
      setTimeout(() => {
        setCurrentPromptIndex((prev) => (prev + 1) % INSPIRATIONAL_PROMPTS.length);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const floatStyle1 = useAnimatedStyle(() => ({
    transform: [{ translateY: float1.value }],
  }));

  const floatStyle2 = useAnimatedStyle(() => ({
    transform: [{ translateY: float2.value }],
  }));

  const floatStyle3 = useAnimatedStyle(() => ({
    transform: [{ translateY: float3.value }],
  }));

  const promptStyle = useAnimatedStyle(() => ({
    opacity: promptOpacity.value,
  }));

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onStartWriting();
  };

  return (
    <View className="flex-1 items-center justify-center py-12 px-6">
      {/* Decorative floating elements */}
      <View className="absolute inset-0 overflow-hidden">
        {/* Floating feather/quill icon */}
        <Animated.View
          style={[
            floatStyle1,
            {
              position: 'absolute',
              top: '15%',
              right: '15%',
            },
          ]}
        >
          <View
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{
              backgroundColor: isDark ? `${colors.mood[4]}20` : `${colors.mood[4]}15`,
            }}
          >
            <Ionicons name="leaf-outline" size={24} color={colors.mood[4]} />
          </View>
        </Animated.View>

        {/* Floating sparkle */}
        <Animated.View
          style={[
            floatStyle2,
            {
              position: 'absolute',
              top: '25%',
              left: '12%',
            },
          ]}
        >
          <View
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{
              backgroundColor: isDark ? `${colors.mood[5]}20` : `${colors.mood[5]}15`,
            }}
          >
            <Ionicons name="sparkles-outline" size={20} color={colors.mood[5]} />
          </View>
        </Animated.View>

        {/* Floating heart */}
        <Animated.View
          style={[
            floatStyle3,
            {
              position: 'absolute',
              bottom: '30%',
              right: '20%',
            },
          ]}
        >
          <View
            className="w-8 h-8 rounded-full items-center justify-center"
            style={{
              backgroundColor: isDark ? `${colors.mood[3]}20` : `${colors.mood[3]}15`,
            }}
          >
            <Ionicons name="heart-outline" size={16} color={colors.mood[3]} />
          </View>
        </Animated.View>
      </View>

      {/* Main content */}
      <Animated.View
        entering={FadeInDown.duration(600).delay(200)}
        className="items-center"
      >
        {/* Journal icon with gradient background */}
        <View
          className="w-24 h-24 rounded-3xl items-center justify-center mb-6"
          style={{
            backgroundColor: isDark ? `${themeColors.primary}20` : `${themeColors.primary}10`,
          }}
        >
          <LinearGradient
            colors={[
              isDark ? `${themeColors.primary}40` : `${themeColors.primary}20`,
              'transparent',
            ]}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '50%',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
            }}
          />
          <Ionicons name="book" size={44} color={themeColors.primary} />
        </View>

        {/* Heading */}
        <Text
          variant="h2"
          color="textPrimary"
          center
          style={{ marginBottom: 8 }}
        >
          Your journal awaits
        </Text>

        {/* Subheading */}
        <Text
          variant="body"
          color="textSecondary"
          center
          style={{ maxWidth: 280, lineHeight: 24, marginBottom: 24 }}
        >
          A private space for your thoughts, feelings, and reflections.
        </Text>

        {/* Rotating prompt */}
        <Animated.View
          style={[
            promptStyle,
            {
              backgroundColor: isDark ? themeColors.surface : themeColors.surfaceElevated,
              borderRadius: borderRadius.xl,
              paddingHorizontal: 20,
              paddingVertical: 14,
              marginBottom: 32,
              borderWidth: 1,
              borderColor: isDark ? themeColors.border : 'rgba(0,0,0,0.05)',
            },
          ]}
        >
          <View className="flex-row items-center gap-2">
            <Ionicons name="bulb-outline" size={18} color={themeColors.warning} />
            <Text
              variant="body"
              color="textSecondary"
              style={{ fontStyle: 'italic', maxWidth: 220 }}
            >
              {`"${INSPIRATIONAL_PROMPTS[currentPromptIndex]}"`}
            </Text>
          </View>
        </Animated.View>

        {/* CTA Button */}
        <Pressable onPress={handlePress}>
          <LinearGradient
            colors={[themeColors.primary, themeColors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingHorizontal: 32,
              paddingVertical: 16,
              borderRadius: borderRadius.full,
              shadowColor: themeColors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <View className="flex-row items-center gap-2">
              <Ionicons name="create-outline" size={20} color="#FFFFFF" />
              <Text
                variant="bodyMedium"
                style={{ color: '#FFFFFF', letterSpacing: 0.3 }}
              >
                Start Writing
              </Text>
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
}
