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
} as const;

/**
 * Get the full audio URL for a sleep story
 */
export function getSleepStoryAudioUrl(storyId: string): string {
  return `${AUDIO_PATHS.sleepStories}/${storyId}.mp3`;
}
