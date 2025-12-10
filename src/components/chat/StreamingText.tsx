import { useEffect, useMemo, useRef } from 'react';
import { TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const WORD_DELAY_MS = 32;
const WORD_DURATION_MS = 150;

interface StreamingTextProps {
  text: string;
  isStreaming: boolean;
  style?: TextStyle;
  onStreamComplete?: () => void;
}

interface WordProps {
  word: string;
  delay: number;
  isAnimated: boolean;
  style?: TextStyle;
}

function StreamingWord({ word, delay, isAnimated, style }: WordProps) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isAnimated) {
      opacity.value = 1;
    } else {
      const timer = setTimeout(() => {
        opacity.value = withTiming(1, {
          duration: WORD_DURATION_MS,
          easing: Easing.out(Easing.cubic),
        });
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [delay, isAnimated, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // If already animated, render plain text for performance
  if (isAnimated) {
    return <Animated.Text style={style}>{word}</Animated.Text>;
  }

  return (
    <Animated.Text style={[style, animatedStyle]}>
      {word}
    </Animated.Text>
  );
}

export function StreamingText({
  text,
  isStreaming,
  style,
  onStreamComplete,
}: StreamingTextProps) {
  // Split text into words preserving whitespace
  const words = useMemo(() => {
    return text.split(/(\s+)/).filter(Boolean);
  }, [text]);

  // Track which words have been seen before (for re-renders)
  const seenWordsCount = useRef(0);
  const animatedIndices = useRef<Set<number>>(new Set());
  // Snapshot count when streaming stops for accurate completion timing
  const countAtStreamEnd = useRef(0);

  // Mark words as already animated if not streaming
  useEffect(() => {
    if (!isStreaming) {
      // Capture count before marking all as animated
      countAtStreamEnd.current = seenWordsCount.current;
      // Mark all words as animated
      words.forEach((_, i) => animatedIndices.current.add(i));
    }
  }, [isStreaming, words.length]);

  // Update seen words count after each render (deferred to avoid race condition)
  useEffect(() => {
    Promise.resolve().then(() => {
      seenWordsCount.current = words.length;
    });
  });

  // When streaming completes
  useEffect(() => {
    if (!isStreaming && words.length > 0) {
      const newWordCount = Math.max(0, words.length - countAtStreamEnd.current);
      const totalDuration = newWordCount * WORD_DELAY_MS + WORD_DURATION_MS;
      const timer = setTimeout(() => {
        onStreamComplete?.();
      }, totalDuration);

      return () => clearTimeout(timer);
    }
  }, [isStreaming, words.length, onStreamComplete]);

  // Calculate delays with pool consideration
  const getDelay = (index: number): number => {
    // Words seen before this render don't animate
    if (index < seenWordsCount.current) {
      return 0;
    }

    // Stagger new words
    const newWordIndex = index - seenWordsCount.current;
    return newWordIndex * WORD_DELAY_MS;
  };

  // Check if word should skip animation
  const isWordAnimated = (index: number): boolean => {
    return animatedIndices.current.has(index) || !isStreaming;
  };

  return (
    <Animated.Text style={style}>
      {words.map((word, index) => (
        <StreamingWord
          key={`${index}-${word}`}
          word={word}
          delay={getDelay(index)}
          isAnimated={isWordAnimated(index)}
          style={style}
        />
      ))}
    </Animated.Text>
  );
}
