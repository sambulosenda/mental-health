import { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, FlatList, RefreshControl, Share, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { Text, Card, Button, AnimatedListItem, SwipeableRow, AnimatedHeader } from '@/src/components/ui';
import { JournalCard, PromptCard, SearchBar } from '@/src/components/journal';
import { useJournalStore } from '@/src/stores';
import { colors, darkColors, spacing } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import type { JournalEntry } from '@/src/types/journal';

const HEADER_EXPANDED_HEIGHT = 120;

type ViewMode = 'entries' | 'prompts';

export default function JournalScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const insets = useSafeAreaInsets();

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });
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
    removeEntry,
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

  const handleDeleteEntry = (entryId: string) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeEntry(entryId),
        },
      ]
    );
  };

  const handleShareEntry = async (entry: typeof entries[0]) => {
    try {
      await Share.share({
        message: `${entry.title ? entry.title + '\n\n' : ''}${entry.content}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const displayedEntries = searchQuery ? searchResults : entries;

  const promptsByCategory = prompts.reduce((acc, prompt) => {
    if (!acc[prompt.category]) {
      acc[prompt.category] = [];
    }
    acc[prompt.category].push(prompt);
    return acc;
  }, {} as Record<string, typeof prompts>);

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`} edges={['top']}>
      <AnimatedHeader
        scrollY={scrollY}
        title="Journal"
        subtitle="Capture your thoughts and reflections"
        showThemeToggle
      />

      <View className="flex-1" style={{ paddingTop: HEADER_EXPANDED_HEIGHT }}>
        <View className="px-6 mb-4">
          <Button fullWidth onPress={handleNewEntry}>
            New Entry
          </Button>
        </View>

        <View className="flex-row px-6 gap-2 mb-4">
        <Button
          variant={viewMode === 'entries' ? 'primary' : 'ghost'}
          size="sm"
          onPress={() => setViewMode('entries')}
          className="flex-1"
        >
          Entries
        </Button>
        <Button
          variant={viewMode === 'prompts' ? 'primary' : 'ghost'}
          size="sm"
          onPress={() => setViewMode('prompts')}
          className="flex-1"
        >
          Prompts
        </Button>
      </View>

      {viewMode === 'entries' ? (
        <View className="flex-1">
          <View className="px-6 mb-4">
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
              renderItem={({ item, index }) => (
                <AnimatedListItem index={index}>
                  <SwipeableRow onDelete={() => handleDeleteEntry(item.id)}>
                    <JournalCard
                      entry={item}
                      onPress={() => handleEntryPress(item.id)}
                      onEdit={() => handleEntryPress(item.id)}
                      onDelete={() => handleDeleteEntry(item.id)}
                      onShare={() => handleShareEntry(item)}
                    />
                  </SwipeableRow>
                </AnimatedListItem>
              )}
              contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={themeColors.primary}
                  colors={[themeColors.primary]}
                  progressBackgroundColor={themeColors.surface}
                />
              }
            />
          ) : (
            <View className="flex-1 justify-center items-center p-8">
              <Ionicons
                name="book-outline"
                size={64}
                color={themeColors.textMuted}
              />
              <Text variant="body" color="textMuted" center className="mt-4">
                {searchQuery
                  ? 'No entries match your search'
                  : 'No journal entries yet.\nTap "New Entry" to start writing.'}
              </Text>
            </View>
          )}
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}
          showsVerticalScrollIndicator={false}
        >
          <Text variant="body" color="textSecondary" className="mb-6">
            Choose a prompt to inspire your writing
          </Text>

          {Object.entries(promptsByCategory).map(([category, categoryPrompts]) => (
            <View key={category} className="mb-8">
              <Text variant="h3" color="textPrimary" className="mb-4 capitalize">
                {category}
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
      </View>
    </SafeAreaView>
  );
}
