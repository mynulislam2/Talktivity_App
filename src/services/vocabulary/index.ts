/**
 * Vocabulary Service
 *
 * Handles vocabulary word fetching and completion tracking.
 * Manages vocabulary words for specific weeks and days.
 */

import { httpService } from '../http/httpservice';
import { API_URLS } from '../urls';

export interface VocabularyWord {
  id: number;
  word: string;
  definition?: string;
  example?: string;
  meaning_bn: string;
  example_en: string;
  example_bn: string;
  word_order: number;
  created_at?: string;
}

export interface VocabularyResponse {
  success: boolean;
  data?: {
    words: VocabularyWord[];
    isCompleted: boolean;
    week: number;
    day: number;
    totalWords: number;
    courseId?: number;
  };
  error?: string;
}

export interface MarkCompleteResponse {
  success: boolean;
  error?: string;
}

class VocabularyService {
  /**
   * Get vocabulary words for a specific week and day
   * GET /api/vocabulary/words?week={week}&day={day}
   * If week/day not provided, backend uses course's current week/day
   */
  async getVocabularyByWeekAndDay(
    week?: number,
    day?: number
  ): Promise<VocabularyResponse> {
    try {
      // Build query params - only include if provided
      const params: { week?: number; day?: number } = {};
      if (week !== undefined && week !== null) params.week = week;
      if (day !== undefined && day !== null) params.day = day;

      const response = await httpService.get(API_URLS.VOCABULARY.WORDS, {
        params: Object.keys(params).length > 0 ? params : undefined,
      });

      // Backend returns { success: true, data: { ... } }
      if (response.data?.success && response.data?.data) {
        const data = response.data.data;

        return {
          success: true,
          data: {
            words: Array.isArray(data.words) ? data.words : [],
            isCompleted: Boolean(data.isCompleted),
            week: data.week || week || 0,
            day: data.day || day || 0,
            totalWords: data.totalWords || data.words?.length || 0,
            courseId: data.courseId,
          },
        };
      }

      // Handle error response from backend
      if (response.data?.success === false) {
        return {
          success: false,
          error:
            response.data.error ||
            response.data.message ||
            'Failed to load vocabulary',
        };
      }

      return {
        success: false,
        error: 'Invalid response format from server',
      };
    } catch (error: any) {
      // Failed to get vocabulary

      // Handle 404 as no vocabulary found (graceful degradation)
      if (error?.response?.status === 404) {
        return {
          success: true,
          data: {
            words: [],
            isCompleted: false,
            week: week || 0,
            day: day || 0,
            totalWords: 0,
          },
        };
      }

      // Extract error message from various possible locations
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'Failed to load vocabulary';

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Mark vocabulary as completed for a specific week and day
   * POST /api/vocabulary/complete
   * If week/day not provided, backend uses course's current week/day
   */
  async markVocabularyAsCompleted(
    week?: number,
    day?: number
  ): Promise<MarkCompleteResponse> {
    try {
      // Build payload - only include if provided
      const payload: { week?: number; day?: number } = {};
      if (week !== undefined && week !== null) payload.week = week;
      if (day !== undefined && day !== null) payload.day = day;

      const response = await httpService.post(
        API_URLS.VOCABULARY.COMPLETE,
        payload
      );

      // Backend returns { success: true, data: { ... } }
      if (response.data?.success !== false) {
        return {
          success: true,
        };
      }

      // Handle error response from backend
      return {
        success: false,
        error:
          response.data?.error ||
          response.data?.message ||
          'Failed to mark vocabulary as completed',
      };
    } catch (error: any) {
      // Failed to mark vocabulary as completed

      // Extract error message from various possible locations
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'Failed to mark vocabulary as completed';

      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}

export const vocabularyService = new VocabularyService();
