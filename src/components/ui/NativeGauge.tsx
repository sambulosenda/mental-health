import { Platform, View, StyleSheet } from 'react-native';
import { Host, Gauge } from '@expo/ui/swift-ui';
import Svg, { Circle } from 'react-native-svg';
import { colors, spacing } from '@/src/constants/theme';
import { Text } from './Text';

interface NativeGaugeProps {
  value: number; // 0-1
  maxValue?: number;
  label?: string;
  size?: number;
  color?: string;
}

export function NativeGauge({
  value,
  maxValue = 1,
  label,
  size = 100,
  color = colors.primary,
}: NativeGaugeProps) {
  const normalizedValue = Math.min(Math.max(value / maxValue, 0), 1);

  // Use native SwiftUI Gauge on iOS
  if (Platform.OS === 'ios') {
    return (
      <View style={styles.container}>
        <Host style={{ width: size, height: size }}>
          <Gauge
            max={{ value: 1, label: String(maxValue) }}
            min={{ value: 0, label: '0' }}
            current={{ value: normalizedValue }}
            type="circularCapacity"
          />
        </Host>
        {label && (
          <Text variant="caption" color="textSecondary" style={styles.label}>
            {label}
          </Text>
        )}
      </View>
    );
  }

  // Fallback circular progress for Android
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - normalizedValue);

  return (
    <View style={styles.container}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.border}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={[styles.valueContainer, { width: size, height: size }]}>
          <Text variant="h2" color="textPrimary">
            {Math.round(value)}
          </Text>
          <Text variant="caption" color="textMuted">
            /{maxValue}
          </Text>
        </View>
      </View>
      {label && (
        <Text variant="caption" color="textSecondary" style={styles.label}>
          {label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  valueContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  label: {
    marginTop: spacing.sm,
  },
});
