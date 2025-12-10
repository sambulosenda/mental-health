import { useEffect, useRef } from 'react';

interface ScrollableRef {
  scrollToEnd: (options?: { animated?: boolean }) => void;
}

/**
 * v0-style hook: scroll to end when composer height increases.
 *
 * From v0 blog:
 * "As you type, the text input's height can increase. When you type new lines,
 * we want to simulate the experience of typing in a regular, non-absolute-positioned
 * input. We had to find a way to shift the chat messages upwards, but only if
 * you are scrolled to the end of the chat."
 */
export function useScrollOnComposerResize(
  scrollViewRef: React.RefObject<ScrollableRef | null>,
  composerHeight: number,
  isNearBottom: boolean = true // For now, always assume near bottom
) {
  const prevHeight = useRef(composerHeight);

  useEffect(() => {
    // Only scroll if composer grew (user typed new lines)
    if (composerHeight > prevHeight.current && isNearBottom) {
      // Scroll without animation for smooth feel
      scrollViewRef.current?.scrollToEnd({ animated: false });
    }
    prevHeight.current = composerHeight;
  }, [composerHeight, isNearBottom, scrollViewRef]);
}
