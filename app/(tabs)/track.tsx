import { useState } from 'react';
import { View, TextInput, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  FadeIn,
} from 'react-native-reanimated';
import { Text, AnimatedHeader } from '@/src/components/ui';
import { MoodGradientSlider, ActivityTags } from '@/src/components/mood';
import { PostCheckInSuggestion } from '@/src/components/interventions/PostCheckInSuggestion';
import { useMoodStore } from '@/src/stores';
import { colors, darkColors, spacing, typography, borderRadius } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';

const HEADER_EXPANDED_HEIGHT = 110;

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

  const handleSave = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Store current values before saving (they get cleared after save)
    const currentMood = draftMood;
    const currentActivities = [...draftActivities];

    const entry = await saveMoodEntry();

    if (entry && currentMood !== null) {
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

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`} edges={['top']}>
      <AnimatedHeader
        scrollY={scrollY}
        title="Check In"
        rightAction={
          <Pressable
            onPress={handleSave}
            disabled={!canSave || isLoading}
            className="px-5 py-2.5 rounded-full"
            style={{
              backgroundColor: canSave ? themeColors.primary : 'transparent',
              opacity: canSave ? 1 : 0.5,
            }}
          >
            <Text
              variant="bodyMedium"
              style={{ color: canSave ? themeColors.textInverse : themeColors.textMuted }}
            >
              {isLoading ? 'Saving...' : 'Done'}
            </Text>
          </Pressable>
        }
      />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.xxl,
            paddingTop: HEADER_EXPANDED_HEIGHT,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScroll={scrollHandler}
          scrollEventThrottle={16}
        >
          {/* Mood Gradient Slider */}
          <View style={{ marginBottom: spacing.xxl }}>
            <MoodGradientSlider
              selectedMood={draftMood}
              onSelectMood={setDraftMood}
            />
          </View>

          {/* Activities */}
          {showActivities && (
            <Animated.View
              entering={FadeIn.duration(400).delay(100)}
              style={{ marginBottom: spacing.xl }}
            >
              <Text variant="h3" color="textPrimary" className="mb-4">
                What have you been up to?
              </Text>
              <ActivityTags
                selectedActivities={draftActivities}
                onToggleActivity={toggleDraftActivity}
              />
            </Animated.View>
          )}

          {/* Note */}
          {showNote && (
            <Animated.View
              entering={FadeIn.duration(400).delay(200)}
            >
              <Text variant="h3" color="textPrimary" className="mb-4">
                Add a note
              </Text>
              <View
                style={{
                  backgroundColor: themeColors.surfaceElevated,
                  borderRadius: borderRadius.lg,
                  padding: spacing.lg,
                  minHeight: 140,
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
                  onChangeText={setDraftNote}
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
        </Animated.ScrollView>
      </KeyboardAvoidingView>

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
