import { Audio, AVPlaybackStatus } from 'expo-av';

export interface AudioState {
  isLoaded: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  positionMs: number;
  durationMs: number;
  isBuffering: boolean;
  error: string | null;
}

export interface AudioCallbacks {
  onPlaybackStatusUpdate?: (status: AudioState) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export interface AudioController {
  play: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seekTo: (positionMs: number) => Promise<void>;
  getState: () => AudioState;
  unload: () => Promise<void>;
}

let activeController: AudioController | null = null;

function parsePlaybackStatus(status: AVPlaybackStatus): AudioState {
  if (!status.isLoaded) {
    return {
      isLoaded: false,
      isPlaying: false,
      isPaused: false,
      positionMs: 0,
      durationMs: 0,
      isBuffering: false,
      error: status.error || null,
    };
  }

  return {
    isLoaded: true,
    isPlaying: status.isPlaying,
    isPaused: !status.isPlaying && status.positionMillis > 0 && !status.didJustFinish,
    positionMs: status.positionMillis,
    durationMs: status.durationMillis || 0,
    isBuffering: status.isBuffering,
    error: null,
  };
}

/**
 * Configure audio mode for background playback
 */
export async function configureAudioMode(): Promise<void> {
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
    shouldDuckAndroid: true,
  });
}

/**
 * Create an audio player for a given URL
 */
export async function createAudioPlayer(
  audioUrl: string,
  callbacks: AudioCallbacks
): Promise<AudioController> {
  // Stop any existing player
  if (activeController) {
    await activeController.unload();
  }

  await configureAudioMode();

  const { sound } = await Audio.Sound.createAsync(
    { uri: audioUrl },
    { shouldPlay: false, progressUpdateIntervalMillis: 500 }
  );

  let currentState: AudioState = {
    isLoaded: false,
    isPlaying: false,
    isPaused: false,
    positionMs: 0,
    durationMs: 0,
    isBuffering: false,
    error: null,
  };

  // Get initial status
  const initialStatus = await sound.getStatusAsync();
  currentState = parsePlaybackStatus(initialStatus);

  const controller: AudioController = {
    play: async () => {
      try {
        await sound.playAsync();
      } catch (error) {
        callbacks.onError?.(error instanceof Error ? error : new Error(String(error)));
      }
    },

    pause: () => {
      sound.pauseAsync().catch((error) => {
        callbacks.onError?.(error instanceof Error ? error : new Error(String(error)));
      });
    },

    resume: () => {
      sound.playAsync().catch((error) => {
        callbacks.onError?.(error instanceof Error ? error : new Error(String(error)));
      });
    },

    stop: () => {
      sound.stopAsync().catch(() => {
        // Best effort stop
      });
    },

    seekTo: async (positionMs: number) => {
      try {
        await sound.setPositionAsync(positionMs);
      } catch (error) {
        callbacks.onError?.(error instanceof Error ? error : new Error(String(error)));
      }
    },

    getState: () => currentState,

    unload: async () => {
      try {
        await sound.unloadAsync();
      } catch {
        // Best effort unload
      }
      if (activeController === controller) {
        activeController = null;
      }
    },
  };

  // Update currentState when status changes
  sound.setOnPlaybackStatusUpdate((status) => {
    currentState = parsePlaybackStatus(status);
    callbacks.onPlaybackStatusUpdate?.(currentState);

    if (status.isLoaded && status.didJustFinish) {
      callbacks.onComplete?.();
    }

    if (!status.isLoaded && status.error) {
      callbacks.onError?.(new Error(status.error));
    }
  });

  activeController = controller;
  return controller;
}

/**
 * Get the currently active audio controller
 */
export function getActiveAudioController(): AudioController | null {
  return activeController;
}

/**
 * Format milliseconds to mm:ss display
 */
export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
