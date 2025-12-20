import { memo } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card } from '@/src/components/ui';
import { colors, darkColors } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';

export type InsightType = 'pattern' | 'trigger' | 'suggestion' | 'streak' | 'milestone';

export interface Insight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  icon?: keyof typeof Ionicons.glyphMap;
  priority?: 'high' | 'medium' | 'low';
  metadata?: Record<string, unknown>;
  isAIGenerated?: boolean;
}

interface InsightCardProps {
  insight: Insight;
}

const typeConfig: Record<InsightType, { icon: keyof typeof Ionicons.glyphMap; color: string; darkColor: string; bgColor: string; darkBgColor: string }> = {
  pattern: { icon: 'analytics', color: colors.primary, darkColor: darkColors.primary, bgColor: `${colors.primary}15`, darkBgColor: `${darkColors.primary}25` },
  trigger: { icon: 'flash', color: colors.warning, darkColor: darkColors.warning, bgColor: `${colors.warning}15`, darkBgColor: `${darkColors.warning}25` },
  suggestion: { icon: 'bulb', color: colors.success, darkColor: darkColors.success, bgColor: `${colors.success}15`, darkBgColor: `${darkColors.success}25` },
  streak: { icon: 'flame', color: colors.error, darkColor: darkColors.error, bgColor: `${colors.error}15`, darkBgColor: `${darkColors.error}25` },
  milestone: { icon: 'trophy', color: colors.warning, darkColor: darkColors.warning, bgColor: `${colors.warning}15`, darkBgColor: `${darkColors.warning}25` },
};

export const InsightCard = memo(function InsightCard({ insight }: InsightCardProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const config = typeConfig[insight.type];
  const icon = insight.icon ?? config.icon;

  return (
    <Card padding="md">
      <View className="flex-row items-start" style={{ gap: 12 }}>
        <View
          className="w-10 h-10 rounded-xl justify-center items-center"
          style={{ backgroundColor: isDark ? config.darkBgColor : config.bgColor }}
        >
          <Ionicons name={icon} size={20} color={isDark ? config.darkColor : config.color} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-start justify-between">
            <Text variant="bodyMedium" color="textPrimary" className="flex-1">
              {insight.title}
            </Text>
            <View className="flex-row items-center">
              {insight.isAIGenerated && (
                <View
                  className="px-1.5 py-0.5 rounded ml-2"
                  style={{ backgroundColor: isDark ? `${themeColors.primary}30` : `${themeColors.primary}15` }}
                >
                  <Text variant="caption" style={{ fontSize: 10, color: themeColors.primary }}>
                    AI
                  </Text>
                </View>
              )}
              {insight.priority === 'high' && (
                <View
                  className="w-2 h-2 rounded-full ml-2"
                  style={{ backgroundColor: themeColors.warning }}
                />
              )}
            </View>
          </View>
          <Text
            variant="caption"
            color="textSecondary"
            className="mt-1"
            style={{ lineHeight: 20 }}
          >
            {insight.description}
          </Text>
        </View>
      </View>
    </Card>
  );
});

interface InsightListProps {
  insights: Insight[];
  emptyMessage?: string;
}

export function InsightList({ insights, emptyMessage }: InsightListProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;

  if (insights.length === 0) {
    return (
      <Card variant="flat" className="py-10 px-6 items-center">
        <View
          className="w-12 h-12 rounded-xl items-center justify-center mb-4"
          style={{ backgroundColor: isDark ? `${darkColors.primary}30` : `${colors.primary}15` }}
        >
          <Ionicons name="sparkles-outline" size={24} color={themeColors.primary} />
        </View>
        <Text variant="body" color="textSecondary" center style={{ maxWidth: 260 }}>
          {emptyMessage ?? 'Track your mood for at least a week to discover patterns.'}
        </Text>
      </Card>
    );
  }

  return (
    <View className="gap-3">
      {insights.map((insight) => (
        <InsightCard key={insight.id} insight={insight} />
      ))}
    </View>
  );
}
