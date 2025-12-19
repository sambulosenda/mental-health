import { TransitionStack, CalmPresets } from '@/src/components/navigation/TransitionStack';

export default function ModalsLayout() {
  return (
    <TransitionStack>
      <TransitionStack.Screen
        name="journal-entry"
        options={{
          ...CalmPresets.SlideFromBottom(),
        }}
      />
      <TransitionStack.Screen
        name="chat"
        options={{
          ...CalmPresets.SlideHorizontal(),
        }}
      />
      <TransitionStack.Screen
        name="exercise-session"
        options={{
          ...CalmPresets.SlideFromBottom(),
          gestureEnabled: false,
        }}
      />
      <TransitionStack.Screen
        name="sources"
        options={{
          ...CalmPresets.SlideFromBottom(),
        }}
      />
    </TransitionStack>
  );
}
