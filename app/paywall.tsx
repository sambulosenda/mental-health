import { Platform, Pressable, ScrollView, StyleSheet, Text, View, Alert, ActivityIndicator, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Brain,
  Heart,
  Download,
  MessageCircle,
  Moon,
  X,
  ShieldCheck,
} from "lucide-react-native";
import React, { useRef, useState, useMemo } from "react";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";

import { useSubscriptionStore } from "@/src/stores";
import { ProgressiveBlurView, GradientText } from "@/src/components/ui";
import { FeaturesSection, FeatureItem, IconContainer, PeriodControl, PlanCard } from "@/src/components/paywall";

type Period = "weekly" | "monthly" | "yearly";

const TERMS_URL = "https://getsoftmind.com/terms";
const PRIVACY_URL = "https://getsoftmind.com/privacy";

export default function PaywallScreen() {
  const [period, setPeriod] = useState<Period>("yearly");
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [bottomContentHeight, setBottomContentHeight] = useState(0);

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const listRef = useRef<ScrollView>(null);

  const {
    currentOffering,
    isLoading,
    error,
    purchasePackage,
    restorePurchases,
    clearError,
  } = useSubscriptionStore();

  const packages = useMemo(
    () => currentOffering?.availablePackages || [],
    [currentOffering?.availablePackages]
  );

  // Check if weekly packages exist
  const hasWeeklyPackage = packages.some((p) => p.identifier.toLowerCase().includes("weekly"));

  // Filter packages by period
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const id = pkg.identifier.toLowerCase();
      if (period === "weekly") {
        return id.includes("weekly");
      } else if (period === "monthly") {
        return id.includes("monthly");
      } else {
        // Yearly: show annual/yearly + lifetime
        return id.includes("annual") || id.includes("yearly") || id.includes("lifetime");
      }
    });
  }, [packages, period]);

  // Keep selection in sync with filtered packages (handles period changes)
  React.useEffect(() => {
    if (filteredPackages.length === 0) return;

    // Check if current selection exists in filtered packages
    const selectionExists = selectedPackageId &&
      filteredPackages.some((p) => p.identifier === selectedPackageId);

    if (!selectionExists) {
      // Try to select annual/yearly first, otherwise select first package
      const annualPkg = filteredPackages.find(
        (p) => p.identifier.toLowerCase().includes("annual") || p.identifier.toLowerCase().includes("yearly")
      );
      setSelectedPackageId(annualPkg?.identifier || filteredPackages[0].identifier);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredPackages]);

  const selectedPackage = packages.find((p) => p.identifier === selectedPackageId);

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    const success = await purchasePackage(selectedPackage);
    if (success) {
      Alert.alert("Welcome to Premium!", "You now have access to all features.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    }
  };

  const handleRestore = async () => {
    const restored = await restorePurchases();
    if (restored) {
      Alert.alert("Success", "Your purchases have been restored!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } else {
      Alert.alert("No Purchases Found", "We could not find any previous purchases to restore.");
    }
  };

  const getPriceText = () => {
    if (!selectedPackage) return "";
    const price = selectedPackage.product.priceString;
    const priceNum = selectedPackage.product.price;
    const id = selectedPackage.identifier.toLowerCase();
    const intro = selectedPackage.product.introPrice;

    // Get currency symbol from price string
    const currencySymbol = price.replace(/[\d.,\s]/g, '').charAt(0) || '$';

    // Build trial text from actual introductory offer
    let trialText = "";
    if (intro && intro.price === 0) {
      const units = intro.periodNumberOfUnits;
      const period = intro.periodUnit;
      if (period === "DAY") trialText = `${units} days free, then `;
      else if (period === "WEEK") trialText = `${units} week free, then `;
      else if (period === "MONTH") trialText = `${units} month free, then `;
      else trialText = "Free trial, then ";
    }

    if (id.includes("lifetime")) {
      return `${price} one-time. Forever access.`;
    } else if (id.includes("annual") || id.includes("yearly")) {
      const perDay = (priceNum / 365).toFixed(2);
      return `${trialText}just ${currencySymbol}${perDay}/day. Cancel anytime.`;
    } else if (id.includes("weekly")) {
      return `${trialText}${price}/week. Cancel anytime.`;
    } else {
      return `${trialText}${price}/month. Cancel anytime.`;
    }
  };

  return (
    <View className="flex-1 bg-black">
      <LinearGradient
        colors={["#1a1a2e", "#16213e", "#0f0f23"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Header */}
      <View
        className="absolute flex-row items-center w-full px-6 z-50"
        style={{ top: insets.top }}
      >
        <Pressable
          onPress={() => router.back()}
          className="rounded-full p-2 overflow-hidden bg-neutral-700/30"
        >
          <BlurView tint="systemThickMaterialDark" style={StyleSheet.absoluteFill} />
          <X size={20} color="#d4d4d4" />
        </Pressable>
      </View>

      <ScrollView
        ref={listRef}
        contentContainerClassName="px-5 gap-6"
        contentContainerStyle={{
          paddingTop: insets.top + 70,
          paddingBottom: bottomContentHeight + 24,
        }}
      >
        <GradientText
          text="Unlock Your Full Potential"
          className="text-neutral-50 w-3/4 text-3xl font-bold self-center text-center"
          gradientProps={{ colors: ["#a3a3a390", "#fafafa", "#a3a3a390"] }}
        />

        <FeaturesSection title="Premium Features">
          <View className="gap-3">
            <FeatureItem
              compact
              icon={
                <IconContainer className="bg-emerald-600">
                  <MessageCircle size={14} color="white" strokeWidth={3} />
                </IconContainer>
              }
              title="Unlimited AI Conversations"
            />
            <FeatureItem
              compact
              icon={
                <IconContainer className="bg-violet-500">
                  <Brain size={14} color="white" strokeWidth={3} />
                </IconContainer>
              }
              title="All Mental Exercises"
            />
            <FeatureItem
              compact
              icon={
                <IconContainer className="bg-rose-500">
                  <Heart size={14} color="white" strokeWidth={3} />
                </IconContainer>
              }
              title="Advanced Insights & Analytics"
            />
            <FeatureItem
              compact
              icon={
                <IconContainer className="bg-amber-500">
                  <Download size={14} color="white" strokeWidth={3} />
                </IconContainer>
              }
              title="Data Export"
            />
            <FeatureItem
              compact
              icon={
                <IconContainer className="bg-blue-500">
                  <Moon size={14} color="white" strokeWidth={3} />
                </IconContainer>
              }
              title="Guided Meditations"
            />
          </View>
        </FeaturesSection>
      </ScrollView>

      <ProgressiveBlurView height={insets.top + 60} blurViewProps={{ tint: "dark" }} />

      <ProgressiveBlurView
        height={bottomContentHeight + 100}
        position="bottom"
        blurViewProps={{ intensity: 100, tint: "dark" }}
      />

      {Platform.OS === "ios" && (
        <LinearGradient
          colors={["#00000000", "#00000080"]}
          style={[styles.bottomGradient, { height: insets.bottom + 100 }]}
        />
      )}

      {/* Bottom Content */}
      <View
        className="absolute bottom-0 px-5 w-full"
        style={{ paddingBottom: insets.bottom + 4 }}
        onLayout={(e) => setBottomContentHeight(e.nativeEvent.layout.height)}
      >
        <View className="items-center">
          <PeriodControl value={period} setValue={setPeriod} showWeekly={hasWeeklyPackage} />
        </View>

        {/* Package Selection */}
        {filteredPackages.length > 0 ? (
          <View className="flex-row gap-2 mb-4">
            {filteredPackages.map((pkg) => {
              const id = pkg.identifier.toLowerCase();
              const isAnnual = id.includes("annual") || id.includes("yearly");

              // Calculate actual discount for annual plan
              let discountBadge: string | undefined;
              if (isAnnual) {
                const monthlyPkg = packages.find((p) =>
                  p.identifier.toLowerCase().includes("monthly")
                );
                if (monthlyPkg) {
                  const monthlyYearCost = monthlyPkg.product.price * 12;
                  const yearlyPrice = pkg.product.price;
                  const discount = Math.round(
                    ((monthlyYearCost - yearlyPrice) / monthlyYearCost) * 100
                  );
                  if (discount > 0) discountBadge = `${discount}% OFF`;
                }
              }

              return (
                <PlanCard
                  key={pkg.identifier}
                  pkg={pkg}
                  isSelected={selectedPackageId === pkg.identifier}
                  onSelect={() => setSelectedPackageId(pkg.identifier)}
                  showBadge={discountBadge}
                />
              );
            })}
          </View>
        ) : (
          <View className="items-center py-4 mb-4">
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-neutral-400 text-center">
                Loading subscription options...
              </Text>
            )}
          </View>
        )}

        {error && (
          <Pressable onPress={clearError} className="mb-2">
            <Text className="text-red-400 text-sm text-center">{error}</Text>
          </Pressable>
        )}

        {/* Guarantee Badge */}
        <View className="flex-row items-center justify-center gap-1.5 mb-3">
          <ShieldCheck size={14} color="#10b981" strokeWidth={2.5} />
          <Text className="text-emerald-500 text-sm font-medium">
            Cancel anytime, no questions asked
          </Text>
        </View>

        <Pressable
          onPress={handlePurchase}
          disabled={isLoading || !selectedPackage}
          className="mb-2 p-4 items-center rounded-[15px] bg-white"
          style={{ opacity: isLoading || !selectedPackage ? 0.6 : 1 }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text className="text-black text-xl font-semibold">
              {selectedPackage?.identifier.toLowerCase().includes("lifetime")
                ? "Get Lifetime Access"
                : "Start Free Trial"}
            </Text>
          )}
        </Pressable>

        <View className="h-10 justify-center mb-1">
          <Animated.Text
            key={selectedPackage?.identifier || "default"}
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            className="text-neutral-50 text-sm font-medium text-center"
          >
            {getPriceText()}
          </Animated.Text>
        </View>

        <View className="w-full flex-row mb-8 items-center justify-center gap-4">
          <Pressable onPress={handleRestore}>
            <Text className="text-neutral-400 text-sm font-medium">Restore</Text>
          </Pressable>
          <Text className="text-neutral-600">•</Text>
          <Pressable
            onPress={() => Linking.openURL(TERMS_URL).catch(() => {})}
            accessibilityLabel="Terms of Service"
            accessibilityRole="link"
          >
            <Text className="text-neutral-400 text-sm font-medium">Terms</Text>
          </Pressable>
          <Text className="text-neutral-600">•</Text>
          <Pressable
            onPress={() => Linking.openURL(PRIVACY_URL).catch(() => {})}
            accessibilityLabel="Privacy Policy"
            accessibilityRole="link"
          >
            <Text className="text-neutral-400 text-sm font-medium">Privacy</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});
