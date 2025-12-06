import { useState, useRef } from 'react';
import { View, TextInput, Pressable, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors, darkColors, typography, spacing, borderRadius } from '@/src/constants/theme';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder = 'Type a message...' }: ChatInputProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleSend = async () => {
    if (!text.trim() || disabled) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSend(text.trim());
    setText('');
    Keyboard.dismiss();
  };

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <View
      className="flex-row items-end gap-2 px-4 py-3"
      style={{
        backgroundColor: themeColors.surface,
        borderTopWidth: 1,
        borderTopColor: themeColors.border,
      }}
    >
      <View
        className="flex-1"
        style={{
          backgroundColor: themeColors.surfaceElevated,
          borderRadius: borderRadius.lg,
          borderWidth: 1,
          borderColor: themeColors.border,
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
              maxHeight: 100,
            },
          ]}
          onSubmitEditing={handleSend}
          submitBehavior="submit"
        />
      </View>
      <Pressable
        onPress={handleSend}
        disabled={!canSend}
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: canSend ? themeColors.primary : themeColors.surfaceElevated,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: canSend ? 1 : 0.5,
        }}
        accessibilityLabel="Send message"
        accessibilityRole="button"
      >
        <Ionicons
          name="send"
          size={20}
          color={canSend ? '#FFFFFF' : themeColors.textMuted}
        />
      </Pressable>
    </View>
  );
}
