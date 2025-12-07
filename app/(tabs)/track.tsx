import { View, TextInput, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  FadeInDown,
} from 'react-native-reanimated';
import { Text, AnimatedHeader } from '@/src/components/ui';
import { MoodSliderSelector, ActivityTags } from '@/src/components/mood';
import { useMoodStore } from '@/src/stores';
import { colors, darkColors, spacing, typography } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';

const HEADER_EXPANDED_HEIGHT = 120;

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

  const handleSave = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const entry = await saveMoodEntry();
    if (entry) {
      router.navigate('/(tabs)');
    }
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
        subtitle="Take a moment to reflect"
        rightAction={
          <Pressable
            onPress={handleSave}
            disabled={!canSave || isLoading}
            className="px-4 py-2 rounded-full"
            style={{
              backgroundColor: canSave ? themeColors.primary : themeColors.border,
              opacity: canSave ? 1 : 0.5,
            }}
          >
            <Text
              variant="bodyMedium"
              style={{ color: canSave ? '#FFFFFF' : themeColors.textMuted }}
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
            paddingBottom: spacing.xl,
            paddingTop: HEADER_EXPANDED_HEIGHT,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScroll={scrollHandler}
          scrollEventThrottle={16}
        >
          {/* Mood Selection */}
          <View className="mb-8">
            <MoodSliderSelector
              selectedMood={draftMood}
              onSelectMood={setDraftMood}
            />
          </View>

          {/* Activities */}
          {showActivities && (
            <Animated.View
              entering={FadeInDown.duration(400).springify()}
              className="mb-8"
            >
              <Text variant="h3" color="textPrimary" className="mb-4">
                Activities
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
              entering={FadeInDown.duration(400).springify()}
              className="mb-6"
            >
              <View className="flex-row items-center justify-between mb-4">
                <Text variant="h3" color="textPrimary">
                  Add a note
                </Text>
                <Text variant="caption" color="textMuted">
                  Optional
                </Text>
              </View>
              <View
                className="rounded-xl border-[1.5px] overflow-hidden"
                style={{
                  backgroundColor: themeColors.surfaceElevated,
                  borderColor: themeColors.border,
                }}
              >
                <TextInput
                  className="p-4 min-h-[120px]"
                  style={[typography.body, { color: themeColors.textPrimary }]}
                  placeholder="What's on your mind? How are you really feeling?"
                  placeholderTextColor={themeColors.textMuted}
                  value={draftNote}
                  onChangeText={setDraftNote}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={500}
                />
                <View
                  className="flex-row items-center justify-between px-4 py-2 border-t"
                  style={{ borderTopColor: themeColors.borderLight }}
                >
                  <View className="flex-row items-center gap-3">
                    <Pressable>
                      <Ionicons
                        name="mic-outline"
                        size={22}
                        color={themeColors.textMuted}
                      />
                    </Pressable>
                  </View>
                  <Text variant="caption" color="textMuted">
                    {draftNote.length}/500
                  </Text>
                </View>
              </View>
            </Animated.View>
          )}
        </Animated.ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
