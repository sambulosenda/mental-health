import type { Ionicons } from '@expo/vector-icons';
import type { UserGoal } from '@/src/types/settings';

export interface GoalDefinition {
  id: UserGoal;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}

export const GOALS: GoalDefinition[] = [
  {
    id: 'reduce_stress',
    label: 'Reduce Stress',
    icon: 'leaf-outline',
    description: 'Find calm in daily life',
  },
  {
    id: 'track_mood',
    label: 'Track Mood',
    icon: 'analytics-outline',
    description: 'Understand your patterns',
  },
  {
    id: 'build_habits',
    label: 'Build Habits',
    icon: 'checkmark-circle-outline',
    description: 'Create positive routines',
  },
  {
    id: 'self_reflection',
    label: 'Self-Reflection',
    icon: 'book-outline',
    description: 'Journal your thoughts',
  },
  {
    id: 'manage_anxiety',
    label: 'Manage Anxiety',
    icon: 'heart-outline',
    description: 'Find peace of mind',
  },
  {
    id: 'improve_sleep',
    label: 'Better Sleep',
    icon: 'moon-outline',
    description: 'Rest and recover',
  },
];

export type OnboardingStep = 'welcome' | 'benefits' | 'name' | 'goals' | 'reminders' | 'complete';

export const ONBOARDING_STEPS: OnboardingStep[] = ['welcome', 'benefits', 'name', 'goals', 'reminders', 'complete'];
