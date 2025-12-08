import { useEffect } from 'react';
import { View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { formatDistanceToNow } from 'date-fns';
import { Text, Card, AnimatedHeader, NativeGauge } from '@/src/components/ui';
import { MoodAnimation } from '@/src/components/mood';
import { InterventionPicker } from '@/src/components/interventions/InterventionPicker';
import { AssessmentCard } from '@/src/components/assessments';
import { useMoodStore, useAssessmentStore } from '@/src/stores';
import { GAD7_TEMPLATE, PHQ9_TEMPLATE } from '@/src/constants/assessments';
import { colors, darkColors, spacing, moodLabels } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';

const HEADER_EXPANDED_HEIGHT = 120;

export default function HomeScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const { todayEntries, entries, loadTodayEntries, loadEntries } = useMoodStore();
  const {
    lastGad7,
    lastPhq9,
    gad7IsDue,
    phq9IsDue,
    loadLastAssessments,
    checkDueStatus,
  } = useAssessmentStore();
  useEffect(() => {
    loadTodayEntries();
    loadEntries();
    loadLastAssessments();
    checkDueStatus();
  }, []);

  const greeting = getGreeting();
  const latestMood = todayEntries[0];

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
      <AnimatedHeader scrollY={scrollY} title={greeting} showThemeToggle />
      <Animated.ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl + 40, paddingTop: HEADER_EXPANDED_HEIGHT }}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {latestMood ? (
          <Card className="mb-6">
            <View className="flex-row items-center">
              <View
                className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                style={{ backgroundColor: colors.mood[latestMood.mood] }}
              >
                <MoodAnimation mood={latestMood.mood} size={36} loop={false} />
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
                <Ionicons name="add" size={24} color={themeColors.primary} />
              </Pressable>
            </View>
          </Card>
        ) : (
          <Card className="mb-6" onPress={() => router.navigate('/(tabs)/track')}>
            <View className="flex-row items-center">
              <View
                className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                style={{ backgroundColor: themeColors.primaryLight }}
              >
                <Ionicons name="happy-outline" size={32} color={themeColors.primary} />
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
          <Text variant="h3" color="textPrimary" className="mb-4">
            Talk with Zen
          </Text>
          <View className="gap-3">
            <Card onPress={() => router.push('/chat?type=checkin')}>
              <View className="flex-row items-center">
                <View
                  className="w-11 h-11 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: themeColors.primaryLight }}
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={20} color={themeColors.primary} />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text variant="bodyMedium" color="textPrimary">
                      2-min Check-in
                    </Text>
                    <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: themeColors.primaryLight }}>
                      <Text variant="label" style={{ color: themeColors.primary, fontSize: 10 }}>
                        Quick
                      </Text>
                    </View>
                  </View>
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
                  className="w-11 h-11 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: themeColors.warningLight }}
                >
                  <Ionicons name="chatbubbles-outline" size={20} color={themeColors.warning} />
                </View>
                <View className="flex-1">
                  <Text variant="bodyMedium" color="textPrimary">
                    Talk it out
                  </Text>
                  <Text variant="caption" color="textSecondary">
                    {"I'm here to listen"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={themeColors.textMuted} />
              </View>
            </Card>
          </View>
        </View>

        {/* Self-Assessments */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text variant="h3" color="textPrimary">
              Self-Assessments
            </Text>
            <Pressable
              onPress={() => router.navigate('/(tabs)/insights')}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              className="py-2 px-3 -my-2 -mx-3"
            >
              <Text variant="captionMedium" color="primary">
                View History
              </Text>
            </Pressable>
          </View>
          <View className="flex-row gap-3">
            <AssessmentCard
              template={GAD7_TEMPLATE}
              lastSession={lastGad7}
              isDue={gad7IsDue}
              onPress={() => router.push('/assessment-session?type=gad7')}
            />
            <AssessmentCard
              template={PHQ9_TEMPLATE}
              lastSession={lastPhq9}
              isDue={phq9IsDue}
              onPress={() => router.push('/assessment-session?type=phq9')}
            />
          </View>
        </View>

        {/* Suggested Exercises */}
        <View className="mb-6" style={{ marginHorizontal: -spacing.lg }}>
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

      </Animated.ScrollView>
    </SafeAreaView>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
