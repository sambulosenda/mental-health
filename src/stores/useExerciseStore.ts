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

interface ExerciseState {
  // Templates (from constants)
  templates: ExerciseTemplate[];

  // Active session
  activeSession: ExerciseSession | null;
  exerciseFlow: ExerciseFlow | null;

  // History
  recentSessions: ExerciseSession[];

  // Loading/error states
  isLoading: boolean;
  error: string | null;

  // Actions
  startExercise: (templateId: string) => Promise<void>;
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

export const useExerciseStore = create<ExerciseState>((set, get) => ({
  // Initial state
  templates: EXERCISE_TEMPLATES,
  activeSession: null,
  exerciseFlow: null,
  recentSessions: [],
  isLoading: false,
  error: null,

  // Start a new exercise
  startExercise: async (templateId) => {
    const template = get().templates.find((t) => t.id === templateId);
    if (!template) {
      set({ error: 'Exercise template not found' });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const session = await createExerciseSession(templateId);
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
    } catch (error) {
      console.error('Failed to save mood before:', error);
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
    } catch (error) {
      console.error('Failed to save mood after:', error);
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
    } catch (error) {
      console.error('Failed to save step response:', error);
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

      // Reload recent sessions
      await get().loadRecentSessions();

      set({
        activeSession: null,
        exerciseFlow: null,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to complete exercise';
      set({ error: message, isLoading: false });
    }
  },

  // Abandon the exercise
  abandonExercise: async () => {
    const { activeSession } = get();
    if (!activeSession) return;

    try {
      await abandonExerciseSession(activeSession.id);
      set({
        activeSession: null,
        exerciseFlow: null,
      });
    } catch (error) {
      console.error('Failed to abandon exercise:', error);
      // Still clear the state
      set({
        activeSession: null,
        exerciseFlow: null,
      });
    }
  },

  // Load recent sessions
  loadRecentSessions: async () => {
    try {
      const sessions = await getRecentExerciseSessions(10);
      set({ recentSessions: sessions });
    } catch (error) {
      console.error('Failed to load exercise sessions:', error);
    }
  },

  // Reset state
  reset: () => {
    set({
      activeSession: null,
      exerciseFlow: null,
      isLoading: false,
      error: null,
    });
  },
}));
