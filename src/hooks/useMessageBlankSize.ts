import {
  useAnimatedProps,
  type SharedValue,
} from 'react-native-reanimated';

interface UseMessageBlankSizeOptions {
  composerHeight: number;
  keyboardHeight: SharedValue<number>;
}

/**
 * v0-style hook for contentInset.
 *
 * contentInset.bottom creates scrollable space below content,
 * allowing it to scroll up above keyboard/composer.
 *
 * When keyboard is closed: use composerHeight so content doesn't go behind composer
 * When keyboard is open: use keyboardHeight (keyboard pushes composer up)
 */
export function useMessageBlankSize(options: UseMessageBlankSizeOptions) {
  const { composerHeight, keyboardHeight } = options;

  const animatedProps = useAnimatedProps(() => {
    // When keyboard open, it pushes composer up - just need keyboard space
    // When keyboard closed, need space for the composer
    const isKeyboardOpen = keyboardHeight.value > 0;
    const bottomInset = isKeyboardOpen
      ? keyboardHeight.value
      : composerHeight;

    return {
      contentInset: { bottom: bottomInset },
      scrollIndicatorInsets: { bottom: bottomInset },
    };
  }, [composerHeight]);

  return { animatedProps };
}
