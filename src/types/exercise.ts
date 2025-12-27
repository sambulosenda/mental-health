// Exercise types (wellness-focused)
export type ExerciseTherapyType = 'reflection' | 'breathing' | 'mindfulness' | 'gratitude' | 'meditation';

// Exercise categories
export type ExerciseCategory =
  | 'thought_record'
  | 'breathing'
  | 'grounding'
  | 'gratitude'
  | 'mindfulness'
  | 'values'
  | 'worry'
  | 'self_compassion'
  | 'goals'
  | 'mindfulness_basics'
  | 'sleep_relaxation'
  | 'anxiety_stress'
  // Sleep story categories
  | 'sleep_nature'
  | 'sleep_fantasy'
  | 'sleep_cozy'
  | 'sleep_travel'
  | 'sleep_guided'
  | 'sleep_celestial';

// Step types for different exercise interactions
export type ExerciseStepType =
  | 'instruction'      // Read-only text/guidance
  | 'text_input'       // Free text input
  | 'mood_select'      // Mood selection (1-5)
  | 'breathing'        // Animated breathing exercise
  | 'multi_input'      // Multiple text inputs (e.g., 5-4-3-2-1)
  | 'reflection'       // Final reflection/summary
  | 'timed_speech'     // TTS reads script with pauses
  | 'meditation_timer' // Silent timer with interval bells
  | 'guided_visual'    // Visual + TTS overlay
  | 'audio_story';     // Pre-recorded audio playback (ElevenLabs)

// Speech segment for TTS meditation
export interface SpeechSegment {
  text: string;
  pauseAfter: number;  // seconds of silence after speech
  breathCue?: boolean; // show breath visual during pause
}

// Voice configuration for TTS
export interface VoiceConfig {
  pitch?: number;   // 0.5-2.0, default 1.0
  rate?: number;    // 0.5-2.0, default 0.85 for calming pace
  language?: string; // e.g., 'en-US'
}

// Individual step definition
export interface ExerciseStep {
  id: string;
  type: ExerciseStepType;
  title: string;
  content: string;               // Instructions or prompt
  placeholder?: string;          // For text inputs
  inputCount?: number;           // For multi_input (e.g., 5 for "5 things you see")
  inputLabels?: string[];        // Labels for each input
  duration?: number;             // Duration in seconds (for breathing/meditation)
  required?: boolean;            // Whether step must be completed
  // Meditation-specific properties
  speechSegments?: SpeechSegment[];  // For timed_speech and guided_visual
  voiceConfig?: VoiceConfig;         // TTS configuration
  intervalBellSeconds?: number;      // Bell every N seconds (for meditation_timer)
  showBreathingGuide?: boolean;      // Show breathing animation overlay
  visualType?: 'breathing' | 'expanding_circle' | 'wave'; // For guided_visual
  // Audio story properties (pre-recorded audio)
  audioUrl?: string;             // CDN URL for audio file
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
  isPremium?: boolean;           // Whether this exercise requires premium
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
