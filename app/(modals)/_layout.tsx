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
    </Stack>
  );
}
