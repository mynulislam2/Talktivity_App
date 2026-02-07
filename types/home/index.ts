/**
 * Home Page Types
 * 
 * Central type definitions for the home page and related components.
 */

export type { HomeViewMode } from './viewMode';
export { HOME_VIEW_MODES, DEFAULT_VIEW_MODE } from './viewMode';

import type { CourseStatus } from '@/service/CourseService';

/**
 * Home data state interface
 * Represents the loading state and data for the home page
 */
export interface HomeDataState {
  isLoading: boolean;
  error: string | null;
  courseStatus: CourseStatus | null;
}
