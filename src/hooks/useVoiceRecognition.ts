import { useState, useEffect, useCallback, useRef } from 'react';
import { voiceService, VoiceState } from '@/src/lib/voice';

interface UseVoiceRecognitionOptions {
  locale?: string;
  onTranscription?: (text: string) => void;
}

interface UseVoiceRecognitionReturn {
  state: VoiceState;
  transcript: string;
  partialTranscript: string;
  error: string | null;
  isAvailable: boolean;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  cancelListening: () => Promise<void>;
}

export function useVoiceRecognition(
  options: UseVoiceRecognitionOptions = {}
): UseVoiceRecognitionReturn {
  const { locale = 'en-US', onTranscription } = options;

  const [state, setState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [partialTranscript, setPartialTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);

  const onTranscriptionRef = useRef(onTranscription);
  onTranscriptionRef.current = onTranscription;

  useEffect(() => {
    let mounted = true;

    const checkAvailability = async () => {
      const available = await voiceService.isAvailable();
      if (mounted) {
        setIsAvailable(available);
      }
    };

    voiceService.initialize({
      onStart: () => {
        if (mounted) {
          setState('listening');
          setError(null);
          setPartialTranscript('');
        }
      },
      onEnd: () => {
        if (mounted) {
          setState('idle');
        }
      },
      onResults: (text) => {
        if (mounted) {
          setTranscript(text);
          setPartialTranscript('');
          onTranscriptionRef.current?.(text);
        }
      },
      onPartialResults: (text) => {
        if (mounted) {
          setPartialTranscript(text);
        }
      },
      onError: (errorMessage) => {
        if (mounted) {
          setState('error');
          setError(errorMessage);
        }
      },
    });

    checkAvailability();

    return () => {
      mounted = false;
      voiceService.cleanup();
    };
  }, []);

  const startListening = useCallback(async () => {
    setError(null);
    setTranscript('');
    setPartialTranscript('');
    await voiceService.startListening(locale);
  }, [locale]);

  const stopListening = useCallback(async () => {
    await voiceService.stopListening();
  }, []);

  const cancelListening = useCallback(async () => {
    await voiceService.cancelListening();
    setState('idle');
    setPartialTranscript('');
  }, []);

  return {
    state,
    transcript,
    partialTranscript,
    error,
    isAvailable,
    startListening,
    stopListening,
    cancelListening,
  };
}
