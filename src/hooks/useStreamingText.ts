import { useRef, useCallback, useMemo } from 'react';
import { useSharedValue, withTiming, Easing } from 'react-native-reanimated';

const POOL_SIZE = 4;
const WORD_DELAY_MS = 32;
const WORD_DURATION_MS = 150;

interface PoolSlot {
  opacity: ReturnType<typeof useSharedValue<number>>;
  inUse: boolean;
}

export function useStreamingText(text: string, _isStreaming?: boolean) {
  // Split text into words preserving whitespace
  const words = useMemo(() => {
    return text.split(/(\s+)/).filter(Boolean);
  }, [text]);

  // Create animation pool
  const pool = useRef<PoolSlot[]>(
    Array.from({ length: POOL_SIZE }, () => ({
      opacity: { value: 0 } as ReturnType<typeof useSharedValue<number>>,
      inUse: false,
    }))
  );

  // Track which words have completed animation
  const completedWords = useRef<Set<number>>(new Set());
  const animationQueue = useRef<number[]>([]);
  const isProcessing = useRef(false);

  // Get next available pool slot
  const getPoolSlot = useCallback((wordIndex: number): number => {
    // If already animated, return -1 (render static)
    if (completedWords.current.has(wordIndex)) {
      return -1;
    }

    // Find available slot
    for (let i = 0; i < POOL_SIZE; i++) {
      if (!pool.current[i].inUse) {
        return i;
      }
    }

    // No slot available, queue for later
    return -2;
  }, []);

  // Animate a word using a pool slot
  const animateWord = useCallback(
    (wordIndex: number, slotIndex: number, onComplete: () => void) => {
      if (slotIndex < 0 || slotIndex >= POOL_SIZE) return;

      const slot = pool.current[slotIndex];
      slot.inUse = true;
      slot.opacity.value = 0;

      // Animate opacity
      slot.opacity.value = withTiming(1, {
        duration: WORD_DURATION_MS,
        easing: Easing.out(Easing.cubic),
      });

      // Release slot after animation
      setTimeout(() => {
        slot.inUse = false;
        completedWords.current.add(wordIndex);
        onComplete();
      }, WORD_DURATION_MS);
    },
    []
  );

  // Process animation queue
  const processQueue = useCallback(() => {
    if (isProcessing.current || animationQueue.current.length === 0) return;

    isProcessing.current = true;

    const processNext = () => {
      if (animationQueue.current.length === 0) {
        isProcessing.current = false;
        return;
      }

      const wordIndex = animationQueue.current[0];
      const slotIndex = getPoolSlot(wordIndex);

      if (slotIndex >= 0) {
        animationQueue.current.shift();
        animateWord(wordIndex, slotIndex, () => {
          // Process next after delay
          setTimeout(processNext, WORD_DELAY_MS);
        });
      } else if (slotIndex === -1) {
        // Already completed, skip
        animationQueue.current.shift();
        processNext();
      } else {
        // No slot available, wait and retry
        setTimeout(processNext, 10);
      }
    };

    processNext();
  }, [getPoolSlot, animateWord]);

  // Queue words for animation
  const queueAnimation = useCallback(
    (wordIndex: number) => {
      if (!completedWords.current.has(wordIndex)) {
        animationQueue.current.push(wordIndex);
        processQueue();
      }
    },
    [processQueue]
  );

  // Reset animation state
  const reset = useCallback(() => {
    completedWords.current.clear();
    animationQueue.current = [];
    isProcessing.current = false;
    pool.current.forEach((slot) => {
      slot.inUse = false;
      slot.opacity.value = 0;
    });
  }, []);

  // Check if word is animated
  const isWordAnimated = useCallback((wordIndex: number) => {
    return completedWords.current.has(wordIndex);
  }, []);

  return {
    words,
    pool: pool.current,
    queueAnimation,
    isWordAnimated,
    getPoolSlot,
    reset,
  };
}
