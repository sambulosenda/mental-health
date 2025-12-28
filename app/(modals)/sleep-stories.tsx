import { useMemo, useState, useCallback } from 'react';
import { View, Pressable, FlatList, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Text, PremiumBadge } from '@/src/components/ui';
import { SLEEP_STORY_TEMPLATES } from '@/src/constants/sleepStories';
import { getSleepStoryImageUrl } from '@/src/constants/cdnConfig';
import { colors, darkColors, spacing } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useSubscriptionStore } from '@/src/stores';
import type { ExerciseTemplate } from '@/src/types/exercise';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_GAP = spacing.md;
const HORIZONTAL_PADDING = spacing.lg;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - COLUMN_GAP) / 2;

interface SleepStoryGridCardProps {
  story: ExerciseTemplate;
  themeColors: typeof colors | typeof darkColors;
  isPremiumUser: boolean;
  onPress: () => void;
}

function SleepStoryGridCard({ story, themeColors, isPremiumUser, onPress }: SleepStoryGridCardProps) {
  const accentColor = story.color || '#6366f1';
  const isLocked = story.isPremium && !isPremiumUser;
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const imageUrl = getSleepStoryImageUrl(story.id);

  const handlePress = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  return (
    <Pressable
      onPress={handlePress}
      className="rounded-2xl overflow-hidden mb-4"
      style={{
        backgroundColor: themeColors.surfaceElevated,
        width: CARD_WIDTH,
        opacity: isLocked ? 0.85 : 1,
      }}
      accessibilityLabel={`${story.name}, ${story.duration} minutes${isLocked ? ', locked' : ''}`}
      accessibilityRole="button"
    >
      <View style={{ height: 112, position: 'relative', backgroundColor: `${accentColor}20` }}>
        {/* Loading placeholder */}
        {imageLoading && !imageError && (
          <View className="absolute inset-0 items-center justify-center">
            <Ionicons name="moon-outline" size={28} color={accentColor} />
          </View>
        )}
        {!imageError ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
          />
        ) : (
          <View className="absolute inset-0 items-center justify-center">
            <Ionicons name="moon-outline" size={32} color={accentColor} />
          </View>
        )}

        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'transparent']}
          className="absolute top-0 left-0 right-0 h-10"
        />

        {isLocked && (
          <View className="absolute top-2 right-2">
            <PremiumBadge />
          </View>
        )}
      </View>

      <View className="p-3">
        <Text variant="bodyMedium" color="textPrimary" numberOfLines={2}>
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

export default function SleepStoriesScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const { isPremium, isInitialized } = useSubscriptionStore();

  const stories = useMemo(() => {
    const freeStories = SLEEP_STORY_TEMPLATES.filter((s) => !s.isPremium);
    const premiumStories = SLEEP_STORY_TEMPLATES.filter((s) => s.isPremium);
    return [...freeStories, ...premiumStories];
  }, []);

  const handleSelectStory = useCallback(
    (templateId: string, templateIsPremium?: boolean) => {
      if (templateIsPremium && isInitialized && !isPremium) {
        router.push('/paywall');
        return;
      }
      router.push(`/exercise-session?templateId=${templateId}`);
    },
    [isPremium, isInitialized, router]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: ExerciseTemplate; index: number }) => (
      <View style={{ marginLeft: index % 2 === 1 ? COLUMN_GAP : 0 }}>
        <SleepStoryGridCard
          story={item}
          themeColors={themeColors}
          isPremiumUser={isPremium}
          onPress={() => handleSelectStory(item.id, item.isPremium)}
        />
      </View>
    ),
    [themeColors, isPremium, handleSelectStory]
  );

  const keyExtractor = useCallback((item: ExerciseTemplate) => item.id, []);

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: themeColors.background }}
      edges={['top']}
    >
      <View
        className="flex-row items-center justify-between px-4 py-3"
        style={{ borderBottomWidth: 0.5, borderBottomColor: themeColors.divider }}
      >
        <Pressable
          onPress={() => router.back()}
          className="w-11 h-11 items-center justify-center"
          accessibilityLabel="Close"
          accessibilityRole="button"
        >
          <Ionicons name="close" size={28} color={themeColors.textPrimary} />
        </Pressable>
        <Text variant="h3" color="textPrimary">
          Sleep Stories
        </Text>
        <View className="w-11" />
      </View>

      <FlatList
        data={stories}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        contentContainerStyle={{
          paddingHorizontal: HORIZONTAL_PADDING,
          paddingTop: spacing.lg,
          paddingBottom: spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
      />
    </SafeAreaView>
  );
}
