import type { ParamListBase, StackNavigationState } from '@react-navigation/native';
import { withLayoutContext } from 'expo-router';
import {
  createBlankStackNavigator,
  type BlankStackNavigationEventMap,
  type BlankStackNavigationOptions,
  type BlankStackOverlayProps,
} from 'react-native-screen-transitions/blank-stack';
import Transition from 'react-native-screen-transitions';
import type { ScreenTransitionConfig } from 'react-native-screen-transitions';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { StyleSheet } from 'react-native';

const { Navigator } = createBlankStackNavigator();

export const TransitionStack = withLayoutContext<
  BlankStackNavigationOptions,
  typeof Navigator,
  StackNavigationState<ParamListBase>,
  BlankStackNavigationEventMap
>(Navigator);

// Optimized spring configs for smooth, professional transitions
// Higher stiffness = faster, lower damping = more bounce

// Snappy spring for regular navigation (~250ms feel)
const snappySpring = {
  damping: 28,
  stiffness: 380,
  mass: 0.8,
};

// Smooth spring for modals (~300ms feel)
const modalSpring = {
  damping: 30,
  stiffness: 320,
  mass: 0.9,
};

// Gentle spring for cards/overlays
const gentleSpring = {
  damping: 26,
  stiffness: 280,
  mass: 0.85,
};

// Overlay component that dims the background
export function DimOverlay({ overlayAnimation }: BlankStackOverlayProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const { progress } = overlayAnimation.value;
    return {
      opacity: interpolate(progress, [0, 1], [0, 0.4]),
    };
  });

  return <Animated.View style={[styles.overlay, animatedStyle]} pointerEvents="none" />;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
});

// Optimized presets with smooth, professional springs
export const CalmPresets = {
  // Smooth slide from bottom - perfect for modals
  SlideFromBottom: (config?: Partial<ScreenTransitionConfig>): ScreenTransitionConfig => ({
    ...Transition.Presets.SlideFromBottom(config),
    transitionSpec: {
      open: modalSpring,
      close: modalSpring,
    },
  }),

  // Slide from top
  SlideFromTop: (config?: Partial<ScreenTransitionConfig>): ScreenTransitionConfig => ({
    ...Transition.Presets.SlideFromTop(config),
    transitionSpec: {
      open: modalSpring,
      close: modalSpring,
    },
  }),

  // Smooth zoom in - good for focus transitions
  ZoomIn: (config?: Partial<ScreenTransitionConfig>): ScreenTransitionConfig => ({
    ...Transition.Presets.ZoomIn(config),
    transitionSpec: {
      open: gentleSpring,
      close: gentleSpring,
    },
  }),

  // Elastic card - iOS-style modal card
  ElasticCard: (config?: Partial<ScreenTransitionConfig>): ScreenTransitionConfig => ({
    ...Transition.Presets.ElasticCard(config),
    transitionSpec: {
      open: gentleSpring,
      close: gentleSpring,
    },
  }),

  // Draggable card with gesture support
  DraggableCard: (config?: Partial<ScreenTransitionConfig>): ScreenTransitionConfig => ({
    ...Transition.Presets.DraggableCard(config),
    transitionSpec: {
      open: modalSpring,
      close: modalSpring,
    },
  }),

  // Horizontal slide - iOS-style push/pop (NO opacity fade for clean look)
  SlideHorizontal: (config?: Partial<ScreenTransitionConfig>): ScreenTransitionConfig => ({
    screenStyleInterpolator: ({ progress, layouts: { screen } }) => {
      'worklet';
      // Incoming screen slides from right, outgoing slides left (parallax effect)
      const translateX = interpolate(
        progress,
        [0, 1, 2],
        [screen.width, 0, -screen.width * 0.3]
      );
      return {
        contentStyle: {
          transform: [{ translateX }],
        },
      };
    },
    transitionSpec: {
      open: snappySpring,
      close: snappySpring,
    },
    gestureEnabled: true,
    gestureDirection: 'horizontal',
    ...config,
  }),

  // Fade transition - subtle, good for tab-like changes
  Fade: (config?: Partial<ScreenTransitionConfig>): ScreenTransitionConfig => ({
    screenStyleInterpolator: ({ progress }) => {
      'worklet';
      const opacity = interpolate(progress, [0, 1, 2], [0, 1, 1]);
      return {
        contentStyle: {
          opacity,
        },
      };
    },
    transitionSpec: {
      open: { damping: 30, stiffness: 400, mass: 0.7 },
      close: { damping: 30, stiffness: 400, mass: 0.7 },
    },
    gestureEnabled: false,
    ...config,
  }),

  // No animation - instant transition
  None: (config?: Partial<ScreenTransitionConfig>): ScreenTransitionConfig => ({
    screenStyleInterpolator: () => {
      'worklet';
      return { contentStyle: {} };
    },
    transitionSpec: {
      open: { damping: 500, stiffness: 1000, mass: 1 },
      close: { damping: 500, stiffness: 1000, mass: 1 },
    },
    gestureEnabled: false,
    ...config,
  }),

  // iOS-style modal (slide from bottom with scale on background)
  Modal: (config?: Partial<ScreenTransitionConfig>): ScreenTransitionConfig => ({
    screenStyleInterpolator: ({ progress, layouts: { screen } }) => {
      'worklet';
      const translateY = interpolate(progress, [0, 1, 2], [screen.height, 0, 0]);
      const scale = interpolate(progress, [0, 1, 2], [1, 1, 0.95]);
      const borderRadius = interpolate(progress, [0, 1, 2], [0, 0, 12]);

      return {
        contentStyle: {
          transform: [{ translateY }, { scale }],
          borderRadius,
          overflow: 'hidden',
        },
      };
    },
    transitionSpec: {
      open: modalSpring,
      close: modalSpring,
    },
    gestureEnabled: true,
    gestureDirection: 'vertical',
    ...config,
  }),
};

// Re-export original Transition for advanced usage
export { Transition };
