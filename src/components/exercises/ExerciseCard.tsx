import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Text } from '@/src/components/ui';
import { colors, darkColors } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import type { ExerciseTemplate } from '@/src/types/exercise';

interface ExerciseCardProps {
  template: ExerciseTemplate;
  onPress: () => void;
  compact?: boolean;
}

const TYPE_LABELS = {
  cbt: 'CBT',
  act: 'ACT',
  dbt: 'DBT',
};

export function ExerciseCard({ template, onPress, compact }: ExerciseCardProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const accentColor = template.color || themeColors.primary;

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  if (compact) {
    return (
      <Pressable
        onPress={handlePress}
        className="rounded-2xl p-4"
        style={{
          backgroundColor: themeColors.surface,
          width: 160,
        }}
      >
        <View
          className="w-10 h-10 rounded-full items-center justify-center mb-3"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          <Ionicons
            name={(template.icon as any) || 'fitness-outline'}
            size={20}
            color={accentColor}
          />
        </View>

        <Text variant="bodyMedium" color="textPrimary" numberOfLines={1}>
          {template.name}
        </Text>

        <Text variant="caption" color="textMuted" className="mt-1">
          {template.duration} min
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      className="rounded-2xl p-4 flex-row items-center"
      style={{ backgroundColor: themeColors.surface }}
    >
      <View
        className="w-12 h-12 rounded-full items-center justify-center mr-4"
        style={{ backgroundColor: `${accentColor}20` }}
      >
        <Ionicons
          name={(template.icon as any) || 'fitness-outline'}
          size={24}
          color={accentColor}
        />
      </View>

      <View className="flex-1">
        <View className="flex-row items-center gap-2 mb-1">
          <Text variant="bodyMedium" color="textPrimary">
            {template.name}
          </Text>
          <View
            className="px-2 py-0.5 rounded"
            style={{ backgroundColor: `${accentColor}15` }}
          >
            <Text variant="caption" style={{ color: accentColor, fontSize: 10 }}>
              {TYPE_LABELS[template.type]}
            </Text>
          </View>
        </View>

        <Text variant="caption" color="textSecondary" numberOfLines={1}>
          {template.description}
        </Text>

        <Text variant="caption" color="textMuted" className="mt-1">
          {template.duration} min • {template.steps.length} steps
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={themeColors.textMuted} />
    </Pressable>
  );
}
