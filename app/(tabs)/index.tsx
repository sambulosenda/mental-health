import { useEffect, useState } from 'react';
import { View, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { format } from 'date-fns';
import { Text, Card, Button, AnimatedHeader, AnimatedListItem, NativeGauge, NativeBottomSheet } from '@/src/components/ui';
import { MoodCard, MoodAnimation } from '@/src/components/mood';
import { InterventionPicker } from '@/src/components/interventions/InterventionPicker';
import { useMoodStore } from '@/src/stores';
import { colors, darkColors, spacing, moodLabels, activityTags } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import type { MoodEntry } from '@/src/types/mood';

const HEADER_EXPANDED_HEIGHT = 120;

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const { todayEntries, entries, loadTodayEntries, loadEntries } = useMoodStore();
  const [selectedEntry, setSelectedEntry] = useState<MoodEntry | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadTodayEntries();
    loadEntries();
  }, []);

  const handleMoodPress = (entry: MoodEntry) => {
    setSelectedEntry(entry);
    setShowDetails(true);
  };

  const today = new Date();
  const greeting = getGreeting();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const latestMood = todayEntries[0];
  const recentEntries = entries.slice(0, 5);

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const weekEntries = entries.filter((e) => e.timestamp >= weekAgo);
  const weeklyAverage =
    weekEntries.length > 0
      ? weekEntries.reduce((sum, e) => sum + e.mood, 0) / weekEntries.length
      : null;

  const uniqueDaysTracked = new Set(
    weekEntries.map((e) => new Date(e.timestamp).toDateString())
  ).size;

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`} edges={['top']}>
      <AnimatedHeader scrollY={scrollY} title={greeting} subtitle={formattedDate} showThemeToggle />
      <Animated.ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, paddingTop: HEADER_EXPANDED_HEIGHT }}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {latestMood ? (
          <Card className="mb-6">
            <Text variant="captionMedium" color="primary" className="mb-2">
              Latest Check-in
            </Text>
            <MoodCard entry={latestMood} compact />
            <Button
              variant="secondary"
              size="sm"
              onPress={() => router.navigate('/(tabs)/track')}
              className="mt-4"
            >
              Log Another
            </Button>
          </Card>
        ) : (
          <Card className="mb-6" onPress={() => router.navigate('/(tabs)/track')}>
            <Text variant="captionMedium" color="primary" className="mb-1">
              Today's Check-in
            </Text>
            <Text variant="h3" color="textPrimary">
              How are you feeling?
            </Text>
            <Text variant="body" color="textSecondary" className="mt-2">
              Tap to log your first mood of the day
            </Text>
            <Ionicons
              name="add-circle"
              size={32}
              color={themeColors.primary}
              style={{ position: 'absolute', right: 16, top: 16 }}
            />
          </Card>
        )}

        {/* AI Chat Cards */}
        <View className="mb-6">
          <Text variant="h3" color="textPrimary" className="mb-4">
            Talk with Zen
          </Text>
          <View className="gap-3">
            <Card onPress={() => router.push('/chat?type=checkin')}>
              <View className="flex-row items-center">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: themeColors.primaryLight }}
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={20} color={themeColors.primary} />
                </View>
                <View className="flex-1">
                  <Text variant="bodyMedium" color="textPrimary">
                    2-min Check-in
                  </Text>
                  <Text variant="caption" color="textSecondary">
                    Quick guided mood check
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={themeColors.textMuted} />
              </View>
            </Card>
            <Card onPress={() => router.push('/chat?type=chat')}>
              <View className="flex-row items-center">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: themeColors.primaryLight }}
                >
                  <Ionicons name="chatbubbles-outline" size={20} color={themeColors.primary} />
                </View>
                <View className="flex-1">
                  <Text variant="bodyMedium" color="textPrimary">
                    Talk it out
                  </Text>
                  <Text variant="caption" color="textSecondary">
                    I'm here to listen
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={themeColors.textMuted} />
              </View>
            </Card>
          </View>
        </View>

        {/* Suggested Exercises */}
        <View className="mb-6 -mx-4">
          <InterventionPicker
            onSelectExercise={(templateId) => router.push(`/exercise-session?templateId=${templateId}`)}
            title="Suggested for You"
          />
        </View>

        {(weeklyAverage !== null || uniqueDaysTracked > 0) && (
          <View className="mb-6">
            <Text variant="h3" color="textPrimary" className="mb-4">
              This Week
            </Text>
            <Card variant="flat">
              <View className="flex-row items-center py-2 gap-6">
                <NativeGauge
                  value={uniqueDaysTracked}
                  maxValue={7}
                  label="Days Tracked"
                  size={90}
                />
                <View className="flex-1 gap-2">
                  <View className="flex-row justify-between items-center">
                    <Text variant="caption" color="textSecondary">Avg. Mood</Text>
                    <Text variant="bodyMedium" color="primary">
                      {weeklyAverage?.toFixed(1) ?? '-'}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text variant="caption" color="textSecondary">Check-ins</Text>
                    <Text variant="bodyMedium" color="primary">
                      {weekEntries.length}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text variant="caption" color="textSecondary">Today</Text>
                    <Text variant="bodyMedium" color="primary">
                      {todayEntries.length}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          </View>
        )}

        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text variant="h3" color="textPrimary">
              Recent Activity
            </Text>
            {entries.length > 5 && (
              <Pressable onPress={() => router.navigate('/(tabs)/insights')}>
                <Text variant="captionMedium" color="primary">
                  See All
                </Text>
              </Pressable>
            )}
          </View>
          {recentEntries.length > 0 ? (
            <View className="gap-4">
              {recentEntries.map((entry, index) => (
                <AnimatedListItem key={entry.id} index={index}>
                  <MoodCard entry={entry} onPress={() => handleMoodPress(entry)} />
                </AnimatedListItem>
              ))}
            </View>
          ) : (
            <Card variant="flat" className="p-8 items-center">
              <Ionicons
                name="happy-outline"
                size={48}
                color={themeColors.textMuted}
                style={{ marginBottom: 16 }}
              />
              <Text variant="body" color="textMuted" center>
                No entries yet.{'\n'}Start tracking your mood to see your activity here.
              </Text>
            </Card>
          )}
        </View>
      </Animated.ScrollView>

      <NativeBottomSheet
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title="Mood Details"
      >
        {selectedEntry && (
          <View className="pt-2">
            <View className="flex-row items-center mb-6">
              <View
                className="w-14 h-14 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.mood[selectedEntry.mood] }}
              >
                <MoodAnimation mood={selectedEntry.mood} size={32} />
              </View>
              <View className="ml-4 flex-1">
                <Text variant="h3" color="textPrimary">
                  {moodLabels[selectedEntry.mood].label}
                </Text>
                <Text variant="caption" color="textSecondary">
                  {format(selectedEntry.timestamp, 'EEEE, MMMM d • h:mm a')}
                </Text>
              </View>
            </View>

            {selectedEntry.activities.length > 0 && (
              <View className="mb-4">
                <Text variant="captionMedium" color="textMuted" className="mb-1">
                  Activities
                </Text>
                <View className="flex-row flex-wrap gap-1">
                  {selectedEntry.activities.map((actId) => {
                    const activity = activityTags.find((t) => t.id === actId);
                    return activity ? (
                      <View
                        key={actId}
                        className={`px-2 py-1 rounded-lg ${isDark ? 'bg-surface-dark-elevated' : 'bg-surface-elevated'}`}
                      >
                        <Text variant="caption" color="textSecondary">
                          {activity.label}
                        </Text>
                      </View>
                    ) : null;
                  })}
                </View>
              </View>
            )}

            {selectedEntry.note && (
              <View className="mb-4">
                <Text variant="captionMedium" color="textMuted" className="mb-1">
                  Note
                </Text>
                <Text variant="body" color="textSecondary">
                  {selectedEntry.note}
                </Text>
              </View>
            )}
          </View>
        )}
      </NativeBottomSheet>
    </SafeAreaView>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
