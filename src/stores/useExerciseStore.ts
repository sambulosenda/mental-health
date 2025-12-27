import { create } from 'zustand';
import type {
  ExerciseTemplate,
  ExerciseSession,
  ExerciseFlow,
  MoodValue,
} from '@/src/types/exercise';
import {
  createExerciseSession,
  completeExerciseSession,
  abandonExerciseSession,
  updateSessionResponses,
  setSessionMoodBefore,
  setSessionMoodAfter,
  getRecentExerciseSessions,
} from '@/src/lib/database';
import { EXERCISE_TEMPLATES } from '@/src/constants/exercises';
import { MEDITATION_TEMPLATES } from '@/src/constants/meditations';
import { useGamificationStore } from './useGamificationStore';

interface ExerciseState {
  // Templates (from constants)
  templates: ExerciseTemplate[];

  // Active session
  activeSession: ExerciseSession | null;
  exerciseFlow: ExerciseFlow | null;

  // Session key to track current session instance (prevents stale updates)
  sessionKey: number;

  // History
  recentSessions: ExerciseSession[];

  // Loading/error states
  isLoading: boolean;
  error: string | null;

  // Actions
  startExercise: (templateId: string, key: number) => Promise<void>;
  setMoodBefore: (mood: MoodValue) => Promise<void>;
  setMoodAfter: (mood: MoodValue) => Promise<void>;
  advanceStep: () => void;
  goBackStep: () => void;
  setStepResponse: (stepId: string, response: string | string[]) => Promise<void>;
  completeExercise: () => Promise<void>;
  abandonExercise: () => Promise<void>;

  // History actions
  loadRecentSessions: () => Promise<void>;

  // Reset
  reset: () => void;
}

// Merge exercise and meditation templates
const ALL_TEMPLATES = [...EXERCISE_TEMPLATES, ...MEDITATION_TEMPLATES];

export const useExerciseStore = create<ExerciseState>((set, get) => ({
  // Initial state
  templates: ALL_TEMPLATES,
  activeSession: null,
  exerciseFlow: null,
  sessionKey: 0,
  recentSessions: [],
  isLoading: false,
  error: null,

  // Start a new exercise
  startExercise: async (templateId, key) => {
    const template = get().templates.find((t) => t.id === templateId);
    if (!template) {
      set({ error: 'Exercise template not found' });
      return;
    }

    set({ isLoading: true, error: null, sessionKey: key });

    try {
      const session = await createExerciseSession(templateId);

      // Check if this session is still current (user may have navigated away or abandoned)
      if (get().sessionKey !== key) {
        // Session was created but user abandoned - mark it as abandoned in DB
        try {
          await abandonExerciseSession(session.id);
        } catch {
          // Silently ignore - orphaned session cleanup is best-effort
        }
        return;
      }

      set({
        activeSession: session,
        exerciseFlow: {
          template,
          currentStepIndex: 0, // Start at mood_before step
          responses: {},
          moodBefore: undefined,
          moodAfter: undefined,
        },
        isLoading: false,
      });
    } catch (error) {
      // Check if this session is still current before setting error
      if (get().sessionKey !== key) {
        return;
      }
      const message = error instanceof Error ? error.message : 'Failed to start exercise';
      set({ error: message, isLoading: false });
    }
  },

  // Set mood before exercise
  setMoodBefore: async (mood) => {
    const { exerciseFlow, activeSession } = get();
    if (!exerciseFlow || !activeSession) return;

    // Update local state immediately for responsiveness
    set({
      exerciseFlow: {
        ...exerciseFlow,
        moodBefore: mood,
      },
    });

    // Update database
    try {
      await setSessionMoodBefore(activeSession.id, mood);
    } catch {
      // Best-effort save - UI already updated
    }
  },

  // Set mood after exercise
  setMoodAfter: async (mood) => {
    const { exerciseFlow, activeSession } = get();
    if (!exerciseFlow || !activeSession) return;

    // Update local state immediately for responsiveness
    set({
      exerciseFlow: {
        ...exerciseFlow,
        moodAfter: mood,
      },
    });

    // Update database
    try {
      await setSessionMoodAfter(activeSession.id, mood);
    } catch {
      // Best-effort save - UI already updated
    }
  },

  // Advance to next step
  advanceStep: () => {
    const { exerciseFlow, activeSession } = get();
    if (!exerciseFlow || !activeSession) return;

    const templateSteps = exerciseFlow.template.steps.length;
    // Flow: mood_before (0) + exercise steps (1 to n) + mood_after (n+1) + complete (n+2)
    // Total = 1 + templateSteps + 1 + 1 = templateSteps + 3
    const totalFlowSteps = templateSteps + 3;

    if (exerciseFlow.currentStepIndex < totalFlowSteps - 1) {
      set({
        exerciseFlow: {
          ...exerciseFlow,
          currentStepIndex: exerciseFlow.currentStepIndex + 1,
        },
      });
    }
  },

  // Go back one step
  goBackStep: () => {
    const { exerciseFlow } = get();
    if (!exerciseFlow) return;

    if (exerciseFlow.currentStepIndex > 0) {
      set({
        exerciseFlow: {
          ...exerciseFlow,
          currentStepIndex: exerciseFlow.currentStepIndex - 1,
        },
      });
    }
  },

  // Set response for a step
  setStepResponse: async (stepId, response) => {
    const { exerciseFlow, activeSession } = get();
    if (!exerciseFlow || !activeSession) return;

    const newResponses = {
      ...exerciseFlow.responses,
      [stepId]: response,
    };

    // Update local state immediately for responsiveness
    set({
      exerciseFlow: {
        ...exerciseFlow,
        responses: newResponses,
      },
    });

    // Update database
    try {
      await updateSessionResponses(activeSession.id, newResponses);
    } catch {
      // Best-effort save - UI already updated
    }
  },

  // Complete the exercise
  completeExercise: async () => {
    const { activeSession, exerciseFlow } = get();
    if (!activeSession || !exerciseFlow) return;

    set({ isLoading: true });

    try {
      await completeExerciseSession(
        activeSession.id,
        exerciseFlow.responses,
        exerciseFlow.moodAfter
      );

      // Record activity for gamification (streaks & badges)
      useGamificationStore.getState().recordActivity('exercise');

      // Reload recent sessions
      await get().loadRecentSessions();

      set({
        activeSession: null,
        exerciseFlow: null,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to complete exercise';
      // Clear activeSession and exerciseFlow to prevent user from being stuck
      // The error state will show and allow the user to start fresh
      set({
        error: message,
        isLoading: false,
        activeSession: null,
        exerciseFlow: null,
      });
    }
  },

  // Abandon the exercise
  abandonExercise: async () => {
    const { activeSession } = get();

    // Increment sessionKey first to invalidate any in-flight startExercise calls
    set((state) => ({
      sessionKey: state.sessionKey + 1,
      error: null, // Clear stale errors
    }));

    // Always reset loading state, even if no active session
    if (!activeSession) {
      set({ isLoading: false, exerciseFlow: null });
      return;
    }

    try {
      await abandonExerciseSession(activeSession.id);
    } catch {
      // Best-effort cleanup
    } finally {
      set({
        activeSession: null,
        exerciseFlow: null,
        isLoading: false,
      });
    }
  },

  // Load recent sessions
  loadRecentSessions: async () => {
    try {
      const sessions = await getRecentExerciseSessions(10);
      set({ recentSessions: sessions });
    } catch {
      // Best-effort load - keep existing state
    }
  },

  // Reset state (increments sessionKey to invalidate any in-flight requests)
  reset: () => {
    set((state) => ({
      activeSession: null,
      exerciseFlow: null,
      isLoading: false,
      error: null,
      sessionKey: state.sessionKey + 1,
    }));
  },
}));
