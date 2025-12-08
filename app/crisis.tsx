import { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card } from '@/src/components/ui';
import { colors, darkColors, spacing, borderRadius } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import {
  getAllResourcesSorted,
  INTERNATIONAL_RESOURCE,
  BEFRIENDERS_RESOURCE,
  type CrisisResource,
  type CountryResources,
} from '@/src/constants/crisisResources';

function ResourceCard({ resource, themeColors }: { resource: CrisisResource; themeColors: typeof colors | typeof darkColors }) {
  const handlePhonePress = useCallback(async () => {
    if (!resource.phone) return;

    const phoneUrl = `tel:${resource.phone.replace(/\s/g, '')}`;
    const canOpen = await Linking.canOpenURL(phoneUrl);

    if (canOpen) {
      Linking.openURL(phoneUrl);
    } else {
      Alert.alert('Unable to Call', `Please call ${resource.phone} manually.`);
    }
  }, [resource.phone]);

  const handleTextPress = useCallback(async () => {
    if (!resource.text) return;

    const smsUrl = `sms:${resource.text.number}${resource.text.message ? `?body=${encodeURIComponent(resource.text.message)}` : ''}`;
    const canOpen = await Linking.canOpenURL(smsUrl);

    if (canOpen) {
      Linking.openURL(smsUrl);
    } else {
      Alert.alert('Unable to Text', `Please text ${resource.text.message} to ${resource.text.number} manually.`);
    }
  }, [resource.text]);

  const handleWebsitePress = useCallback(async () => {
    if (!resource.website) return;

    try {
      const canOpen = await Linking.canOpenURL(resource.website);

      if (canOpen) {
        await Linking.openURL(resource.website);
      } else {
        Alert.alert('Unable to Open', `Please visit ${resource.website} in your browser.`);
      }
    } catch (error) {
      console.error('Failed to open website:', error);
      Alert.alert('Unable to Open', `Please visit ${resource.website} in your browser.`);
    }
  }, [resource.website]);

  return (
    <Card variant="outlined" style={styles.resourceCard}>
      <View style={styles.resourceHeader}>
        <Text variant="bodyMedium" color="textPrimary" style={styles.resourceName}>
          {resource.name}
        </Text>
        <Text variant="caption" color="textMuted">
          {resource.available}
        </Text>
      </View>

      <Text variant="caption" color="textSecondary" style={styles.resourceDescription}>
        {resource.description}
      </Text>

      <View style={styles.resourceActions}>
        {resource.phone && (
          <Pressable
            style={[styles.actionButton, { backgroundColor: themeColors.success }]}
            onPress={handlePhonePress}
          >
            <Ionicons name="call" size={18} color="#fff" />
            <Text variant="caption" style={styles.actionText}>
              {resource.phone}
            </Text>
          </Pressable>
        )}

        {resource.text && (
          <Pressable
            style={[styles.actionButton, { backgroundColor: themeColors.primary }]}
            onPress={handleTextPress}
          >
            <Ionicons name="chatbubble" size={18} color="#fff" />
            <Text variant="caption" style={styles.actionText}>
              Text {resource.text.message}
            </Text>
          </Pressable>
        )}

        {resource.website && (
          <Pressable
            style={[styles.actionButton, { backgroundColor: themeColors.textMuted }]}
            onPress={handleWebsitePress}
          >
            <Ionicons name="globe-outline" size={18} color="#fff" />
            <Text variant="caption" style={styles.actionText}>
              Website
            </Text>
          </Pressable>
        )}
      </View>
    </Card>
  );
}

function CountrySection({ country, themeColors }: { country: CountryResources; themeColors: typeof colors | typeof darkColors }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <View style={styles.countrySection}>
      <Pressable
        style={styles.countryHeader}
        onPress={() => setExpanded(!expanded)}
      >
        <Text variant="h3" color="textPrimary">
          {country.flag} {country.country}
        </Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={themeColors.textSecondary}
        />
      </Pressable>

      {expanded && (
        <View style={styles.resourceList}>
          {country.resources.map((resource, index) => (
            <ResourceCard key={index} resource={resource} themeColors={themeColors} />
          ))}
        </View>
      )}
    </View>
  );
}

export default function CrisisScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;

  const sortedResources = getAllResourcesSorted();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={themeColors.textPrimary} />
        </Pressable>
        <Text variant="h2" color="textPrimary">
          Crisis Support
        </Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Important message */}
        <Card
          variant="flat"
          style={[styles.importantCard, { backgroundColor: themeColors.primaryLight }]}
        >
          <View style={styles.importantContent}>
            <Ionicons name="heart" size={24} color={themeColors.primary} />
            <View style={styles.importantText}>
              <Text variant="bodyMedium" color="textPrimary">
                You matter, and help is available
              </Text>
              <Text variant="caption" color="textSecondary">
                {"If you're in immediate danger, please call emergency services (999/911/112)"}
              </Text>
            </View>
          </View>
        </Card>

        {/* Country sections */}
        {sortedResources.map((country) => (
          <CountrySection
            key={country.countryCode}
            country={country}
            themeColors={themeColors}
          />
        ))}

        {/* International */}
        <View style={styles.countrySection}>
          <Text variant="h3" color="textPrimary" style={styles.sectionTitle}>
            🌍 International
          </Text>
          <ResourceCard resource={INTERNATIONAL_RESOURCE} themeColors={themeColors} />
          <ResourceCard resource={BEFRIENDERS_RESOURCE} themeColors={themeColors} />
        </View>

        {/* Footer note */}
        <Text variant="caption" color="textMuted" style={styles.footerNote}>
          These resources are provided for informational purposes. In an emergency, always contact local emergency services.
        </Text>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  importantCard: {
    marginBottom: spacing.lg,
  },
  importantContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  importantText: {
    flex: 1,
    gap: 2,
  },
  countrySection: {
    marginBottom: spacing.lg,
  },
  countryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  resourceList: {
    gap: spacing.sm,
  },
  resourceCard: {
    marginBottom: spacing.xs,
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  resourceName: {
    flex: 1,
    fontWeight: '600',
  },
  resourceDescription: {
    marginBottom: spacing.sm,
  },
  resourceActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  actionText: {
    color: '#fff',
    fontWeight: '500',
  },
  footerNote: {
    textAlign: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
});
