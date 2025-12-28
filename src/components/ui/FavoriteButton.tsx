import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
  useSharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useFavoritesStore } from '@/src/stores';
import type { ContentType } from '@/src/lib/database';

interface FavoriteButtonProps {
  contentType: ContentType;
  contentId: string;
  size?: number;
  color?: string;
  activeColor?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const FavoriteButton = memo(function FavoriteButton({
  contentType,
  contentId,
  size = 24,
  color = 'rgba(255,255,255,0.8)',
  activeColor = '#ef4444',
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const isActive = isFavorite(contentType, contentId);
  const scale = useSharedValue(1);

  const handlePress = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Bounce animation
    scale.value = withSequence(
      withSpring(1.3, { damping: 10, stiffness: 400 }),
      withSpring(1, { damping: 10, stiffness: 400 })
    );

    await toggleFavorite(contentType, contentId);
  }, [contentType, contentId, toggleFavorite, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[styles.button, animatedStyle]}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      accessibilityRole="button"
      accessibilityLabel={isActive ? 'Remove from favorites' : 'Add to favorites'}
      accessibilityState={{ selected: isActive }}
    >
      <Ionicons
        name={isActive ? 'heart' : 'heart-outline'}
        size={size}
        color={isActive ? activeColor : color}
      />
    </AnimatedPressable>
  );
});

const styles = StyleSheet.create({
  button: {
    padding: 4,
  },
});
