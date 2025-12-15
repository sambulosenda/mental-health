import type { ParamListBase, StackNavigationState } from '@react-navigation/native';
import { withLayoutContext } from 'expo-router';
import {
  createBlankStackNavigator,
  type BlankStackNavigationEventMap,
  type BlankStackNavigationOptions,
} from 'react-native-screen-transitions/blank-stack';

const { Navigator } = createBlankStackNavigator();

export const TransitionStack = withLayoutContext<
  BlankStackNavigationOptions,
  typeof Navigator,
  StackNavigationState<ParamListBase>,
  BlankStackNavigationEventMap
>(Navigator);

// Re-export presets for convenience
export { default as Transition } from 'react-native-screen-transitions';
