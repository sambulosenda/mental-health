import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Text } from '@/src/components/ui';
import { colors, darkColors, borderRadius } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import type { JournalPrompt } from '@/src/types/journal';

interface PromptCardProps {
  prompt: JournalPrompt;
  onPress: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export function PromptCard({ prompt, onPress, isFirst, isLast }: PromptCardProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: pressed
            ? (isDark ? '#363D39' : '#E5E5EA')
            : themeColors.surfaceElevated,
          borderTopLeftRadius: isFirst ? borderRadius.lg : 0,
          borderTopRightRadius: isFirst ? borderRadius.lg : 0,
          borderBottomLeftRadius: isLast ? borderRadius.lg : 0,
          borderBottomRightRadius: isLast ? borderRadius.lg : 0,
        },
      ]}
    >
      <View style={styles.content}>
        <Text
          variant="body"
          color="textPrimary"
          style={styles.promptText}
          numberOfLines={2}
        >
          {prompt.text}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={18}
          color={themeColors.textMuted}
          style={styles.chevron}
        />
      </View>
      {!isLast && (
        <View
          style={[
            styles.separator,
            { backgroundColor: themeColors.divider }
          ]}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  promptText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  chevron: {
    marginLeft: 8,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 0,
  },
});
