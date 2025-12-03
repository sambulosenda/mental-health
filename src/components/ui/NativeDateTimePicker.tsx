import { Platform, View, StyleSheet, Modal, Pressable } from 'react-native';
import { useState } from 'react';
import { Host, DateTimePicker } from '@expo/ui/swift-ui';
import DateTimePickerRN from '@react-native-community/datetimepicker';
import { colors, spacing, borderRadius } from '@/src/constants/theme';
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
  const [tempDate, setTempDate] = useState(value);

  const handleConfirm = () => {
    onChange(tempDate);
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
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Pressable onPress={onClose}>
                <Text variant="body" color="textSecondary">Cancel</Text>
              </Pressable>
              <Text variant="bodyMedium" color="textPrimary">Select Time</Text>
              <Pressable onPress={handleConfirm}>
                <Text variant="body" color="primary">Done</Text>
              </Pressable>
            </View>
            <View style={styles.pickerWrapper}>
              <Host style={styles.hostContainer}>
                <DateTimePicker
                  onDateSelected={({ nativeEvent: { date } }) => {
                    setTempDate(new Date(date));
                  }}
                  displayedComponents="hourAndMinute"
                  initialDate={tempDate.toISOString()}
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
    backgroundColor: colors.surface,
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
    borderBottomColor: colors.border,
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
