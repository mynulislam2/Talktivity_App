/**
 * Call Service
 *
 * Handles all call-related operations including call status, eligibility checks,
 * and session management.
 *
 * This service acts as the data access layer for call operations, managing
 * API calls to GET /api/call/status. State management is handled by Redux.
 */

import { httpService } from '../http/httpservice';
import { API_URLS } from '../urls';
import { CallStatusApiResponse, CallStatusResponse } from '@/types/call';
import { toCallError } from '@/lib/call/errorHandler';

class CallService {
  /**
   * Get call status including statistics, recent sessions, and lifetime eligibility
   *
   * Calls GET /api/call/status which returns:
   * - statistics: Total sessions, completed sessions, duration stats
   * - recent_sessions: Last 10 call sessions
   * - lifetime: Total duration, remaining time, canCall flag
   *
   * Note: The lifetime.canCall flag is already included in the response,
   * so no separate canStartCall() method is needed.
   *
   * @returns Promise resolving to call status response
   * @throws {CallError} If the API call fails
   */
  async getCallStatus(): Promise<CallStatusApiResponse> {
    try {
      const response = await httpService.get(API_URLS.CALL.STATUS);

      console.log('≡ƒôí [CallService] Raw call status response:', {
        hasData: !!response.data,
        hasSuccess: !!response.data?.success,
        hasDataField: !!response.data?.data,
        responseStructure: response.data ? Object.keys(response.data) : [],
      });

      // Backend returns { success: true, data: { ... }, meta: { ... } }
      if (response.data && response.data.success && response.data.data) {
        const callStatusData = response.data.data as CallStatusResponse;
        console.log('Γ£à [CallService] Parsed call status:', {
          hasLifetime: !!callStatusData?.lifetime,
          canCall: callStatusData?.lifetime?.canCall,
          remaining: callStatusData?.lifetime?.remaining,
          totalDuration: callStatusData?.lifetime?.totalDuration,
          fullLifetime: callStatusData?.lifetime,
        });
        return {
          success: true,
          data: callStatusData,
        };
      }

      // Fallback: if response structure is different (direct data)
      if (
        response.data &&
        typeof response.data === 'object' &&
        !response.data.success
      ) {
        const callStatusData = response.data as CallStatusResponse;
        console.log('Γ£à [CallService] Parsed call status (fallback):', {
          hasLifetime: !!callStatusData?.lifetime,
          canCall: callStatusData?.lifetime?.canCall,
          remaining: callStatusData?.lifetime?.remaining,
        });
        return {
          success: true,
          data: callStatusData,
        };
      }

      console.error('[CallService] Invalid response format:', response.data);
      throw new Error('Invalid response format from call status API');
    } catch (error) {
      console.error('Γ¥î [CallService] Error fetching call status:', error);
      const callError = toCallError(error);
      throw callError;
    }
  }
}

export const callService = new CallService();
