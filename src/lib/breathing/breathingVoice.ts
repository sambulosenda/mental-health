import { speakText, stopSpeaking } from '@/src/lib/meditation/speechService';
import type { VoiceConfig } from '@/src/types/exercise';

// Calm, slow voice configuration for breathing exercises
const BREATHING_VOICE_CONFIG: VoiceConfig = {
  rate: 0.85,
  pitch: 0.95,
  language: 'en-US',
};

/**
 * Speak a breathing cue with calm voice settings
 * @param cue - The text to speak (e.g., "Breathe in", "Hold")
 * @param config - Optional voice config overrides
 */
export async function speakBreathCue(
  cue: string,
  config?: Partial<VoiceConfig>
): Promise<void> {
  try {
    await speakText(cue, { ...BREATHING_VOICE_CONFIG, ...config });
  } catch {
    // Voice is an optional enhancement - fail silently
    // User can still follow visual cues
  }
}

/**
 * Stop any currently playing breath cue
 */
export function stopBreathCue(): void {
  stopSpeaking();
}

/**
 * Get the default breathing voice configuration
 */
export function getBreathingVoiceConfig(): VoiceConfig {
  return { ...BREATHING_VOICE_CONFIG };
}
