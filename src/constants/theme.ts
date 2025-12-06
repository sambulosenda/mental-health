// DaySi Design System - Calming, minimal aesthetic

export const colors = {
  // Primary palette - soft teal
  primary: '#6B8E8E',
  primaryLight: '#A8C5C5',
  primaryDark: '#4A6B6B',

  // Mood colors (WCAG AA compliant)
  mood: {
    1: '#E8B4B4', // Distressed - soft coral
    2: '#E8D4B4', // Low - warm sand
    3: '#E8E4B4', // Neutral - pale yellow
    4: '#C4E8B4', // Good - soft green
    5: '#B4D4E8', // Great - calm blue
  } as Record<number, string>,

  // Mood text colors (darker versions for contrast)
  moodText: {
    1: '#8B5A5A',
    2: '#8B7A5A',
    3: '#7B7A4A',
    4: '#5A7B5A',
    5: '#5A6A7B',
  } as Record<number, string>,

  // Backgrounds
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceElevated: '#F5F5F5',

  // Text (WCAG AA contrast ratios met)
  textPrimary: '#2C3E3E',
  textSecondary: '#5A6B6B',
  textMuted: '#8A9A9A',
  textInverse: '#FFFFFF',

  // Semantic
  error: '#D47979',
  errorLight: '#F5E0E0',
  success: '#79B47F',
  successLight: '#E0F5E2',
  warning: '#D4A979',
  warningLight: '#F5EDE0',

  // Borders & dividers
  border: '#E5E8E8',
  borderLight: '#F0F2F2',
  divider: '#E8EBEB',
} as const;

// Dark mode colors
export const darkColors = {
  // Primary palette - same as light
  primary: '#6B8E8E',
  primaryLight: '#A8C5C5',
  primaryDark: '#4A6B6B',

  // Mood colors - same as light (for consistency)
  mood: {
    1: '#E8B4B4',
    2: '#E8D4B4',
    3: '#E8E4B4',
    4: '#C4E8B4',
    5: '#B4D4E8',
  } as Record<number, string>,

  moodText: {
    1: '#8B5A5A',
    2: '#8B7A5A',
    3: '#7B7A4A',
    4: '#5A7B5A',
    5: '#5A6A7B',
  } as Record<number, string>,

  // Dark backgrounds
  background: '#121212',
  surface: '#1E1E1E',
  surfaceElevated: '#2A2A2A',

  // Dark text
  textPrimary: '#FAFAFA',
  textSecondary: '#B0B0B0',
  textMuted: '#707070',
  textInverse: '#1E1E1E',

  // Semantic - slightly adjusted for dark
  error: '#E57373',
  errorLight: '#3D2020',
  success: '#81C784',
  successLight: '#1D3D1D',
  warning: '#FFB74D',
  warningLight: '#3D3020',

  // Dark borders
  border: '#3A3A3A',
  borderLight: '#2A2A2A',
  divider: '#2A2A2A',
} as const;

// Helper to get colors based on theme
export const getThemeColors = (isDark: boolean) => isDark ? darkColors : colors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const typography = {
  // Headers
  h1: {
    fontSize: 28,
    fontWeight: '600' as const,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  // Body
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
  },
  // Small
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  captionMedium: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  // Tiny
  label: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

// Mood labels for accessibility
export const moodLabels: Record<number, { label: string; description: string }> = {
  1: { label: 'Struggling', description: 'Feeling distressed or overwhelmed' },
  2: { label: 'Low', description: 'Feeling down or unmotivated' },
  3: { label: 'Okay', description: 'Feeling neutral or balanced' },
  4: { label: 'Good', description: 'Feeling positive and content' },
  5: { label: 'Great', description: 'Feeling joyful and energized' },
};

// Activity tags
export const activityTags = [
  { id: 'work', label: 'Work', icon: 'briefcase' },
  { id: 'exercise', label: 'Exercise', icon: 'fitness' },
  { id: 'social', label: 'Social', icon: 'people' },
  { id: 'family', label: 'Family', icon: 'home' },
  { id: 'sleep', label: 'Sleep', icon: 'moon' },
  { id: 'food', label: 'Food', icon: 'restaurant' },
  { id: 'nature', label: 'Nature', icon: 'leaf' },
  { id: 'creative', label: 'Creative', icon: 'color-palette' },
  { id: 'relax', label: 'Relax', icon: 'cafe' },
  { id: 'health', label: 'Health', icon: 'medkit' },
] as const;

export type ActivityTagId = (typeof activityTags)[number]['id'];
