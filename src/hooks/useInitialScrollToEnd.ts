import { useEffect, useRef, useCallback } from 'react';
import { useSharedValue } from 'react-native-reanimated';

interface ScrollableRef {
  scrollToEnd: (options?: { animated?: boolean }) => void;
}

/**
 * v0-style hook for scrolling to end when chat first loads.
 *
 * From v0 blog:
 * "Due to a complex combination of dynamic message heights and blank size,
 * we had to call scrollToEnd multiple times. If we didn't, our list would
 * either not scroll properly, or scroll too late."
 *
 * This hook scrolls multiple times to ensure content is properly positioned
 * before fading in the chat.
 */
export function useInitialScrollToEnd(
  scrollViewRef: React.RefObject<ScrollableRef | null>,
  hasMessages: boolean
) {
  const hasScrolledToEnd = useSharedValue(false);
  const hasStartedScroll = useRef(false);

  const scrollToEnd = useCallback(() => {
    scrollViewRef.current?.scrollToEnd({ animated: false });
  }, [scrollViewRef]);

  useEffect(() => {
    if (!hasMessages || hasStartedScroll.current) return;

    hasStartedScroll.current = true;

    // v0 pattern: call scrollToEnd multiple times to handle dynamic heights
    scrollToEnd();

    // Another one in case list hasn't fully laid out
    requestAnimationFrame(() => {
      scrollToEnd();

      // And another one
      setTimeout(() => {
        scrollToEnd();

        // Final one, then mark as complete
        requestAnimationFrame(() => {
          hasScrolledToEnd.value = true;
        });
      }, 16);
    });
  }, [hasMessages, scrollToEnd, hasScrolledToEnd]);

  return hasScrolledToEnd;
}
