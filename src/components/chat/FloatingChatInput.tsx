import { useState, useRef } from 'react';
import { View, TextInput, Pressable, Keyboard, LayoutChangeEvent, Platform } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors, darkColors, typography, spacing, borderRadius, shadows } from '@/src/constants/theme';

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
  placeholder = 'Type a message...',
  onHeightChange
}: FloatingChatInputProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);
  const buttonScale = useSharedValue(1);

  const handleSend = async () => {
    if (!text.trim() || disabled) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSend(text.trim());
    setText('');
    // Don't dismiss keyboard - keep it open like v0
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    onHeightChange?.(height);
  };

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
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
        marginHorizontal: spacing.md,
        marginBottom: Platform.OS === 'ios' ? spacing.sm : spacing.md,
        backgroundColor: themeColors.surface,
        borderRadius: borderRadius.xl,
        ...shadows.md,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: spacing.sm,
          padding: spacing.sm,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: themeColors.surfaceElevated,
            borderRadius: borderRadius.lg,
          }}
        >
          <TextInput
            ref={inputRef}
            value={text}
            onChangeText={setText}
            placeholder={placeholder}
            placeholderTextColor={themeColors.textMuted}
            multiline
            maxLength={500}
            editable={!disabled}
            style={[
              typography.body,
              {
                color: themeColors.textPrimary,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                maxHeight: 120,
                minHeight: 40,
              },
            ]}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
        </View>
        <AnimatedPressable
          onPress={handleSend}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={!canSend}
          style={[
            buttonAnimatedStyle,
            {
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: canSend ? themeColors.primary : themeColors.surfaceElevated,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: canSend ? 1 : 0.5,
            },
          ]}
          accessibilityLabel="Send message"
          accessibilityRole="button"
        >
          <Ionicons
            name="arrow-up"
            size={20}
            color={canSend ? themeColors.textInverse : themeColors.textMuted}
          />
        </AnimatedPressable>
      </View>
    </View>
  );
}
