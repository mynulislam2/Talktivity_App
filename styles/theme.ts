/**
 * Theme System
 * 
 * Combines colors, spacing, and typography into a unified theme object
 */

import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';

const theme = {
  colors,
  spacing,
  typography,
  
  // Common style combinations (reusable style sets)
  button: {
    primary: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: 8,
    },
    secondary: {
      backgroundColor: 'transparent',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.primary,
    },
  },
  
  card: {
    base: {
      backgroundColor: '#fff',
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
  },
  
  input: {
    base: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      fontSize: 16,
      fontFamily: 'System',
    },
    error: {
      borderColor: colors.error,
      backgroundColor: 'rgba(244, 67, 54, 0.05)',
    },
  },
  
  spacing: {
    screenPadding: spacing.lg,
    screenPaddingVertical: spacing.lg,
    screenPaddingHorizontal: spacing.lg,
  },
  
  dimensions: {
    headerHeight: 56,
    tabBarHeight: 60,
  },
};

export type Theme = typeof theme;
export default theme;
