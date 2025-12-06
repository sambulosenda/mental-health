import { View, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { Text, Card, Button, AnimatedHeader } from '@/src/components/ui';
import { MoodSliderSelector, ActivityTags } from '@/src/components/mood';
import { useMoodStore } from '@/src/stores';
import { spacing, typography } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';

const HEADER_EXPANDED_HEIGHT = 120;

export default function TrackScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const {
    draftMood,
    draftActivities,
    draftNote,
    isLoading,
    setDraftMood,
    toggleDraftActivity,
    setDraftNote,
    saveMoodEntry,
    clearDraft,
  } = useMoodStore();

  const handleSave = async () => {
    const entry = await saveMoodEntry();
    if (entry) {
      Alert.alert(
        'Mood Logged',
        'Your mood has been saved successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.navigate('/(tabs)'),
          },
        ]
      );
    }
  };

  const handleClear = () => {
    Alert.alert(
      'Clear Entry',
      'Are you sure you want to clear this entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearDraft },
      ]
    );
  };

  const canSave = draftMood !== null;

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
        title="Track Mood"
        subtitle="How are you feeling right now?"
      />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.xxl * 2,
            paddingTop: HEADER_EXPANDED_HEIGHT + insets.top,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScroll={scrollHandler}
          scrollEventThrottle={16}
        >
          <Card className="p-6 py-8 mb-6">
            <MoodSliderSelector
              selectedMood={draftMood}
              onSelectMood={setDraftMood}
            />
          </Card>

          <View className="mb-6">
            <Text variant="h3" color="textPrimary" className="mb-4">
              What are you doing?
            </Text>
            <ActivityTags
              selectedActivities={draftActivities}
              onToggleActivity={toggleDraftActivity}
            />
          </View>

          <View className="mb-6">
            <Text variant="h3" color="textPrimary" className="mb-4">
              Add a note (optional)
            </Text>
            <TextInput
              className={`rounded-md border-[1.5px] p-4 min-h-[120px] ${
                isDark
                  ? 'bg-surface-dark-elevated border-border-dark'
                  : 'bg-surface-elevated border-border'
              }`}
              style={[typography.body, { color: isDark ? '#FAFAFA' : '#2C3E3E' }]}
              placeholder="How are you really feeling? What's on your mind?"
              placeholderTextColor={isDark ? '#707070' : '#8A9A9A'}
              value={draftNote}
              onChangeText={setDraftNote}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text variant="caption" color="textMuted" className="text-right mt-1">
              {draftNote.length}/500
            </Text>
          </View>

          <View className="mt-6 gap-2">
            <Button
              fullWidth
              onPress={handleSave}
              loading={isLoading}
              disabled={!canSave}
            >
              Save Entry
            </Button>
            {(draftMood || draftActivities.length > 0 || draftNote) && (
              <Button
                variant="ghost"
                fullWidth
                onPress={handleClear}
                className="mt-1"
              >
                Clear
              </Button>
            )}
          </View>
        </Animated.ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
