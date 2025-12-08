import { create } from 'zustand';
import type {
  AssessmentType,
  AssessmentTemplate,
  AssessmentSession,
  AssessmentFlow,
  LikertValue,
  SeverityLevel,
} from '@/src/types/assessment';
import {
  createAssessmentSession,
  updateAssessmentResponses,
  completeAssessmentSession,
  abandonAssessmentSession,
  getRecentAssessments,
  getAssessmentHistory,
  getLastAssessment,
  isAssessmentDue as checkIsAssessmentDue,
} from '@/src/lib/database';
import { ASSESSMENT_TEMPLATES, getTemplateById } from '@/src/constants/assessments';

interface AssessmentState {
  // Templates
  templates: AssessmentTemplate[];

  // Active session
  activeSession: AssessmentSession | null;
  assessmentFlow: AssessmentFlow | null;

  // History
  recentAssessments: AssessmentSession[];
  gad7History: AssessmentSession[];
  phq9History: AssessmentSession[];
  lastGad7: AssessmentSession | null;
  lastPhq9: AssessmentSession | null;

  // Due status
  gad7IsDue: boolean;
  phq9IsDue: boolean;

  // Loading/error states
  isLoading: boolean;
  error: string | null;
  saveError: string | null; // Non-blocking error for background saves

  // Actions
  startAssessment: (type: AssessmentType) => Promise<void>;
  setResponse: (questionId: string, value: LikertValue) => Promise<boolean>; // Returns success
  advanceQuestion: () => void;
  goBackQuestion: () => void;
  completeAssessment: () => Promise<{ totalScore: number; severity: SeverityLevel } | null>;
  abandonAssessment: () => Promise<void>;

  // History actions
  loadRecentAssessments: () => Promise<void>;
  loadAssessmentHistory: (type: AssessmentType, days?: number) => Promise<void>;
  loadLastAssessments: () => Promise<void>;
  checkDueStatus: () => Promise<void>;

  // Reset
  reset: () => void;
}

export const useAssessmentStore = create<AssessmentState>((set, get) => ({
  // Initial state
  templates: ASSESSMENT_TEMPLATES,
  activeSession: null,
  assessmentFlow: null,
  recentAssessments: [],
  gad7History: [],
  phq9History: [],
  lastGad7: null,
  lastPhq9: null,
  gad7IsDue: true,
  phq9IsDue: true,
  isLoading: false,
  error: null,
  saveError: null,

  // Start a new assessment
  startAssessment: async (type) => {
    const template = getTemplateById(type);

    set({ isLoading: true, error: null });

    try {
      const session = await createAssessmentSession(type);
      set({
        activeSession: session,
        assessmentFlow: {
          template,
          currentQuestionIndex: -1, // -1 = intro screen, 0+ = questions
          responses: {},
        },
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start assessment';
      set({ error: message, isLoading: false });
    }
  },

  // Set response for a question
  setResponse: async (questionId, value) => {
    const { assessmentFlow, activeSession } = get();
    if (!assessmentFlow || !activeSession) return false;

    const newResponses = {
      ...assessmentFlow.responses,
      [questionId]: value,
    };

    // Update local state immediately (optimistic update)
    set({
      assessmentFlow: {
        ...assessmentFlow,
        responses: newResponses,
      },
      saveError: null, // Clear previous error
    });

    // Update database with retry
    let retries = 2;
    while (retries > 0) {
      try {
        await updateAssessmentResponses(activeSession.id, newResponses);
        return true; // Success
      } catch (error) {
        retries--;
        if (retries === 0) {
          console.error('Failed to save assessment response after retries:', error);
          set({
            saveError: 'Failed to save response. Your answer is stored locally and will be saved when you complete.',
          });
          return false;
        }
        // Brief delay before retry
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
    return false;
  },

  // Advance to next question
  advanceQuestion: () => {
    const { assessmentFlow } = get();
    if (!assessmentFlow) return;

    const totalQuestions = assessmentFlow.template.questions.length;
    // Flow: intro (-1) -> questions (0 to n-1) -> complete (n)
    const maxIndex = totalQuestions; // Complete screen

    if (assessmentFlow.currentQuestionIndex < maxIndex) {
      set({
        assessmentFlow: {
          ...assessmentFlow,
          currentQuestionIndex: assessmentFlow.currentQuestionIndex + 1,
        },
      });
    }
  },

  // Go back one question
  goBackQuestion: () => {
    const { assessmentFlow } = get();
    if (!assessmentFlow) return;

    if (assessmentFlow.currentQuestionIndex > -1) {
      set({
        assessmentFlow: {
          ...assessmentFlow,
          currentQuestionIndex: assessmentFlow.currentQuestionIndex - 1,
        },
      });
    }
  },

  // Complete the assessment
  completeAssessment: async () => {
    const { activeSession, assessmentFlow } = get();
    if (!activeSession || !assessmentFlow) return null;

    set({ isLoading: true });

    try {
      const result = await completeAssessmentSession(
        activeSession.id,
        activeSession.type,
        assessmentFlow.responses
      );

      // Reload data
      await get().loadRecentAssessments();
      await get().loadLastAssessments();
      await get().checkDueStatus();

      set({
        activeSession: null,
        assessmentFlow: null,
        isLoading: false,
      });

      return result;
    } catch (error) {
      console.error('Failed to complete assessment:', error);
      const message = error instanceof Error ? error.message : 'Failed to complete assessment';
      set({
        error: message,
        isLoading: false,
        activeSession: null,
        assessmentFlow: null,
      });
      return null;
    }
  },

  // Abandon the assessment
  abandonAssessment: async () => {
    const { activeSession } = get();
    if (!activeSession) return;

    try {
      await abandonAssessmentSession(activeSession.id);
    } catch (error) {
      console.error('Failed to abandon assessment:', error);
    }

    set({
      activeSession: null,
      assessmentFlow: null,
    });
  },

  // Load recent assessments
  loadRecentAssessments: async () => {
    try {
      const assessments = await getRecentAssessments(undefined, 20);
      set({ recentAssessments: assessments });
    } catch (error) {
      console.error('Failed to load assessments:', error);
    }
  },

  // Load assessment history for a specific type
  loadAssessmentHistory: async (type, days = 90) => {
    try {
      const history = await getAssessmentHistory(type, days);
      if (type === 'gad7') {
        set({ gad7History: history });
      } else {
        set({ phq9History: history });
      }
    } catch (error) {
      console.error('Failed to load assessment history:', error);
    }
  },

  // Load last completed assessments
  loadLastAssessments: async () => {
    try {
      const [lastGad7, lastPhq9] = await Promise.all([
        getLastAssessment('gad7'),
        getLastAssessment('phq9'),
      ]);
      set({ lastGad7, lastPhq9 });
    } catch (error) {
      console.error('Failed to load last assessments:', error);
    }
  },

  // Check if assessments are due
  checkDueStatus: async () => {
    try {
      const [gad7IsDue, phq9IsDue] = await Promise.all([
        checkIsAssessmentDue('gad7'),
        checkIsAssessmentDue('phq9'),
      ]);
      set({ gad7IsDue, phq9IsDue });
    } catch (error) {
      console.error('Failed to check assessment due status:', error);
    }
  },

  // Reset state
  reset: () => {
    set({
      activeSession: null,
      assessmentFlow: null,
      isLoading: false,
      error: null,
      saveError: null,
    });
  },
}));
