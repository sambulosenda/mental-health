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
        // Primary palette
        primary: {
          DEFAULT: '#6B8E8E',
          light: '#A8C5C5',
          dark: '#4A6B6B',
        },
        // Mood colors
        mood: {
          1: '#E8B4B4',
          2: '#E8D4B4',
          3: '#E8E4B4',
          4: '#C4E8B4',
          5: '#B4D4E8',
        },
        'mood-text': {
          1: '#8B5A5A',
          2: '#8B7A5A',
          3: '#7B7A4A',
          4: '#5A7B5A',
          5: '#5A6A7B',
        },
        // Light mode backgrounds
        background: '#FAFAFA',
        surface: {
          DEFAULT: '#FFFFFF',
          elevated: '#F5F5F5',
        },
        // Dark mode backgrounds
        'background-dark': '#121212',
        'surface-dark': {
          DEFAULT: '#1E1E1E',
          elevated: '#2A2A2A',
        },
        // Text colors
        'text-primary': '#2C3E3E',
        'text-secondary': '#5A6B6B',
        'text-muted': '#8A9A9A',
        'text-inverse': '#FFFFFF',
        // Dark mode text
        'text-primary-dark': '#FAFAFA',
        'text-secondary-dark': '#B0B0B0',
        'text-muted-dark': '#707070',
        // Semantic
        error: {
          DEFAULT: '#D47979',
          light: '#F5E0E0',
        },
        success: {
          DEFAULT: '#79B47F',
          light: '#E0F5E2',
        },
        warning: {
          DEFAULT: '#D4A979',
          light: '#F5EDE0',
        },
        // Borders
        border: {
          DEFAULT: '#E5E8E8',
          light: '#F0F2F2',
        },
        'border-dark': {
          DEFAULT: '#3A3A3A',
          light: '#2A2A2A',
        },
        divider: '#E8EBEB',
        'divider-dark': '#2A2A2A',
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
