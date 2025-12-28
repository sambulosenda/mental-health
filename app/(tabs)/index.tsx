import { useEffect, useCallback } from 'react';
import { View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { formatDistanceToNow } from 'date-fns';
import { Text, Card, AnimatedHeader } from '@/src/components/ui';
import { MoodAnimation } from '@/src/components/mood';
import { InterventionPicker } from '@/src/components/interventions/InterventionPicker';
import { SleepStoriesSection } from '@/src/components/sleep';
import { StreakCard, BadgeCelebration } from '@/src/components/gamification';
import { useMoodStore, useSubscriptionStore } from '@/src/stores';
import { useGamificationStore } from '@/src/stores/useGamificationStore';
import { usePremiumFeature } from '@/src/hooks/usePremiumFeature';
import { colors, darkColors, spacing, moodLabels } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';

const HEADER_EXPANDED_HEIGHT = 110;

export default function HomeScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const { todayEntries, loadTodayEntries } = useMoodStore();
  const { isPremium } = useSubscriptionStore();
  const { requirePremium } = usePremiumFeature();
  const {
    streaks,
    pendingCelebrations,
    loadGamificationData,
    dismissCelebration,
  } = useGamificationStore();

  const handleChatPress = useCallback(
    (type: 'checkin' | 'chat') => {
      requirePremium(() => {
        router.push(`/chat?type=${type}`);
      });
    },
    [requirePremium, router]
  );

  useEffect(() => {
    loadTodayEntries();
    loadGamificationData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const greeting = getGreeting();
  const latestMood = todayEntries[0];
  const currentStreak = streaks.overall.currentStreak;
  const headerSubtitle = currentStreak > 0 ? `🔥 ${currentStreak} day streak` : undefined;

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`} edges={['top']}>
      <AnimatedHeader scrollY={scrollY} title={greeting} subtitle={headerSubtitle} showThemeToggle />
      <Animated.ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, paddingTop: HEADER_EXPANDED_HEIGHT }}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {latestMood ? (
          <Card className="mb-6">
            <View className="flex-row items-center">
              <View
                className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                style={{ backgroundColor: colors.mood[latestMood.mood] }}
              >
                <MoodAnimation mood={latestMood.mood} size={32} loop={false} />
              </View>
              <View className="flex-1">
                <Text variant="caption" color="textMuted" className="mb-0.5">
                  Latest Check-in
                </Text>
                <Text variant="h3" color="textPrimary">
                  {moodLabels[latestMood.mood].label}
                </Text>
                <Text variant="caption" color="textSecondary">
                  {formatDistanceToNow(latestMood.timestamp, { addSuffix: true })}
                </Text>
              </View>
              <Pressable
                onPress={() => router.navigate('/(tabs)/track')}
                className="w-11 h-11 rounded-full items-center justify-center"
                style={{ backgroundColor: themeColors.primaryLight }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="add" size={24} color={themeColors.textInverse} />
              </Pressable>
            </View>
          </Card>
        ) : (
          <Card className="mb-6" onPress={() => router.navigate('/(tabs)/track')}>
            <View className="flex-row items-center">
              <View
                className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                style={{ backgroundColor: themeColors.primaryLight }}
              >
                <Ionicons name="happy-outline" size={28} color={themeColors.textInverse} />
              </View>
              <View className="flex-1">
                <Text variant="caption" color="textMuted" className="mb-0.5">
                  {"Today's Check-in"}
                </Text>
                <Text variant="h3" color="textPrimary">
                  How are you feeling?
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={themeColors.textMuted} />
            </View>
          </Card>
        )}

        {/* AI Chat Cards */}
        <View className="mb-6">
          <View className="flex-row items-center gap-2 mb-4">
            <Text variant="h3" color="textPrimary">
              Talk with Softmind
            </Text>
            {!isPremium && (
              <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: isDark ? `${themeColors.warning}30` : `${themeColors.warning}15` }}>
                <Text variant="label" style={{ color: themeColors.warning, fontSize: 10 }}>
                  PRO
                </Text>
              </View>
            )}
          </View>
          <View className="gap-3">
            <Card onPress={() => handleChatPress('checkin')}>
              <View className="flex-row items-center">
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                  style={{ backgroundColor: themeColors.primaryLight }}
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={20} color={themeColors.textInverse} />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text variant="bodyMedium" color="textPrimary">
                      2-min Check-in
                    </Text>
                    <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: isDark ? `${themeColors.primary}30` : `${themeColors.primary}15` }}>
                      <Text variant="label" style={{ color: themeColors.primary, fontSize: 10 }}>
                        QUICK
                      </Text>
                    </View>
                  </View>
                  <Text variant="caption" color="textSecondary">
                    Understand what's behind your mood
                  </Text>
                </View>
                {!isPremium && <Ionicons name="lock-closed" size={16} color={themeColors.textMuted} style={{ marginRight: 4 }} />}
                <Ionicons name="chevron-forward" size={20} color={themeColors.textMuted} />
              </View>
            </Card>
            <Card onPress={() => handleChatPress('chat')}>
              <View className="flex-row items-center">
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                  style={{ backgroundColor: themeColors.warningLight }}
                >
                  <Ionicons name="chatbubbles-outline" size={20} color={themeColors.warning} />
                </View>
                <View className="flex-1">
                  <Text variant="bodyMedium" color="textPrimary">
                    Talk it out
                  </Text>
                  <Text variant="caption" color="textSecondary">
                    Open conversation when you need to vent
                  </Text>
                </View>
                {!isPremium && <Ionicons name="lock-closed" size={16} color={themeColors.textMuted} style={{ marginRight: 4 }} />}
                <Ionicons name="chevron-forward" size={20} color={themeColors.textMuted} />
              </View>
            </Card>
          </View>
        </View>

        {/* Sleep Stories Section */}
        <View className="mb-6">
          <SleepStoriesSection maxStories={6} />
        </View>

        {/* Crisis Support - Quick Access */}
        <Pressable
          onPress={() => router.push('/crisis')}
          className="mb-6"
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <View
            className="flex-row items-center px-4 py-3 rounded-xl"
            style={{ backgroundColor: isDark ? `${themeColors.error}15` : `${themeColors.error}08` }}
          >
            <View
              className="w-8 h-8 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: `${themeColors.error}20` }}
            >
              <Ionicons name="heart" size={16} color={themeColors.error} />
            </View>
            <View className="flex-1">
              <Text variant="caption" style={{ color: themeColors.error }}>
                Need support right now?
              </Text>
              <Text variant="caption" color="textSecondary">
                View crisis resources
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={themeColors.error} />
          </View>
        </Pressable>

        {/* Suggested Exercises */}
        <View className="mb-6" style={{ marginHorizontal: -spacing.lg }}>
          <InterventionPicker
            onSelectExercise={(templateId) => router.push(`/exercise-session?templateId=${templateId}`)}
            title="Suggested for You"
          />
        </View>

        {/* Streak Card */}
        <View className="mb-6">
          <Text variant="h3" color="textPrimary" className="mb-4">
            Your Streak
          </Text>
          <StreakCard onPress={() => router.push('/achievements')} />
        </View>

      </Animated.ScrollView>

      {/* Badge Celebration Modal */}
      <BadgeCelebration
        badge={pendingCelebrations[0] ?? null}
        onDismiss={() => {
          if (pendingCelebrations[0]) {
            dismissCelebration(pendingCelebrations[0].badgeId);
          }
        }}
      />
    </SafeAreaView>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
