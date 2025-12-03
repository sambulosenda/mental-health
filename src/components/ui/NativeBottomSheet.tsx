import { Platform, Modal, View, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { ReactNode } from 'react';
import { Host, BottomSheet } from '@expo/ui/swift-ui';
import { colors, spacing, borderRadius } from '@/src/constants/theme';
import { Text } from './Text';

interface NativeBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export function NativeBottomSheet({
  isOpen,
  onClose,
  children,
  title,
}: NativeBottomSheetProps) {
  const { width, height } = useWindowDimensions();

  // Use native SwiftUI BottomSheet on iOS
  if (Platform.OS === 'ios') {
    if (!isOpen) return null;

    return (
      <Host style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width, height }}>
        <BottomSheet
          isOpened={isOpen}
          onIsOpenedChange={(opened) => {
            if (!opened) onClose();
          }}
          presentationDetents={['medium']}
          presentationDragIndicator="visible"
        >
          <View style={styles.sheetContent}>
            {title && (
              <Text variant="h3" color="textPrimary" style={styles.sheetTitle}>
                {title}
              </Text>
            )}
            {children}
          </View>
        </BottomSheet>
      </Host>
    );
  }

  // Fallback modal for Android
  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          {title && (
            <Text variant="h3" color="textPrimary" style={styles.title}>
              {title}
            </Text>
          )}
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    maxHeight: '80%',
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.md,
  },
  sheetContent: {
    padding: spacing.lg,
  },
  sheetTitle: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
});
