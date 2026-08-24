import { DarkTheme, type Theme } from '@react-navigation/native';
import { tokens } from './tokens';

/**
 * Without this, NavigationContainer falls back to the light DefaultTheme
 * (background rgb(242,242,242)) and every screen that paints no background
 * of its own renders white text on near-white.
 */
export const appNavigationTheme: Theme = {
  ...DarkTheme,
  dark: true,
  colors: {
    ...DarkTheme.colors,
    primary: tokens.color.accent.primary,
    background: tokens.color.bg.screen,
    card: tokens.color.bg.screen,
    text: tokens.color.text.primary,
    border: tokens.color.border.card,
    notification: tokens.color.accent.primary,
  },
};

export default appNavigationTheme;
