/**
 * Progress Types
 */

import type { CourseStatus, CourseAnalytics, MonthlyReport } from '@/service/CourseService';

export interface ProgressStats {
  courseStatus: CourseStatus | null;
  courseProgress: CourseAnalytics | null;
  monthlyReport: MonthlyReport | null;
}

// Re-export for convenience
export type { CourseAnalytics, MonthlyReport };
