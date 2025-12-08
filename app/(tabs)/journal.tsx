import { useEffect, useState, useCallback } from 'react';
import { View, RefreshControl, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { Text, AnimatedListItem, SwipeableRow, AnimatedHeader, NativePicker } from '@/src/components/ui';
import { JournalCard, PromptCard, SearchBar } from '@/src/components/journal';
import { useJournalStore } from '@/src/stores';
import { colors, darkColors, spacing } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';

const HEADER_EXPANDED_HEIGHT = 120;

const VIEW_MODES = ['Entries', 'Prompts'] as const;

export default function JournalScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;

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
    loadEntries,
    loadPrompts,
    setSearchQuery,
    performSearch,
    clearSearch,
    removeEntry,
  } = useJournalStore();

  const [viewModeIndex, setViewModeIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const isEntriesMode = viewModeIndex === 0;

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
        rightAction={{ icon: 'add', onPress: handleNewEntry }}
      />

      <Animated.ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.xxl,
          paddingTop: HEADER_EXPANDED_HEIGHT,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={themeColors.primary}
            colors={[themeColors.primary]}
            progressBackgroundColor={themeColors.surface}
          />
        }
      >
        <View className="mb-4">
          <NativePicker
            options={[...VIEW_MODES]}
            selectedIndex={viewModeIndex}
            onSelect={setViewModeIndex}
          />
        </View>

        {isEntriesMode ? (
          <>
            <View className="mb-4">
              <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                onClear={clearSearch}
              />
            </View>

            {displayedEntries.length > 0 ? (
              <View className="gap-2">
                {displayedEntries.map((item, index) => (
                  <AnimatedListItem key={item.id} index={index}>
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
                ))}
              </View>
            ) : (
              <View className="flex-1 justify-center items-center py-16">
                <Ionicons
                  name="book-outline"
                  size={64}
                  color={themeColors.textMuted}
                />
                <Text variant="body" color="textMuted" center className="mt-4">
                  {searchQuery
                    ? 'No entries match your search'
                    : 'No journal entries yet.\nTap + to start writing.'}
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            <Text variant="body" color="textSecondary" className="mb-4">
              Choose a prompt to inspire your writing
            </Text>

            {Object.entries(promptsByCategory).map(([category, categoryPrompts]) => (
              <View key={category} className="mb-6">
                <Text variant="h3" color="textPrimary" className="mb-3 capitalize">
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
          </>
        )}
      </Animated.ScrollView>
    </SafeAreaView>
  );
}
