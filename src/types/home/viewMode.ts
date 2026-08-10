/**
 * Home View Mode Types
 *
 * Defines the view modes available on the home page.
 */

export type HomeViewMode = 'dashboard' | 'today' | 'timeline';

export const HOME_VIEW_MODES = {
  DASHBOARD: 'dashboard' as const,
  TODAY: 'today' as const,
  TIMELINE: 'timeline' as const,
} as const;

export const DEFAULT_VIEW_MODE: HomeViewMode = 'dashboard';
