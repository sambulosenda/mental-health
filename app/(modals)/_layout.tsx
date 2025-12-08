import { Stack } from 'expo-router';
import { colors } from '@/src/constants/theme';

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        presentation: 'modal',
      }}
    >
      <Stack.Screen name="journal-entry" />
      <Stack.Screen name="chat" />
      <Stack.Screen
        name="exercise-session"
        options={{
          presentation: 'fullScreenModal',
          gestureEnabled: false, // Prevent accidental swipe dismiss during exercises
        }}
      />
      <Stack.Screen
        name="assessment-session"
        options={{
          presentation: 'fullScreenModal',
          gestureEnabled: false, // Prevent accidental swipe dismiss during assessments
        }}
      />
    </Stack>
  );
}
