import { Text, PremiumBadge } from '@/src/components/ui';
import { colors, darkColors, spacing } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useInterventionRecommendations } from '@/src/hooks/useInterventionRecommendations';
import type { InterventionRecommendation } from '@/src/lib/interventions/recommendations';
import { useSubscriptionStore } from '@/src/stores';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

interface InterventionPickerProps {
  onSelectExercise: (templateId: string) => void;
  overrideMood?: number;
  overrideActivities?: string[];
  title?: string;
  showTitle?: boolean;
}

const MATCH_TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  mood: 'heart-outline',
  activity: 'flash-outline',
  effectiveness: 'star-outline',
};

function RecommendationCard({
  recommendation,
  onPress,
  themeColors,
  isPremiumUser,
}: {
  recommendation: InterventionRecommendation;
  onPress: () => void;
  themeColors: typeof colors | typeof darkColors;
  isPremiumUser: boolean;
}) {
  const { template, reason, matchType } = recommendation;
  const accentColor = template.color || themeColors.primary;
  const isLocked = template.isPremium && !isPremiumUser;

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      className="rounded-2xl p-3 flex-1"
      style={{
        backgroundColor: themeColors.surfaceElevated,
        minWidth: 100,
        opacity: isLocked ? 0.85 : 1,
      }}
    >
      {/* Icon with optional lock overlay */}
      <View className="relative">
        <View
          className="w-11 h-11 rounded-full items-center justify-center mb-3"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          <Ionicons
            name={(template.icon as keyof typeof Ionicons.glyphMap) || 'fitness-outline'}
            size={22}
            color={accentColor}
          />
        </View>
        {isLocked && (
          <View className="absolute -top-1 -right-1">
            <PremiumBadge />
          </View>
        )}
      </View>

      {/* Name */}
      <Text variant="bodyMedium" color="textPrimary" numberOfLines={1}>
        {template.name}
      </Text>

      {/* Reason with match type icon */}
      <View className="flex-row items-center mt-1.5 gap-1">
        <Ionicons
          name={MATCH_TYPE_ICONS[matchType] || 'bulb-outline'}
          size={12}
          color={themeColors.textMuted}
        />
        <Text variant="caption" color="textMuted" numberOfLines={1} className="flex-1">
          {reason}
        </Text>
      </View>

      {/* Duration */}
      <Text variant="caption" color="textMuted" className="mt-1" style={{ opacity: 0.7 }}>
        {template.duration} min
      </Text>
    </Pressable>
  );
}

export function InterventionPicker({
  onSelectExercise,
  overrideMood,
  overrideActivities,
  title = 'Suggested for You',
  showTitle = true,
}: InterventionPickerProps) {
  const router = useRouter();
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const { isPremium, isInitialized } = useSubscriptionStore();

  const { recommendations, isLoading } = useInterventionRecommendations({
    overrideMood,
    overrideActivities,
  });

  const handleSelectExercise = (templateId: string, templateIsPremium?: boolean) => {
    // Only block access once initialization is complete
    if (templateIsPremium && isInitialized && !isPremium) {
      router.push('/paywall');
      return;
    }
    onSelectExercise(templateId);
  };

  if (isLoading) {
    return (
      <View className="py-4">
        {showTitle && (
          <Text variant="h3" color="textPrimary" className="mb-4 px-6">
            {title}
          </Text>
        )}
        <View className="items-center justify-center py-8">
          <ActivityIndicator size="small" color={themeColors.primary} />
        </View>
      </View>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <View className="py-2">
      {showTitle && (
        <View className="flex-row items-center justify-between mb-3 px-6">
          <Text variant="h3" color="textPrimary">
            {title}
          </Text>
          <Ionicons
            name="sparkles"
            size={16}
            color={themeColors.primary}
          />
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.md }}
      >
        {recommendations.map((rec) => (
          <RecommendationCard
            key={rec.template.id}
            recommendation={rec}
            onPress={() => handleSelectExercise(rec.template.id, rec.template.isPremium)}
            themeColors={themeColors}
            isPremiumUser={isPremium}
          />
        ))}
      </ScrollView>
    </View>
  );
}
