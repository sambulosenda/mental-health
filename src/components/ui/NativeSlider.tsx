import { Platform, StyleSheet, View } from 'react-native';
import { Host, Slider } from '@expo/ui/swift-ui';
import SliderRN from '@react-native-community/slider';
import { colors } from '@/src/constants/theme';

interface NativeSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  disabled?: boolean;
}

export function NativeSlider({
  value,
  onValueChange,
  minimumValue = 0,
  maximumValue = 1,
  step,
  disabled,
}: NativeSliderProps) {
  // Use native SwiftUI Slider on iOS
  if (Platform.OS === 'ios') {
    return (
      <View style={styles.container}>
        <Host style={styles.hostContainer}>
          <Slider
            value={value}
            onValueChange={(event: number | { nativeEvent?: { value?: number }; value?: number }) => {
              // Handle both possible event structures
              const rawValue = typeof event === 'number'
                ? event
                : (event as { nativeEvent?: { value?: number }; value?: number })?.nativeEvent?.value ?? (event as { value?: number })?.value ?? value;

              // Round to step if provided
              let newValue = rawValue;
              if (step) {
                newValue = Math.round(newValue / step) * step;
              }
              onValueChange(newValue);
            }}
          />
        </Host>
      </View>
    );
  }

  // Fallback for Android
  return (
    <SliderRN
      style={styles.slider}
      value={value}
      onValueChange={onValueChange}
      minimumValue={minimumValue}
      maximumValue={maximumValue}
      step={step}
      disabled={disabled}
      minimumTrackTintColor={colors.primary}
      maximumTrackTintColor={colors.border}
      thumbTintColor={colors.primary}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  hostContainer: {
    height: 44,
    width: '100%',
  },
  slider: {
    height: 44,
    width: '100%',
  },
});
