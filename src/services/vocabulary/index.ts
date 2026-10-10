/**
 * Vocabulary Coach Service (Mobile App)
 * Handles Vocabulary Coach API communication and backwards-compatible legacy calls
 */

import { httpService } from '../http/httpservice';
import { API_URLS } from '../urls';
import type {
  VocabularyTopic,
  VocabularyCategoryGroup,
  VocabularyWordItem,
  VocabularyHomeData,
  VocabularyTopicDetailData,
  PracticeRecordResult,
  ToggleSaveResult,
} from '@/types/vocabulary';

export type VocabularyWord = {
  id: number;
  word: string;
  definition?: string;
  example?: string;
  meaning_bn?: string;
  example_en?: string;
  example_bn?: string;
  word_order?: number;
  created_at?: string;
  [key: string]: any;
};

export type LegacyVocabularyWord = VocabularyWord;

export interface VocabularyResponse {
  success: boolean;
  data?: {
    words: LegacyVocabularyWord[];
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
   * GET /api/vocabulary/home
   */
  async getHome(): Promise<{ success: boolean; data?: VocabularyHomeData; error?: string }> {
    try {
      const res = await httpService.get(API_URLS.VOCABULARY.HOME);
      if (res.data?.success && res.data?.data) {
        return { success: true, data: res.data.data };
      }
      return { success: false, error: res.data?.error || 'Failed to load vocabulary home' };
    } catch (err: any) {
      return { success: false, error: err?.response?.data?.error || err.message };
    }
  }

  /**
   * GET /api/vocabulary/topics
   */
  async getAllTopics(): Promise<{ success: boolean; data?: VocabularyCategoryGroup[]; error?: string }> {
    try {
      const res = await httpService.get(API_URLS.VOCABULARY.TOPICS);
      if (res.data?.success && res.data?.data) {
        return { success: true, data: res.data.data.categories || [] };
      }
      return { success: false, error: res.data?.error || 'Failed to load topics' };
    } catch (err: any) {
      return { success: false, error: err?.response?.data?.error || err.message };
    }
  }

  /**
   * GET /api/vocabulary/topics/:slug
   */
  async getTopicDetail(
    slug: string
  ): Promise<{ success: boolean; data?: VocabularyTopicDetailData; error?: string }> {
    try {
      const res = await httpService.get(API_URLS.VOCABULARY.TOPIC(slug));
      if (res.data?.success && res.data?.data) {
        return { success: true, data: res.data.data };
      }
      return { success: false, error: res.data?.error || 'Failed to load topic detail' };
    } catch (err: any) {
      return { success: false, error: err?.response?.data?.error || err.message };
    }
  }

  /**
   * GET /api/vocabulary/words/:id
   */
  async getWordDetail(
    id: number
  ): Promise<{ success: boolean; data?: VocabularyWordItem; error?: string }> {
    try {
      const res = await httpService.get(API_URLS.VOCABULARY.WORD(id));
      if (res.data?.success && res.data?.data) {
        return { success: true, data: res.data.data };
      }
      return { success: false, error: res.data?.error || 'Failed to load word detail' };
    } catch (err: any) {
      return { success: false, error: err?.response?.data?.error || err.message };
    }
  }

  /**
   * POST /api/vocabulary/words/:id/save
   */
  async toggleSaveWord(
    id: number
  ): Promise<{ success: boolean; data?: ToggleSaveResult; error?: string }> {
    try {
      const res = await httpService.post(API_URLS.VOCABULARY.SAVE(id), {});
      if (res.data?.success && res.data?.data) {
        return { success: true, data: res.data.data };
      }
      return { success: false, error: res.data?.error || 'Failed to toggle save' };
    } catch (err: any) {
      return { success: false, error: err?.response?.data?.error || err.message };
    }
  }

  /**
   * POST /api/vocabulary/words/:id/practice
   */
  async recordPractice(
    id: number
  ): Promise<{ success: boolean; data?: PracticeRecordResult; error?: string }> {
    try {
      const res = await httpService.post(API_URLS.VOCABULARY.PRACTICE(id), {});
      if (res.data?.success && res.data?.data) {
        return { success: true, data: res.data.data };
      }
      return { success: false, error: res.data?.error || 'Failed to record practice' };
    } catch (err: any) {
      return { success: false, error: err?.response?.data?.error || err.message };
    }
  }

  /**
   * GET /api/vocabulary/saved
   */
  async getSavedWords(): Promise<{
    success: boolean;
    data?: { total_saved: number; words: VocabularyWordItem[] };
    error?: string;
  }> {
    try {
      const res = await httpService.get(API_URLS.VOCABULARY.SAVED);
      if (res.data?.success && res.data?.data) {
        return { success: true, data: res.data.data };
      }
      return { success: false, error: res.data?.error || 'Failed to load saved words' };
    } catch (err: any) {
      return { success: false, error: err?.response?.data?.error || err.message };
    }
  }

  /**
   * GET /api/vocabulary/search?q=...
   */
  async search(
    query: string
  ): Promise<{
    success: boolean;
    data?: { topics: VocabularyTopic[]; words: VocabularyWordItem[] };
    error?: string;
  }> {
    try {
      const res = await httpService.get(API_URLS.VOCABULARY.SEARCH, { params: { q: query } });
      if (res.data?.success && res.data?.data) {
        return { success: true, data: res.data.data };
      }
      return { success: false, error: res.data?.error || 'Search failed' };
    } catch (err: any) {
      return { success: false, error: err?.response?.data?.error || err.message };
    }
  }

  // -------------------------------------------------------------
  // Legacy methods for backwards compatibility
  // -------------------------------------------------------------
  async getVocabularyByWeekAndDay(
    week?: number,
    day?: number
  ): Promise<VocabularyResponse> {
    try {
      const params: { week?: number; day?: number } = {};
      if (week !== undefined && week !== null) params.week = week;
      if (day !== undefined && day !== null) params.day = day;

      const response = await httpService.get(API_URLS.VOCABULARY.WORDS, {
        params: Object.keys(params).length > 0 ? params : undefined,
      });

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

  async markVocabularyAsCompleted(
    week?: number,
    day?: number
  ): Promise<MarkCompleteResponse> {
    try {
      const payload: { week?: number; day?: number } = {};
      if (week !== undefined && week !== null) payload.week = week;
      if (day !== undefined && day !== null) payload.day = day;

      const response = await httpService.post(
        API_URLS.VOCABULARY.COMPLETE,
        payload
      );

      if (response.data?.success !== false) {
        return {
          success: true,
        };
      }

      return {
        success: false,
        error:
          response.data?.error ||
          response.data?.message ||
          'Failed to mark vocabulary as completed',
      };
    } catch (error: any) {
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
export default vocabularyService;
