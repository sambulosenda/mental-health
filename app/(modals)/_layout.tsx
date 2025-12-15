import { TransitionStack, Transition } from '@/src/components/navigation/TransitionStack';

export default function ModalsLayout() {
  return (
    <TransitionStack>
      <TransitionStack.Screen
        name="journal-entry"
        options={{
          ...Transition.Presets.SlideFromBottom(),
        }}
      />
      <TransitionStack.Screen
        name="chat"
        options={{
          ...Transition.Presets.SlideFromBottom(),
        }}
      />
      <TransitionStack.Screen
        name="exercise-session"
        options={{
          ...Transition.Presets.SlideFromBottom(),
          gestureEnabled: false,
        }}
      />
      <TransitionStack.Screen
        name="assessment-session"
        options={{
          ...Transition.Presets.SlideFromBottom(),
          gestureEnabled: false,
        }}
      />
    </TransitionStack>
  );
}
