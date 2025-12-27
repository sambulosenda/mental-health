import { Audio } from 'expo-av';
import { getMeditationAudioUrl } from '@/src/constants/cdnConfig';

// Meditation IDs that have pre-recorded audio
const MEDITATIONS_WITH_AUDIO = [
  'breath-awareness-5min',
  'body-scan-10min',
  'sleep-relaxation',
  'calming-anxiety',
  'grounding-meditation',
];

let currentSound: Audio.Sound | null = null;
let isPlaying = false;

/**
 * Check if a meditation has pre-recorded audio available
 */
export function hasMeditationAudio(meditationId: string): boolean {
  return MEDITATIONS_WITH_AUDIO.includes(meditationId);
}

/**
 * Play the pre-recorded meditation audio
 * @param meditationId - The meditation ID (e.g., "breath-awareness-5min")
 * @param onFinish - Callback when audio finishes playing
 */
export async function playMeditationAudio(
  meditationId: string,
  onFinish?: () => void
): Promise<void> {
  try {
    // Stop any currently playing audio
    await stopMeditationAudio();

    if (!hasMeditationAudio(meditationId)) {
      console.log('[MeditationVoice] No audio for meditation:', meditationId);
      return;
    }

    const audioUrl = getMeditationAudioUrl(meditationId);
    console.log('[MeditationVoice] Playing:', audioUrl);

    // Configure audio for meditation playback
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true, // Keep playing if app goes to background
      shouldDuckAndroid: true,
    });

    // Load and play
    const { sound } = await Audio.Sound.createAsync(
      { uri: audioUrl },
      { shouldPlay: true }
    );

    currentSound = sound;
    isPlaying = true;

    // Handle playback status updates
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded) {
        if (status.didJustFinish) {
          isPlaying = false;
          sound.unloadAsync().catch(() => {});
          if (currentSound === sound) {
            currentSound = null;
          }
          onFinish?.();
        }
      }
    });
  } catch (error) {
    console.error('[MeditationVoice] Error playing audio:', error);
    isPlaying = false;
  }
}

/**
 * Pause the currently playing meditation audio
 */
export async function pauseMeditationAudio(): Promise<void> {
  if (currentSound && isPlaying) {
    try {
      await currentSound.pauseAsync();
      isPlaying = false;
    } catch (error) {
      console.error('[MeditationVoice] Error pausing:', error);
    }
  }
}

/**
 * Resume the paused meditation audio
 */
export async function resumeMeditationAudio(): Promise<void> {
  if (currentSound && !isPlaying) {
    try {
      await currentSound.playAsync();
      isPlaying = true;
    } catch (error) {
      console.error('[MeditationVoice] Error resuming:', error);
    }
  }
}

/**
 * Stop and unload the meditation audio
 */
export async function stopMeditationAudio(): Promise<void> {
  if (currentSound) {
    try {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
    } catch {
      // Best effort cleanup
    }
    currentSound = null;
    isPlaying = false;
  }
}

/**
 * Get current playback position in milliseconds
 */
export async function getMeditationPlaybackPosition(): Promise<number> {
  if (currentSound) {
    try {
      const status = await currentSound.getStatusAsync();
      if (status.isLoaded) {
        return status.positionMillis;
      }
    } catch {
      // Ignore errors
    }
  }
  return 0;
}

/**
 * Seek to a specific position in the meditation audio
 * @param positionMs - Position in milliseconds
 */
export async function seekMeditationAudio(positionMs: number): Promise<void> {
  if (currentSound) {
    try {
      await currentSound.setPositionAsync(positionMs);
    } catch (error) {
      console.error('[MeditationVoice] Error seeking:', error);
    }
  }
}

/**
 * Check if meditation audio is currently playing
 */
export function isMeditationPlaying(): boolean {
  return isPlaying;
}
