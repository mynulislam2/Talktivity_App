import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';

const theme = {
  colors,
  spacing,
  typography,

  button: {
    primary: {
      backgroundColor: colors.brand.buttonPrimary,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: 999,
      shadowColor: colors.brand.buttonGlow,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 4,
    },
    secondary: {
      backgroundColor: 'transparent',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.borderInput,
    },
    ghost: {
      backgroundColor: 'transparent',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: 999,
    },
  },

  card: {
    base: {
      backgroundColor: colors.dark.backgroundCard,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.brand.cardBorder,
    },
  },

  input: {
    base: {
      borderWidth: 1,
      borderColor: colors.borderInput,
      borderRadius: 6,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      fontSize: 14,
      backgroundColor: colors.brand.inputBg,
      color: colors.text.primary,
    },
    error: {
      borderColor: colors.borderInputError,
      backgroundColor: colors.brand.inputErrorBg,
    },
    focused: {
      borderColor: colors.borderInputFocus,
    },
  },

  dimensions: {
    headerHeight: 56,
    tabBarHeight: 60,
    inputHeight: 42,
    buttonHeight: 42,
  },
};

export type Theme = typeof theme;
export default theme;
