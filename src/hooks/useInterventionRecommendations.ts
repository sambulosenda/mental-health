import { useCallback, useEffect, useState } from 'react';
import { getExerciseEffectiveness } from '@/src/lib/database/queries/exercise';
import {
  getDefaultRecommendations,
  getPersonalizedRecommendations,
  type ExerciseEffectiveness,
  type InterventionRecommendation,
} from '@/src/lib/interventions/recommendations';
import { useMoodStore } from '@/src/stores/useMoodStore';

interface UseInterventionRecommendationsOptions {
  /** Override mood instead of using latest from store */
  overrideMood?: number;
  /** Override activities instead of using latest from store */
  overrideActivities?: string[];
}

interface UseInterventionRecommendationsResult {
  recommendations: InterventionRecommendation[];
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export function useInterventionRecommendations(
  options: UseInterventionRecommendationsOptions = {}
): UseInterventionRecommendationsResult {
  const { overrideMood, overrideActivities } = options;

  const [recommendations, setRecommendations] = useState<InterventionRecommendation[]>([]);
  const [effectiveness, setEffectiveness] = useState<ExerciseEffectiveness[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get latest mood entry from store
  const todayEntries = useMoodStore((s) => s.todayEntries);
  const latestEntry = todayEntries.length > 0 ? todayEntries[todayEntries.length - 1] : null;

  // Use override values or fall back to latest entry
  const currentMood = overrideMood ?? latestEntry?.mood;
  const currentActivities = overrideActivities ?? latestEntry?.activities;

  // Load effectiveness data
  const loadEffectiveness = useCallback(async () => {
    try {
      const data = await getExerciseEffectiveness();
      setEffectiveness(data);
    } catch (error) {
      console.error('Failed to load exercise effectiveness:', error);
    }
  }, []);

  // Calculate recommendations
  const calculateRecommendations = useCallback(() => {
    if (currentMood === undefined) {
      // No mood data - show defaults
      const defaults = getDefaultRecommendations();
      setRecommendations(defaults);
    } else {
      // Get personalized recommendations
      const recs = getPersonalizedRecommendations(
        currentMood,
        currentActivities,
        effectiveness
      );
      setRecommendations(recs);
    }
  }, [currentMood, currentActivities, effectiveness]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await loadEffectiveness();
      setIsLoading(false);
    };
    init();
  }, [loadEffectiveness]);

  // Recalculate when mood or effectiveness changes
  useEffect(() => {
    if (!isLoading) {
      calculateRecommendations();
    }
  }, [isLoading, calculateRecommendations]);

  // Manual refresh
  const refresh = useCallback(async () => {
    setIsLoading(true);
    await loadEffectiveness();
    calculateRecommendations();
    setIsLoading(false);
  }, [loadEffectiveness, calculateRecommendations]);

  return {
    recommendations,
    isLoading,
    refresh,
  };
}
