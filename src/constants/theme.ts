// Softmind Design System - Ultra-Minimal Apple-Style Theme

export const colors = {
  // Primary palette - muted indigo
  primary: '#8A9CFF',
  primaryLight: '#C7D7FE',
  primaryDark: '#6B7FE3',

  // Accent - soft indigo wash
  accent: '#EEF2FF',

  // Mood colors - calming gradient (WCAG AA compliant)
  mood: {
    1: '#FFE4EC', // Struggling - soft pink
    2: '#F2C7FF', // Low - light pink lavender
    3: '#C7D7FE', // Okay - cool mist
    4: '#B8D4FF', // Good - sky blue
    5: '#8A9CFF', // Great - muted indigo
  } as Record<number, string>,

  // Mood text colors (darker versions for contrast)
  moodText: {
    1: '#8B5A6B',
    2: '#7B5A8B',
    3: '#4B5563',
    4: '#4A6A8B',
    5: '#3730A3',
  } as Record<number, string>,

  // Backgrounds - off-white
  background: '#F9FAFB',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  // Text - black for maximum readability
  textPrimary: '#111827',
  textSecondary: '#111827',
  textMuted: '#111827',
  textInverse: '#FFFFFF',

  // Icons - deep muted indigo for visibility
  iconPrimary: '#7585E6',
  iconSecondary: '#6B7280',

  // Text/icons on colored backgrounds
  textOnPrimary: '#FFFFFF',
  textOnAccent: '#3730A3',
  textOnMood: '#111827',

  // Semantic
  error: '#EF4444',
  errorLight: '#FEE2E2',
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',

  // Borders & dividers
  border: '#E5E7EB',
  borderLight: '#EEF2FF',
  divider: '#E5E7EB',
} as const;

// Dark mode colors - calm charcoal with indigo accents
export const darkColors = {
  // Primary palette - brighter indigo for dark mode
  primary: '#A5B4FF',
  primaryLight: '#C7D7FE',
  primaryDark: '#8A9CFF',

  // Accent - soft indigo wash
  accent: '#1E2340',

  // Mood colors - same as light (for consistency)
  mood: {
    1: '#FFE4EC',
    2: '#F2C7FF',
    3: '#C7D7FE',
    4: '#B8D4FF',
    5: '#A5B4FF',
  } as Record<number, string>,

  moodText: {
    1: '#FFE4EC',
    2: '#F2C7FF',
    3: '#C7D7FE',
    4: '#B8D4FF',
    5: '#A5B4FF',
  } as Record<number, string>,

  // Dark backgrounds - calm charcoal
  background: '#111827',
  surface: '#1F2937',
  surfaceElevated: '#374151',

  // Dark text (WCAG AA contrast ratios met)
  textPrimary: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textMuted: '#9CA3AF',
  textInverse: '#111827',

  // Icons - brighter for dark mode
  iconPrimary: '#A5B4FF',
  iconSecondary: '#9CA3AF',

  // Text/icons on colored backgrounds
  textOnPrimary: '#111827',
  textOnAccent: '#C7D7FE',
  textOnMood: '#111827',

  // Semantic - adjusted for dark mode
  error: '#FCA5A5',
  errorLight: '#7F1D1D',
  success: '#6EE7B7',
  successLight: '#064E3B',
  warning: '#FCD34D',
  warningLight: '#78350F',

  // Dark borders
  border: '#374151',
  borderLight: '#4B5563',
  divider: '#374151',
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
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#111827',
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
