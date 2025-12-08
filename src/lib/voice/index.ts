import Voice, {
  SpeechResultsEvent,
  SpeechErrorEvent,
  SpeechStartEvent,
  SpeechEndEvent,
} from '@react-native-voice/voice';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'error';

export interface VoiceCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onResults?: (text: string) => void;
  onPartialResults?: (text: string) => void;
  onError?: (error: string) => void;
}

class VoiceService {
  private callbacks: VoiceCallbacks = {};
  private isInitialized = false;

  async initialize(callbacks: VoiceCallbacks): Promise<void> {
    if (this.isInitialized) {
      this.cleanup();
    }

    this.callbacks = callbacks;

    Voice.onSpeechStart = this.onSpeechStart;
    Voice.onSpeechEnd = this.onSpeechEnd;
    Voice.onSpeechResults = this.onSpeechResults;
    Voice.onSpeechPartialResults = this.onSpeechPartialResults;
    Voice.onSpeechError = this.onSpeechError;

    this.isInitialized = true;
  }

  private onSpeechStart = (e: SpeechStartEvent) => {
    this.callbacks.onStart?.();
  };

  private onSpeechEnd = (e: SpeechEndEvent) => {
    this.callbacks.onEnd?.();
  };

  private onSpeechResults = (e: SpeechResultsEvent) => {
    const text = e.value?.[0] ?? '';
    this.callbacks.onResults?.(text);
  };

  private onSpeechPartialResults = (e: SpeechResultsEvent) => {
    const text = e.value?.[0] ?? '';
    this.callbacks.onPartialResults?.(text);
  };

  private onSpeechError = (e: SpeechErrorEvent) => {
    const errorMessage = e.error?.message ?? 'Unknown error occurred';
    this.callbacks.onError?.(errorMessage);
  };

  async startListening(locale: string = 'en-US'): Promise<void> {
    try {
      await Voice.start(locale);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start voice recognition';
      this.callbacks.onError?.(message);
    }
  }

  async stopListening(): Promise<void> {
    try {
      await Voice.stop();
    } catch {
      // Ignore stop errors
    }
  }

  async cancelListening(): Promise<void> {
    try {
      await Voice.cancel();
    } catch {
      // Ignore cancel errors
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const available = await Voice.isAvailable();
      return !!available;
    } catch {
      return false;
    }
  }

  cleanup(): void {
    Voice.destroy().then(Voice.removeAllListeners);
    this.isInitialized = false;
    this.callbacks = {};
  }
}

export const voiceService = new VoiceService();
