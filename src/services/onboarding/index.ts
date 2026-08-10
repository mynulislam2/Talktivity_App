/**
 * Onboarding Service (React Native)
 *
 * Handles onboarding-related operations including saving onboarding data.
 */

import { httpService } from '../http/httpservice';
import { API_URLS } from '../urls';

export interface OnboardingSaveResponse {
  success: boolean;
  data?: {
    progress?: number;
    completed?: boolean;
  };
  error?: string;
}

class OnboardingService {
  async saveOnboarding(
    data: Record<string, any>,
    userId?: string
  ): Promise<OnboardingSaveResponse> {
    try {
      const response = await httpService.post(API_URLS.ONBOARDING, data);
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data as OnboardingSaveResponse['data'],
        };
      }
      throw new Error(
        response.data?.error || 'Failed to save onboarding data.'
      );
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          'Failed to save onboarding data.',
      };
    }
  }
}

export const onboardingService = new OnboardingService();
