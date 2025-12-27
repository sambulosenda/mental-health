import { create } from 'zustand';
import type { JournalEntry, JournalPrompt } from '@/src/types/journal';
import {
  createJournalEntry,
  updateJournalEntry,
  getAllJournalEntries,
  getJournalEntryById,
  searchJournalEntries,
  deleteJournalEntry,
  deleteAllJournalEntries,
  getAllPrompts,
  getRandomPrompt,
  markPromptUsed,
} from '@/src/lib/database';
import { asyncAction, silentAction } from './utils';
import { useGamificationStore } from './useGamificationStore';

interface JournalState {
  // Data
  entries: JournalEntry[];
  prompts: JournalPrompt[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  searchResults: JournalEntry[];

  // Draft entry
  draftTitle: string;
  draftContent: string;
  draftPromptId: string | null;
  draftMood: (1 | 2 | 3 | 4 | 5) | null;
  draftTags: string[];
  editingId: string | null;

  // Actions
  setDraftTitle: (title: string) => void;
  setDraftContent: (content: string) => void;
  setDraftPrompt: (prompt: JournalPrompt | null) => void;
  setDraftMood: (mood: (1 | 2 | 3 | 4 | 5) | null) => void;
  addDraftTag: (tag: string) => void;
  removeDraftTag: (tag: string) => void;
  clearDraft: () => void;
  loadEntryForEditing: (id: string) => Promise<void>;

  // CRUD operations
  loadEntries: () => Promise<void>;
  loadPrompts: () => Promise<void>;
  saveEntry: () => Promise<JournalEntry | null>;
  removeEntry: (id: string) => Promise<void>;

  // Search
  setSearchQuery: (query: string) => void;
  performSearch: () => Promise<void>;
  clearSearch: () => void;

  // Prompts
  getRandomPrompt: (category?: string) => Promise<JournalPrompt | null>;
  clearEntries: () => Promise<void>;
}

export const useJournalStore = create<JournalState>((set, get) => ({
  // Initial state
  entries: [],
  prompts: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  searchResults: [],

  draftTitle: '',
  draftContent: '',
  draftPromptId: null,
  draftMood: null,
  draftTags: [],
  editingId: null,

  // Draft actions
  setDraftTitle: (title) => set({ draftTitle: title }),
  setDraftContent: (content) => set({ draftContent: content }),
  setDraftPrompt: (prompt) => set({ draftPromptId: prompt?.id ?? null }),
  setDraftMood: (mood) => set({ draftMood: mood }),

  addDraftTag: (tag) => {
    const current = get().draftTags;
    if (!current.includes(tag)) {
      set({ draftTags: [...current, tag] });
    }
  },

  removeDraftTag: (tag) => {
    set({ draftTags: get().draftTags.filter((t) => t !== tag) });
  },

  clearDraft: () =>
    set({
      draftTitle: '',
      draftContent: '',
      draftPromptId: null,
      draftMood: null,
      draftTags: [],
      editingId: null,
    }),

  loadEntryForEditing: async (id) => {
    const entry = await getJournalEntryById(id);
    if (entry) {
      set({
        draftTitle: entry.title ?? '',
        draftContent: entry.content,
        draftPromptId: entry.promptId ?? null,
        draftMood: entry.mood ?? null,
        draftTags: entry.tags,
        editingId: id,
      });
    }
  },

  // Load all entries
  loadEntries: async () => {
    await asyncAction(set, { errorFallback: 'Failed to load entries' }, async () => {
      const entries = await getAllJournalEntries();
      return { entries };
    });
  },

  // Load prompts
  loadPrompts: async () => {
    await silentAction(async () => {
      const prompts = await getAllPrompts();
      set({ prompts });
    }, 'loadPrompts');
  },

  // Save entry (create or update)
  saveEntry: async () => {
    const { draftContent, draftTitle, draftPromptId, draftMood, draftTags, editingId } = get();

    if (!draftContent.trim()) {
      set({ error: 'Please write something' });
      return null;
    }

    let savedEntry: JournalEntry | null = null;

    const success = await asyncAction(
      set,
      { errorFallback: 'Failed to save entry' },
      async () => {
        let entry: JournalEntry | null;

        if (editingId) {
          entry = await updateJournalEntry(editingId, {
            title: draftTitle || undefined,
            content: draftContent,
            mood: draftMood ?? undefined,
            tags: draftTags,
          });
        } else {
          entry = await createJournalEntry({
            title: draftTitle || undefined,
            content: draftContent,
            promptId: draftPromptId ?? undefined,
            mood: draftMood ?? undefined,
            tags: draftTags,
          });

          if (draftPromptId) {
            await markPromptUsed(draftPromptId);
          }
        }

        savedEntry = entry;
        const entries = await getAllJournalEntries();

        return {
          entries,
          draftTitle: '',
          draftContent: '',
          draftPromptId: null,
          draftMood: null,
          draftTags: [],
          editingId: null,
        };
      }
    );

    // Record activity for gamification (only for new entries, not edits)
    if (success && savedEntry && !editingId) {
      useGamificationStore.getState().recordActivity('journal');
    }

    return success ? savedEntry : null;
  },

  // Remove entry
  removeEntry: async (id) => {
    await asyncAction(set, { errorFallback: 'Failed to delete entry' }, async () => {
      await deleteJournalEntry(id);
      return {
        entries: get().entries.filter((e) => e.id !== id),
      };
    });
  },

  // Search
  setSearchQuery: (query) => set({ searchQuery: query }),

  performSearch: async () => {
    const { searchQuery } = get();
    if (!searchQuery.trim()) {
      set({ searchResults: [] });
      return;
    }

    await silentAction(async () => {
      const results = await searchJournalEntries(searchQuery);
      set({ searchResults: results });
    }, 'performSearch');
  },

  clearSearch: () => set({ searchQuery: '', searchResults: [] }),

  // Get random prompt
  getRandomPrompt: async (category) => {
    return getRandomPrompt(category);
  },

  // Clear all entries
  clearEntries: async () => {
    await asyncAction(set, { errorFallback: 'Failed to clear entries' }, async () => {
      await deleteAllJournalEntries();
      return { entries: [], searchResults: [] };
    });
  },
}));
