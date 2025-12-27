import { EXERCISE_TEMPLATES } from '@/src/constants/exercises';
import { MEDITATION_TEMPLATES } from '@/src/constants/meditations';
import { SLEEP_STORY_TEMPLATES } from '@/src/constants/sleepStories';
import type { ExerciseTemplate } from '@/src/types/exercise';

// Combine all templates
const ALL_TEMPLATES = [...EXERCISE_TEMPLATES, ...MEDITATION_TEMPLATES, ...SLEEP_STORY_TEMPLATES];

export interface InterventionRecommendation {
  template: ExerciseTemplate;
  reason: string;
  priority: number;
  matchType: 'mood' | 'activity' | 'effectiveness';
}

export interface ExerciseEffectiveness {
  templateId: string;
  avgMoodDelta: number;
  completionCount: number;
}

// Mood-based mapping rules (includes meditations)
const MOOD_EXERCISE_MAP: Record<string, string[]> = {
  // Low mood (1-2): Focus on self-compassion and calming
  low: ['self-compassion', 'calming-anxiety', 'body-scan-10min', 'gratitude-list'],
  // Struggling (2-3): Active coping techniques
  struggling: ['grounding-54321', 'grounding-meditation', 'breath-awareness-5min', 'thought-record'],
  // Neutral (3-4): Momentum building
  neutral: ['quick-goal', 'breath-awareness-5min', 'silent-meditation', 'gratitude-list'],
  // Good (4-5): Maintain and build
  good: ['gratitude-list', 'silent-meditation', 'quick-goal', 'thought-record'],
};

// Activity-based overrides (these take priority when matched)
const ACTIVITY_EXERCISE_MAP: Record<string, string[]> = {
  anxious: ['calming-anxiety', '4-7-8-breathing', 'grounding-meditation', 'grounding-54321', 'box-breathing'],
  stressed: ['coherent-breathing', 'breath-awareness-5min', 'box-breathing', 'body-scan-10min', 'worry-dump'],
  work: ['worry-dump', 'breath-awareness-5min', 'thought-record', 'quick-goal'],
  sleep: ['4-7-8-breathing', 'sleep-forest-path', 'sleep-cloud-float', 'sleep-body-release', 'sleep-relaxation'],
  bedtime: ['4-7-8-breathing', 'sleep-forest-path', 'sleep-rainy-window', 'sleep-cloud-float', 'sleep-body-release'],
  insomnia: ['4-7-8-breathing', 'sleep-body-release', 'sleep-counting-down', 'sleep-mind-quieting', 'sleep-breath-journey'],
  restless: ['coherent-breathing', 'sleep-cloud-float', 'sleep-train-journey', 'sleep-river-boat', 'body-scan-10min'],
  social: ['thought-record', 'self-compassion', 'calming-anxiety'],
  sad: ['self-compassion', 'calming-anxiety', 'body-scan-10min', 'gratitude-list'],
  tired: ['energizing-breath', 'breath-awareness-5min', 'body-scan-10min', 'box-breathing'],
  'low-energy': ['energizing-breath', 'breath-awareness-5min', 'quick-goal'],
  energy: ['energizing-breath', 'quick-goal'],
  focus: ['coherent-breathing', 'box-breathing', 'breath-awareness-5min'],
};

// Reasons for each exercise type
const EXERCISE_REASONS: Record<string, Record<string, string>> = {
  'self-compassion': {
    mood: 'Helps when you\'re feeling low',
    activity: 'Good for difficult emotions',
    effectiveness: 'Has helped your mood before',
  },
  'gratitude-list': {
    mood: 'Shifts focus to the positive',
    activity: 'Builds perspective',
    effectiveness: 'Works well for you',
  },
  'box-breathing': {
    mood: 'Calms your nervous system',
    activity: 'Helps with anxiety',
    effectiveness: 'Reliably improves your mood',
  },
  '4-7-8-breathing': {
    mood: 'Natural tranquilizer for your nervous system',
    activity: 'Perfect for sleep and anxiety',
    effectiveness: 'Deeply relaxing for you',
  },
  'coherent-breathing': {
    mood: 'Balances heart and brain rhythms',
    activity: 'Optimizes your stress response',
    effectiveness: 'Builds your calm baseline',
  },
  'energizing-breath': {
    mood: 'Natural energy boost',
    activity: 'Wakes up your system',
    effectiveness: 'Quick pick-me-up that works for you',
  },
  'grounding-54321': {
    mood: 'Brings you back to the present',
    activity: 'Great for anxious moments',
    effectiveness: 'Effective for you',
  },
  'thought-record': {
    mood: 'Challenges unhelpful thoughts',
    activity: 'Good for work stress',
    effectiveness: 'Helps you reframe',
  },
  'worry-dump': {
    mood: 'Gets worries out of your head',
    activity: 'Clears mental clutter',
    effectiveness: 'Reduces your worry',
  },
  'quick-goal': {
    mood: 'Creates forward momentum',
    activity: 'Helps you take action',
    effectiveness: 'Boosts your motivation',
  },
  // Meditation reasons
  'breath-awareness-5min': {
    mood: 'Calms and centers you',
    activity: 'Reduces stress naturally',
    effectiveness: 'A reliable calm practice',
  },
  'body-scan-10min': {
    mood: 'Releases tension in your body',
    activity: 'Deep relaxation',
    effectiveness: 'Helps you feel at ease',
  },
  'silent-meditation': {
    mood: 'Peaceful self-guided practice',
    activity: 'Time for yourself',
    effectiveness: 'Works well for you',
  },
  'sleep-relaxation': {
    mood: 'Prepares you for rest',
    activity: 'Helps you wind down',
    effectiveness: 'Improves your sleep',
  },
  'calming-anxiety': {
    mood: 'Soothes anxious feelings',
    activity: 'Calms your nervous system',
    effectiveness: 'Reliably reduces anxiety',
  },
  'grounding-meditation': {
    mood: 'Brings you to the present',
    activity: 'Reconnects you to now',
    effectiveness: 'Effective grounding practice',
  },
  // Sleep story reasons
  'sleep-forest-path': {
    mood: 'A peaceful journey into sleep',
    activity: 'Perfect for winding down',
    effectiveness: 'Helps you drift off naturally',
  },
  'sleep-cloud-float': {
    mood: 'Float away from your worries',
    activity: 'Gentle relaxation for bedtime',
    effectiveness: 'Soothes you to sleep',
  },
  'sleep-rainy-window': {
    mood: 'Cozy comfort for restless nights',
    activity: 'Calming for bedtime',
    effectiveness: 'Creates a peaceful space',
  },
  'sleep-body-release': {
    mood: 'Release tension for better sleep',
    activity: 'Relaxes your whole body',
    effectiveness: 'Proven to help you sleep',
  },
  'sleep-counting-down': {
    mood: 'A classic technique for sleep',
    activity: 'Quiets a busy mind',
    effectiveness: 'Works well for insomnia',
  },
  'sleep-mind-quieting': {
    mood: 'Let go of racing thoughts',
    activity: 'Calms an overactive mind',
    effectiveness: 'Helps you find peace',
  },
  'sleep-breath-journey': {
    mood: 'Follow your breath to sleep',
    activity: 'Gentle breathing practice',
    effectiveness: 'Naturally induces sleep',
  },
  'sleep-train-journey': {
    mood: 'A soothing journey to rest',
    activity: 'Gentle motion to sleep',
    effectiveness: 'Rocks you to sleep',
  },
  'sleep-river-boat': {
    mood: 'Drift away on gentle waters',
    activity: 'Peaceful nighttime journey',
    effectiveness: 'Calms restless nights',
  },
};

function getMoodCategory(mood: number): string {
  if (mood <= 2) return 'low';
  if (mood <= 3) return 'struggling';
  if (mood <= 4) return 'neutral';
  return 'good';
}

function getTemplateById(id: string): ExerciseTemplate | undefined {
  return ALL_TEMPLATES.find((t) => t.id === id);
}

function getReason(
  templateId: string,
  matchType: 'mood' | 'activity' | 'effectiveness'
): string {
  return (
    EXERCISE_REASONS[templateId]?.[matchType] ||
    'Recommended for you'
  );
}

/**
 * Get recommendations based on current mood level
 */
export function getRecommendationsForMood(
  mood: number,
  activities?: string[]
): InterventionRecommendation[] {
  const recommendations: InterventionRecommendation[] = [];
  const addedIds = new Set<string>();

  const moodCategory = getMoodCategory(mood);

  // First, check activity-based recommendations (higher priority)
  if (activities && activities.length > 0) {
    for (const activity of activities) {
      const activityLower = activity.toLowerCase();
      const matchedExercises = ACTIVITY_EXERCISE_MAP[activityLower];

      if (matchedExercises) {
        for (const exerciseId of matchedExercises) {
          if (addedIds.has(exerciseId)) continue;

          const template = getTemplateById(exerciseId);
          if (template) {
            recommendations.push({
              template,
              reason: getReason(exerciseId, 'activity'),
              priority: 10 - recommendations.length,
              matchType: 'activity',
            });
            addedIds.add(exerciseId);
          }
        }
      }
    }
  }

  // Then add mood-based recommendations
  const moodExercises = MOOD_EXERCISE_MAP[moodCategory] || [];

  for (const exerciseId of moodExercises) {
    if (addedIds.has(exerciseId)) continue;

    const template = getTemplateById(exerciseId);
    if (template) {
      recommendations.push({
        template,
        reason: getReason(exerciseId, 'mood'),
        priority: 5 - recommendations.length,
        matchType: 'mood',
      });
      addedIds.add(exerciseId);
    }
  }

  // Sort by priority and return top 3
  return recommendations
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3);
}

/**
 * Get personalized recommendations based on historical effectiveness
 */
export function getPersonalizedRecommendations(
  mood: number,
  activities: string[] | undefined,
  effectiveness: ExerciseEffectiveness[]
): InterventionRecommendation[] {
  // Start with mood-based recommendations
  const baseRecommendations = getRecommendationsForMood(mood, activities);

  // If we have effectiveness data, boost exercises that work well
  if (effectiveness.length > 0) {
    // Sort by effectiveness (positive mood delta and completion count)
    const effectiveExercises = effectiveness
      .filter((e) => e.avgMoodDelta > 0 && e.completionCount >= 2)
      .sort((a, b) => b.avgMoodDelta - a.avgMoodDelta);

    // Check if any effective exercises aren't in current recommendations
    const recommendedIds = new Set(baseRecommendations.map((r) => r.template.id));

    for (const effective of effectiveExercises.slice(0, 2)) {
      if (!recommendedIds.has(effective.templateId)) {
        const template = getTemplateById(effective.templateId);
        if (template) {
          // Add effectiveness-based recommendation with high priority
          baseRecommendations.unshift({
            template,
            reason: getReason(effective.templateId, 'effectiveness'),
            priority: 15, // Higher than activity-based
            matchType: 'effectiveness',
          });
        }
      } else {
        // Boost existing recommendation if it's effective
        const existing = baseRecommendations.find(
          (r) => r.template.id === effective.templateId
        );
        if (existing) {
          existing.priority += 5;
          existing.reason = getReason(effective.templateId, 'effectiveness');
          existing.matchType = 'effectiveness';
        }
      }
    }
  }

  // Re-sort and return top 3
  return baseRecommendations
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3);
}

/**
 * Get default recommendations when no mood data is available
 */
export function getDefaultRecommendations(): InterventionRecommendation[] {
  const defaultIds = ['box-breathing', 'gratitude-list', 'quick-goal'];
  const results: InterventionRecommendation[] = [];

  for (const id of defaultIds) {
    const template = getTemplateById(id);
    if (template) {
      results.push({
        template,
        reason: 'Quick and effective',
        priority: 5,
        matchType: 'mood',
      });
    }
  }

  return results;
}
