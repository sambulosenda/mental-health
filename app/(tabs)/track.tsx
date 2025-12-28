import { useState, useRef, useCallback } from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { Text, AnimatedHeader } from '@/src/components/ui';
import { MoodGradientSlider, ActivityTags } from '@/src/components/mood';
import { PostCheckInSuggestion } from '@/src/components/interventions/PostCheckInSuggestion';
import { useMoodStore } from '@/src/stores';
import { colors, darkColors, spacing, typography, borderRadius, type ActivityTagId } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';

const HEADER_EXPANDED_HEIGHT = 110;
const QUICK_CHECKIN_THRESHOLD_MS = 3000;

export default function TrackScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const {
    draftMood,
    draftActivities,
    draftNote,
    isLoading,
    setDraftMood,
    toggleDraftActivity,
    setDraftNote,
    saveMoodEntry,
  } = useMoodStore();

  const [showSuggestion, setShowSuggestion] = useState(false);
  const [savedMood, setSavedMood] = useState<number | null>(null);
  const [savedActivities, setSavedActivities] = useState<string[]>([]);

  // Quick vs detailed mode tracking
  const moodSelectedAtRef = useRef<number | null>(null);
  const hasEngagedDetailsRef = useRef(false);

  const handleMoodSelect = useCallback((mood: 1 | 2 | 3 | 4 | 5) => {
    if (moodSelectedAtRef.current === null) {
      moodSelectedAtRef.current = Date.now();
    }
    setDraftMood(mood);
  }, [setDraftMood]);

  const handleActivityToggle = useCallback((activity: ActivityTagId) => {
    hasEngagedDetailsRef.current = true;
    toggleDraftActivity(activity);
  }, [toggleDraftActivity]);

  const handleNoteChange = useCallback((text: string) => {
    if (text.length > 0) {
      hasEngagedDetailsRef.current = true;
    }
    setDraftNote(text);
  }, [setDraftNote]);

  const handleSave = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const currentMood = draftMood;
    const currentActivities = [...draftActivities];

    const entry = await saveMoodEntry();

    // Determine if this was a quick check-in
    const isQuickCheckin = !hasEngagedDetailsRef.current &&
      moodSelectedAtRef.current !== null &&
      (Date.now() - moodSelectedAtRef.current < QUICK_CHECKIN_THRESHOLD_MS);

    // Reset refs for next check-in
    moodSelectedAtRef.current = null;
    hasEngagedDetailsRef.current = false;

    if (!entry) {
      router.navigate('/(tabs)');
      return;
    }

    if (isQuickCheckin) {
      // Quick check-in: skip modal, go straight home
      router.navigate('/(tabs)');
    } else if (currentMood !== null) {
      // Detailed check-in: show suggestion modal
      setSavedMood(currentMood);
      setSavedActivities(currentActivities);
      setShowSuggestion(true);
    } else {
      router.navigate('/(tabs)');
    }
  };

  const handleDismissSuggestion = () => {
    setShowSuggestion(false);
    router.navigate('/(tabs)');
  };

  const handleSelectExercise = (templateId: string) => {
    setShowSuggestion(false);
    router.push(`/exercise-session?templateId=${templateId}`);
  };

  const canSave = draftMood !== null;
  const showActivities = draftMood !== null;
  const showNote = draftMood !== null;

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Done button animation
  const doneButtonAnimatedStyle = useAnimatedStyle(() => {
    const isEnabled = draftMood !== null;
    return {
      transform: [{ scale: withSpring(isEnabled ? 1 : 0.9, { damping: 15 }) }],
      opacity: withTiming(isEnabled ? 1 : 0.5, { duration: 150 }),
    };
  });

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`} edges={['top']}>
      <AnimatedHeader
        scrollY={scrollY}
        title="Check In"
        rightAction={
          <Animated.View style={doneButtonAnimatedStyle}>
            <Pressable
              onPress={handleSave}
              disabled={!canSave || isLoading}
              className="px-5 py-2.5 rounded-full"
              style={{
                backgroundColor: canSave ? themeColors.primary : 'transparent',
              }}
            >
              <Text
                variant="bodyMedium"
                style={{ color: canSave ? themeColors.textInverse : themeColors.textMuted }}
              >
                {isLoading ? 'Saving...' : 'Done'}
              </Text>
            </Pressable>
          </Animated.View>
        }
      />
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.xxl,
          paddingTop: HEADER_EXPANDED_HEIGHT,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        bottomOffset={20}
      >
          {/* Mood Gradient Slider */}
          <View style={{ marginBottom: spacing.lg }}>
            <MoodGradientSlider
              selectedMood={draftMood}
              onSelectMood={handleMoodSelect}
            />
          </View>

          {/* Activities */}
          {showActivities && (
            <Animated.View
              entering={FadeIn.duration(200)}
              style={{ marginBottom: spacing.md }}
            >
              <Text variant="bodyMedium" color="textSecondary" className="mb-2">
                Activities
              </Text>
              <ActivityTags
                selectedActivities={draftActivities}
                onToggleActivity={handleActivityToggle}
              />
            </Animated.View>
          )}

          {/* Note */}
          {showNote && (
            <Animated.View
              entering={FadeIn.duration(200).delay(50)}
            >
              <Text variant="bodyMedium" color="textSecondary" className="mb-2">
                Note (optional)
              </Text>
              <View
                style={{
                  backgroundColor: themeColors.surfaceElevated,
                  borderRadius: borderRadius.lg,
                  padding: spacing.md,
                  minHeight: 100,
                  // Subtle border for definition
                  borderWidth: isDark ? 0 : 0.5,
                  borderColor: isDark ? 'transparent' : 'rgba(0,0,0,0.04)',
                }}
              >
                <TextInput
                  style={[
                    typography.body,
                    {
                      color: themeColors.textPrimary,
                      flex: 1,
                      textAlignVertical: 'top',
                    },
                  ]}
                  placeholder="Write anything..."
                  placeholderTextColor={themeColors.textMuted}
                  value={draftNote}
                  onChangeText={handleNoteChange}
                  multiline
                  maxLength={500}
                />
                {draftNote.length > 400 && (
                  <Text
                    variant="label"
                    color="textMuted"
                    style={{ textAlign: 'right', marginTop: spacing.sm }}
                  >
                    {draftNote.length}/500
                  </Text>
                )}
              </View>
            </Animated.View>
          )}
      </KeyboardAwareScrollView>

      {/* Post check-in suggestion modal */}
      {savedMood !== null && (
        <PostCheckInSuggestion
          visible={showSuggestion}
          onDismiss={handleDismissSuggestion}
          onSelectExercise={handleSelectExercise}
          mood={savedMood}
          activities={savedActivities}
        />
      )}
    </SafeAreaView>
  );
}
