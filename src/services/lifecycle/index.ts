/**
 * Lifecycle Service (React Native)
 *
 * Handles lifecycle state management including onboarding status.
 */

import { httpService } from '../http/httpservice';
import { API_URLS } from '../urls';

export interface LifecycleResponse {
  success: boolean;
  data?: {
    onboarding?: {
      completed?: boolean;
      steps?: number;
      data?: Record<string, unknown> | null;
    };
    milestones?: Record<string, boolean>;
  };
  error?: string;
}

class LifecycleService {
  async getLifecycle(): Promise<LifecycleResponse> {
    try {
      const response = await httpService.get(API_URLS.LIFECYCLE);
      if (response.data && response.data.success && response.data.data) {
        return {
          success: true,
          data: response.data.data as LifecycleResponse['data'],
        };
      }
      return { success: false, error: 'Failed to load lifecycle state.' };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          'Failed to load lifecycle state.',
      };
    }
  }
}

export const lifecycleService = new LifecycleService();
