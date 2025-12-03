import { Platform, Modal, View, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { ReactNode } from 'react';
import { Host, BottomSheet } from '@expo/ui/swift-ui';
import { BlurView } from 'expo-blur';
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
  const { width } = useWindowDimensions();

  // Use native SwiftUI BottomSheet on iOS
  if (Platform.OS === 'ios') {
    return (
      <Host style={{ position: 'absolute', width }}>
        <BottomSheet
          isOpened={isOpen}
          onIsOpenedChange={(opened) => {
            if (!opened) onClose();
          }}
        >
          {title && (
            <Text variant="h3" color="textPrimary" style={{ marginBottom: spacing.md }}>
              {title}
            </Text>
          )}
          {children}
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
});
