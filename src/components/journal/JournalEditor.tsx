import { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Text, Button } from '@/src/components/ui';
import { MoodSelector } from '@/src/components/mood';
import { VoiceButton } from './VoiceButton';
import { colors, darkColors, typography } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
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
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
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
      className="flex-1"
      style={{ backgroundColor: themeColors.surface }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {prompt && (
        <View
          className="p-4 border-b"
          style={{
            backgroundColor: themeColors.primaryLight + '20',
            borderBottomColor: themeColors.border,
          }}
        >
          <Text variant="label" color="primary">
            {prompt.category.toUpperCase()}
          </Text>
          <Text variant="body" color="textPrimary" className="mt-1">
            {prompt.text}
          </Text>
        </View>
      )}

      <TextInput
        className="px-4 py-3 pb-2 border-b"
        style={[
          typography.h3,
          {
            color: themeColors.textPrimary,
            borderBottomColor: themeColors.borderLight,
          },
        ]}
        placeholder="Title (optional)"
        placeholderTextColor={themeColors.textMuted}
        value={title}
        onChangeText={setTitle}
        maxLength={100}
        returnKeyType="next"
        onSubmitEditing={() => contentRef.current?.focus()}
      />

      <TextInput
        ref={contentRef}
        className="flex-1 p-4"
        style={[typography.body, { color: themeColors.textPrimary, lineHeight: 26 }]}
        placeholder="What's on your mind?"
        placeholderTextColor={themeColors.textMuted}
        value={content}
        onChangeText={setContent}
        multiline
        textAlignVertical="top"
        maxLength={10000}
        autoFocus={!prompt}
      />

      <View
        className="flex-row items-center justify-between px-4 py-2 border-t"
        style={{ borderTopColor: themeColors.borderLight }}
      >
        <View className="flex-row items-center gap-2">
          <Text variant="caption" color="textMuted">
            {content.length.toLocaleString()} characters
          </Text>
          {hasUnsavedChanges && (
            <View
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: themeColors.warning }}
            />
          )}
        </View>

        <View className="flex-row items-center gap-2">
          <VoiceButton
            onTranscription={(text) => {
              setContent((prev) => prev + (prev ? ' ' : '') + text);
            }}
          />
          <Pressable
            onPress={toggleMoodPicker}
            className="p-2"
            accessibilityLabel="Add mood to entry"
          >
            <Ionicons
              name={mood ? 'happy' : 'happy-outline'}
              size={24}
              color={mood ? colors.mood[mood] : themeColors.textMuted}
            />
          </Pressable>
        </View>
      </View>

      {showMoodPicker && (
        <View
          className="p-4 border-t"
          style={{
            backgroundColor: themeColors.surfaceElevated,
            borderTopColor: themeColors.border,
          }}
        >
          <Text variant="captionMedium" color="textSecondary" center className="mb-4">
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

      <View
        className="flex-row p-4 gap-2 border-t"
        style={{ borderTopColor: themeColors.border }}
      >
        <Button variant="ghost" onPress={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button
          onPress={handleSave}
          disabled={!canSave}
          loading={isSaving}
          className="flex-[2]"
        >
          Save Entry
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
