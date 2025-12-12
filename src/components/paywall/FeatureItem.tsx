import { View, Text } from "react-native";
import React, { ReactNode } from "react";

type FeatureItemProps = {
  icon: ReactNode;
  title: string;
  description?: string;
  compact?: boolean;
};

export const FeatureItem = ({ icon, title, description, compact }: FeatureItemProps) => {
  if (compact) {
    return (
      <View className="flex-row items-center gap-2">
        {icon}
        <Text className="text-neutral-50 text-base font-medium flex-1">{title}</Text>
      </View>
    );
  }

  return (
    <View className="flex-row flex-1 gap-3">
      {icon}
      <View className="flex-1 gap-1">
        <Text className="text-neutral-50 text-lg font-semibold">{title}</Text>
        {description && <Text className="text-neutral-400">{description}</Text>}
      </View>
    </View>
  );
};
