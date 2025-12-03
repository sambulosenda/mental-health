import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants/theme';

export default function InsightsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text variant="h1" color="textPrimary">
            Insights
          </Text>
          <Text variant="body" color="textSecondary" style={styles.subtitle}>
            Discover patterns in your emotional journey
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="h3" color="textPrimary" style={styles.sectionTitle}>
            Mood Trends
          </Text>
          <Card style={styles.chartCard}>
            <Text variant="body" color="textMuted" center>
              Charts will appear here once you have mood entries.
            </Text>
          </Card>
        </View>

        <View style={styles.section}>
          <Text variant="h3" color="textPrimary" style={styles.sectionTitle}>
            Monthly Calendar
          </Text>
          <Card variant="flat" style={styles.calendarCard}>
            <Text variant="body" color="textMuted" center>
              Mood calendar coming soon
            </Text>
          </Card>
        </View>

        <View style={styles.section}>
          <Text variant="h3" color="textPrimary" style={styles.sectionTitle}>
            Patterns Detected
          </Text>
          <Card variant="flat" style={styles.emptyCard}>
            <Text variant="body" color="textMuted" center>
              Track your mood for at least a week to see patterns.
            </Text>
          </Card>
        </View>

        <View style={styles.section}>
          <Text variant="h3" color="textPrimary" style={styles.sectionTitle}>
            AI Insights
          </Text>
          <Card variant="outlined" style={styles.insightCard}>
            <Text variant="captionMedium" color="primary">
              Coming in v1.1
            </Text>
            <Text variant="body" color="textSecondary" style={styles.insightText}>
              Personalized insights powered by on-device AI will be available in a future update.
            </Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  chartCard: {
    height: 200,
    justifyContent: 'center',
  },
  calendarCard: {
    height: 280,
    justifyContent: 'center',
  },
  emptyCard: {
    padding: spacing.xl,
  },
  insightCard: {
    padding: spacing.md,
  },
  insightText: {
    marginTop: spacing.xs,
  },
});
