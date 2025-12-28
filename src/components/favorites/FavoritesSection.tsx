import { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Pressable, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Text, FavoriteButton } from '@/src/components/ui';
import { SLEEP_STORY_TEMPLATES } from '@/src/constants/sleepStories';
import { MEDITATION_TEMPLATES } from '@/src/constants/meditations';
import { getSleepStoryImageUrl } from '@/src/constants/cdnConfig';
import { colors, darkColors, spacing } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useFavoritesStore, useSubscriptionStore } from '@/src/stores';
import type { ExerciseTemplate } from '@/src/types/exercise';
import type { ContentType } from '@/src/lib/database';

interface FavoriteCardProps {
  item: ExerciseTemplate;
  contentType: ContentType;
  themeColors: typeof colors | typeof darkColors;
  onPress: () => void;
}

function FavoriteCard({ item, contentType, themeColors, onPress }: FavoriteCardProps) {
  const [imageError, setImageError] = useState(false);
  const imageUrl = contentType === 'sleep_story' ? getSleepStoryImageUrl(item.id) : null;
  const accentColor = item.color || '#6366f1';

  const handlePress = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  return (
    <Pressable
      onPress={handlePress}
      className="rounded-2xl overflow-hidden mr-3"
      style={{
        backgroundColor: themeColors.surfaceElevated,
        width: 140,
      }}
      accessibilityLabel={`${item.name}, ${item.duration} minutes`}
      accessibilityRole="button"
    >
      <View className="h-20 relative" style={{ backgroundColor: `${accentColor}20` }}>
        {imageUrl && !imageError ? (
          <Image
            source={{ uri: imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <Ionicons
              name={contentType === 'sleep_story' ? 'moon-outline' : 'leaf-outline'}
              size={28}
              color={accentColor}
            />
          </View>
        )}

        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'transparent']}
          className="absolute top-0 left-0 right-0 h-8"
        />

        <View className="absolute top-1.5 right-1.5">
          <FavoriteButton
            contentType={contentType}
            contentId={item.id}
            size={16}
          />
        </View>
      </View>

      <View className="p-2.5">
        <Text variant="bodyMedium" color="textPrimary" numberOfLines={1} style={{ fontSize: 13 }}>
          {item.name}
        </Text>
        <View className="flex-row items-center mt-1 gap-1">
          <Ionicons name="time-outline" size={10} color={themeColors.textMuted} />
          <Text variant="caption" color="textMuted" style={{ fontSize: 10 }}>
            {item.duration} min
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export function FavoritesSection() {
  const router = useRouter();
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const { favorites, loadFavorites } = useFavoritesStore();
  const { isPremium, isInitialized } = useSubscriptionStore();

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const favoriteItems = useMemo(() => {
    const allTemplates = [
      ...SLEEP_STORY_TEMPLATES.map((t) => ({ ...t, _contentType: 'sleep_story' as ContentType })),
      ...MEDITATION_TEMPLATES.map((t) => ({ ...t, _contentType: 'meditation' as ContentType })),
    ];

    return favorites
      .map((fav) => {
        const template = allTemplates.find(
          (t) => t.id === fav.contentId && t._contentType === fav.contentType
        );
        if (!template) return null;
        return { template, contentType: fav.contentType };
      })
      .filter(Boolean) as Array<{ template: ExerciseTemplate & { _contentType: ContentType }; contentType: ContentType }>;
  }, [favorites]);

  const handlePress = useCallback(
    (templateId: string, isPremiumContent?: boolean) => {
      if (isPremiumContent && isInitialized && !isPremium) {
        router.push('/paywall');
        return;
      }
      router.push(`/exercise-session?templateId=${templateId}`);
    },
    [isPremium, isInitialized, router]
  );

  if (favoriteItems.length === 0) {
    return null;
  }

  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between mb-3">
        <Text variant="h3" color="textPrimary">
          Your Favorites
        </Text>
        <View className="flex-row items-center gap-1">
          <Ionicons name="heart" size={14} color={themeColors.error} />
          <Text variant="caption" color="textMuted">
            {favoriteItems.length}
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: spacing.lg }}
      >
        {favoriteItems.map(({ template, contentType }) => (
          <FavoriteCard
            key={`${contentType}-${template.id}`}
            item={template}
            contentType={contentType}
            themeColors={themeColors}
            onPress={() => handlePress(template.id, template.isPremium)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
