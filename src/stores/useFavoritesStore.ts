import { create } from 'zustand';
import {
  getFavorites,
  getFavoriteIds,
  toggleFavorite as dbToggleFavorite,
  type ContentType,
  type Favorite,
} from '@/src/lib/database';

interface FavoritesState {
  // Data
  favorites: Favorite[];
  favoriteIds: Record<ContentType, Set<string>>;
  isLoading: boolean;

  // Actions
  loadFavorites: () => Promise<void>;
  toggleFavorite: (contentType: ContentType, contentId: string) => Promise<boolean>;
  isFavorite: (contentType: ContentType, contentId: string) => boolean;
  getFavoritesByType: (contentType: ContentType) => Favorite[];
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  favoriteIds: {
    meditation: new Set(),
    sleep_story: new Set(),
    exercise: new Set(),
  },
  isLoading: false,

  loadFavorites: async () => {
    set({ isLoading: true });
    try {
      const [allFavorites, meditationIds, sleepStoryIds, exerciseIds] = await Promise.all([
        getFavorites(),
        getFavoriteIds('meditation'),
        getFavoriteIds('sleep_story'),
        getFavoriteIds('exercise'),
      ]);

      set({
        favorites: allFavorites,
        favoriteIds: {
          meditation: meditationIds,
          sleep_story: sleepStoryIds,
          exercise: exerciseIds,
        },
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load favorites:', error);
      set({ isLoading: false });
    }
  },

  toggleFavorite: async (contentType, contentId) => {
    const { favoriteIds, favorites } = get();

    // Optimistic update
    const wasInFavorites = favoriteIds[contentType].has(contentId);
    const newIds = new Set(favoriteIds[contentType]);

    if (wasInFavorites) {
      newIds.delete(contentId);
    } else {
      newIds.add(contentId);
    }

    set({
      favoriteIds: {
        ...favoriteIds,
        [contentType]: newIds,
      },
    });

    try {
      const isNowFavorite = await dbToggleFavorite(contentType, contentId);

      // Reload full favorites list to get accurate data
      const allFavorites = await getFavorites();
      set({ favorites: allFavorites });

      return isNowFavorite;
    } catch (error) {
      // Revert on error
      console.error('Failed to toggle favorite:', error);
      set({
        favoriteIds: {
          ...get().favoriteIds,
          [contentType]: favoriteIds[contentType],
        },
      });
      return wasInFavorites;
    }
  },

  isFavorite: (contentType, contentId) => {
    const { favoriteIds } = get();
    return favoriteIds[contentType].has(contentId);
  },

  getFavoritesByType: (contentType) => {
    const { favorites } = get();
    return favorites.filter((f) => f.contentType === contentType);
  },
}));
