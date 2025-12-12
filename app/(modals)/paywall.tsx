import { View, ScrollView, Alert, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button, Card } from '@/src/components/ui';
import { useSubscriptionStore } from '@/src/stores';
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors, darkColors, spacing } from '@/src/constants/theme';
import type { PurchasesPackage } from 'react-native-purchases';

const FEATURES = [
  {
    icon: 'chatbubbles-outline' as const,
    title: 'AI Chat',
    description: 'Unlimited conversations with your wellness companion',
  },
  {
    icon: 'fitness-outline' as const,
    title: 'All Exercises',
    description: 'Access every meditation and mental exercise',
  },
  {
    icon: 'download-outline' as const,
    title: 'Data Export',
    description: 'Export your mood and journal data anytime',
  },
  {
    icon: 'sparkles-outline' as const,
    title: 'Premium Support',
    description: 'Priority support and new features first',
  },
];

function getPackageLabel(identifier: string): string {
  if (identifier.includes('lifetime')) return 'Lifetime';
  if (identifier.includes('annual') || identifier.includes('yearly')) return 'Annual';
  if (identifier.includes('monthly')) return 'Monthly';
  return identifier;
}

function getPackageDescription(identifier: string): string {
  if (identifier.includes('lifetime')) return 'One-time purchase, forever access';
  if (identifier.includes('annual') || identifier.includes('yearly')) return 'Best value - save 33%';
  if (identifier.includes('monthly')) return 'Cancel anytime';
  return '';
}

export default function PaywallScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;

  const {
    currentOffering,
    isLoading,
    error,
    purchasePackage,
    restorePurchases,
    clearError,
  } = useSubscriptionStore();

  const handlePurchase = async (pkg: PurchasesPackage) => {
    const success = await purchasePackage(pkg);
    if (success) {
      Alert.alert('Welcome to Premium!', 'You now have access to all features.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  const handleRestore = async () => {
    const restored = await restorePurchases();
    if (restored) {
      Alert.alert('Success', 'Your purchases have been restored!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } else {
      Alert.alert('No Purchases Found', 'We could not find any previous purchases to restore.');
    }
  };

  const packages = currentOffering?.availablePackages || [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          padding: spacing.md,
        }}
      >
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={28} color={themeColors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: spacing.lg,
          paddingBottom: spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          variant="h1"
          color="textPrimary"
          style={{ textAlign: 'center', marginBottom: spacing.sm }}
        >
          Unlock Premium
        </Text>
        <Text
          variant="body"
          color="textSecondary"
          style={{ textAlign: 'center', marginBottom: spacing.xl }}
        >
          Get unlimited access to all features
        </Text>

        {/* Features List */}
        <View style={{ marginBottom: spacing.xl }}>
          {FEATURES.map((feature, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: spacing.md,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: themeColors.primaryLight,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: spacing.md,
                }}
              >
                <Ionicons name={feature.icon} size={22} color={themeColors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="bodyMedium" color="textPrimary">
                  {feature.title}
                </Text>
                <Text variant="caption" color="textSecondary">
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Package Options */}
        {packages.length > 0 ? (
          packages.map((pkg) => (
            <Card
              key={pkg.identifier}
              variant="flat"
              style={{ marginBottom: spacing.md }}
            >
              <Pressable
                onPress={() => handlePurchase(pkg)}
                disabled={isLoading}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMedium" color="textPrimary">
                    {getPackageLabel(pkg.identifier)}
                  </Text>
                  <Text variant="caption" color="textSecondary">
                    {getPackageDescription(pkg.identifier)}
                  </Text>
                </View>
                <Text variant="h3" color="primary">
                  {pkg.product.priceString}
                </Text>
              </Pressable>
            </Card>
          ))
        ) : (
          <View
            style={{
              padding: spacing.xl,
              alignItems: 'center',
            }}
          >
            {isLoading ? (
              <ActivityIndicator size="large" color={themeColors.primary} />
            ) : (
              <Text variant="body" color="textSecondary" style={{ textAlign: 'center' }}>
                Loading subscription options...
                {'\n\n'}
                <Text variant="caption" color="textTertiary">
                  Make sure RevenueCat is configured with your API keys.
                </Text>
              </Text>
            )}
          </View>
        )}

        {error && (
          <Pressable onPress={clearError}>
            <Text
              variant="caption"
              color="error"
              style={{ textAlign: 'center', marginTop: spacing.md }}
            >
              {error}
            </Text>
          </Pressable>
        )}

        <Button
          variant="ghost"
          onPress={handleRestore}
          disabled={isLoading}
          style={{ marginTop: spacing.lg }}
        >
          Restore Purchases
        </Button>

        <Text
          variant="caption"
          color="textTertiary"
          style={{
            textAlign: 'center',
            marginTop: spacing.lg,
            paddingHorizontal: spacing.md,
          }}
        >
          Payment will be charged to your App Store account. Subscriptions
          automatically renew unless canceled at least 24 hours before the end
          of the current period.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
