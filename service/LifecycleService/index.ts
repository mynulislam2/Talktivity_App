/**
 * Lifecycle Service
 * 
 * Handles lifecycle state management including onboarding status,
 * milestones, and user progress tracking.
 * 
 * This service acts as the data access layer for lifecycle operations,
 * managing API calls to GET /api/lifecycle.
 */

import { httpService } from '../httpservice';
import {
  LifecycleResponse,
  LifecycleResponseData,
} from '@/types/onboarding';
import { OnboardingError, OnboardingLoadError } from '@/types/onboarding/errors';

class LifecycleService {
  /**
   * Get complete user lifecycle state
   * 
   * Calls GET /api/lifecycle which returns:
   * - onboarding.completed (boolean)
   * - onboarding.steps (number - count of completed steps, 0-15)
   * - onboarding.data (object - all 15 field values or null)
   * - milestones (callCompleted, reportCompleted, upgradeCompleted)
   * - timestamps
   * 
   * @returns Promise resolving to lifecycle response
   * @throws {OnboardingLoadError} If the API call fails
   */
  async getLifecycle(): Promise<LifecycleResponse> {
    try {
      const response = await httpService.get('/lifecycle');
      console.log('📡 [LifecycleService] /lifecycle raw response:', {
        status: response?.status,
        data: response?.data,
      });
      
      // Backend returns { success: true, data: { ... }, meta: { ... } }
      if (response.data && response.data.success && response.data.data) {
        console.log('✅ [LifecycleService] Parsed lifecycle data (wrapped):', response.data.data);
        return {
          success: true,
          data: response.data.data as LifecycleResponseData,
        };
      }

      // Fallback: if response structure is different (direct data)
      if (response.data && typeof response.data === 'object' && !response.data.success) {
        console.log('✅ [LifecycleService] Parsed lifecycle data (direct):', response.data);
        return {
          success: true,
          data: response.data as LifecycleResponseData,
        };
      }

      throw new OnboardingLoadError('Invalid response format from lifecycle API');
    } catch (error: any) {
      if (error instanceof OnboardingError) {
        throw error;
      }

      // Handle 401/403 as authentication errors
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        throw new OnboardingLoadError('Authentication required');
      }

      const errorMessage = error instanceof Error 
        ? error.message 
        : error?.response?.data?.error || 'Failed to load lifecycle data';
      
      throw new OnboardingLoadError(errorMessage);
    }
  }

  /**
   * Update user lifecycle fields
   * 
   * Calls POST /api/lifecycle to update lifecycle milestones.
   * Used for updating report_completed, upgrade_completed, etc.
   * 
   * @param updates - Object with lifecycle fields to update
   * @returns Promise resolving to lifecycle response with updated data
   * @throws {OnboardingLoadError} If the API call fails
   */
  async updateLifecycle(updates: {
    report_completed?: boolean;
    upgrade_completed?: boolean;
    onboarding_completed?: boolean;
    onboarding_steps?: number;
    call_completed?: boolean;
  }): Promise<LifecycleResponse> {
    try {
      const response = await httpService.post('/lifecycle', updates);
      
      // Backend returns { success: true, data: { ... }, meta: { ... } }
      if (response.data && response.data.success && response.data.data) {
        return {
          success: true,
          data: response.data.data as LifecycleResponseData,
        };
      }

      // Fallback: if response structure is different (direct data)
      if (response.data && typeof response.data === 'object' && !response.data.success) {
        return {
          success: true,
          data: response.data as LifecycleResponseData,
        };
      }

      throw new OnboardingLoadError('Invalid response format from lifecycle API');
    } catch (error: any) {
      if (error instanceof OnboardingError) {
        throw error;
      }

      // Handle 401/403 as authentication errors
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        throw new OnboardingLoadError('Authentication required');
      }

      const errorMessage = error instanceof Error 
        ? error.message 
        : error?.response?.data?.error || 'Failed to update lifecycle data';
      
      throw new OnboardingLoadError(errorMessage);
    }
  }
}

export const lifecycleService = new LifecycleService();
