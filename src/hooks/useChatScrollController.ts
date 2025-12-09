import { useRef, useCallback } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useDerivedValue,
  useAnimatedReaction,
} from 'react-native-reanimated';

const NEAR_BOTTOM_THRESHOLD = 100;

export function useChatScrollController() {
  const scrollViewRef = useRef<Animated.ScrollView>(null);

  // Scroll tracking shared values
  const scrollY = useSharedValue(0);
  const contentHeight = useSharedValue(0);
  const containerHeight = useSharedValue(0);
  const composerHeight = useSharedValue(80);

  // Derived value: is user near bottom of scroll
  const isNearBottom = useDerivedValue(() => {
    const maxScroll = contentHeight.value - containerHeight.value;
    const distanceFromBottom = maxScroll - scrollY.value;
    return distanceFromBottom < NEAR_BOTTOM_THRESHOLD || maxScroll <= 0;
  });

  // Scroll handler for tracking position
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Scroll to bottom function (called from JS thread)
  const scrollToBottom = useCallback((animated = true) => {
    scrollViewRef.current?.scrollToEnd({ animated });
  }, []);

  // Auto-scroll when content grows and user is near bottom
  useAnimatedReaction(
    () => contentHeight.value,
    (newHeight, prevHeight) => {
      'worklet';
      if (isNearBottom.value && newHeight > (prevHeight ?? 0)) {
        // Will be handled by onContentSizeChange callback
      }
    }
  );

  // Handle content size changes
  const onContentSizeChange = useCallback((_width: number, height: number) => {
    contentHeight.value = height;
  }, []);

  // Handle container layout
  const onContainerLayout = useCallback((height: number) => {
    containerHeight.value = height;
  }, []);

  // Update composer height (for contentInset)
  const setComposerHeight = useCallback((height: number) => {
    composerHeight.value = height;
  }, []);

  return {
    scrollViewRef,
    scrollHandler,
    scrollToBottom,
    onContentSizeChange,
    onContainerLayout,
    setComposerHeight,
    composerHeight,
    isNearBottom,
  };
}
