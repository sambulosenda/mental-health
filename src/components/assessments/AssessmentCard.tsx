import { View, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { Text } from '@/src/components/ui';
import { colors, darkColors, borderRadius, getCardShadow, getCardBorder, pressAnimation } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { formatDistanceToNow } from 'date-fns';
import type { AssessmentTemplate, AssessmentSession } from '@/src/types/assessment';
import { ScoreInterpretation } from './ScoreInterpretation';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AssessmentCardProps {
  template: AssessmentTemplate;
  lastSession?: AssessmentSession | null;
  isDue?: boolean;
  onPress: () => void;
}

export function AssessmentCard({
  template,
  lastSession,
  isDue,
  onPress,
}: AssessmentCardProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const accentColor = template.color;
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(pressed.value, [0, 1], [1, pressAnimation.scale]);
    return {
      transform: [{ scale }],
    };
  });

  const handlePressIn = () => {
    pressed.value = withSpring(1, pressAnimation.springConfig);
  };

  const handlePressOut = () => {
    pressed.value = withSpring(0, pressAnimation.springConfig);
  };

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const lastTakenText = lastSession?.completedAt
    ? `${formatDistanceToNow(lastSession.completedAt, { addSuffix: true })}`
    : 'Start →';

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        {
          flex: 1,
          borderRadius: borderRadius.lg,
          padding: 16,
          backgroundColor: themeColors.surfaceElevated,
          ...getCardShadow(isDark),
          ...getCardBorder(isDark),
        },
        animatedStyle,
      ]}
    >
      {/* Header with icon and due badge */}
      <View className="flex-row items-start justify-between mb-3">
        <View
          className="w-10 h-10 rounded-xl items-center justify-center"
          style={{ backgroundColor: `${accentColor}${isDark ? '30' : '15'}` }}
        >
          <Ionicons
            name={template.icon as any}
            size={20}
            color={accentColor}
          />
        </View>

        {isDue && (
          <View
            className="px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${accentColor}${isDark ? '30' : '15'}` }}
          >
            <Text
              variant="label"
              style={{ color: accentColor, fontSize: 10 }}
            >
              DUE
            </Text>
          </View>
        )}
      </View>

      {/* Title */}
      <Text variant="bodyMedium" color="textPrimary">
        {template.name}
      </Text>

      {/* Description */}
      <Text variant="caption" color="textSecondary" className="mt-1" numberOfLines={1}>
        {template.description}
      </Text>

      {/* Last score or last taken */}
      <View className="mt-3 flex-row items-center justify-between">
        {lastSession?.severity ? (
          <ScoreInterpretation severity={lastSession.severity} compact />
        ) : (
          <Text variant="caption" style={{ color: accentColor }}>
            {lastTakenText}
          </Text>
        )}

        {lastSession?.totalScore !== undefined && (
          <Text variant="caption" color="textMuted">
            {lastSession.totalScore}/{template.scoringInfo.maxScore}
          </Text>
        )}
      </View>
    </AnimatedPressable>
  );
}
