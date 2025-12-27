import { useMemo, useState } from 'react';
import { View, Pressable, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Text } from '@/src/components/ui';
import { SLEEP_STORY_TEMPLATES } from '@/src/constants/sleepStories';
import { getSleepStoryImageUrl } from '@/src/constants/cdnConfig';
import { colors, darkColors, spacing } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useSubscriptionStore } from '@/src/stores';
import type { ExerciseTemplate } from '@/src/types/exercise';

interface SleepStoryCardProps {
  story: ExerciseTemplate;
  themeColors: typeof colors | typeof darkColors;
  isPremiumUser: boolean;
  onPress: () => void;
}

function SleepStoryCard({ story, themeColors, isPremiumUser, onPress }: SleepStoryCardProps) {
  const accentColor = story.color || '#6366f1';
  const isLocked = story.isPremium && !isPremiumUser;
  const [imageError, setImageError] = useState(false);
  const imageUrl = getSleepStoryImageUrl(story.id);

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: themeColors.surfaceElevated,
        width: 150,
        opacity: isLocked ? 0.85 : 1,
      }}
    >
      {/* Image header with gradient overlay */}
      <View className="h-24 relative">
        {!imageError ? (
          <Image
            source={{ uri: imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          // Fallback to accent color with icon
          <View
            className="w-full h-full items-center justify-center"
            style={{ backgroundColor: `${accentColor}20` }}
          >
            <Ionicons name="moon-outline" size={32} color={accentColor} />
          </View>
        )}

        {/* Gradient overlay for badges */}
        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'transparent']}
          className="absolute top-0 left-0 right-0 h-10"
        />

        {/* Lock badge */}
        {isLocked && (
          <View
            className="absolute top-2 right-2 w-5 h-5 rounded-full items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            <Ionicons name="lock-closed" size={10} color="#fff" />
          </View>
        )}

        {/* Free badge */}
        {!story.isPremium && (
          <View
            className="absolute top-2 left-2 px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'rgba(16,185,129,0.9)' }}
          >
            <Text variant="label" style={{ color: '#fff', fontSize: 9 }}>
              FREE
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View className="p-3">
        <Text variant="bodyMedium" color="textPrimary" numberOfLines={1}>
          {story.name}
        </Text>
        <View className="flex-row items-center mt-1.5 gap-1">
          <Ionicons name="time-outline" size={12} color={themeColors.textMuted} />
          <Text variant="caption" color="textMuted">
            {story.duration} min
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

interface SleepStoriesSectionProps {
  maxStories?: number;
}

export function SleepStoriesSection({ maxStories = 8 }: SleepStoriesSectionProps) {
  const router = useRouter();
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const { isPremium, isInitialized } = useSubscriptionStore();

  // Get current hour to determine if it's evening/night time
  const isEvening = useMemo(() => {
    const hour = new Date().getHours();
    return hour >= 19 || hour < 6; // 7pm to 6am
  }, []);

  // Select stories to display
  // Prioritize free stories first, then mix in premium
  const displayedStories = useMemo(() => {
    const freeStories = SLEEP_STORY_TEMPLATES.filter((s) => !s.isPremium);
    const premiumStories = SLEEP_STORY_TEMPLATES.filter((s) => s.isPremium);

    // Show free stories first, then premium
    const combined = [...freeStories, ...premiumStories];
    return combined.slice(0, maxStories);
  }, [maxStories]);

  const handleSelectStory = (templateId: string, templateIsPremium?: boolean) => {
    if (templateIsPremium && isInitialized && !isPremium) {
      router.push('/paywall');
      return;
    }
    router.push(`/exercise-session?templateId=${templateId}`);
  };

  // Don't show section if no stories
  if (displayedStories.length === 0) {
    return null;
  }

  return (
    <View className="py-2" style={{ marginHorizontal: -spacing.lg }}>
      <View className="flex-row items-center justify-between mb-3 px-6">
        <View className="flex-row items-center gap-2">
          <Text variant="h3" color="textPrimary">
            {isEvening ? 'Sleep Stories' : 'Bedtime Stories'}
          </Text>
          <View
            className="px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${themeColors.primary}15` }}
          >
            <Text variant="label" style={{ color: themeColors.primary, fontSize: 10 }}>
              {SLEEP_STORY_TEMPLATES.length}
            </Text>
          </View>
        </View>
        <Ionicons name="moon" size={16} color={themeColors.primary} />
      </View>

      {isEvening && (
        <View className="px-6 mb-3">
          <Text variant="caption" color="textSecondary">
            Wind down with a calming bedtime story
          </Text>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.md }}
      >
        {displayedStories.map((story) => (
          <SleepStoryCard
            key={story.id}
            story={story}
            themeColors={themeColors}
            isPremiumUser={isPremium}
            onPress={() => handleSelectStory(story.id, story.isPremium)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
