import { httpService } from '../http/httpservice';
import { API_URLS } from '../urls';
import type {
  GrammarHubData,
  GrammarTopic,
  GrammarLesson,
  GrammarQuizQuestion,
  GrammarQuizResult,
  QuizSubmissionAnswer,
} from '@/types/grammar';

class GrammarService {
  async getHub(): Promise<{ success: boolean; data?: GrammarHubData; error?: string }> {
    try {
      const res = await httpService.get(API_URLS.GRAMMAR.HUB);
      const payload = (res.data as any)?.data ?? res.data;
      return { success: true, data: payload };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data?.error || err.message || 'Failed to load Grammar Hub',
      };
    }
  }

  async getTopic(slug: string): Promise<{ success: boolean; data?: GrammarTopic; error?: string }> {
    try {
      const res = await httpService.get(API_URLS.GRAMMAR.TOPIC(slug));
      const payload = (res.data as any)?.data ?? res.data;
      return { success: true, data: payload };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data?.error || err.message || 'Failed to load topic details',
      };
    }
  }

  async getLessons(slug: string): Promise<{
    success: boolean;
    data?: { topic: GrammarTopic; lessons: GrammarLesson[]; totalSteps: number };
    error?: string;
  }> {
    try {
      const res = await httpService.get(API_URLS.GRAMMAR.LESSONS(slug));
      const payload = (res.data as any)?.data ?? res.data;
      return { success: true, data: payload };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data?.error || err.message || 'Failed to load lessons',
      };
    }
  }

  async completeLessons(slug: string): Promise<{ success: boolean; error?: string }> {
    try {
      await httpService.post(API_URLS.GRAMMAR.COMPLETE_LESSONS(slug), {});
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data?.error || err.message || 'Failed to update lesson completion',
      };
    }
  }

  async getQuiz(slug: string): Promise<{
    success: boolean;
    data?: { topic: GrammarTopic; questions: GrammarQuizQuestion[]; totalQuestions: number };
    error?: string;
  }> {
    try {
      const res = await httpService.get(API_URLS.GRAMMAR.QUIZ(slug));
      const payload = (res.data as any)?.data ?? res.data;
      return { success: true, data: payload };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data?.error || err.message || 'Failed to load quiz',
      };
    }
  }

  async submitQuiz(
    slug: string,
    answers: QuizSubmissionAnswer[]
  ): Promise<{ success: boolean; data?: GrammarQuizResult; error?: string }> {
    try {
      const res = await httpService.post(API_URLS.GRAMMAR.SUBMIT_QUIZ(slug), { answers });
      const payload = (res.data as any)?.data ?? res.data;
      return { success: true, data: payload };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data?.error || err.message || 'Failed to submit quiz',
      };
    }
  }
}

export const grammarService = new GrammarService();
