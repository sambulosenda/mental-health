import { useState, useRef } from 'react';
import { View, TextInput, Pressable, Platform, LayoutChangeEvent } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors, darkColors, typography, spacing } from '@/src/constants/theme';

interface FloatingChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  onHeightChange?: (height: number) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FloatingChatInput({
  onSend,
  disabled,
  placeholder = 'Message',
  onHeightChange
}: FloatingChatInputProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);
  const buttonScale = useSharedValue(1);

  const handleSend = () => {
    if (!text.trim() || disabled) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
      // Silently ignore haptics errors
    });
    onSend(text.trim());
    setText('');
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    onHeightChange?.(height);
  };

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.92, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <View
      onLayout={handleLayout}
      style={{
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
        paddingBottom: Math.max(insets.bottom, spacing.sm),
      }}
    >
      {/* Glass-effect container */}
      <BlurView
        intensity={isDark ? 40 : 60}
        tint={isDark ? 'dark' : 'light'}
        style={{
          borderRadius: 24,
          overflow: 'hidden',
          borderWidth: 0.5,
          borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            paddingHorizontal: 6,
            paddingVertical: 6,
            backgroundColor: isDark ? 'rgba(45,45,45,0.7)' : 'rgba(255,255,255,0.85)',
          }}
        >
          {/* Text Input */}
          <TextInput
            ref={inputRef}
            value={text}
            onChangeText={setText}
            placeholder={placeholder}
            placeholderTextColor={themeColors.textMuted}
            multiline
            maxLength={1000}
            editable={!disabled}
            style={[
              typography.body,
              {
                flex: 1,
                color: themeColors.textPrimary,
                paddingHorizontal: 12,
                paddingVertical: Platform.OS === 'ios' ? 8 : 6,
                maxHeight: 120,
                minHeight: 36,
              },
            ]}
            onSubmitEditing={handleSend}
            submitBehavior="newline"
          />

          {/* Send Button */}
          <AnimatedPressable
            onPress={handleSend}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={!canSend}
            style={[
              buttonAnimatedStyle,
              {
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: canSend ? themeColors.primary : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 2,
              },
            ]}
            accessibilityLabel="Send message"
            accessibilityRole="button"
          >
            <Ionicons
              name="arrow-up"
              size={20}
              color={canSend ? '#FFFFFF' : themeColors.textMuted}
              style={{ opacity: canSend ? 1 : 0.4 }}
            />
          </AnimatedPressable>
        </View>
      </BlurView>
    </View>
  );
}
