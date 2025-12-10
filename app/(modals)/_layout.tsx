import { Stack } from 'expo-router';
import { colors, darkColors } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';

export default function ModalsLayout() {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: themeColors.background },
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
