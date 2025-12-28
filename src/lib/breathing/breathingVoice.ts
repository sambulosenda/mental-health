import { getBreathingCueAudioUrl } from '@/src/constants/cdnConfig';
import { Audio } from 'expo-av';

// Map voice cue text to audio file IDs
const CUE_TO_AUDIO_ID: Record<string, string> = {
  'Breathe in': 'breathe-in',
  'Breathe in slowly': 'breathe-in-slowly',
  'Hold': 'hold',
  'Breathe out': 'breathe-out',
  'Release slowly': 'release-slowly',
  'In': 'in',
  'Out': 'out',
};

let currentSound: Audio.Sound | null = null;

/**
 * Play a pre-recorded breathing cue audio
 * @param cue - The cue text (e.g., "Breathe in", "Hold")
 */
export async function speakBreathCue(cue: string): Promise<void> {
  try {
    // Stop any currently playing cue
    await stopBreathCue();

    // Find matching audio file
    const audioId = CUE_TO_AUDIO_ID[cue];
    if (!audioId) {
      // No matching audio for this cue - skip silently
      return;
    }

    const audioUrl = getBreathingCueAudioUrl(audioId);

    // Configure audio for foreground playback
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });

    // Load and play
    const { sound } = await Audio.Sound.createAsync(
      { uri: audioUrl },
      { shouldPlay: true }
    );

    currentSound = sound;

    // Auto-unload when done
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync().catch(() => {});
        if (currentSound === sound) {
          currentSound = null;
        }
      }
    });
  } catch {
    // Audio is an optional enhancement - fail silently
    // User can still follow visual cues
  }
}

/**
 * Stop any currently playing breath cue
 */
export async function stopBreathCue(): Promise<void> {
  const soundToStop = currentSound;
  if (soundToStop) {
    currentSound = null; // Clear immediately to prevent race
    try {
      await soundToStop.stopAsync();
      await soundToStop.unloadAsync();
    } catch {
      // Best effort cleanup
    }
  }
}

/**
 * Audio files needed for breathing cues:
 * Upload these to R2 CDN at /breathing-cues/
 *
 * Files needed:
 * - breathe-in.mp3        ("Breathe in")
 * - breathe-in-slowly.mp3 ("Breathe in slowly")
 * - hold.mp3              ("Hold")
 * - breathe-out.mp3       ("Breathe out")
 * - release-slowly.mp3    ("Release slowly")
 * - in.mp3                ("In")
 * - out.mp3               ("Out")
 */
export const BREATHING_CUE_FILES = [
  { id: 'breathe-in', text: 'Breathe in' },
  { id: 'breathe-in-slowly', text: 'Breathe in slowly' },
  { id: 'hold', text: 'Hold' },
  { id: 'breathe-out', text: 'Breathe out' },
  { id: 'release-slowly', text: 'Release slowly' },
  { id: 'in', text: 'In' },
  { id: 'out', text: 'Out' },
];
