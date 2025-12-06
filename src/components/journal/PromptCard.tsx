import { Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Card, Text } from '@/src/components/ui';
import { colors, darkColors } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import type { JournalPrompt } from '@/src/types/journal';

interface PromptCardProps {
  prompt: JournalPrompt;
  onPress: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  reflection: colors.mood[5],
  gratitude: colors.mood[4],
  growth: colors.mood[3],
  emotion: colors.mood[2],
};

export function PromptCard({ prompt, onPress }: PromptCardProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const categoryColor = CATEGORY_COLORS[prompt.category] || themeColors.primary;

  return (
    <Pressable onPress={handlePress}>
      <Card variant="outlined" className="mb-2">
        <Text variant="label" className="mb-1" style={{ color: categoryColor }}>
          {prompt.category.toUpperCase()}
        </Text>
        <Text variant="body" color="textPrimary" style={{ lineHeight: 24 }}>
          {prompt.text}
        </Text>
      </Card>
    </Pressable>
  );
}
