import { DefaultTheme } from '@react-navigation/native';

import { appNavigationTheme } from '../navigationTheme';
import { tokens } from '../tokens';

/**
 * Perceived (relative) luminance of a #rrggbb hex colour, 0-255 scale.
 * `#09090f` scores ~9 (dark); React Navigation's light DefaultTheme
 * background rgb(242,242,242) scores ~242 (light).
 */
function luminanceOf(hex: string): number {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

describe('appNavigationTheme', () => {
  it('is a dark theme', () => {
    expect(appNavigationTheme.dark).toBe(true);
  });

  it('paints the navigation surface with the app background, not light grey', () => {
    expect(appNavigationTheme.colors.background).toBe(tokens.color.bg.screen);
    expect(appNavigationTheme.colors.card).toBe(tokens.color.bg.screen);
  });

  it('uses the accent blue as the primary colour', () => {
    expect(appNavigationTheme.colors.primary).toBe(tokens.color.accent.primary);
  });

  it('uses the primary text colour for navigation text', () => {
    expect(appNavigationTheme.colors.text).toBe(tokens.color.text.primary);
  });

  it('pins the navigation background/card to the literal dark hex, independent of the token module', () => {
    expect(appNavigationTheme.colors.background).toBe('#09090f');
    expect(appNavigationTheme.colors.card).toBe('#09090f');
  });

  it('differs from React Navigation\'s light DefaultTheme background', () => {
    expect(appNavigationTheme.colors.background).not.toBe(DefaultTheme.colors.background);
  });

  it('has a dark perceived luminance for the navigation background', () => {
    expect(luminanceOf(appNavigationTheme.colors.background)).toBeLessThan(40);
  });
});
