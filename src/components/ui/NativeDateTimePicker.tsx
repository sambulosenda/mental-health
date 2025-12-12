import { Platform, View, StyleSheet, Modal, Pressable } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Host, DateTimePicker } from '@expo/ui/swift-ui';
import DateTimePickerRN from '@react-native-community/datetimepicker';
import { colors, darkColors, spacing, borderRadius } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Text } from './Text';

interface NativeTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  visible: boolean;
  onClose: () => void;
}

export function NativeTimePicker({
  value,
  onChange,
  visible,
  onClose,
}: NativeTimePickerProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const tempDateRef = useRef(value);

  useEffect(() => {
    if (visible) {
      tempDateRef.current = value;
    }
  }, [visible, value]);

  const handleDateChange = (date: Date) => {
    tempDateRef.current = date;
  };

  const handleConfirm = () => {
    onChange(tempDateRef.current);
    onClose();
  };

  // Use native SwiftUI DateTimePicker on iOS
  if (Platform.OS === 'ios') {
    if (!visible) return null;

    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: themeColors.border }]}>
              <Pressable onPress={onClose}>
                <Text variant="body" color="textSecondary">Cancel</Text>
              </Pressable>
              <Text variant="bodyMedium" color="textPrimary">Select Time</Text>
              <Pressable onPress={handleConfirm}>
                <Text variant="body" color="textPrimary">Done</Text>
              </Pressable>
            </View>
            <View style={styles.pickerWrapper}>
              <Host style={styles.hostContainer}>
                <DateTimePicker
                  onDateSelected={(date) => {
                    // Handle various date formats from @expo/ui
                    let newDate: Date;
                    if (date instanceof Date) {
                      newDate = date;
                    } else if (typeof date === 'string') {
                      newDate = new Date(date);
                    } else if ((date as any)?.nativeEvent?.date) {
                      newDate = new Date((date as any).nativeEvent.date);
                    } else {
                      return;
                    }
                    handleDateChange(newDate);
                  }}
                  displayedComponents="hourAndMinute"
                  initialDate={value.toISOString()}
                  variant="wheel"
                />
              </Host>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // Fallback for Android using @react-native-community/datetimepicker
  if (!visible) return null;

  return (
    <DateTimePickerRN
      value={value}
      mode="time"
      is24Hour={false}
      display="spinner"
      onChange={(event, selectedDate) => {
        if (event.type === 'dismissed') {
          onClose();
          return;
        }
        if (selectedDate) {
          onChange(selectedDate);
        }
        onClose();
      }}
    />
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  pickerWrapper: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  hostContainer: {
    width: 300,
    height: 200,
  },
});
