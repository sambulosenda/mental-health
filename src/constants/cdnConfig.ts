/**
 * CDN Configuration for audio files
 *
 * After setting up Cloudflare R2:
 * 1. Create a bucket (e.g., 'softmind-audio')
 * 2. Enable public access with a custom domain or R2.dev subdomain
 * 3. Update the CDN_BASE_URL below with your bucket URL
 * 4. Upload generated audio files to the 'sleep-stories' folder
 *
 * File structure in R2:
 *   /sleep-stories/
 *     ├── sleep-forest-path.mp3
 *     ├── sleep-cloud-float.mp3
 *     └── ...
 */

// Cloudflare R2 bucket URL
export const CDN_BASE_URL = 'https://pub-cd0bdc36c3ae4d86ac2b9bdaa9b15b48.r2.dev';

// Audio file paths
export const AUDIO_PATHS = {
  sleepStories: `${CDN_BASE_URL}/sleep-stories`,
  breathingCues: `${CDN_BASE_URL}/breathing-cues`,
  meditations: `${CDN_BASE_URL}/meditations`,
} as const;

// Image file paths
export const IMAGE_PATHS = {
  sleepStories: `${CDN_BASE_URL}/sleep-stories/thumbnails`,
} as const;

/**
 * Get the full audio URL for a sleep story
 */
export function getSleepStoryAudioUrl(storyId: string): string {
  return `${AUDIO_PATHS.sleepStories}/${storyId}.mp3`;
}

/**
 * Get the full audio URL for a breathing cue
 * Cue IDs: breathe-in, breathe-in-slowly, hold, breathe-out, release-slowly, in, out
 */
export function getBreathingCueAudioUrl(cueId: string): string {
  return `${AUDIO_PATHS.breathingCues}/${cueId}.mp3`;
}

/**
 * Get the full audio URL for a meditation
 * Meditation IDs: breath-awareness-5min, body-scan-10min, sleep-relaxation, calming-anxiety, grounding-meditation
 */
export function getMeditationAudioUrl(meditationId: string): string {
  return `${AUDIO_PATHS.meditations}/${meditationId}.mp3`;
}

/**
 * Get the full image URL for a sleep story
 * Uses story ID as image filename (e.g., sleep-forest-path.png)
 */
export function getSleepStoryImageUrl(storyId: string): string {
  return `${IMAGE_PATHS.sleepStories}/${storyId}.webp`;
}
