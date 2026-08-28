import { httpService } from '../http/httpservice';
import { API_URLS } from '../urls';
import type { ReviewItemsResponse, ReviewItem } from '@/types/review';

export interface CoachAudioResponse {
  success: boolean;
  text: string;
  audioBase64: string;
  audioAvailable?: boolean;
}

class ReviewService {
  async fetchReviewItems(): Promise<ReviewItemsResponse> {
    try {
      const response = await httpService.post(API_URLS.REVIEW.ITEMS, {});
      const data = response.data as {
        success: boolean;
        reviewItems: ReviewItem[];
      };

      if (!data.success || !data.reviewItems) {
        return {
          success: false,
          reviewItems: [],
          error: 'Failed to generate review items',
        };
      }

      return {
        success: true,
        reviewItems: data.reviewItems,
      };
    } catch (error: any) {
      return {
        success: false,
        reviewItems: [],
        error:
          error?.response?.data?.error ||
          error?.message ||
          'Failed to fetch review items',
      };
    }
  }

  async greet(reviewItems: ReviewItem[]): Promise<CoachAudioResponse> {
    try {
      const response = await httpService.post(API_URLS.REVIEW.GREET, {
        reviewItems,
      });
      return response.data as CoachAudioResponse;
    } catch {
      return {
        success: false,
        text: "Hey there! Let's review your recent mistakes together. Ready? Let's go!",
        audioBase64: '',
        audioAvailable: false,
      };
    }
  }

  async feedback(params: {
    userAnswer: string;
    corrected: string;
    original: string;
    isValid: boolean;
    cardIndex: number;
    totalCards: number;
  }): Promise<CoachAudioResponse> {
    try {
      const response = await httpService.post(API_URLS.REVIEW.FEEDBACK, params);
      return response.data as CoachAudioResponse;
    } catch {
      const fallbackText = params.isValid
        ? "Great job! Let's move on to the next one."
        : 'Not quite right. Try saying it one more time.';
      return {
        success: false,
        text: fallbackText,
        audioBase64: '',
        audioAvailable: false,
      };
    }
  }
}

export const reviewService = new ReviewService();
export { ReviewService };
