/**
 * Canonical design tokens, ported from talktivity_frontend.
 * Values chosen by frequency sweep of the web app's app/ + components/;
 * see superpowers/specs/2026-08-24-app-design-parity-design.md §4.
 *
 * This is the single source of truth. Do not introduce raw palette hexes
 * in screens or components — add a token here instead.
 */
export const tokens = {
  color: {
    bg: {
      screen: '#09090f',
    },
    surface: {
      card: 'rgba(255,255,255,0.10)',
      raised: 'rgba(255,255,255,0.08)',
      subtle: 'rgba(255,255,255,0.06)',
      tabbar: '#09090f',
    },
    border: {
      card: '#3d3e50',
      input: '#636363',
      hairline: 'rgba(255,255,255,0.10)',
    },
    text: {
      primary: '#fdfdfd',
      secondary: '#c6c6c6',
      placeholder: '#8c8c8c',
    },
    accent: {
      primary: '#2949ff',
      rim: '#b0c7ff',
      gradientStart: '#0e55ff',
      gradientEnd: '#c55dfe',
    },
    tab: {
      active: '#5462ff',
      inactive: '#ffffff',
    },
    state: {
      success: '#23ff7a',
      danger: '#ff2323',
      errorText: '#ff8b8b',
    },
  },
  radius: { xs: 4, sm: 6, md: 8, lg: 10, xl: 12, pill: 9999 },
  control: { height: 42 },
  layout: { maxWidth: 480, gutter: 16 },
} as const;

export default tokens;
