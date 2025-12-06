import React, { useState } from 'react';
import { StyleSheet, Text, View, TextProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  withSequence,
  EasingFunction,
  EasingFunctionFactory,
} from 'react-native-reanimated';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

type ShimmerTextProps = TextProps & {
  children: React.ReactNode;
  speed?: number;
  easing?: EasingFunction | EasingFunctionFactory;
  highlightColor?: string;
};

// Helper to convert hex to rgba with alpha
function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(255, 255, 255, ${alpha})`;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function ShimmerText({
  children,
  speed = 0.6,
  easing = Easing.in(Easing.ease),
  highlightColor = '#ffffff',
  ...textProps
}: ShimmerTextProps) {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const translateX = useSharedValue(-width);

  // Convert speed (shimmers per second) to duration in milliseconds per shimmer
  const duration = 1000 / speed;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  React.useEffect(() => {
    if (width === 0) return;

    translateX.value = withRepeat(
      withSequence(
        withTiming(-width, { duration: 0 }),
        withTiming(width, { duration, easing })
      ),
      -1, // Infinite repetition
      false // Don't reverse the animation
    );
  }, [duration, easing, translateX, width]);

  const highlightColorTransparent = hexToRgba(highlightColor, 0);

  return (
    <View>
      {/* Hidden text to measure dimensions */}
      <Text
        {...textProps}
        style={[textProps.style, styles.measureText]}
        onLayout={(event) => {
          const { width: w, height: h } = event.nativeEvent.layout;
          setWidth(w);
          setHeight(h);
        }}
      >
        {children}
      </Text>
      <MaskedView
        style={{ width, height }}
        maskElement={
          <View style={styles.maskContainer}>
            <Text style={textProps.style}>{children}</Text>
          </View>
        }
      >
        <Animated.View style={[{ width, height }, animatedStyle]}>
          <LinearGradient
            colors={[
              highlightColorTransparent,
              highlightColor,
              highlightColor,
              highlightColorTransparent,
            ]}
            locations={[0, 0.4, 0.6, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </MaskedView>
    </View>
  );
}

const styles = StyleSheet.create({
  measureText: {
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0,
  },
  maskContainer: {
    backgroundColor: 'transparent',
  },
});
