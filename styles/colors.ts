/**
 * Color Palette
 * 
 * Centralized color definitions for consistent theming
 */

export const colors = {
  // Primary colors (matching Next.js purple branding)
  primary: '#6A5AE0',
  primaryLight: '#7B70FF', // Lighter purple for gradients
  primaryDark: '#5A4BC0',

  // Secondary colors
  secondary: '#FF9800',
  secondaryLight: '#FFE0B2',
  secondaryDark: '#E65100',

  // Success/Warning/Error
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',

  // Neutral
  black: '#000000',
  white: '#FFFFFF',
  gray: {
    50: '#F5F5F5',
    100: '#EEEEEE',
    200: '#E0E0E0',
    300: '#BDBDBD',
    400: '#9E9E9E',
    500: '#757575',
    600: '#616161',
    700: '#424242',
    800: '#212121',
    900: '#121212',
  },

  // Dark theme colors (matching Next.js app)
  dark: {
    background: '#161823', // Primary dark background (matches Next.js)
    backgroundAlt: '#1E2029', // Secondary dark background
    backgroundCard: '#1E2029', // Card background
    backgroundHover: '#2a2e38', // Hover state
    backgroundDeep: '#18143a', // Deep dark
  },

  // Slate colors (for text and UI elements in dark mode)
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1', // Secondary text in dark mode
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },

  // Blue shades (for gradient and accents)
  blue: {
    400: '#60a5fa',
    500: '#3b82f6', // Primary blue accent
    600: '#2563eb',
    700: '#1d4ed8', // Dark blue for gradients
  },

  // Purple shades (matching Next.js brand colors)
  purple: {
    400: '#7B70FF', // Light purple (brand color)
    500: '#6A5AE0', // Primary purple (brand color)
    600: '#5A4BC0', // Dark purple
    700: '#4A3BA0', // Darker purple
  },

  // Pink/Magenta (for accent gradients)
  pink: {
    500: '#ec4899',
    600: '#db2777',
  },

  // Text colors
  text: {
    primary: '#000000',
    secondary: '#666666',
    tertiary: '#999999',
    disabled: '#CCCCCC',
  },

  // Dark mode text colors
  textDark: {
    primary: '#FFFFFF',
    secondary: '#cbd5e1', // slate-300
    tertiary: '#94a3b8', // slate-400
    disabled: '#64748b', // slate-500
  },

  // Background
  background: '#FFFFFF',
  backgroundAlt: '#F5F5F5',

  // Border
  border: '#E0E0E0',
  borderLight: '#F0F0F0',

  // Dark mode borders
  borderDark: '#334155', // slate-700
  borderDarkLight: '#475569', // slate-600
};

export default colors;
