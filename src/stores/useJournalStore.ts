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
    set({ isLoading: true, error: null });
    try {
      const entries = await getAllJournalEntries();
      set({ entries, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load entries',
        isLoading: false,
      });
    }
  },

  // Load prompts
  loadPrompts: async () => {
    try {
      const prompts = await getAllPrompts();
      set({ prompts });
    } catch (error) {
      console.error('Failed to load prompts:', error);
    }
  },

  // Save entry (create or update)
  saveEntry: async () => {
    const { draftContent, draftTitle, draftPromptId, draftMood, draftTags, editingId } = get();

    if (!draftContent.trim()) {
      set({ error: 'Please write something' });
      return null;
    }

    set({ isLoading: true, error: null });
    try {
      let entry: JournalEntry | null;

      if (editingId) {
        // Update existing
        entry = await updateJournalEntry(editingId, {
          title: draftTitle || undefined,
          content: draftContent,
          mood: draftMood ?? undefined,
          tags: draftTags,
        });
      } else {
        // Create new
        entry = await createJournalEntry({
          title: draftTitle || undefined,
          content: draftContent,
          promptId: draftPromptId ?? undefined,
          mood: draftMood ?? undefined,
          tags: draftTags,
        });

        // Mark prompt as used
        if (draftPromptId) {
          await markPromptUsed(draftPromptId);
        }
      }

      // Reload entries
      const entries = await getAllJournalEntries();
      set({
        entries,
        isLoading: false,
        draftTitle: '',
        draftContent: '',
        draftPromptId: null,
        draftMood: null,
        draftTags: [],
        editingId: null,
      });

      return entry;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to save entry',
        isLoading: false,
      });
      return null;
    }
  },

  // Remove entry
  removeEntry: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteJournalEntry(id);
      set((state) => ({
        entries: state.entries.filter((e) => e.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete entry',
        isLoading: false,
      });
    }
  },

  // Search
  setSearchQuery: (query) => set({ searchQuery: query }),

  performSearch: async () => {
    const { searchQuery } = get();
    if (!searchQuery.trim()) {
      set({ searchResults: [] });
      return;
    }

    try {
      const results = await searchJournalEntries(searchQuery);
      set({ searchResults: results });
    } catch (error) {
      console.error('Search failed:', error);
    }
  },

  clearSearch: () => set({ searchQuery: '', searchResults: [] }),

  // Get random prompt
  getRandomPrompt: async (category) => {
    return getRandomPrompt(category);
  },

  // Clear all entries
  clearEntries: async () => {
    set({ isLoading: true, error: null });
    try {
      await deleteAllJournalEntries();
      set({ entries: [], searchResults: [], isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to clear entries',
        isLoading: false,
      });
    }
  },
}));
