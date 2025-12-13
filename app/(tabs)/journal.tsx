import { useEffect, useState, useCallback } from 'react';
import { View, RefreshControl, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  FadeInDown,
} from 'react-native-reanimated';
import { Text, SwipeableRow, AnimatedHeader, NativePicker } from '@/src/components/ui';
import { JournalCard, JournalEmptyState, PromptCard, SearchBar } from '@/src/components/journal';
import { useJournalStore } from '@/src/stores';
import { colors, darkColors, spacing } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';

const HEADER_EXPANDED_HEIGHT = 110;

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
              <View className="gap-3">
                {displayedEntries.map((item, index) => (
                  <Animated.View
                    key={item.id}
                    entering={FadeInDown.duration(400).delay(index * 80).springify()}
                  >
                    <SwipeableRow onDelete={() => handleDeleteEntry(item.id)}>
                      <JournalCard
                        entry={item}
                        onPress={() => handleEntryPress(item.id)}
                        onEdit={() => handleEntryPress(item.id)}
                        onDelete={() => handleDeleteEntry(item.id)}
                        onShare={() => handleShareEntry(item)}
                      />
                    </SwipeableRow>
                  </Animated.View>
                ))}
              </View>
            ) : searchQuery ? (
              <View className="flex-1 justify-center items-center py-16">
                <View
                  className="w-16 h-16 rounded-2xl items-center justify-center mb-4"
                  style={{ backgroundColor: isDark ? `${themeColors.primary}20` : `${themeColors.primary}10` }}
                >
                  <Ionicons
                    name="search-outline"
                    size={32}
                    color={themeColors.primary}
                  />
                </View>
                <Text variant="bodyMedium" color="textPrimary" center>
                  No results found
                </Text>
                <Text variant="caption" color="textMuted" center className="mt-1">
                  Try a different search term
                </Text>
              </View>
            ) : (
              <JournalEmptyState onStartWriting={handleNewEntry} />
            )}
          </>
        ) : (
          <>
            <Animated.View
              entering={FadeInDown.duration(400).delay(100)}
              className="mb-6"
            >
              <Text variant="h3" color="textPrimary" className="mb-2">
                Find your inspiration
              </Text>
              <Text variant="body" color="textSecondary">
                Choose a prompt to guide your reflection
              </Text>
            </Animated.View>

            {Object.entries(promptsByCategory).map(([category, categoryPrompts], categoryIndex) => (
              <Animated.View
                key={category}
                className="mb-6"
                entering={FadeInDown.duration(400).delay(200 + categoryIndex * 100)}
              >
                <Text
                  variant="caption"
                  color="textSecondary"
                  style={{
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    marginBottom: 8,
                    marginLeft: 16,
                  }}
                >
                  {category}
                </Text>
                <View
                  style={{
                    borderRadius: 12,
                    overflow: 'hidden',
                  }}
                >
                  {categoryPrompts.map((prompt, promptIndex) => (
                    <PromptCard
                      key={prompt.id}
                      prompt={prompt}
                      onPress={() => handlePromptSelect(prompt.id)}
                      isFirst={promptIndex === 0}
                      isLast={promptIndex === categoryPrompts.length - 1}
                    />
                  ))}
                </View>
              </Animated.View>
            ))}
          </>
        )}
      </Animated.ScrollView>
    </SafeAreaView>
  );
}
