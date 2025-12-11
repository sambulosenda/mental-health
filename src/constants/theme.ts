// Softmind Design System - Calm Mental Health Palette

export const colors = {
  // Primary palette - soft blue & lavender
  primary: '#A9C9FF',
  primaryLight: '#C7B8FF',
  primaryDark: '#9B8CFF',

  // Mood colors - calming gradient (WCAG AA compliant)
  mood: {
    1: '#FFE4EC', // Struggling - soft pink
    2: '#F2C7FF', // Low - light pink lavender
    3: '#C7B8FF', // Okay - lavender
    4: '#B8D4FF', // Good - sky blue
    5: '#A9C9FF', // Great - soft blue
  } as Record<number, string>,

  // Mood text colors (darker versions for contrast)
  moodText: {
    1: '#8B5A6B',
    2: '#7B5A8B',
    3: '#5A5A8B',
    4: '#4A6A8B',
    5: '#3A5A7B',
  } as Record<number, string>,

  // Backgrounds - gentle gray
  background: '#F7F8FA',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  // Text (WCAG AA contrast ratios met)
  textPrimary: '#2F3441',
  textSecondary: '#5A6170',
  textMuted: '#8A8F9C',
  textInverse: '#FFFFFF',

  // Semantic
  error: '#E57373',
  errorLight: '#FFEBEE',
  success: '#81C784',
  successLight: '#E8F5E9',
  warning: '#FFB74D',
  warningLight: '#FFF3E0',

  // Borders & dividers
  border: '#E4E6EB',
  borderLight: '#F0F2F5',
  divider: '#EBEDF0',
} as const;

// Dark mode colors - calm charcoal with soft accents
export const darkColors = {
  // Primary palette - brighter for dark mode visibility
  primary: '#A9C9FF',
  primaryLight: '#C7B8FF',
  primaryDark: '#9B8CFF',

  // Mood colors - same as light (for consistency)
  mood: {
    1: '#FFE4EC',
    2: '#F2C7FF',
    3: '#C7B8FF',
    4: '#B8D4FF',
    5: '#A9C9FF',
  } as Record<number, string>,

  moodText: {
    1: '#FFE4EC',
    2: '#F2C7FF',
    3: '#C7B8FF',
    4: '#B8D4FF',
    5: '#A9C9FF',
  } as Record<number, string>,

  // Dark backgrounds - calm charcoal
  background: '#1A1D24',
  surface: '#2F3441',
  surfaceElevated: '#3A3F4C',

  // Dark text (WCAG AA contrast ratios met)
  textPrimary: '#F7F8FA',
  textSecondary: '#B8BCC5',
  textMuted: '#8A8F9C',
  textInverse: '#2F3441',

  // Semantic - adjusted for dark mode
  error: '#EF9A9A',
  errorLight: '#3D2424',
  success: '#A5D6A7',
  successLight: '#243D24',
  warning: '#FFCC80',
  warningLight: '#3D3424',

  // Dark borders
  border: '#3A3F4C',
  borderLight: '#4A4F5C',
  divider: '#3A3F4C',
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

// System font for iOS (SF Pro) and Android (Roboto)
const systemFont = 'System';

export const typography = {
  // Headers
  h1: {
    fontFamily: systemFont,
    fontSize: 28,
    fontWeight: '600' as const,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  h2: {
    fontFamily: systemFont,
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  h3: {
    fontFamily: systemFont,
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  // Body
  body: {
    fontFamily: systemFont,
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: systemFont,
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
  },
  // Small
  caption: {
    fontFamily: systemFont,
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  captionMedium: {
    fontFamily: systemFont,
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  // Tiny
  label: {
    fontFamily: systemFont,
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
} as const;

export const shadows = {
  sm: {
    shadowColor: '#2F3441',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#2F3441',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#2F3441',
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
