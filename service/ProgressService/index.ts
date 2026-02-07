import { httpService } from "../httpservice";

export interface CourseContext {
  course_id: number;
  week_number: number;
  day_number: number;
}

export interface DailyProgressRow {
  id?: number;
  user_id?: number;
  progress_date?: string;
  course_id?: number | null;
  week_number?: number | null;
  day_number?: number | null;

  speaking_completed?: boolean | null;
  speaking_started_at?: string | null;
  speaking_ended_at?: string | null;
  speaking_duration_seconds?: number | null;

  speaking_quiz_completed?: boolean | null;
  speaking_quiz_score?: number | null;

  listening_completed?: boolean | null;
  listening_quiz_completed?: boolean | null;
  listening_quiz_score?: number | null;

  roleplay_completed?: boolean | null;
  roleplay_started_at?: string | null;
  roleplay_ended_at?: string | null;
  roleplay_duration_seconds?: number | null;

  total_time_seconds?: number | null;

  created_at?: string;
  updated_at?: string;
}

export interface DailyProgressData {
  date: string;
  course: CourseContext;
  progress: DailyProgressRow | null;
  remaining?: {
    speaking_seconds: number | null;
    roleplay_seconds: number | null;
  };
}

export interface DailyProgressResponse {
  success: boolean;
  data?: DailyProgressData;
  error?: string;
  message?: string;
}

export type DailyProgressUpdates = Partial<DailyProgressRow> & { date?: string };

class ProgressService {
  /**
   * GET /api/progress/daily?date=YYYY-MM-DD
   * If date omitted, backend defaults to today.
   */
  async getDailyProgress(date?: string): Promise<DailyProgressResponse> {
    try {
      const response = await httpService.get("/progress/daily", {
        params: date ? { date } : undefined,
      });

      if (response.data?.success && response.data?.data) {
        return {
          success: true,
          data: response.data.data as DailyProgressData,
        };
      }

      if (response.data?.success === false) {
        return {
          success: false,
          error: response.data.error || response.data.message || "Failed to load daily progress",
        };
      }

      return {
        success: false,
        error: "Invalid response format from progress API",
      };
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load daily progress";

      return { success: false, error: errorMessage };
    }
  }

  /**
   * POST /api/progress/daily
   * Partial updates allowed; backend auto-fills course_id/week_number/day_number when omitted.
   */
  async updateDailyProgress(updates: DailyProgressUpdates): Promise<DailyProgressResponse> {
    try {
      const response = await httpService.post("/progress/daily", updates || {});

      if (response.data?.success && response.data?.data) {
        return {
          success: true,
          data: response.data.data as DailyProgressData,
        };
      }

      if (response.data?.success === false) {
        return {
          success: false,
          error: response.data.error || response.data.message || "Failed to save daily progress",
        };
      }

      return {
        success: false,
        error: "Invalid response format from progress API",
      };
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save daily progress";

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get today's progress using UTC date
   * Backend uses UTC for all date calculations, frontend converts to local timezone for display
   */
  async getTodayProgress(): Promise<DailyProgressResponse> {
    // Use UTC date for API calls (business logic)
    const { getUtcToday } = require('@/Utils/timezoneUtils');
    const utcDate = getUtcToday();
    
    return this.getDailyProgress(utcDate);
  }
}

export const progressService = new ProgressService();
