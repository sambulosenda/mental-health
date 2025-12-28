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
import { Text, SwipeableRow, AnimatedHeader } from '@/src/components/ui';
import { JournalCard, JournalEmptyState, SearchBar } from '@/src/components/journal';
import { useJournalStore } from '@/src/stores';
import { colors, darkColors, spacing } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';

const HEADER_EXPANDED_HEIGHT = 110;

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
    searchQuery,
    searchResults,
    loadEntries,
    setSearchQuery,
    performSearch,
    clearSearch,
    removeEntry,
  } = useJournalStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const debounce = setTimeout(() => {
        performSearch();
      }, 300);
      return () => clearTimeout(debounce);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEntries();
    setRefreshing(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNewEntry = () => {
    router.push('/(modals)/journal-entry');
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

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`} edges={['top']}>
      <AnimatedHeader
        scrollY={scrollY}
        title="Journal"
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
      </Animated.ScrollView>
    </SafeAreaView>
  );
}
