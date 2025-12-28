import { useEffect, useState, useMemo } from 'react';
import { Alert, View, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { JournalEditor } from '@/src/components/journal';
import { Text } from '@/src/components/ui';
import { useJournalStore } from '@/src/stores';
import { colors, darkColors, spacing } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import type { JournalPrompt } from '@/src/types/journal';

export default function JournalEntryModal() {
  const router = useRouter();
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const params = useLocalSearchParams<{ promptId?: string; editId?: string }>();
  const {
    draftTitle,
    draftContent,
    draftMood,
    isLoading,
    prompts,
    setDraftTitle,
    setDraftContent,
    setDraftMood,
    loadEntryForEditing,
    saveEntry,
    clearDraft,
    loadPrompts,
  } = useJournalStore();

  const [selectedPrompt, setSelectedPrompt] = useState<JournalPrompt | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showPromptPicker, setShowPromptPicker] = useState(false);

  const isNewEntry = !params.editId;
  const hasPreselectedPrompt = !!params.promptId;

  // Get 3 random prompts for inspiration
  const suggestedPrompts = useMemo(() => {
    if (prompts.length === 0) return [];
    const shuffled = [...prompts].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, [prompts]);

  useEffect(() => {
    loadPrompts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize once on mount
  useEffect(() => {
    if (isInitialized) return;

    if (params.editId) {
      loadEntryForEditing(params.editId);
      setIsInitialized(true);
    } else if (!params.promptId || prompts.length > 0) {
      // Clear draft for new entries (not editing)
      clearDraft();
      // Show prompt picker for new entries without preselected prompt
      if (!params.promptId && prompts.length > 0) {
        setShowPromptPicker(true);
      }
      setIsInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.editId, params.promptId, prompts.length, isInitialized]);

  // Find prompt after prompts are loaded
  useEffect(() => {
    if (params.promptId && prompts.length > 0 && !selectedPrompt) {
      const prompt = prompts.find((p) => p.id === params.promptId);
      if (prompt) {
        setSelectedPrompt(prompt);
      }
    }
  }, [params.promptId, prompts, selectedPrompt]);

  const handleSave = async (data: {
    title: string;
    content: string;
    mood?: 1 | 2 | 3 | 4 | 5;
  }) => {
    setDraftTitle(data.title);
    setDraftContent(data.content);
    if (data.mood) {
      setDraftMood(data.mood);
    }

    const entry = await saveEntry();
    if (entry) {
      router.back();
    } else {
      Alert.alert('Error', 'Failed to save entry. Please try again.');
    }
  };

  const handleCancel = () => {
    if (showPromptPicker) {
      setShowPromptPicker(false);
      return;
    }
    if (draftContent.trim()) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              clearDraft();
              router.back();
            },
          },
        ]
      );
    } else {
      clearDraft();
      router.back();
    }
  };

  const handleSelectPrompt = (prompt: JournalPrompt) => {
    setSelectedPrompt(prompt);
    setShowPromptPicker(false);
  };

  const handleSkipPrompts = () => {
    setShowPromptPicker(false);
  };

  // Show prompt picker for new entries without preselected prompt
  if (showPromptPicker && isNewEntry && !hasPreselectedPrompt && suggestedPrompts.length > 0) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: themeColors.background }}
        edges={['top', 'bottom']}
      >
        <View className="flex-row items-center justify-between px-4 py-3 border-b"
          style={{ borderBottomColor: themeColors.borderLight }}
        >
          <Pressable
            onPress={handleCancel}
            className="w-10 h-10 items-center justify-center rounded-full"
            style={{ backgroundColor: themeColors.surfaceElevated }}
          >
            <Ionicons name="close" size={22} color={themeColors.textSecondary} />
          </Pressable>
          <Text variant="bodyMedium" color="textPrimary">New Entry</Text>
          <Pressable onPress={handleSkipPrompts} className="px-3 py-2">
            <Text variant="body" style={{ color: themeColors.primary }}>Skip</Text>
          </Pressable>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ padding: spacing.lg }}>
          <Animated.View entering={FadeIn.duration(300)}>
            <View className="items-center mb-8">
              <View
                className="w-16 h-16 rounded-2xl items-center justify-center mb-4"
                style={{ backgroundColor: `${themeColors.primary}15` }}
              >
                <Ionicons name="sparkles" size={32} color={themeColors.primary} />
              </View>
              <Text variant="h2" color="textPrimary" center>Need inspiration?</Text>
              <Text variant="body" color="textSecondary" center className="mt-2">
                Choose a prompt to guide your reflection
              </Text>
            </View>

            <View className="gap-3">
              {suggestedPrompts.map((prompt, index) => (
                <Animated.View
                  key={prompt.id}
                  entering={FadeIn.duration(300).delay(index * 100)}
                >
                  <Pressable
                    onPress={() => handleSelectPrompt(prompt)}
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: themeColors.surfaceElevated,
                      borderWidth: 1,
                      borderColor: themeColors.borderLight,
                    }}
                  >
                    <Text variant="label" color="textMuted" className="mb-2">
                      {prompt.category.toUpperCase()}
                    </Text>
                    <Text variant="body" color="textPrimary" style={{ lineHeight: 24 }}>
                      {prompt.text}
                    </Text>
                  </Pressable>
                </Animated.View>
              ))}
            </View>

            <Pressable
              onPress={handleSkipPrompts}
              className="mt-6 py-4"
            >
              <Text variant="body" color="textMuted" center>
                Start with a blank page
              </Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: themeColors.background }}
      edges={['top', 'bottom']}
    >
      <JournalEditor
        initialTitle={draftTitle}
        initialContent={draftContent}
        initialMood={draftMood ?? undefined}
        prompt={selectedPrompt}
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={isLoading}
      />
    </SafeAreaView>
  );
}
