// Softmind Design System - Organic Tranquility Theme
// A calming sage/eucalyptus palette for mental wellness

export const colors = {
  // Primary palette - healing sage green
  primary: '#5B8A72',
  primaryLight: '#7BA393',
  primaryDark: '#3D6B54',

  // Accent - warm cream wash
  accent: '#F7F5F0',

  // Mood colors - warm to cool progression (WCAG AA compliant)
  mood: {
    1: '#F2D4D4', // Struggling - dusty rose
    2: '#E8D5C4', // Low - warm sand
    3: '#D4E0D9', // Okay - sage mist
    4: '#C5DDD3', // Good - soft mint
    5: '#A8D4C2', // Great - fresh eucalyptus
  } as Record<number, string>,

  // Mood text colors (harmonious darker versions)
  moodText: {
    1: '#8B5A5A', // Deep rose
    2: '#7A6555', // Warm brown
    3: '#4A5D53', // Forest
    4: '#3D6B54', // Sage
    5: '#2D5A47', // Deep teal
  } as Record<number, string>,

  // Backgrounds - warm off-white
  background: '#FAFAF8',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  // Text - warm charcoal with proper hierarchy
  textPrimary: '#1F2421',
  textSecondary: '#4A5568',
  textMuted: '#718096',
  textInverse: '#FFFFFF',

  // Icons
  iconPrimary: '#5B8A72',
  iconSecondary: '#718096',

  // Text/icons on colored backgrounds
  textOnPrimary: '#FFFFFF',
  textOnAccent: '#3D6B54',
  textOnMood: '#1F2421',

  // Semantic - warmer, more refined
  error: '#D66853',
  errorLight: '#FBEAE6',
  success: '#5B8A72',
  successLight: '#E8F2ED',
  warning: '#D4915C',
  warningLight: '#FDF4EB',

  // Borders & dividers - subtle warmth
  border: '#E8E6E1',
  borderLight: '#F2F0EB',
  divider: '#E8E6E1',

  // Chat bubbles
  chatBubbleAssistant: '#F0F2F5',
} as const;

// Dark mode - warm charcoal with sage accents
export const darkColors = {
  // Primary palette - luminous sage for dark mode
  primary: '#7BA393',
  primaryLight: '#A8D4C2',
  primaryDark: '#5B8A72',

  // Accent - deep forest wash
  accent: '#1A2420',

  // Mood colors - luminous versions for dark mode
  mood: {
    1: '#E8B4B4', // Dusty rose
    2: '#D4C4A8', // Warm sand
    3: '#B8D4C4', // Sage mist
    4: '#A8D4C2', // Soft mint
    5: '#8AC4AE', // Fresh eucalyptus
  } as Record<number, string>,

  moodText: {
    1: '#E8B4B4',
    2: '#D4C4A8',
    3: '#B8D4C4',
    4: '#A8D4C2',
    5: '#8AC4AE',
  } as Record<number, string>,

  // Dark backgrounds - warm charcoal
  background: '#141816',
  surface: '#1E2320',
  surfaceElevated: '#2A302C',

  // Dark text - warm whites with hierarchy
  textPrimary: '#F5F5F3',
  textSecondary: '#C4C7C5',
  textMuted: '#8A8F8C',
  textInverse: '#141816',

  // Icons - luminous for dark mode
  iconPrimary: '#7BA393',
  iconSecondary: '#8A8F8C',

  // Text/icons on colored backgrounds
  textOnPrimary: '#141816',
  textOnAccent: '#A8D4C2',
  textOnMood: '#141816',

  // Semantic - luminous for dark mode
  error: '#E8A090',
  errorLight: '#3D2420',
  success: '#7BA393',
  successLight: '#1A2C24',
  warning: '#E8B480',
  warningLight: '#2C2418',

  // Dark borders - subtle definition
  border: '#2A302C',
  borderLight: '#3A423E',
  divider: '#2A302C',

  // Chat bubbles
  chatBubbleAssistant: '#1E2320', // Same as surface in dark mode
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
  // Headers - refined tracking for professional feel
  h1: {
    fontFamily: systemFont,
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: -0.8,
  },
  h2: {
    fontFamily: systemFont,
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 30,
    letterSpacing: -0.4,
  },
  h3: {
    fontFamily: systemFont,
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  // Body - optimized for readability
  body: {
    fontFamily: systemFont,
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    letterSpacing: -0.1,
  },
  bodyMedium: {
    fontFamily: systemFont,
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
    letterSpacing: -0.1,
  },
  // Small - slightly tighter for compact display
  caption: {
    fontFamily: systemFont,
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0,
  },
  captionMedium: {
    fontFamily: systemFont,
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
    letterSpacing: 0,
  },
  // Tiny - used for labels and badges
  label: {
    fontFamily: systemFont,
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 0.3,
    textTransform: 'uppercase' as const,
  },
} as const;

export const shadows = {
  // Subtle elevation for cards
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  // Standard card elevation
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  // Elevated elements like modals
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  // Floating elements
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
} as const;

// Card shadow helper - returns appropriate shadow for light/dark mode
export const getCardShadow = (isDark: boolean) => ({
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: isDark ? 0.3 : 0.04,
  shadowRadius: 8,
  elevation: 2,
});

// Subtle card border for light mode definition
export const getCardBorder = (isDark: boolean) =>
  isDark
    ? {}
    : {
        borderWidth: 0.5,
        borderColor: 'rgba(0,0,0,0.04)',
      };

// Consistent press animation scale
export const pressAnimation = {
  scale: 0.97,
  springConfig: { damping: 20, stiffness: 400 },
} as const;

// Mood labels for accessibility
export const moodLabels: Record<number, { label: string; description: string }> = {
  1: { label: 'Rough', description: 'Having a hard time right now' },
  2: { label: 'Low', description: 'Not feeling my best' },
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
