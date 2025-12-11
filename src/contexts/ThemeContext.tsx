import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const THEME_STORAGE_KEY = '@softmind_theme_mode';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useSystemColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved preference
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((savedMode) => {
      if (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system') {
        setModeState(savedMode);
      }
      setIsLoaded(true);
    });
  }, []);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
  }, []);

  // Resolve actual theme based on mode and system preference
  const resolvedTheme: ResolvedTheme =
    mode === 'system' ? (systemColorScheme ?? 'light') : mode;

  const isDark = resolvedTheme === 'dark';

  // Don't render until we've loaded the saved preference
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ mode, resolvedTheme, setMode, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function useThemeColors() {
  const { isDark } = useTheme();

  return {
    // Backgrounds - calm mental health palette
    background: isDark ? '#1A1D24' : '#F7F8FA',
    surface: isDark ? '#2F3441' : '#FFFFFF',
    surfaceElevated: isDark ? '#3A3F4C' : '#FFFFFF',

    // Text
    textPrimary: isDark ? '#F7F8FA' : '#2F3441',
    textSecondary: isDark ? '#B8BCC5' : '#5A6170',
    textMuted: isDark ? '#8A8F9C' : '#8A8F9C',

    // Borders
    border: isDark ? '#3A3F4C' : '#E4E6EB',
    borderLight: isDark ? '#4A4F5C' : '#F0F2F5',
    divider: isDark ? '#3A3F4C' : '#EBEDF0',

    // Primary - soft blue & lavender
    primary: '#A9C9FF',
    primaryLight: '#C7B8FF',
    primaryDark: '#9B8CFF',
  };
}
