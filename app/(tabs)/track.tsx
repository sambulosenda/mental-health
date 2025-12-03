import { View, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text, Card, Button } from '@/src/components/ui';
import { MoodSelector, ActivityTags } from '@/src/components/mood';
import { useMoodStore } from '@/src/stores';
import { colors, spacing, borderRadius, typography } from '@/src/constants/theme';

export default function TrackScreen() {
  const router = useRouter();
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text variant="h1" color="textPrimary">
              Track Mood
            </Text>
            <Text variant="body" color="textSecondary" style={styles.subtitle}>
              How are you feeling right now?
            </Text>
          </View>

          <Card style={styles.moodCard}>
            <MoodSelector
              selectedMood={draftMood}
              onSelectMood={setDraftMood}
            />
          </Card>

          <View style={styles.section}>
            <Text variant="h3" color="textPrimary" style={styles.sectionTitle}>
              What are you doing?
            </Text>
            <ActivityTags
              selectedActivities={draftActivities}
              onToggleActivity={toggleDraftActivity}
            />
          </View>

          <View style={styles.section}>
            <Text variant="h3" color="textPrimary" style={styles.sectionTitle}>
              Add a note (optional)
            </Text>
            <TextInput
              style={styles.noteInput}
              placeholder="How are you really feeling? What's on your mind?"
              placeholderTextColor={colors.textMuted}
              value={draftNote}
              onChangeText={setDraftNote}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text variant="caption" color="textMuted" style={styles.charCount}>
              {draftNote.length}/500
            </Text>
          </View>

          <View style={styles.actions}>
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
                style={styles.clearButton}
              >
                Clear
              </Button>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
  header: {
    marginBottom: spacing.xl,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  moodCard: {
    paddingVertical: spacing.xl,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  noteInput: {
    ...typography.body,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.md,
    minHeight: 120,
    color: colors.textPrimary,
  },
  charCount: {
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  actions: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  clearButton: {
    marginTop: spacing.xs,
  },
});
