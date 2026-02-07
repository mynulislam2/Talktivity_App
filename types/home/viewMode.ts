/**
 * Home View Mode Types
 * 
 * Defines the view modes available on the home page.
 */

export type HomeViewMode = 'today' | 'timeline';

export const HOME_VIEW_MODES = {
  TODAY: 'today' as const,
  TIMELINE: 'timeline' as const,
} as const;

export const DEFAULT_VIEW_MODE: HomeViewMode = 'today';
