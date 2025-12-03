import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants/theme';

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

const typeConfig: Record<InsightType, { icon: keyof typeof Ionicons.glyphMap; color: string; bgColor: string }> = {
  pattern: { icon: 'analytics', color: colors.primary, bgColor: colors.primaryLight },
  trigger: { icon: 'flash', color: colors.warning, bgColor: colors.warningLight },
  suggestion: { icon: 'bulb', color: colors.success, bgColor: colors.successLight },
  streak: { icon: 'flame', color: '#FF6B6B', bgColor: '#FFE4E4' },
  milestone: { icon: 'trophy', color: '#FFD93D', bgColor: '#FFF8E1' },
};

export function InsightCard({ insight }: InsightCardProps) {
  const config = typeConfig[insight.type];
  const icon = insight.icon ?? config.icon;

  return (
    <Card style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
        <Ionicons name={icon} size={24} color={config.color} />
      </View>
      <View style={styles.content}>
        <Text variant="captionMedium" color="textPrimary">
          {insight.title}
        </Text>
        <Text variant="caption" color="textSecondary" style={styles.description}>
          {insight.description}
        </Text>
      </View>
      {insight.priority === 'high' && (
        <View style={styles.priorityBadge}>
          <Ionicons name="star" size={12} color={colors.warning} />
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
  if (insights.length === 0) {
    return (
      <Card variant="flat" style={styles.emptyCard}>
        <Ionicons name="sparkles-outline" size={32} color={colors.textMuted} />
        <Text variant="body" color="textMuted" center style={styles.emptyText}>
          {emptyMessage ?? 'Track your mood for at least a week to discover patterns.'}
        </Text>
      </Card>
    );
  }

  return (
    <View style={styles.list}>
      {insights.map((insight) => (
        <InsightCard key={insight.id} insight={insight} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  description: {
    marginTop: 2,
  },
  priorityBadge: {
    marginLeft: spacing.sm,
  },
  list: {
    gap: spacing.sm,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: spacing.sm,
  },
});
