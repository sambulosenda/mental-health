import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, Button } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants/theme';

export default function JournalScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text variant="h1" color="textPrimary">
            Journal
          </Text>
          <Text variant="body" color="textSecondary" style={styles.subtitle}>
            Capture your thoughts and reflections
          </Text>
        </View>

        <View style={styles.actions}>
          <Button fullWidth>
            New Entry
          </Button>
        </View>

        <View style={styles.section}>
          <Text variant="h3" color="textPrimary" style={styles.sectionTitle}>
            Today's Prompts
          </Text>
          <Card variant="outlined" style={styles.promptCard}>
            <Text variant="captionMedium" color="primary">
              Reflection
            </Text>
            <Text variant="body" color="textPrimary" style={styles.promptText}>
              What made you smile today?
            </Text>
          </Card>
          <Card variant="outlined" style={styles.promptCard}>
            <Text variant="captionMedium" color="primary">
              Gratitude
            </Text>
            <Text variant="body" color="textPrimary" style={styles.promptText}>
              What are three things you're grateful for?
            </Text>
          </Card>
        </View>

        <View style={styles.section}>
          <Text variant="h3" color="textPrimary" style={styles.sectionTitle}>
            Recent Entries
          </Text>
          <Card variant="flat" style={styles.emptyCard}>
            <Text variant="body" color="textMuted" center>
              No journal entries yet. Tap "New Entry" to start writing.
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
    marginBottom: spacing.lg,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  actions: {
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  promptCard: {
    marginBottom: spacing.sm,
  },
  promptText: {
    marginTop: spacing.xs,
  },
  emptyCard: {
    padding: spacing.xl,
  },
});
