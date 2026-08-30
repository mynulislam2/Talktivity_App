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

  /**
   * Short-lived signed URL for the practice recording a review card points at,
   * so the learner can hear the moment they made the mistake. Returns null
   * whenever playback is unavailable — no recording bucket, recording already
   * expired, or the room isn't theirs — so callers just hide the control.
   */
  async recordingUrl(roomName: string): Promise<string | null> {
    try {
      const response = await httpService.get(
        `${API_URLS.REVIEW.RECORDING}?roomName=${encodeURIComponent(roomName)}`
      );
      const data = response.data as { available?: boolean; url?: string };
      return data?.available && data.url ? data.url : null;
    } catch (err: any) {
      console.warn('[ReviewService] recordingUrl failed:', err?.message);
      return null;
    }
  }

  async evaluateAudio(params: {
    audioBase64: string;
    mimeType?: string;
    original: string;
    corrected: string;
    explanation?: string;
    cardIndex: number;
    totalCards: number;
  }): Promise<{
    success: boolean;
    isValid: boolean;
    accuracyScore: number;
    userSpokenText: string;
    feedbackText: string;
    audioBase64: string;
    audioAvailable: boolean;
  }> {
    try {
      const response = await httpService.post(API_URLS.REVIEW.EVALUATE_AUDIO, {
        audio: params.audioBase64,
        mimeType: params.mimeType || 'audio/m4a',
        original: params.original,
        corrected: params.corrected,
        explanation: params.explanation || '',
        cardIndex: params.cardIndex,
        totalCards: params.totalCards,
      });
      return response.data;
    } catch (err: any) {
      console.warn('[ReviewService] evaluateAudio failed:', err?.message);
      return {
        success: false,
        isValid: false,
        accuracyScore: 0,
        userSpokenText: '',
        feedbackText: "I couldn't hear clearly. Please try saying it one more time.",
        audioBase64: '',
        audioAvailable: false,
      };
    }
  }
}

export const reviewService = new ReviewService();
export { ReviewService };
