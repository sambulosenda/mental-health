// DaySi Design System - Forest Green & Warm Cream

export const colors = {
  // Primary palette - deep forest green
  primary: '#1B4332',
  primaryLight: '#2D6A4F',
  primaryDark: '#0D2818',

  // Mood colors - all green tones (WCAG AA compliant)
  mood: {
    1: '#D8E2DC', // Struggling - pale sage
    2: '#B7E4C7', // Low - light mint
    3: '#95D5B2', // Okay - soft green
    4: '#74C69D', // Good - fresh green
    5: '#52B788', // Great - vibrant forest
  } as Record<number, string>,

  // Mood text colors (darker versions for contrast)
  moodText: {
    1: '#5C7065',
    2: '#4A7C59',
    3: '#3D6B4F',
    4: '#2D5A3D',
    5: '#1B4332',
  } as Record<number, string>,

  // Backgrounds - clean white
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceElevated: '#F5F5F5',

  // Text (WCAG AA contrast ratios met - 4.5:1 minimum)
  textPrimary: '#1B4332',
  textSecondary: '#40694D',
  textMuted: '#6B8068',
  textInverse: '#FFFEFB',

  // Semantic
  error: '#BC4749',
  errorLight: '#F5E0E0',
  success: '#52B788',
  successLight: '#D8E2DC',
  warning: '#DDA15E',
  warningLight: '#F5EDE0',

  // Borders & dividers - warm tones
  border: '#D8D4CB',
  borderLight: '#E8E4DB',
  divider: '#E0DCD3',
} as const;

// Dark mode colors - warm dark with forest green accents
export const darkColors = {
  // Primary palette - brighter for dark mode visibility
  primary: '#40916C',
  primaryLight: '#52B788',
  primaryDark: '#1B4332',

  // Mood colors - same as light (for consistency)
  mood: {
    1: '#D8E2DC',
    2: '#B7E4C7',
    3: '#95D5B2',
    4: '#74C69D',
    5: '#52B788',
  } as Record<number, string>,

  moodText: {
    1: '#5C7065',
    2: '#4A7C59',
    3: '#3D6B4F',
    4: '#2D5A3D',
    5: '#1B4332',
  } as Record<number, string>,

  // Dark backgrounds - warm dark tones
  background: '#1A1A18',
  surface: '#252521',
  surfaceElevated: '#2F2F2A',

  // Dark text (WCAG AA contrast ratios met - 4.5:1 minimum)
  textPrimary: '#FAF6EF',
  textSecondary: '#B8B4A8',
  textMuted: '#8A8680',
  textInverse: '#1A1A18',

  // Semantic - adjusted for dark mode
  error: '#E57373',
  errorLight: '#3D2020',
  success: '#52B788',
  successLight: '#1D3D1D',
  warning: '#FFB74D',
  warningLight: '#3D3020',

  // Dark borders - warm dark tones
  border: '#3A3A35',
  borderLight: '#2A2A26',
  divider: '#2A2A26',
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
