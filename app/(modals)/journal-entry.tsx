import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { JournalEditor } from '@/src/components/journal';
import { useJournalStore } from '@/src/stores';
import { colors, darkColors } from '@/src/constants/theme';
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

  useEffect(() => {
    loadPrompts();
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
      setIsInitialized(true);
    }
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
