import type { BreathingConfig } from '@/src/types/exercise';

export const BREATHING_TECHNIQUES: Record<string, BreathingConfig> = {
  'box-breathing': {
    id: 'box-breathing',
    name: 'Box Breathing',
    description: 'Equal-length breathing used by Navy SEALs for stress management',
    phases: [
      { name: 'inhale', durationSeconds: 4, label: 'Breathe In', voiceCue: 'Breathe in', hapticPattern: 'ascending' },
      { name: 'hold-in', durationSeconds: 4, label: 'Hold', voiceCue: 'Hold', hapticPattern: 'steady' },
      { name: 'exhale', durationSeconds: 4, label: 'Breathe Out', voiceCue: 'Breathe out', hapticPattern: 'descending' },
      { name: 'hold-out', durationSeconds: 4, label: 'Hold', voiceCue: 'Hold', hapticPattern: 'steady' },
    ],
  },
  '4-7-8-relaxation': {
    id: '4-7-8-relaxation',
    name: '4-7-8 Relaxation',
    description: "Dr. Weil's relaxing breath technique for sleep and anxiety",
    phases: [
      { name: 'inhale', durationSeconds: 4, label: 'Breathe In', voiceCue: 'Breathe in slowly', hapticPattern: 'ascending' },
      { name: 'hold-in', durationSeconds: 7, label: 'Hold', voiceCue: 'Hold', hapticPattern: 'steady' },
      { name: 'exhale', durationSeconds: 8, label: 'Breathe Out', voiceCue: 'Release slowly', hapticPattern: 'descending' },
    ],
  },
  'coherent-breathing': {
    id: 'coherent-breathing',
    name: 'Coherent Breathing',
    description: 'Optimize heart rate variability with balanced 5-second rhythms',
    phases: [
      { name: 'inhale', durationSeconds: 5, label: 'Breathe In', voiceCue: 'Breathe in', hapticPattern: 'ascending' },
      { name: 'exhale', durationSeconds: 5, label: 'Breathe Out', voiceCue: 'Breathe out', hapticPattern: 'descending' },
    ],
  },
  'energizing-breath': {
    id: 'energizing-breath',
    name: 'Energizing Breath',
    description: 'Quick rhythmic breathing for energy boost and focus',
    phases: [
      { name: 'inhale', durationSeconds: 1, label: 'In', voiceCue: 'In', hapticPattern: 'pulse' },
      { name: 'exhale', durationSeconds: 1, label: 'Out', voiceCue: 'Out', hapticPattern: 'pulse' },
    ],
  },
};

// Helper to calculate cycle duration in seconds
export function getCycleDuration(config: BreathingConfig): number {
  return config.phases.reduce((sum, phase) => sum + phase.durationSeconds, 0);
}

// Helper to calculate total cycles for a given duration
export function getTotalCycles(config: BreathingConfig, totalDurationSeconds: number): number {
  const cycleDuration = getCycleDuration(config);
  return Math.max(1, Math.floor(totalDurationSeconds / cycleDuration));
}
