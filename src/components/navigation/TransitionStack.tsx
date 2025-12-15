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

// Calm spring config for wellness app - slower, smoother
const calmSpring = {
  damping: 22,
  stiffness: 85,
  mass: 1,
};

// Overlay component that dims the background
export function DimOverlay({ overlayAnimation }: BlankStackOverlayProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const { progress } = overlayAnimation.value;
    return {
      opacity: interpolate(progress, [0, 1], [0, 0.5]),
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

// Calm presets with slower springs
export const CalmPresets = {
  SlideFromBottom: (config?: Partial<ScreenTransitionConfig>): ScreenTransitionConfig => ({
    ...Transition.Presets.SlideFromBottom(config),
    transitionSpec: {
      open: calmSpring,
      close: calmSpring,
    },
  }),

  SlideFromTop: (config?: Partial<ScreenTransitionConfig>): ScreenTransitionConfig => ({
    ...Transition.Presets.SlideFromTop(config),
    transitionSpec: {
      open: calmSpring,
      close: calmSpring,
    },
  }),

  ZoomIn: (config?: Partial<ScreenTransitionConfig>): ScreenTransitionConfig => ({
    ...Transition.Presets.ZoomIn(config),
    transitionSpec: {
      open: { ...calmSpring, damping: 18 },
      close: { ...calmSpring, damping: 18 },
    },
  }),

  ElasticCard: (config?: Partial<ScreenTransitionConfig> & { elasticFactor?: number }): ScreenTransitionConfig => ({
    ...Transition.Presets.ElasticCard(config),
    transitionSpec: {
      open: calmSpring,
      close: calmSpring,
    },
  }),

  DraggableCard: (config?: Partial<ScreenTransitionConfig>): ScreenTransitionConfig => ({
    ...Transition.Presets.DraggableCard(config),
    transitionSpec: {
      open: calmSpring,
      close: calmSpring,
    },
  }),

  // Gentle horizontal slide for onboarding-style flows
  SlideHorizontal: (config?: Partial<ScreenTransitionConfig>): ScreenTransitionConfig => ({
    screenStyleInterpolator: ({ progress, layouts: { screen } }) => {
      'worklet';
      const translateX = interpolate(
        progress,
        [0, 1, 2],
        [screen.width * 0.3, 0, -screen.width * 0.3]
      );
      const opacity = interpolate(progress, [0, 1, 2], [0, 1, 0]);
      return {
        contentStyle: {
          transform: [{ translateX }],
          opacity,
        },
      };
    },
    transitionSpec: {
      open: calmSpring,
      close: calmSpring,
    },
    gestureEnabled: true,
    gestureDirection: 'horizontal',
    ...config,
  }),
};

// Re-export original Transition for advanced usage
export { Transition };
