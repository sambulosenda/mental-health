import * as Haptics from 'expo-haptics';
import type { HapticPatternType } from '@/src/types/exercise';

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Play a haptic pattern for a breathing phase
 * @param pattern - The type of haptic pattern
 * @param durationMs - Duration of the phase in milliseconds
 * @param abortController - Optional controller to cancel the pattern
 */
export async function playHapticPattern(
  pattern: HapticPatternType,
  durationMs: number,
  abortController?: AbortController
): Promise<void> {
  const signal = abortController?.signal;

  switch (pattern) {
    case 'ascending':
      await playAscendingPattern(durationMs, signal);
      break;
    case 'descending':
      await playDescendingPattern(durationMs, signal);
      break;
    case 'steady':
      await playSteadyPattern(durationMs, signal);
      break;
    case 'pulse':
      await playPulsePattern(durationMs, signal);
      break;
    case 'single':
    default:
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}

/**
 * Ascending pattern: Light → Medium → Heavy
 * Used for inhale phases - builds intensity as lungs fill
 */
async function playAscendingPattern(
  durationMs: number,
  signal?: AbortSignal
): Promise<void> {
  const intensities = [
    Haptics.ImpactFeedbackStyle.Light,
    Haptics.ImpactFeedbackStyle.Medium,
    Haptics.ImpactFeedbackStyle.Heavy,
  ];
  const interval = durationMs / (intensities.length + 1);

  for (const intensity of intensities) {
    if (signal?.aborted) return;
    await Haptics.impactAsync(intensity);
    await delay(interval);
  }
}

/**
 * Descending pattern: Heavy → Medium → Light
 * Used for exhale phases - releases intensity as breath flows out
 */
async function playDescendingPattern(
  durationMs: number,
  signal?: AbortSignal
): Promise<void> {
  const intensities = [
    Haptics.ImpactFeedbackStyle.Heavy,
    Haptics.ImpactFeedbackStyle.Medium,
    Haptics.ImpactFeedbackStyle.Light,
  ];
  const interval = durationMs / (intensities.length + 1);

  for (const intensity of intensities) {
    if (signal?.aborted) return;
    await Haptics.impactAsync(intensity);
    await delay(interval);
  }
}

/**
 * Steady pattern: Light at start and midpoint
 * Used for hold phases - gentle reminders during pause
 */
async function playSteadyPattern(
  durationMs: number,
  signal?: AbortSignal
): Promise<void> {
  if (signal?.aborted) return;
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  await delay(durationMs / 2);

  if (signal?.aborted) return;
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/**
 * Pulse pattern: Rapid light haptics
 * Used for energizing breath - quick rhythmic feedback
 */
async function playPulsePattern(
  durationMs: number,
  signal?: AbortSignal
): Promise<void> {
  const pulseInterval = 200; // 200ms between pulses
  const pulseCount = Math.floor(durationMs / pulseInterval);

  for (let i = 0; i < pulseCount; i++) {
    if (signal?.aborted) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await delay(pulseInterval);
  }
}

/**
 * Play a single notification haptic for phase completion
 */
export async function playPhaseCompleteHaptic(): Promise<void> {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

/**
 * Play start haptic for beginning exercise
 */
export async function playStartHaptic(): Promise<void> {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}
