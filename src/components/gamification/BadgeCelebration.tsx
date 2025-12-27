import { View, Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { Text } from '@/src/components/ui';
import { colors, darkColors, spacing, borderRadius } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import { getBadgeById, BADGE_RARITY_COLORS } from '@/src/constants/badges';
import type { EarnedBadge } from '@/src/types/gamification';

interface BadgeCelebrationProps {
  badge: EarnedBadge | null;
  onDismiss: () => void;
}

export function BadgeCelebration({ badge, onDismiss }: BadgeCelebrationProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const insets = useSafeAreaInsets();

  const badgeDefinition = badge ? getBadgeById(badge.badgeId) : null;

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const badgeScale = useSharedValue(0);
  const badgeRotation = useSharedValue(-30);
  const shimmerOpacity = useSharedValue(0);

  useEffect(() => {
    if (badge && badgeDefinition) {
      // Haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Animate in
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, { damping: 12, stiffness: 150 });

      // Badge entrance with bounce
      badgeScale.value = withDelay(
        200,
        withSequence(
          withSpring(1.3, { damping: 6, stiffness: 200 }),
          withSpring(1, { damping: 10, stiffness: 150 })
        )
      );
      badgeRotation.value = withDelay(
        200,
        withSequence(
          withSpring(10, { damping: 6 }),
          withSpring(0, { damping: 8 })
        )
      );

      // Shimmer effect
      shimmerOpacity.value = withDelay(
        400,
        withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0.3, { duration: 500 }),
          withTiming(1, { duration: 300 }),
          withTiming(0.5, { duration: 1000 })
        )
      );
    } else {
      // Reset
      scale.value = 0;
      opacity.value = 0;
      badgeScale.value = 0;
      badgeRotation.value = -30;
      shimmerOpacity.value = 0;
    }
  }, [badge]);

  const handleDismiss = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    opacity.value = withTiming(0, { duration: 150 }, () => {
      runOnJS(onDismiss)();
    });
    scale.value = withTiming(0.9, { duration: 150 });
  };

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: badgeScale.value },
      { rotate: `${badgeRotation.value}deg` },
    ],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: shimmerOpacity.value,
  }));

  if (!badge || !badgeDefinition) return null;

  const rarityColor = BADGE_RARITY_COLORS[badgeDefinition.rarity];
  const rarityLabel = badgeDefinition.rarity.charAt(0).toUpperCase() + badgeDefinition.rarity.slice(1);

  return (
    <Modal
      visible={!!badge}
      animationType="none"
      transparent
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.7)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: spacing.lg,
          paddingTop: insets.top + spacing.lg,
          paddingBottom: insets.bottom + spacing.lg,
        }}
        onPress={handleDismiss}
      >
        <Animated.View
          style={[
            {
              backgroundColor: themeColors.surface,
              borderRadius: borderRadius.xl,
              maxWidth: 320,
              width: '100%',
              padding: spacing.xl,
              alignItems: 'center',
            },
            containerStyle,
          ]}
        >
          {/* Confetti-like decorations */}
          <View className="absolute top-4 left-4">
            <Ionicons name="sparkles" size={20} color={rarityColor} />
          </View>
          <View className="absolute top-4 right-4">
            <Ionicons name="star" size={16} color={rarityColor} />
          </View>

          {/* Badge Icon */}
          <Animated.View
            style={[
              {
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: `${rarityColor}20`,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 3,
                borderColor: rarityColor,
                marginBottom: spacing.md,
              },
              badgeStyle,
            ]}
          >
            <Animated.View style={shimmerStyle}>
              <Ionicons
                name={badgeDefinition.icon as any}
                size={48}
                color={rarityColor}
              />
            </Animated.View>
          </Animated.View>

          {/* Title */}
          <Text variant="h2" center style={{ marginBottom: spacing.xs }}>
            Badge Earned!
          </Text>

          {/* Badge Name */}
          <Text
            variant="h3"
            center
            style={{ color: rarityColor, marginBottom: spacing.xs }}
          >
            {badgeDefinition.name}
          </Text>

          {/* Rarity */}
          <View
            style={{
              backgroundColor: `${rarityColor}20`,
              paddingHorizontal: spacing.sm,
              paddingVertical: 4,
              borderRadius: borderRadius.sm,
              marginBottom: spacing.sm,
            }}
          >
            <Text variant="label" style={{ color: rarityColor, fontWeight: '600' }}>
              {rarityLabel}
            </Text>
          </View>

          {/* Description */}
          <Text variant="body" color="textSecondary" center>
            {badgeDefinition.description}
          </Text>

          {/* Dismiss Button */}
          <Pressable
            onPress={handleDismiss}
            style={({ pressed }) => ({
              backgroundColor: pressed ? themeColors.primaryDark : themeColors.primary,
              borderRadius: borderRadius.lg,
              paddingVertical: 14,
              paddingHorizontal: spacing.xl,
              marginTop: spacing.lg,
              width: '100%',
              alignItems: 'center',
            })}
          >
            <Text variant="bodyMedium" style={{ color: '#FFFFFF', fontWeight: '600' }}>
              Awesome!
            </Text>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
