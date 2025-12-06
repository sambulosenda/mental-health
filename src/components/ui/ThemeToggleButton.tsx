import React, { FC, useRef } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import switchTheme from 'react-native-theme-switch-animation';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme, useThemeColors } from '@/src/contexts/ThemeContext';

interface ThemeToggleButtonProps {
  size?: 'small' | 'medium' | 'large';
}

const SIZES = {
  small: { padding: 6, icon: 16 },
  medium: { padding: 8, icon: 20 },
  large: { padding: 10, icon: 24 },
};

export const ThemeToggleButton: FC<ThemeToggleButtonProps> = ({ size = 'medium' }) => {
  const { mode, setMode, isDark } = useTheme();
  const colors = useThemeColors();
  const sizeConfig = SIZES[size];
  const buttonRef = useRef<View>(null);

  const toggleTheme = () => {
    buttonRef.current?.measureInWindow((x, y, width, height) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const cx = x + width / 2;
      const cy = y + height / 2;

      switchTheme({
        switchThemeFunction: () => {
          if (mode === 'system') {
            setMode(isDark ? 'light' : 'dark');
          } else {
            setMode(mode === 'dark' ? 'light' : 'dark');
          }
        },
        animationConfig: {
          type: Platform.OS === 'ios' ? 'inverted-circular' : 'fade',
          duration: 500,
          startingPoint: { cx, cy },
        },
      });
    });
  };

  return (
    <Pressable
      ref={buttonRef}
      onPress={toggleTheme}
      style={[
        styles.button,
        {
          padding: sizeConfig.padding,
          borderColor: colors.border,
          backgroundColor: colors.surface,
        },
      ]}
    >
      {isDark ? (
        <Ionicons name="sunny" size={sizeConfig.icon} color={colors.textPrimary} />
      ) : (
        <Ionicons name="moon" size={sizeConfig.icon} color={colors.textPrimary} />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 999,
    borderWidth: 1,
  },
});
