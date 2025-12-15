import { Text } from '@/src/components/ui';
import { borderRadius, colors, darkColors, spacing } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useSettingsStore } from '@/src/stores';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Modal, ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
            maxHeight: '85%',
            width: '100%',
            overflow: 'hidden',
          }}
        >
          <ScrollView
            contentContainerStyle={{
              padding: spacing.lg,
              paddingBottom: spacing.sm,
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
                <Ionicons name="information-circle" size={16} color={themeColors.warning} />
                <Text variant="caption" style={{ marginLeft: 6, color: themeColors.warning, fontWeight: '600' }}>
                  Important Notice
                </Text>
              </View>
              <Text variant="caption" color="textSecondary">
                Softmind is a self-care companion for mood tracking, journaling, and wellness exercises.
              </Text>
            </View>

            {/* Key Points */}
            <View style={{ gap: spacing.sm, marginBottom: spacing.md }}>
              <DisclaimerPoint
                icon="medical"
                title="Not Medical Advice"
                description="Not a substitute for professional mental health treatment or diagnosis."
                themeColors={themeColors}
              />
              <DisclaimerPoint
                icon="person"
                title="Seek Professional Help"
                description="If in crisis, please consult a qualified healthcare provider."
                themeColors={themeColors}
              />
              <DisclaimerPoint
                icon="call"
                title="Crisis Resources"
                description="Emergency resources are available within the app."
                themeColors={themeColors}
              />
            </View>

            {/* Privacy Note */}
            <Text variant="caption" color="textMuted" center>
              Data stored locally. By continuing, you agree to our Privacy Policy.
            </Text>
          </ScrollView>

          {/* Accept Button - Outside ScrollView */}
          <View style={{ padding: spacing.lg, paddingTop: spacing.sm }}>
            <TouchableOpacity
              onPress={handleAccept}
              activeOpacity={0.8}
              style={{
                backgroundColor: themeColors.primary,
                borderRadius: borderRadius.lg,
                paddingVertical: 16,
                alignItems: 'center',
              }}
            >
              <Text variant="bodyMedium" style={{ color: '#FFFFFF', fontWeight: '600' }}>
                I Understand, Continue
              </Text>
            </TouchableOpacity>
          </View>
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
