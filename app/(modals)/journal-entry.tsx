import { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { JournalEditor } from '@/src/components/journal';
import { useJournalStore } from '@/src/stores';
import { colors, spacing } from '@/src/constants/theme';
import type { JournalPrompt } from '@/src/types/journal';

export default function JournalEntryModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ promptId?: string; editId?: string }>();
  const {
    draftTitle,
    draftContent,
    draftMood,
    draftPromptId,
    editingId,
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

  useEffect(() => {
    loadPrompts();
  }, []);

  useEffect(() => {
    // Handle editing existing entry
    if (params.editId) {
      loadEntryForEditing(params.editId);
    }
    // Handle prompt selection
    else if (params.promptId) {
      const prompt = prompts.find((p) => p.id === params.promptId);
      if (prompt) {
        setSelectedPrompt(prompt);
      }
    }
  }, [params.editId, params.promptId, prompts]);

  const handleSave = async (data: {
    title: string;
    content: string;
    mood?: 1 | 2 | 3 | 4 | 5;
  }) => {
    // Update store with editor data
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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
});
