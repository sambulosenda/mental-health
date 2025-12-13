/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Primary palette - healing sage green
        primary: {
          DEFAULT: '#5B8A72',
          light: '#7BA393',
          dark: '#3D6B54',
        },
        // Mood colors - warm to cool progression
        mood: {
          1: '#F2D4D4', // Dusty rose
          2: '#E8D5C4', // Warm sand
          3: '#D4E0D9', // Sage mist
          4: '#C5DDD3', // Soft mint
          5: '#A8D4C2', // Fresh eucalyptus
        },
        'mood-text': {
          1: '#8B5A5A',
          2: '#7A6555',
          3: '#4A5D53',
          4: '#3D6B54',
          5: '#2D5A47',
        },
        // Light mode backgrounds - warm off-white
        background: '#FAFAF8',
        surface: {
          DEFAULT: '#FFFFFF',
          elevated: '#FFFFFF',
        },
        // Dark mode backgrounds - warm charcoal
        'background-dark': '#141816',
        'surface-dark': {
          DEFAULT: '#1E2320',
          elevated: '#2A302C',
        },
        // Text colors - warm charcoal with hierarchy
        'text-primary': '#1F2421',
        'text-secondary': '#4A5568',
        'text-muted': '#718096',
        'text-inverse': '#FFFFFF',
        // Dark mode text - warm whites
        'text-primary-dark': '#F5F5F3',
        'text-secondary-dark': '#C4C7C5',
        'text-muted-dark': '#8A8F8C',
        // Semantic - warmer, refined
        error: {
          DEFAULT: '#D66853',
          light: '#FBEAE6',
        },
        success: {
          DEFAULT: '#5B8A72',
          light: '#E8F2ED',
        },
        warning: {
          DEFAULT: '#D4915C',
          light: '#FDF4EB',
        },
        // Borders - subtle warmth
        border: {
          DEFAULT: '#E8E6E1',
          light: '#F2F0EB',
        },
        'border-dark': {
          DEFAULT: '#2A302C',
          light: '#3A423E',
        },
        divider: '#E8E6E1',
        'divider-dark': '#2A302C',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      fontSize: {
        h1: ['32px', { lineHeight: '40px', letterSpacing: '-0.8px', fontWeight: '700' }],
        h2: ['24px', { lineHeight: '30px', letterSpacing: '-0.4px', fontWeight: '600' }],
        h3: ['18px', { lineHeight: '24px', letterSpacing: '-0.2px', fontWeight: '600' }],
        body: ['16px', { lineHeight: '24px', letterSpacing: '-0.1px', fontWeight: '400' }],
        'body-medium': ['16px', { lineHeight: '24px', letterSpacing: '-0.1px', fontWeight: '500' }],
        caption: ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'caption-medium': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        label: ['12px', { lineHeight: '16px', letterSpacing: '0.3px', fontWeight: '600' }],
      },
      boxShadow: {
        sm: '0 1px 3px rgba(31, 36, 33, 0.04)',
        md: '0 2px 6px rgba(31, 36, 33, 0.06)',
        lg: '0 8px 16px rgba(31, 36, 33, 0.08)',
        xl: '0 12px 24px rgba(31, 36, 33, 0.12)',
      },
    },
  },
  plugins: [],
};
