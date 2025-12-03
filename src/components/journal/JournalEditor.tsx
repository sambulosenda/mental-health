import { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Text, Button } from '@/src/components/ui';
import { MoodSelector } from '@/src/components/mood';
import { VoiceButton } from './VoiceButton';
import { colors, spacing, borderRadius, typography } from '@/src/constants/theme';
import type { JournalPrompt } from '@/src/types/journal';

interface JournalEditorProps {
  initialTitle?: string;
  initialContent?: string;
  initialMood?: 1 | 2 | 3 | 4 | 5;
  prompt?: JournalPrompt | null;
  onSave: (data: {
    title: string;
    content: string;
    mood?: 1 | 2 | 3 | 4 | 5;
  }) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

export function JournalEditor({
  initialTitle = '',
  initialContent = '',
  initialMood,
  prompt,
  onSave,
  onCancel,
  isSaving = false,
}: JournalEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [mood, setMood] = useState<(1 | 2 | 3 | 4 | 5) | null>(initialMood ?? null);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const contentRef = useRef<TextInput>(null);

  useEffect(() => {
    const hasChanges =
      title !== initialTitle ||
      content !== initialContent ||
      mood !== initialMood;
    setHasUnsavedChanges(hasChanges);
  }, [title, content, mood, initialTitle, initialContent, initialMood]);

  const handleSave = async () => {
    if (!content.trim()) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await onSave({
      title: title.trim(),
      content: content.trim(),
      mood: mood ?? undefined,
    });
  };

  const toggleMoodPicker = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowMoodPicker(!showMoodPicker);
  };

  const canSave = content.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {prompt && (
        <View style={styles.promptBanner}>
          <Text variant="label" color="primary">
            {prompt.category.toUpperCase()}
          </Text>
          <Text variant="body" color="textPrimary" style={styles.promptText}>
            {prompt.text}
          </Text>
        </View>
      )}

      <TextInput
        style={styles.titleInput}
        placeholder="Title (optional)"
        placeholderTextColor={colors.textMuted}
        value={title}
        onChangeText={setTitle}
        maxLength={100}
        returnKeyType="next"
        onSubmitEditing={() => contentRef.current?.focus()}
      />

      <TextInput
        ref={contentRef}
        style={styles.contentInput}
        placeholder="What's on your mind?"
        placeholderTextColor={colors.textMuted}
        value={content}
        onChangeText={setContent}
        multiline
        textAlignVertical="top"
        maxLength={10000}
        autoFocus={!prompt}
      />

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Text variant="caption" color="textMuted">
            {content.length.toLocaleString()} characters
          </Text>
          {hasUnsavedChanges && (
            <View style={styles.unsavedDot} />
          )}
        </View>

        <View style={styles.footerRight}>
          <VoiceButton
            onTranscription={(text) => {
              setContent((prev) => prev + (prev ? ' ' : '') + text);
            }}
          />
          <Pressable
            onPress={toggleMoodPicker}
            style={styles.moodToggle}
            accessibilityLabel="Add mood to entry"
          >
            <Ionicons
              name={mood ? 'happy' : 'happy-outline'}
              size={24}
              color={mood ? colors.mood[mood] : colors.textMuted}
            />
          </Pressable>
        </View>
      </View>

      {showMoodPicker && (
        <View style={styles.moodPicker}>
          <Text variant="captionMedium" color="textSecondary" style={styles.moodLabel}>
            How does this make you feel?
          </Text>
          <MoodSelector
            selectedMood={mood}
            onSelectMood={(m) => {
              setMood(m);
              setShowMoodPicker(false);
            }}
          />
        </View>
      )}

      <View style={styles.actions}>
        <Button
          variant="ghost"
          onPress={onCancel}
          style={styles.cancelButton}
        >
          Cancel
        </Button>
        <Button
          onPress={handleSave}
          disabled={!canSave}
          loading={isSaving}
          style={styles.saveButton}
        >
          Save Entry
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  promptBanner: {
    backgroundColor: colors.primaryLight + '20',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  promptText: {
    marginTop: spacing.xs,
  },
  titleInput: {
    ...typography.h3,
    color: colors.textPrimary,
    padding: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  contentInput: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
    padding: spacing.md,
    lineHeight: 26,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  unsavedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.warning,
  },
  moodToggle: {
    padding: spacing.sm,
  },
  moodPicker: {
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  moodLabel: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
  },
});
