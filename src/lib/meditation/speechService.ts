import * as Speech from 'expo-speech';
import type { SpeechSegment, VoiceConfig } from '@/src/types/exercise';

export interface SpeechState {
  isPlaying: boolean;
  isPaused: boolean;
  currentSegmentIndex: number;
  totalSegments: number;
}

export interface SpeechCallbacks {
  onSegmentStart?: (index: number, text: string) => void;
  onSegmentEnd?: (index: number) => void;
  onPauseStart?: (duration: number, breathCue: boolean) => void;
  onPauseEnd?: () => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export interface SpeechController {
  play: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  skipToNext: () => void;
  getState: () => SpeechState;
}

let activeController: SpeechController | null = null;

export async function getPreferredVoice(language: string = 'en-US'): Promise<string | undefined> {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    // Prefer enhanced/premium voices, filter by language
    const languageVoices = voices.filter(v => v.language.startsWith(language.split('-')[0]));
    const enhanced = languageVoices.find(v => v.quality === 'Enhanced');
    return enhanced?.identifier || languageVoices[0]?.identifier;
  } catch {
    return undefined;
  }
}

export class SpeechStoppedError extends Error {
  constructor() {
    super('speech stopped');
    this.name = 'SpeechStoppedError';
  }
}

export async function speakText(
  text: string,
  config: VoiceConfig = {},
  onDone?: () => void,
  onError?: (error: Error) => void
): Promise<void> {
  const voice = await getPreferredVoice(config.language);

  return new Promise((resolve, reject) => {
    Speech.speak(text, {
      language: config.language || 'en-US',
      pitch: config.pitch || 1.0,
      rate: config.rate || 0.85,
      voice,
      onDone: () => {
        onDone?.();
        resolve();
      },
      onError: (error) => {
        const err = new Error(String(error));
        onError?.(err);
        reject(err);
      },
      onStopped: () => {
        const err = new SpeechStoppedError();
        onError?.(err);
        reject(err);
      },
    });
  });
}

export function stopSpeaking(): void {
  Speech.stop();
}

export function isSpeaking(): Promise<boolean> {
  return Speech.isSpeakingAsync();
}

export async function createMeditationSpeaker(
  segments: SpeechSegment[],
  voiceConfig: VoiceConfig,
  callbacks: SpeechCallbacks
): Promise<SpeechController> {
  // Stop any existing speaker
  if (activeController) {
    activeController.stop();
  }

  let currentIndex = 0;
  let isPlaying = false;
  let isPaused = false;
  let pauseTimeoutId: ReturnType<typeof setTimeout> | null = null;
  let pauseRejectFn: (() => void) | null = null;
  let shouldStop = false;
  let isExecutingSegment = false;

  const getState = (): SpeechState => ({
    isPlaying,
    isPaused,
    currentSegmentIndex: currentIndex,
    totalSegments: segments.length,
  });

  const clearPauseTimeout = () => {
    if (pauseTimeoutId) {
      clearTimeout(pauseTimeoutId);
      pauseTimeoutId = null;
    }
    // Reject pending pause promise to prevent hanging
    if (pauseRejectFn) {
      pauseRejectFn();
      pauseRejectFn = null;
    }
  };

  const speakSegment = async (index: number): Promise<void> => {
    if (isExecutingSegment) return;

    try {
      isExecutingSegment = true;

      if (shouldStop || index >= segments.length) {
        if (!shouldStop && index >= segments.length) {
          isPlaying = false;
          callbacks.onComplete?.();
        }
        return;
      }

      const segment = segments[index];
      currentIndex = index;
      callbacks.onSegmentStart?.(index, segment.text);

      // Speak the text
      await speakText(segment.text, voiceConfig);

      if (shouldStop) return;

      callbacks.onSegmentEnd?.(index);

      // Handle pause after speech
      if (segment.pauseAfter > 0) {
        callbacks.onPauseStart?.(segment.pauseAfter, segment.breathCue || false);

        try {
          await new Promise<void>((resolve, reject) => {
            pauseRejectFn = reject;
            pauseTimeoutId = setTimeout(() => {
              pauseTimeoutId = null;
              pauseRejectFn = null;
              callbacks.onPauseEnd?.();
              resolve();
            }, segment.pauseAfter * 1000);
          });
        } catch {
          // Pause was interrupted (stop/pause called), exit gracefully
          return;
        }
      }

      if (shouldStop) return;

      // Allow next segment to execute
      isExecutingSegment = false;

      // Move to next segment
      await speakSegment(index + 1);
    } catch (error) {
      if (!shouldStop && !(error instanceof SpeechStoppedError)) {
        callbacks.onError?.(error instanceof Error ? error : new Error(String(error)));
      }
    } finally {
      isExecutingSegment = false;
    }
  };

  const controller: SpeechController = {
    play: async () => {
      if (isPlaying && !isPaused) return;

      shouldStop = false;
      isPlaying = true;
      isPaused = false;

      await speakSegment(currentIndex);
    },

    pause: () => {
      isPaused = true;
      Speech.stop();
      clearPauseTimeout();
      isExecutingSegment = false;
    },

    resume: () => {
      if (!isPaused || isExecutingSegment) return;
      isPaused = false;
      speakSegment(currentIndex);
    },

    stop: () => {
      shouldStop = true;
      isPlaying = false;
      isPaused = false;
      Speech.stop();
      clearPauseTimeout();
      currentIndex = 0;
    },

    skipToNext: () => {
      Speech.stop();
      clearPauseTimeout();
      isExecutingSegment = false;
      if (currentIndex < segments.length - 1) {
        speakSegment(currentIndex + 1);
      }
    },

    getState,
  };

  activeController = controller;
  return controller;
}

export function getActiveController(): SpeechController | null {
  return activeController;
}
