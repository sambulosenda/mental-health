import { memo, useCallback } from 'react';
import { View, Modal, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Text } from '@/src/components/ui';
import { colors, darkColors, spacing, borderRadius } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useSettingsStore } from '@/src/stores';

interface DisclaimerModalProps {
  visible: boolean;
}

export const DisclaimerModal = memo(function DisclaimerModal({ visible }: DisclaimerModalProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const insets = useSafeAreaInsets();
  const acceptDisclaimer = useSettingsStore((s) => s.acceptDisclaimer);

  const handleAccept = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    acceptDisclaimer();
  }, [acceptDisclaimer]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.6)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: spacing.lg,
        }}
      >
        <View
          style={{
            backgroundColor: themeColors.surface,
            borderRadius: borderRadius.xl,
            maxWidth: 400,
            width: '100%',
            maxHeight: '80%',
            overflow: 'hidden',
          }}
        >
          <ScrollView
            contentContainerStyle={{
              padding: spacing.xl,
              paddingBottom: spacing.lg,
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* Icon */}
            <View
              style={{
                alignItems: 'center',
                marginBottom: spacing.lg,
              }}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: `${themeColors.primary}15`,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="heart" size={32} color={themeColors.primary} />
              </View>
            </View>

            {/* Title */}
            <Text variant="h2" center style={{ marginBottom: spacing.md }}>
              Welcome to Softmind
            </Text>

            {/* Important Notice */}
            <View
              style={{
                backgroundColor: `${themeColors.warning}15`,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                marginBottom: spacing.lg,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                <Ionicons name="information-circle" size={20} color={themeColors.warning} />
                <Text variant="bodyMedium" style={{ marginLeft: spacing.sm, color: themeColors.warning }}>
                  Important Notice
                </Text>
              </View>
              <Text variant="body" color="textSecondary">
                Softmind is a self-care companion designed to help you track your mood,
                reflect through journaling, and practice wellness exercises.
              </Text>
            </View>

            {/* Key Points */}
            <View style={{ gap: spacing.md, marginBottom: spacing.lg }}>
              <DisclaimerPoint
                icon="medical"
                title="Not Medical Advice"
                description="This app is not a substitute for professional mental health treatment, diagnosis, or medical advice."
                themeColors={themeColors}
              />
              <DisclaimerPoint
                icon="person"
                title="Seek Professional Help"
                description="If you're experiencing a mental health crisis or need support, please consult a qualified healthcare provider."
                themeColors={themeColors}
              />
              <DisclaimerPoint
                icon="call"
                title="Crisis Resources"
                description="In an emergency, contact your local emergency services or a crisis helpline. We provide crisis resources within the app."
                themeColors={themeColors}
              />
            </View>

            {/* Privacy Note */}
            <Text variant="caption" color="textMuted" center style={{ marginBottom: spacing.lg }}>
              Your data is stored locally on your device. By continuing, you agree to our
              Privacy Policy and Terms of Service.
            </Text>
          </ScrollView>

          {/* Accept Button */}
          <View style={{ padding: spacing.lg, paddingTop: 0 }}>
            <Pressable
              onPress={handleAccept}
              style={({ pressed }) => ({
                backgroundColor: pressed ? themeColors.primaryDark : themeColors.primary,
                borderRadius: borderRadius.lg,
                paddingVertical: spacing.md,
                alignItems: 'center',
              })}
            >
              <Text variant="bodyMedium" style={{ color: themeColors.textOnPrimary }}>
                I Understand, Continue
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
});

interface DisclaimerPointProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  themeColors: typeof colors;
}

function DisclaimerPoint({ icon, title, description, themeColors }: DisclaimerPointProps) {
  return (
    <View style={{ flexDirection: 'row', gap: spacing.md }}>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: `${themeColors.primary}10`,
          justifyContent: 'center',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <Ionicons name={icon} size={18} color={themeColors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="bodyMedium" style={{ marginBottom: 2 }}>
          {title}
        </Text>
        <Text variant="caption" color="textSecondary">
          {description}
        </Text>
      </View>
    </View>
  );
}
