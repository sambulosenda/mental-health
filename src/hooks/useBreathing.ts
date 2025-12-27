import { useState, useCallback, useRef, useEffect } from 'react';
import type { BreathingConfig, BreathingPhaseConfig } from '@/src/types/exercise';
import { playHapticPattern, playStartHaptic, playPhaseCompleteHaptic } from '@/src/lib/breathing/breathingHaptics';
import { speakBreathCue, stopBreathCue } from '@/src/lib/breathing/breathingVoice';
import { getCycleDuration, getTotalCycles, BREATHING_TECHNIQUES } from '@/src/constants/breathingTechniques';

export interface UseBreathingOptions {
  config: BreathingConfig;
  totalDurationSeconds: number;
  enableVoice?: boolean;
  enableHaptics?: boolean;
  onPhaseChange?: (phase: BreathingPhaseConfig, index: number) => void;
  onCycleComplete?: (cycleNumber: number) => void;
  onComplete?: () => void;
}

export interface UseBreathingReturn {
  isRunning: boolean;
  isPaused: boolean;
  currentPhase: BreathingPhaseConfig | null;
  currentPhaseIndex: number;
  phaseSecondsLeft: number;
  cyclesCompleted: number;
  totalCycles: number;
  cycleDuration: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

export function useBreathing(options: UseBreathingOptions): UseBreathingReturn {
  const {
    config,
    totalDurationSeconds,
    enableVoice = false,
    enableHaptics = true,
    onPhaseChange,
    onCycleComplete,
    onComplete,
  } = options;

  const cycleDuration = getCycleDuration(config);
  const totalCycles = getTotalCycles(config, totalDurationSeconds);

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(config.phases[0]?.durationSeconds || 4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  // Refs for cleanup and abort control
  const abortControllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentPhase = config.phases[currentPhaseIndex] || null;

  // Cleanup function
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    stopBreathCue();
  }, []);

  // Start a new phase
  const startPhase = useCallback(async (phaseIndex: number, newCycle: boolean = false) => {
    const phase = config.phases[phaseIndex];
    if (!phase) return;

    setCurrentPhaseIndex(phaseIndex);
    setPhaseSecondsLeft(phase.durationSeconds);

    onPhaseChange?.(phase, phaseIndex);

    // Create new abort controller for this phase
    abortControllerRef.current = new AbortController();

    // Play haptic pattern for this phase
    if (enableHaptics && phase.hapticPattern) {
      playHapticPattern(
        phase.hapticPattern,
        phase.durationSeconds * 1000,
        abortControllerRef.current
      );
    }

    // Speak voice cue
    if (enableVoice && phase.voiceCue) {
      speakBreathCue(phase.voiceCue);
    }
  }, [config.phases, enableHaptics, enableVoice, onPhaseChange]);

  // Move to next phase
  const nextPhase = useCallback(() => {
    const nextIndex = (currentPhaseIndex + 1) % config.phases.length;
    const isNewCycle = nextIndex === 0;

    if (isNewCycle) {
      const newCycleCount = cyclesCompleted + 1;
      setCyclesCompleted(newCycleCount);
      onCycleComplete?.(newCycleCount);

      // Check if exercise is complete
      if (newCycleCount >= totalCycles) {
        setIsRunning(false);
        cleanup();
        if (enableHaptics) {
          playPhaseCompleteHaptic();
        }
        onComplete?.();
        return;
      }
    }

    startPhase(nextIndex, isNewCycle);
  }, [currentPhaseIndex, config.phases.length, cyclesCompleted, totalCycles, startPhase, cleanup, enableHaptics, onCycleComplete, onComplete]);

  // Timer tick
  useEffect(() => {
    if (!isRunning || isPaused) return;

    timerRef.current = setInterval(() => {
      setPhaseSecondsLeft((prev) => {
        if (prev <= 1) {
          nextPhase();
          return config.phases[(currentPhaseIndex + 1) % config.phases.length]?.durationSeconds || 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, isPaused, currentPhaseIndex, config.phases, nextPhase]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const start = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
    setCyclesCompleted(0);
    setCurrentPhaseIndex(0);
    setPhaseSecondsLeft(config.phases[0]?.durationSeconds || 4);

    if (enableHaptics) {
      playStartHaptic();
    }

    startPhase(0);
  }, [config.phases, enableHaptics, startPhase]);

  const pause = useCallback(() => {
    setIsPaused(true);
    cleanup();
  }, [cleanup]);

  const resume = useCallback(() => {
    setIsPaused(false);
    // Restart haptics for current phase with remaining time
    if (enableHaptics && currentPhase?.hapticPattern) {
      abortControllerRef.current = new AbortController();
      playHapticPattern(
        currentPhase.hapticPattern,
        phaseSecondsLeft * 1000,
        abortControllerRef.current
      );
    }
  }, [enableHaptics, currentPhase, phaseSecondsLeft]);

  const stop = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setCyclesCompleted(0);
    setCurrentPhaseIndex(0);
    setPhaseSecondsLeft(config.phases[0]?.durationSeconds || 4);
    cleanup();
  }, [config.phases, cleanup]);

  return {
    isRunning,
    isPaused,
    currentPhase,
    currentPhaseIndex,
    phaseSecondsLeft,
    cyclesCompleted,
    totalCycles,
    cycleDuration,
    start,
    pause,
    resume,
    stop,
  };
}

// Default config for backward compatibility
export const DEFAULT_BREATHING_CONFIG = BREATHING_TECHNIQUES['box-breathing'];
