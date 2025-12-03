import { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card, Button } from '@/src/components/ui';
import { JournalCard, PromptCard, SearchBar } from '@/src/components/journal';
import { useJournalStore } from '@/src/stores';
import { colors, spacing } from '@/src/constants/theme';

type ViewMode = 'entries' | 'prompts';

export default function JournalScreen() {
  const router = useRouter();
  const {
    entries,
    prompts,
    searchQuery,
    searchResults,
    isLoading,
    loadEntries,
    loadPrompts,
    setSearchQuery,
    performSearch,
    clearSearch,
    setDraftPrompt,
  } = useJournalStore();

  const [viewMode, setViewMode] = useState<ViewMode>('entries');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEntries();
    loadPrompts();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const debounce = setTimeout(() => {
        performSearch();
      }, 300);
      return () => clearTimeout(debounce);
    }
  }, [searchQuery]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEntries();
    setRefreshing(false);
  }, []);

  const handleNewEntry = () => {
    router.push('/(modals)/journal-entry');
  };

  const handlePromptSelect = (promptId: string) => {
    router.push({
      pathname: '/(modals)/journal-entry',
      params: { promptId },
    });
  };

  const handleEntryPress = (entryId: string) => {
    router.push({
      pathname: '/(modals)/journal-entry',
      params: { editId: entryId },
    });
  };

  const displayedEntries = searchQuery ? searchResults : entries;

  // Group prompts by category
  const promptsByCategory = prompts.reduce((acc, prompt) => {
    if (!acc[prompt.category]) {
      acc[prompt.category] = [];
    }
    acc[prompt.category].push(prompt);
    return acc;
  }, {} as Record<string, typeof prompts>);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text variant="h1" color="textPrimary">
          Journal
        </Text>
        <Text variant="body" color="textSecondary" style={styles.subtitle}>
          Capture your thoughts and reflections
        </Text>
      </View>

      <View style={styles.actions}>
        <Button fullWidth onPress={handleNewEntry}>
          New Entry
        </Button>
      </View>

      <View style={styles.tabs}>
        <Button
          variant={viewMode === 'entries' ? 'primary' : 'ghost'}
          size="sm"
          onPress={() => setViewMode('entries')}
          style={styles.tab}
        >
          Entries
        </Button>
        <Button
          variant={viewMode === 'prompts' ? 'primary' : 'ghost'}
          size="sm"
          onPress={() => setViewMode('prompts')}
          style={styles.tab}
        >
          Prompts
        </Button>
      </View>

      {viewMode === 'entries' ? (
        <View style={styles.entriesContainer}>
          <View style={styles.searchContainer}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              onClear={clearSearch}
            />
          </View>

          {displayedEntries.length > 0 ? (
            <FlatList
              data={displayedEntries}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <JournalCard
                  entry={item}
                  onPress={() => handleEntryPress(item.id)}
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={colors.primary}
                />
              }
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="book-outline"
                size={64}
                color={colors.textMuted}
              />
              <Text variant="body" color="textMuted" center style={styles.emptyText}>
                {searchQuery
                  ? 'No entries match your search'
                  : 'No journal entries yet.\nTap "New Entry" to start writing.'}
              </Text>
            </View>
          )}
        </View>
      ) : (
        <ScrollView
          style={styles.promptsContainer}
          contentContainerStyle={styles.promptsContent}
          showsVerticalScrollIndicator={false}
        >
          <Text variant="body" color="textSecondary" style={styles.promptsIntro}>
            Choose a prompt to inspire your writing
          </Text>

          {Object.entries(promptsByCategory).map(([category, categoryPrompts]) => (
            <View key={category} style={styles.categorySection}>
              <Text variant="h3" color="textPrimary" style={styles.categoryTitle}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
              {categoryPrompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  onPress={() => handlePromptSelect(prompt.id)}
                />
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  actions: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
  },
  entriesContainer: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    marginTop: spacing.md,
  },
  promptsContainer: {
    flex: 1,
  },
  promptsContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  promptsIntro: {
    marginBottom: spacing.lg,
  },
  categorySection: {
    marginBottom: spacing.xl,
  },
  categoryTitle: {
    marginBottom: spacing.md,
    textTransform: 'capitalize',
  },
});
