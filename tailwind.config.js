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
        // Primary palette - forest green
        primary: {
          DEFAULT: '#1B4332',
          light: '#2D6A4F',
          dark: '#0D2818',
        },
        // Mood colors - all green tones
        mood: {
          1: '#D8E2DC',
          2: '#B7E4C7',
          3: '#95D5B2',
          4: '#74C69D',
          5: '#52B788',
        },
        'mood-text': {
          1: '#5C7065',
          2: '#4A7C59',
          3: '#3D6B4F',
          4: '#2D5A3D',
          5: '#1B4332',
        },
        // Light mode backgrounds - warm cream
        background: '#FAF6EF',
        surface: {
          DEFAULT: '#FFFEFB',
          elevated: '#F0EBE3',
        },
        // Dark mode backgrounds - warm dark
        'background-dark': '#1A1A18',
        'surface-dark': {
          DEFAULT: '#252521',
          elevated: '#2F2F2A',
        },
        // Text colors
        'text-primary': '#1B4332',
        'text-secondary': '#40694D',
        'text-muted': '#6B8068',
        'text-inverse': '#FFFEFB',
        // Dark mode text
        'text-primary-dark': '#FAF6EF',
        'text-secondary-dark': '#B8B4A8',
        'text-muted-dark': '#8A8680',
        // Semantic
        error: {
          DEFAULT: '#BC4749',
          light: '#F5E0E0',
        },
        success: {
          DEFAULT: '#52B788',
          light: '#D8E2DC',
        },
        warning: {
          DEFAULT: '#DDA15E',
          light: '#F5EDE0',
        },
        // Borders - warm tones
        border: {
          DEFAULT: '#D8D4CB',
          light: '#E8E4DB',
        },
        'border-dark': {
          DEFAULT: '#3A3A35',
          light: '#2A2A26',
        },
        divider: '#E0DCD3',
        'divider-dark': '#2A2A26',
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
        h1: ['28px', { lineHeight: '36px', letterSpacing: '-0.5px', fontWeight: '600' }],
        h2: ['22px', { lineHeight: '28px', letterSpacing: '-0.3px', fontWeight: '600' }],
        h3: ['18px', { lineHeight: '24px', fontWeight: '600' }],
        body: ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-medium': ['16px', { lineHeight: '24px', fontWeight: '500' }],
        caption: ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'caption-medium': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        label: ['12px', { lineHeight: '16px', letterSpacing: '0.5px', fontWeight: '500' }],
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        md: '0 2px 4px rgba(0, 0, 0, 0.08)',
        lg: '0 4px 8px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};
