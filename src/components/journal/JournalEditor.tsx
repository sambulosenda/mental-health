import { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { Text } from '@/src/components/ui';
import { MoodSelector, MoodAnimation } from '@/src/components/mood';
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
      style={{ backgroundColor: themeColors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-4 py-3 border-b"
        style={{ borderBottomColor: themeColors.borderLight }}
      >
        <Pressable
          onPress={onCancel}
          className="w-10 h-10 items-center justify-center rounded-full"
          style={{ backgroundColor: themeColors.surfaceElevated }}
        >
          <Ionicons name="close" size={22} color={themeColors.textSecondary} />
        </Pressable>

        <View className="flex-row items-center gap-2">
          {hasUnsavedChanges && (
            <View
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: themeColors.warning }}
            />
          )}
          <Text variant="caption" color="textMuted">
            {content.length > 0 ? `${content.length.toLocaleString()} chars` : 'Draft'}
          </Text>
        </View>

        <Pressable
          onPress={handleSave}
          disabled={!canSave || isSaving}
          className="px-5 py-2.5 rounded-full"
          style={{
            backgroundColor: canSave ? themeColors.primary : themeColors.surfaceElevated,
            opacity: isSaving ? 0.7 : 1,
          }}
        >
          <Text
            variant="captionMedium"
            style={{ color: canSave ? '#FFFFFF' : themeColors.textMuted }}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Prompt banner */}
        {prompt && (
          <View
            className="mx-4 mt-4 p-4 rounded-xl"
            style={{ backgroundColor: themeColors.primaryLight + '15' }}
          >
            <View className="flex-row items-center gap-2 mb-2">
              <Ionicons name="sparkles" size={16} color={themeColors.iconPrimary} />
              <Text variant="label" color="textPrimary">
                {prompt.category.toUpperCase()}
              </Text>
            </View>
            <Text variant="body" color="textPrimary" style={{ lineHeight: 24 }}>
              {prompt.text}
            </Text>
          </View>
        )}

        {/* Title input */}
        <TextInput
          className="px-4 pt-6 pb-2"
          style={[
            typography.h2,
            { color: themeColors.textPrimary },
          ]}
          placeholder="Title"
          placeholderTextColor={themeColors.textMuted}
          value={title}
          onChangeText={setTitle}
          maxLength={100}
          returnKeyType="next"
          onSubmitEditing={() => contentRef.current?.focus()}
        />

        {/* Content input */}
        <TextInput
          ref={contentRef}
          className="px-4 pt-2 pb-8"
          style={[
            typography.body,
            {
              color: themeColors.textPrimary,
              lineHeight: 28,
              minHeight: 200,
            },
          ]}
          placeholder="Start writing..."
          placeholderTextColor={themeColors.textMuted}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          maxLength={10000}
          autoFocus={!prompt}
        />

        {/* Mood display */}
        {mood && !showMoodPicker && (
          <Animated.View
            entering={FadeIn.duration(200)}
            className="mx-4 mb-4"
          >
            <Pressable
              onPress={toggleMoodPicker}
              className="flex-row items-center gap-3 p-3 rounded-xl"
              style={{ backgroundColor: themeColors.surfaceElevated }}
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.mood[mood] + '20' }}
              >
                <MoodAnimation mood={mood} size={24} loop={false} />
              </View>
              <View className="flex-1">
                <Text variant="caption" color="textMuted">Mood</Text>
                <Text variant="bodyMedium" color="textPrimary">
                  {['', 'Very Low', 'Low', 'Neutral', 'Good', 'Great'][mood]}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={themeColors.textMuted} />
            </Pressable>
          </Animated.View>
        )}
      </ScrollView>

      {/* Bottom toolbar */}
      <View
        className="flex-row items-center justify-between px-4 py-3 border-t"
        style={{
          borderTopColor: themeColors.borderLight,
          backgroundColor: themeColors.background,
        }}
      >
        <View className="flex-row items-center gap-1">
          <VoiceButton
            onTranscription={(text) => {
              setContent((prev) => prev + (prev ? ' ' : '') + text);
            }}
          />
          <Pressable
            onPress={toggleMoodPicker}
            className="w-11 h-11 items-center justify-center rounded-full"
            style={{ backgroundColor: mood ? colors.mood[mood] + '20' : 'transparent' }}
            accessibilityLabel="Add mood to entry"
          >
            {mood ? (
              <MoodAnimation mood={mood} size={24} loop={false} />
            ) : (
              <Ionicons name="happy-outline" size={24} color={themeColors.textMuted} />
            )}
          </Pressable>
        </View>

        <View className="flex-row items-center gap-1">
          <Pressable
            className="w-11 h-11 items-center justify-center"
            accessibilityLabel="Add image"
          >
            <Ionicons name="image-outline" size={24} color={themeColors.textMuted} />
          </Pressable>
          <Pressable
            className="w-11 h-11 items-center justify-center"
            accessibilityLabel="Add tag"
          >
            <Ionicons name="pricetag-outline" size={22} color={themeColors.textMuted} />
          </Pressable>
        </View>
      </View>

      {/* Mood picker overlay */}
      {showMoodPicker && (
        <Animated.View
          entering={SlideInDown.duration(300).springify()}
          exiting={SlideOutDown.duration(200)}
          className="absolute bottom-0 left-0 right-0 rounded-t-3xl"
          style={{
            backgroundColor: themeColors.surface,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <View className="items-center pt-3 pb-2">
            <View
              className="w-10 h-1 rounded-full"
              style={{ backgroundColor: themeColors.borderLight }}
            />
          </View>
          <View className="px-6 pt-2 pb-8">
            <Text variant="h3" color="textPrimary" center className="mb-6">
              How are you feeling?
            </Text>
            <MoodSelector
              selectedMood={mood}
              onSelectMood={(m) => {
                setMood(m);
                setShowMoodPicker(false);
              }}
            />
            {mood && (
              <Pressable
                onPress={() => {
                  setMood(null);
                  setShowMoodPicker(false);
                }}
                className="mt-4 py-2"
              >
                <Text variant="body" color="textMuted" center>
                  Remove mood
                </Text>
              </Pressable>
            )}
          </View>
        </Animated.View>
      )}
    </KeyboardAvoidingView>
  );
}
