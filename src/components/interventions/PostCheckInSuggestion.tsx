import { Text } from '@/src/components/ui';
import { colors, darkColors } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useInterventionRecommendations } from '@/src/hooks/useInterventionRecommendations';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Modal, Pressable, View } from 'react-native';

interface PostCheckInSuggestionProps {
  visible: boolean;
  onDismiss: () => void;
  onSelectExercise: (templateId: string) => void;
  mood: number;
  activities?: string[];
}

export function PostCheckInSuggestion({
  visible,
  onDismiss,
  onSelectExercise,
  mood,
  activities,
}: PostCheckInSuggestionProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;

  const { recommendations } = useInterventionRecommendations({
    overrideMood: mood,
    overrideActivities: activities,
  });

  // Get the top recommendation
  const topRecommendation = recommendations[0];

  if (!topRecommendation) {
    return null;
  }

  const handleSelect = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelectExercise(topRecommendation.template.id);
  };

  const handleDismiss = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDismiss();
  };

  const accentColor = topRecommendation.template.color || themeColors.primary;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <Pressable
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        onPress={onDismiss}
      >
        <Pressable
          className="rounded-t-3xl p-6 pb-10"
          style={{ backgroundColor: themeColors.surface }}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center gap-2">
              <Ionicons name="sparkles" size={20} color={themeColors.iconPrimary} />
              <Text variant="h3" color="textPrimary">
                {"Based on how you're feeling"}
              </Text>
            </View>
            <Pressable onPress={handleDismiss} hitSlop={16}>
              <Ionicons name="close" size={24} color={themeColors.textMuted} />
            </Pressable>
          </View>

          {/* Recommendation Card */}
          <Pressable
            onPress={handleSelect}
            className="rounded-2xl p-5 mb-4"
            style={{ backgroundColor: `${accentColor}10` }}
          >
            <View className="flex-row items-center">
              <View
                className="w-14 h-14 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${accentColor}20` }}
              >
                <Ionicons
                  name={
                    (topRecommendation.template.icon as keyof typeof Ionicons.glyphMap) ||
                    'fitness-outline'
                  }
                  size={28}
                  color={accentColor}
                />
              </View>
              <View className="flex-1">
                <Text variant="bodyMedium" color="textPrimary" className="mb-1">
                  {topRecommendation.template.name}
                </Text>
                <Text variant="caption" color="textSecondary">
                  {topRecommendation.reason}
                </Text>
                <Text variant="caption" color="textMuted" className="mt-1">
                  {topRecommendation.template.duration} min
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={themeColors.textMuted}
              />
            </View>
          </Pressable>

          {/* Skip button */}
          <Pressable
            onPress={handleDismiss}
            className="py-3 items-center"
          >
            <Text variant="bodyMedium" color="textMuted">
              Not now
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
