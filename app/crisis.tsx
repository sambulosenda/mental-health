import { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Text } from '@/src/components/ui';
import { spacing, borderRadius } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import {
  getAllResourcesSorted,
  INTERNATIONAL_RESOURCE,
  BEFRIENDERS_RESOURCE,
  type CrisisResource,
  type CountryResources,
} from '@/src/constants/crisisResources';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function EmergencyBanner({ isDark }: { isDark: boolean }) {
  const handleEmergencyCall = useCallback(async () => {
    const phoneUrl = 'tel:999';
    const canOpen = await Linking.canOpenURL(phoneUrl);
    if (canOpen) {
      Linking.openURL(phoneUrl);
    }
  }, []);

  return (
    <Animated.View entering={FadeIn.duration(400)}>
      <LinearGradient
        colors={isDark ? ['#1a1a2e', '#16213e'] : ['#fff5f5', '#ffe8e8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.emergencyBanner}
      >
        <View style={styles.emergencyContent}>
          <View style={[styles.emergencyIconContainer, { backgroundColor: isDark ? '#3d1f1f' : '#fee2e2' }]}>
            <Ionicons name="warning" size={20} color="#ef4444" />
          </View>
          <View style={styles.emergencyText}>
            <Text variant="bodyMedium" style={{ fontWeight: '600', color: isDark ? '#fca5a5' : '#dc2626' }}>
              In immediate danger?
            </Text>
            <Text variant="caption" color="textSecondary">
              Call emergency services now
            </Text>
          </View>
          <Pressable
            style={[styles.emergencyButton]}
            onPress={handleEmergencyCall}
          >
            <Ionicons name="call" size={18} color="#fff" />
            <Text variant="caption" style={styles.emergencyButtonText}>
              999
            </Text>
          </Pressable>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

function HeroSection({ isDark }: { isDark: boolean }) {
  return (
    <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.heroSection}>
      <LinearGradient
        colors={isDark ? ['#1e293b', '#0f172a'] : ['#f0fdf4', '#dcfce7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroGradient}
      >
        <View style={[styles.heroIconContainer, { backgroundColor: isDark ? '#166534' : '#bbf7d0' }]}>
          <Ionicons name="heart" size={28} color={isDark ? '#86efac' : '#16a34a'} />
        </View>
        <Text variant="h3" style={[styles.heroTitle, { color: isDark ? '#86efac' : '#166534' }]}>
          You matter
        </Text>
        <Text variant="body" style={[styles.heroSubtitle, { color: isDark ? '#94a3b8' : '#4b5563' }]}>
          Help is available, and reaching out is a sign of strength. These resources are here for you.
        </Text>
      </LinearGradient>
    </Animated.View>
  );
}

function ResourceCard({
  resource,
  isDark,
  index
}: {
  resource: CrisisResource;
  isDark: boolean;
  index: number;
}) {
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
      Alert.alert('Unable to Open', `Please visit ${resource.website} in your browser.`);
    }
  }, [resource.website]);

  return (
    <AnimatedPressable
      entering={FadeInDown.duration(400).delay(index * 50)}
      style={[
        styles.resourceCard,
        {
          backgroundColor: isDark ? '#1e293b' : '#fff',
          borderColor: isDark ? '#334155' : '#e5e7eb',
        },
      ]}
    >
      <View style={styles.resourceHeader}>
        <View style={styles.resourceTitleRow}>
          <Text variant="bodyMedium" style={[styles.resourceName, { color: isDark ? '#f1f5f9' : '#1f2937' }]}>
            {resource.name}
          </Text>
          <View style={[styles.availabilityBadge, { backgroundColor: isDark ? '#1e3a5f' : '#dbeafe' }]}>
            <Text variant="caption" style={{ color: isDark ? '#93c5fd' : '#1d4ed8', fontSize: 10 }}>
              {resource.available}
            </Text>
          </View>
        </View>
        <Text variant="caption" style={{ color: isDark ? '#94a3b8' : '#6b7280', marginTop: 4 }}>
          {resource.description}
        </Text>
      </View>

      <View style={styles.resourceActions}>
        {resource.phone && (
          <Pressable
            style={[styles.actionButton, styles.callButton]}
            onPress={handlePhonePress}
          >
            <Ionicons name="call" size={16} color="#fff" />
            <Text variant="caption" style={styles.actionText}>
              {resource.phone}
            </Text>
          </Pressable>
        )}

        {resource.text && (
          <Pressable
            style={[styles.actionButton, styles.textButton]}
            onPress={handleTextPress}
          >
            <Ionicons name="chatbubble" size={16} color="#fff" />
            <Text variant="caption" style={styles.actionText}>
              Text {resource.text.message}
            </Text>
          </Pressable>
        )}

        {resource.website && (
          <Pressable
            style={[styles.actionButton, styles.webButton, { backgroundColor: isDark ? '#475569' : '#6b7280' }]}
            onPress={handleWebsitePress}
          >
            <Ionicons name="globe-outline" size={16} color="#fff" />
            <Text variant="caption" style={styles.actionText}>
              Website
            </Text>
          </Pressable>
        )}
      </View>
    </AnimatedPressable>
  );
}

function CountrySection({
  country,
  isDark,
  defaultExpanded = false,
  startIndex = 0,
}: {
  country: CountryResources;
  isDark: boolean;
  defaultExpanded?: boolean;
  startIndex?: number;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <View style={styles.countrySection}>
      <Pressable
        style={[
          styles.countryHeader,
          { backgroundColor: isDark ? '#1e293b' : '#f9fafb', borderColor: isDark ? '#334155' : '#e5e7eb' },
        ]}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.countryTitleRow}>
          <Text style={styles.countryFlag}>{country.flag}</Text>
          <Text variant="bodyMedium" style={{ fontWeight: '600', color: isDark ? '#f1f5f9' : '#1f2937' }}>
            {country.country}
          </Text>
          <View style={[styles.countBadge, { backgroundColor: isDark ? '#334155' : '#e5e7eb' }]}>
            <Text variant="caption" style={{ color: isDark ? '#94a3b8' : '#6b7280', fontSize: 11 }}>
              {country.resources.length}
            </Text>
          </View>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={isDark ? '#94a3b8' : '#6b7280'}
        />
      </Pressable>

      {expanded && (
        <View style={styles.resourceList}>
          {country.resources.map((resource, index) => (
            <ResourceCard
              key={index}
              resource={resource}
              isDark={isDark}
              index={startIndex + index}
            />
          ))}
        </View>
      )}
    </View>
  );
}

export default function CrisisScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const sortedResources = getAllResourcesSorted();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}
        >
          <Ionicons name="close" size={22} color={isDark ? '#f1f5f9' : '#1f2937'} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '600', color: isDark ? '#f1f5f9' : '#1f2937' }}>
          Crisis Support
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Emergency Banner */}
        <EmergencyBanner isDark={isDark} />

        {/* Hero Section */}
        <HeroSection isDark={isDark} />

        {/* Country sections */}
        {sortedResources.map((country, countryIndex) => (
          <CountrySection
            key={country.countryCode}
            country={country}
            isDark={isDark}
            defaultExpanded={countryIndex === 0}
            startIndex={countryIndex * 10}
          />
        ))}

        {/* International Section */}
        <View style={styles.internationalSection}>
          <Text variant="bodyMedium" style={{ fontWeight: '600', color: isDark ? '#f1f5f9' : '#1f2937', marginBottom: 12 }}>
            🌍 International Resources
          </Text>
          <ResourceCard resource={INTERNATIONAL_RESOURCE} isDark={isDark} index={0} />
          <ResourceCard resource={BEFRIENDERS_RESOURCE} isDark={isDark} index={1} />
        </View>

        {/* Footer */}
        <Text variant="caption" style={[styles.footerNote, { color: isDark ? '#64748b' : '#9ca3af' }]}>
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
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl + 40,
    gap: spacing.md,
  },
  emergencyBanner: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    overflow: 'hidden',
  },
  emergencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  emergencyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyText: {
    flex: 1,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#dc2626',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: borderRadius.full,
  },
  emergencyButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  heroSection: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  heroGradient: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  heroIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  heroTitle: {
    fontWeight: '700',
    marginBottom: 8,
  },
  heroSubtitle: {
    textAlign: 'center',
    lineHeight: 22,
  },
  countrySection: {
    gap: spacing.sm,
  },
  countryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  countryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  countryFlag: {
    fontSize: 20,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  resourceList: {
    gap: spacing.sm,
    paddingLeft: spacing.xs,
  },
  resourceCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  resourceHeader: {
    marginBottom: spacing.sm,
  },
  resourceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resourceName: {
    fontWeight: '600',
    flex: 1,
  },
  availabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  resourceActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: borderRadius.md,
  },
  callButton: {
    backgroundColor: '#16a34a',
  },
  textButton: {
    backgroundColor: '#2563eb',
  },
  webButton: {
    backgroundColor: '#6b7280',
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  internationalSection: {
    marginTop: spacing.sm,
  },
  footerNote: {
    textAlign: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    lineHeight: 18,
  },
});
