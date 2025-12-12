import React, { createContext, useState, useCallback, useContext, ReactNode } from "react";
import { View, Pressable, type LayoutChangeEvent, GestureResponderEvent, ViewProps, PressableProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  WithTimingConfig,
} from "react-native-reanimated";
import type { WithSpringConfig } from "react-native-reanimated/lib/typescript/animation/spring";

interface ItemMeasurements {
  width: number;
  height: number;
  x: number;
}

interface SegmentedControlContextValue {
  value: string;
  onValueChange: (value: string) => void;
  measurements: Record<string, ItemMeasurements>;
  setMeasurements: (key: string, measurements: ItemMeasurements) => void;
}

interface SegmentedControlProps extends ViewProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

interface SegmentedControlItemProps extends Omit<PressableProps, 'children'> {
  value: string;
  className?: string;
  children?: ReactNode;
}

interface SegmentedControlIndicatorProps extends ViewProps {
  className?: string;
  animationConfig?:
    | { type: "timing"; config?: WithTimingConfig }
    | { type: "spring"; config?: WithSpringConfig };
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SegmentedControlContext = createContext<SegmentedControlContextValue>({
  value: "",
  onValueChange: () => {},
  measurements: {},
  setMeasurements: () => {},
});

const SegmentedControlRoot = ({
  value,
  onValueChange,
  className,
  children,
  style,
  ...props
}: SegmentedControlProps) => {
  const [measurements, setMeasurementsState] = useState<Record<string, ItemMeasurements>>({});

  const setMeasurements = useCallback((key: string, newMeasurements: ItemMeasurements) => {
    setMeasurementsState((prev) => ({
      ...prev,
      [key]: newMeasurements,
    }));
  }, []);

  const contextValue: SegmentedControlContextValue = {
    value,
    onValueChange,
    measurements,
    setMeasurements,
  };

  return (
    <SegmentedControlContext.Provider value={contextValue}>
      <View className={`flex-row ${className || ""}`} style={style} {...props}>
        {children}
      </View>
    </SegmentedControlContext.Provider>
  );
};

const SegmentedControlItem = ({
  value,
  className,
  onPress,
  ...props
}: SegmentedControlItemProps) => {
  const { onValueChange, setMeasurements, value: activeValue } = useContext(SegmentedControlContext);

  const isActive = activeValue === value;

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height, x } = event.nativeEvent.layout;
      setMeasurements(value, { width, height, x });
    },
    [value, setMeasurements]
  );

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      onValueChange(value);
      // @ts-ignore
      onPress?.(event);
    },
    [value, onValueChange, onPress]
  );

  return (
    <AnimatedPressable
      className={className}
      onLayout={handleLayout}
      onPress={handlePress}
      accessibilityState={{ selected: isActive }}
      {...props}
    />
  );
};

const SegmentedControlIndicator = ({
  className,
  style,
  animationConfig = { type: "spring" },
  ...props
}: SegmentedControlIndicatorProps) => {
  const { value, measurements } = useContext(SegmentedControlContext);

  const activeMeasurements = measurements[value];
  const hasMeasured = useSharedValue(false);

  const reanimatedConfig = animationConfig?.config;

  const animatedStyle = useAnimatedStyle(() => {
    if (!activeMeasurements) {
      return {
        width: 0,
        height: 0,
        left: 0,
        opacity: 0,
      };
    }

    if (!hasMeasured.value) {
      hasMeasured.value = true;
      return {
        width: activeMeasurements.width,
        height: activeMeasurements.height,
        left: activeMeasurements.x,
        opacity: 1,
      };
    }

    return {
      width:
        animationConfig?.type === "timing"
          ? withTiming(activeMeasurements.width, reanimatedConfig)
          : withSpring(activeMeasurements.width, reanimatedConfig),
      height:
        animationConfig?.type === "timing"
          ? withTiming(activeMeasurements.height, reanimatedConfig)
          : withSpring(activeMeasurements.height, reanimatedConfig),
      left:
        animationConfig?.type === "timing"
          ? withTiming(activeMeasurements.x, reanimatedConfig)
          : withSpring(activeMeasurements.x, reanimatedConfig),
      opacity: 1,
    };
  }, [activeMeasurements]);

  return (
    <Animated.View
      className={`absolute ${className || ""}`}
      style={[animatedStyle, style]}
      {...props}
    />
  );
};

SegmentedControlRoot.displayName = "SegmentedControl";
SegmentedControlItem.displayName = "SegmentedControl.Item";
SegmentedControlIndicator.displayName = "SegmentedControl.Indicator";

const SegmentedControl = Object.assign(SegmentedControlRoot, {
  Item: SegmentedControlItem,
  Indicator: SegmentedControlIndicator,
});

export default SegmentedControl;
