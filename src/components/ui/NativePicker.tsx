import { Platform, View, StyleSheet } from 'react-native';
import { useState } from 'react';
import { Host, Picker } from '@expo/ui/swift-ui';
import { colors, borderRadius, spacing } from '@/src/constants/theme';
import { Text } from './Text';

interface NativePickerProps {
  options: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  variant?: 'segmented' | 'wheel';
}

export function NativePicker({
  options,
  selectedIndex,
  onSelect,
  variant = 'segmented',
}: NativePickerProps) {
  // Use native Picker on iOS
  if (Platform.OS === 'ios') {
    return (
      <Host matchContents>
        <Picker
          options={options}
          selectedIndex={selectedIndex}
          onOptionSelected={({ nativeEvent: { index } }) => {
            onSelect(index);
          }}
          variant={variant}
        />
      </Host>
    );
  }

  // Fallback segmented control for Android
  return (
    <View style={styles.fallbackContainer}>
      {options.map((option, index) => (
        <View
          key={index}
          style={[
            styles.fallbackOption,
            index === selectedIndex && styles.fallbackOptionSelected,
            index === 0 && styles.fallbackOptionFirst,
            index === options.length - 1 && styles.fallbackOptionLast,
          ]}
          onTouchEnd={() => onSelect(index)}
        >
          <Text
            variant="captionMedium"
            color={index === selectedIndex ? 'white' : 'textSecondary'}
          >
            {option}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  fallbackContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    padding: 2,
  },
  fallbackOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.sm,
  },
  fallbackOptionSelected: {
    backgroundColor: colors.primary,
  },
  fallbackOptionFirst: {
    borderTopLeftRadius: borderRadius.md - 2,
    borderBottomLeftRadius: borderRadius.md - 2,
  },
  fallbackOptionLast: {
    borderTopRightRadius: borderRadius.md - 2,
    borderBottomRightRadius: borderRadius.md - 2,
  },
});
