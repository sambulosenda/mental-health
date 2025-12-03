import { StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Card, Text } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants/theme';
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
  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const categoryColor = CATEGORY_COLORS[prompt.category] || colors.primary;

  return (
    <Pressable onPress={handlePress}>
      <Card variant="outlined" style={styles.card}>
        <Text
          variant="label"
          style={[styles.category, { color: categoryColor }]}
        >
          {prompt.category.toUpperCase()}
        </Text>
        <Text variant="body" color="textPrimary" style={styles.text}>
          {prompt.text}
        </Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  category: {
    marginBottom: spacing.xs,
  },
  text: {
    lineHeight: 24,
  },
});
