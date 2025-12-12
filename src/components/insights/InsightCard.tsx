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
}

interface InsightCardProps {
  insight: Insight;
}

const typeConfig: Record<InsightType, { icon: keyof typeof Ionicons.glyphMap; color: string; darkColor: string; bgColor: string; darkBgColor: string }> = {
  pattern: { icon: 'analytics', color: colors.textOnAccent, darkColor: darkColors.textOnAccent, bgColor: colors.primaryLight, darkBgColor: `${colors.primary}40` },
  trigger: { icon: 'flash', color: '#B45309', darkColor: darkColors.warning, bgColor: colors.warningLight, darkBgColor: `${colors.warning}40` },
  suggestion: { icon: 'bulb', color: '#047857', darkColor: darkColors.success, bgColor: colors.successLight, darkBgColor: `${colors.success}40` },
  streak: { icon: 'flame', color: '#B91C1C', darkColor: darkColors.error, bgColor: colors.errorLight, darkBgColor: `${colors.error}40` },
  milestone: { icon: 'trophy', color: '#B45309', darkColor: darkColors.warning, bgColor: colors.warningLight, darkBgColor: `${colors.warning}40` },
};

export function InsightCard({ insight }: InsightCardProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const config = typeConfig[insight.type];
  const icon = insight.icon ?? config.icon;

  return (
    <Card className="flex-row items-center p-4">
      <View
        className="w-11 h-11 rounded-xl justify-center items-center mr-4"
        style={{ backgroundColor: isDark ? config.darkBgColor : config.bgColor }}
      >
        <Ionicons name={icon} size={24} color={isDark ? config.darkColor : config.color} />
      </View>
      <View className="flex-1">
        <Text variant="captionMedium" color="textPrimary">
          {insight.title}
        </Text>
        <Text variant="caption" color="textSecondary" className="mt-0.5">
          {insight.description}
        </Text>
      </View>
      {insight.priority === 'high' && (
        <View className="ml-2">
          <Ionicons name="star" size={12} color={themeColors.warning} />
        </View>
      )}
    </Card>
  );
}

interface InsightListProps {
  insights: Insight[];
  emptyMessage?: string;
}

export function InsightList({ insights, emptyMessage }: InsightListProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;

  if (insights.length === 0) {
    return (
      <Card variant="flat" className="p-8 items-center">
        <Ionicons name="sparkles-outline" size={32} color={themeColors.textMuted} />
        <Text variant="body" color="textMuted" center className="mt-2">
          {emptyMessage ?? 'Track your mood for at least a week to discover patterns.'}
        </Text>
      </Card>
    );
  }

  return (
    <View className="gap-2">
      {insights.map((insight) => (
        <InsightCard key={insight.id} insight={insight} />
      ))}
    </View>
  );
}
