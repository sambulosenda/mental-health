import { Text, View, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";
import SegmentedControl from "@/src/components/ui/SegmentedControl";

type Period = "weekly" | "monthly" | "yearly";

type PeriodControlProps = {
  value: Period;
  setValue: (value: Period) => void;
  showWeekly?: boolean;
};

const PeriodControl = ({ value, setValue, showWeekly = false }: PeriodControlProps) => {
  return (
    <SegmentedControl
      value={value}
      onValueChange={(v) => setValue(v as Period)}
      className={`overflow-hidden mb-5 px-1 py-1 justify-between rounded-full border border-neutral-700/30 ${
        Platform.OS === "android" ? "bg-neutral-800" : "bg-neutral-700/50"
      }`}
      style={styles.borderCurve}
    >
      <BlurView key="control-bg" tint="systemThickMaterialDark" style={StyleSheet.absoluteFill} />
      <SegmentedControl.Indicator
        className="top-1 rounded-full overflow-hidden bg-neutral-700"
        style={styles.borderCurve}
      />

      {showWeekly && (
        <SegmentedControl.Item value="weekly" className="px-4 py-1.5 rounded-full">
          <Text
            className={
              value === "weekly"
                ? "text-neutral-50 text-lg font-semibold"
                : "text-neutral-400 text-lg font-semibold"
            }
          >
            Weekly
          </Text>
        </SegmentedControl.Item>
      )}
      <SegmentedControl.Item value="monthly" className="px-4 py-1.5 rounded-full">
        <Text
          className={
            value === "monthly"
              ? "text-neutral-50 text-lg font-semibold"
              : "text-neutral-400 text-lg font-semibold"
          }
        >
          Monthly
        </Text>
      </SegmentedControl.Item>
      <SegmentedControl.Item value="yearly" className="pl-4 pr-1 py-1.5 rounded-full">
        <View className="flex-row gap-3">
          <Text
            className={
              value === "yearly"
                ? "text-neutral-50 text-lg font-semibold"
                : "text-neutral-400 text-lg font-semibold"
            }
          >
            Yearly
          </Text>
          <View className="pt-0.5 px-2 bg-emerald-500 rounded-full" style={styles.borderCurve}>
            <Text className="text-white text-sm font-semibold">-58%</Text>
          </View>
        </View>
      </SegmentedControl.Item>
    </SegmentedControl>
  );
};

const styles = StyleSheet.create({
  borderCurve: {
    borderCurve: "continuous",
  },
});

export default PeriodControl;
