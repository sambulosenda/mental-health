import { View, ScrollView, Pressable, Linking, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/src/components/ui';
import { colors, darkColors, spacing, borderRadius } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';

interface SourceItem {
  category: string;
  name: string;
  authors: string;
  year: number;
  title: string;
  journal: string;
  url: string;
}

const SOURCES: SourceItem[] = [
  {
    category: 'Wellness Exercises',
    name: 'Box Breathing',
    authors: 'Ma X, Yue ZQ, Gong ZQ, et al.',
    year: 2017,
    title: 'The effect of diaphragmatic breathing on attention, negative affect and stress',
    journal: 'Frontiers in Psychology',
    url: 'https://www.frontiersin.org/articles/10.3389/fpsyg.2017.00874/full',
  },
  {
    category: 'Wellness Exercises',
    name: 'Gratitude Practice',
    authors: 'Emmons RA, McCullough ME',
    year: 2003,
    title: 'Counting blessings versus burdens: An experimental investigation',
    journal: 'Journal of Personality and Social Psychology',
    url: 'https://pubmed.ncbi.nlm.nih.gov/12585811/',
  },
  {
    category: 'Wellness Exercises',
    name: 'Self-Compassion',
    authors: 'Neff KD',
    year: 2003,
    title: 'The development and validation of a scale to measure self-compassion',
    journal: 'Self and Identity',
    url: 'https://self-compassion.org/wp-content/uploads/publications/empirical.article.pdf',
  },
  {
    category: 'Wellness Exercises',
    name: 'Grounding Techniques',
    authors: 'Najavits LM',
    year: 2002,
    title: 'Seeking Safety: Coping skills for stress and anxiety',
    journal: 'Guilford Press',
    url: 'https://www.guilford.com/books/Seeking-Safety/Lisa-Najavits/9781462504015',
  },
];

export default function SourcesScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;

  const categories = [...new Set(SOURCES.map(s => s.category))];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={themeColors.textPrimary} />
        </Pressable>
        <Text variant="h2" color="textPrimary">Sources & Citations</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.infoBox, { backgroundColor: `${themeColors.primary}15` }]}>
          <Ionicons name="information-circle" size={20} color={themeColors.primary} />
          <Text variant="caption" color="textSecondary" style={styles.infoText}>
            Softmind&apos;s self-reflection tools and wellness exercises are informed by peer-reviewed research.
            Tap any source below to view the original publication.
          </Text>
        </View>

        {categories.map(category => (
          <View key={category} style={styles.section}>
            <Text variant="h3" color="textPrimary" style={styles.sectionTitle}>
              {category}
            </Text>
            {SOURCES.filter(s => s.category === category).map((source) => (
              <Pressable
                key={source.name}
                onPress={() => Linking.openURL(source.url)}
                style={({ pressed }) => [
                  styles.sourceCard,
                  {
                    backgroundColor: themeColors.surface,
                    opacity: pressed ? 0.7 : 1,
                  }
                ]}
              >
                <View style={styles.sourceHeader}>
                  <Text variant="bodyMedium" color="textPrimary">
                    {source.name}
                  </Text>
                  <Ionicons name="open-outline" size={16} color={themeColors.primary} />
                </View>
                <Text variant="caption" color="textSecondary" style={styles.sourceAuthors}>
                  {source.authors} ({source.year})
                </Text>
                <Text variant="caption" color="textMuted" style={styles.sourceTitle}>
                  {source.title}
                </Text>
                <Text variant="caption" style={{ color: themeColors.primary, marginTop: 4 }}>
                  {source.journal}
                </Text>
              </Pressable>
            ))}
          </View>
        ))}

        <View style={styles.footer}>
          <Text variant="caption" color="textMuted" center>
            Softmind is a wellness and self-care app for informational purposes only.
            It does not provide medical advice, diagnosis, or treatment.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  infoBox: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    lineHeight: 20,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  sourceCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  sourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sourceAuthors: {
    marginBottom: 4,
  },
  sourceTitle: {
    fontStyle: 'italic',
    lineHeight: 18,
  },
  footer: {
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
  },
});
