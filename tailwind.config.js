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
        // Primary palette - soft blue & lavender
        primary: {
          DEFAULT: '#A9C9FF',
          light: '#C7B8FF',
          dark: '#9B8CFF',
        },
        // Mood colors - calming gradient
        mood: {
          1: '#FFE4EC',
          2: '#F2C7FF',
          3: '#C7B8FF',
          4: '#B8D4FF',
          5: '#A9C9FF',
        },
        'mood-text': {
          1: '#8B5A6B',
          2: '#7B5A8B',
          3: '#5A5A8B',
          4: '#4A6A8B',
          5: '#3A5A7B',
        },
        // Light mode backgrounds - gentle gray
        background: '#F7F8FA',
        surface: {
          DEFAULT: '#FFFFFF',
          elevated: '#FFFFFF',
        },
        // Dark mode backgrounds - calm charcoal
        'background-dark': '#1A1D24',
        'surface-dark': {
          DEFAULT: '#2F3441',
          elevated: '#3A3F4C',
        },
        // Text colors
        'text-primary': '#2F3441',
        'text-secondary': '#5A6170',
        'text-muted': '#8A8F9C',
        'text-inverse': '#FFFFFF',
        // Dark mode text
        'text-primary-dark': '#F7F8FA',
        'text-secondary-dark': '#B8BCC5',
        'text-muted-dark': '#8A8F9C',
        // Semantic
        error: {
          DEFAULT: '#E57373',
          light: '#FFEBEE',
        },
        success: {
          DEFAULT: '#81C784',
          light: '#E8F5E9',
        },
        warning: {
          DEFAULT: '#FFB74D',
          light: '#FFF3E0',
        },
        // Borders
        border: {
          DEFAULT: '#E4E6EB',
          light: '#F0F2F5',
        },
        'border-dark': {
          DEFAULT: '#3A3F4C',
          light: '#4A4F5C',
        },
        divider: '#EBEDF0',
        'divider-dark': '#3A3F4C',
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
        sm: '0 1px 2px rgba(47, 52, 65, 0.05)',
        md: '0 2px 4px rgba(47, 52, 65, 0.08)',
        lg: '0 4px 8px rgba(47, 52, 65, 0.1)',
      },
    },
  },
  plugins: [],
};
