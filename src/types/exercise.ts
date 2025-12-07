// Exercise therapy types
export type ExerciseTherapyType = 'cbt' | 'act' | 'dbt';

// Exercise categories
export type ExerciseCategory =
  | 'thought_record'
  | 'breathing'
  | 'grounding'
  | 'gratitude'
  | 'mindfulness'
  | 'values';

// Step types for different exercise interactions
export type ExerciseStepType =
  | 'instruction'      // Read-only text/guidance
  | 'text_input'       // Free text input
  | 'mood_select'      // Mood selection (1-5)
  | 'breathing'        // Animated breathing exercise
  | 'multi_input'      // Multiple text inputs (e.g., 5-4-3-2-1)
  | 'reflection';      // Final reflection/summary

// Individual step definition
export interface ExerciseStep {
  id: string;
  type: ExerciseStepType;
  title: string;
  content: string;               // Instructions or prompt
  placeholder?: string;          // For text inputs
  inputCount?: number;           // For multi_input (e.g., 5 for "5 things you see")
  inputLabels?: string[];        // Labels for each input
  duration?: number;             // Duration in seconds (for breathing)
  required?: boolean;            // Whether step must be completed
}

// Exercise template (definition)
export interface ExerciseTemplate {
  id: string;
  type: ExerciseTherapyType;
  category: ExerciseCategory;
  name: string;
  description: string;
  duration: number;              // Estimated duration in minutes
  steps: ExerciseStep[];
  icon?: string;                 // Ionicons name
  color?: string;                // Accent color
}

// Session status
export type ExerciseSessionStatus = 'in_progress' | 'completed' | 'abandoned';

// User's exercise session
export interface ExerciseSession {
  id: string;
  templateId: string;
  status: ExerciseSessionStatus;
  startedAt: Date;
  completedAt?: Date;
  responses: Record<string, string | string[]>;  // stepId -> response(s)
  moodBefore?: 1 | 2 | 3 | 4 | 5;
  moodAfter?: 1 | 2 | 3 | 4 | 5;
}

// Exercise flow state (for UI)
export interface ExerciseFlow {
  template: ExerciseTemplate;
  currentStepIndex: number;
  responses: Record<string, string | string[]>;
  moodBefore?: 1 | 2 | 3 | 4 | 5;
  moodAfter?: 1 | 2 | 3 | 4 | 5;
}

// Mood value type
export type MoodValue = 1 | 2 | 3 | 4 | 5;
