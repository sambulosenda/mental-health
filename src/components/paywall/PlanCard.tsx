import { StyleSheet, Text, View, Platform, TouchableOpacity } from "react-native";
import React from "react";
import { BlurView } from "expo-blur";
import { Check } from "lucide-react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import type { PurchasesPackage } from "react-native-purchases";

type PlanCardProps = {
  pkg: PurchasesPackage;
  isSelected: boolean;
  onSelect: () => void;
  showBadge?: string;
};

function getPackageTitle(identifier: string): string {
  if (identifier.includes("lifetime")) return "Lifetime";
  if (identifier.includes("annual") || identifier.includes("yearly")) return "Annual";
  if (identifier.includes("weekly")) return "Weekly";
  if (identifier.includes("monthly")) return "Monthly";
  return identifier;
}

function getPackageSubtitle(pkg: PurchasesPackage): string {
  const id = pkg.identifier.toLowerCase();
  if (id.includes("lifetime")) return "One-time purchase";
  if (id.includes("annual") || id.includes("yearly")) {
    const perDay = (pkg.product.price / 365).toFixed(2);
    return `Just $${perDay}/day`;
  }
  if (id.includes("weekly")) return "3 days free";
  if (id.includes("monthly")) return "7 days free";
  return "";
}

function getTrialText(identifier: string): string | null {
  if (identifier.includes("lifetime")) return null;
  if (identifier.includes("weekly")) return "3-day trial";
  return "7-day trial";
}

export const PlanCard = ({ pkg, isSelected, onSelect, showBadge }: PlanCardProps) => {
  const title = getPackageTitle(pkg.identifier);
  const subtitle = getPackageSubtitle(pkg);
  const trialText = getTrialText(pkg.identifier.toLowerCase());
  const price = pkg.product.priceString;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect();
  };

  return (
    <View
      className={`flex-1 rounded-[18px] border-[2px] ${
        isSelected ? "border-white" : "border-transparent"
      }`}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        className={`p-3 rounded-[18px] overflow-hidden border-[0.5px] border-neutral-700/40 ${
          Platform.OS === "android" ? "bg-neutral-800" : "bg-neutral-700/30"
        }`}
        style={styles.borderCurve}
        onPress={handlePress}
      >
        <BlurView tint="dark" style={StyleSheet.absoluteFill} />
        {isSelected && !showBadge && (
          <View className="absolute rounded-full right-3 top-3 p-1 bg-white">
            <Check size={10} color="#404040" strokeWidth={5} />
          </View>
        )}
        {showBadge && (
          <View className="absolute right-3 top-3 px-2 py-0.5 bg-emerald-500 rounded-full">
            <Text className="text-white text-xs font-semibold">{showBadge}</Text>
          </View>
        )}
        <Text className="text-neutral-50 text-xl font-bold">{title}</Text>
        <Animated.Text
          key={title + price}
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          className="text-neutral-50 text-xl font-bold mb-1"
        >
          {price}
        </Animated.Text>
        <View className="flex-row items-center gap-2">
          <Text className="text-neutral-400">{subtitle}</Text>
          {trialText && (
            <View className="px-1.5 py-0.5 bg-blue-500/20 rounded">
              <Text className="text-blue-400 text-xs font-medium">{trialText}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  borderCurve: {
    borderCurve: "continuous",
  },
});

export default PlanCard;
