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

export function DisclaimerModal({ visible }: DisclaimerModalProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const insets = useSafeAreaInsets();
  const acceptDisclaimer = useSettingsStore((s) => s.acceptDisclaimer);

  const handleAccept = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    acceptDisclaimer();
  };

  if (!visible) return null;

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
          paddingHorizontal: spacing.lg,
          paddingTop: insets.top + spacing.lg,
          paddingBottom: insets.bottom + spacing.lg,
        }}
      >
        <View
          style={{
            backgroundColor: themeColors.surface,
            borderRadius: borderRadius.xl,
            maxWidth: 400,
            width: '100%',
            overflow: 'hidden',
          }}
        >
          <ScrollView
            contentContainerStyle={{
              padding: spacing.lg,
              paddingBottom: spacing.xl,
            }}
            showsVerticalScrollIndicator={true}
            bounces={true}
          >
            {/* Icon & Title */}
            <View style={{ alignItems: 'center', marginBottom: spacing.md }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: `${themeColors.primary}15`,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: spacing.sm,
                }}
              >
                <Ionicons name="heart" size={24} color={themeColors.primary} />
              </View>
              <Text variant="h3" center>
                Welcome to Softmind
              </Text>
            </View>

            {/* Important Notice */}
            <View
              style={{
                backgroundColor: `${themeColors.warning}15`,
                borderRadius: borderRadius.md,
                padding: spacing.sm,
                marginBottom: spacing.md,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Ionicons name="warning" size={16} color={themeColors.warning} />
                <Text variant="caption" style={{ marginLeft: 6, color: themeColors.warning, fontWeight: '700' }}>
                  Medical Disclaimer
                </Text>
              </View>
              <Text variant="caption" color="textSecondary" style={{ lineHeight: 18 }}>
                Softmind is a wellness and self-care app. It does NOT provide medical advice, diagnosis, or treatment.
                Always seek the advice of a qualified healthcare provider with any questions about your mental health.
              </Text>
            </View>

            {/* Key Points */}
            <View style={{ gap: spacing.sm, marginBottom: spacing.md }}>
              <DisclaimerPoint
                icon="medical"
                title="Not Medical Advice"
                description="This app is for informational and educational purposes only. It is not intended to diagnose, treat, cure, or prevent any disease or health condition."
                themeColors={themeColors}
              />
              <DisclaimerPoint
                icon="person"
                title="Consult Your Doctor"
                description="Before making any health decisions, consult a qualified healthcare provider. If you are in crisis or need immediate help, call emergency services."
                themeColors={themeColors}
              />
              <DisclaimerPoint
                icon="call"
                title="Crisis Resources"
                description="If you're experiencing thoughts of self-harm or suicide, please contact emergency services or a crisis hotline immediately."
                themeColors={themeColors}
              />
              <DisclaimerPoint
                icon="book"
                title="Evidence-Based Tools"
                description="Our assessments (GAD-7, PHQ-9) and exercises are based on peer-reviewed research. Sources are cited within the app."
                themeColors={themeColors}
              />
            </View>

            {/* Privacy Note */}
            <Text variant="caption" color="textMuted" center style={{ marginBottom: spacing.md, lineHeight: 16 }}>
              Your data is stored locally on your device. By continuing, you acknowledge this disclaimer and agree to our Privacy Policy.
            </Text>

            {/* Accept Button */}
            <View style={{ marginTop: spacing.sm, marginBottom: spacing.md }}>
              <Pressable
                onPress={handleAccept}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? themeColors.primaryDark : themeColors.primary,
                  borderRadius: borderRadius.lg,
                  paddingVertical: 16,
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                })}
              >
                <Text variant="bodyMedium" style={{ color: '#FFFFFF', fontWeight: '600' }}>
                  I Understand, Continue
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

interface DisclaimerPointProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  themeColors: typeof colors | typeof darkColors;
}

function DisclaimerPoint({ icon, title, description, themeColors }: DisclaimerPointProps) {
  return (
    <View style={{ flexDirection: 'row', gap: spacing.sm }}>
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: `${themeColors.primary}10`,
          justifyContent: 'center',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <Ionicons name={icon} size={16} color={themeColors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="caption" style={{ fontWeight: '600', marginBottom: 2 }}>
          {title}
        </Text>
        <Text variant="caption" color="textSecondary" style={{ fontSize: 12 }}>
          {description}
        </Text>
      </View>
    </View>
  );
}
