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

const THEME_STORAGE_KEY = '@daysi_theme_mode';

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
    // Backgrounds
    background: isDark ? '#121212' : '#FAFAFA',
    surface: isDark ? '#1E1E1E' : '#FFFFFF',
    surfaceElevated: isDark ? '#2A2A2A' : '#F5F5F5',

    // Text
    textPrimary: isDark ? '#FAFAFA' : '#2C3E3E',
    textSecondary: isDark ? '#B0B0B0' : '#5A6B6B',
    textMuted: isDark ? '#707070' : '#8A9A9A',

    // Borders
    border: isDark ? '#3A3A3A' : '#E5E8E8',
    borderLight: isDark ? '#2A2A2A' : '#F0F2F2',
    divider: isDark ? '#2A2A2A' : '#E8EBEB',

    // Primary (same in both modes)
    primary: '#6B8E8E',
    primaryLight: '#A8C5C5',
    primaryDark: '#4A6B6B',
  };
}
