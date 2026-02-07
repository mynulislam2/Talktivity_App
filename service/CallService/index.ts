/**
 * Call Service
 * 
 * Handles all call-related operations including call status, eligibility checks,
 * and session management.
 * 
 * This service acts as the data access layer for call operations, managing
 * API calls to GET /api/call/status. State management is handled by Redux.
 */

import { httpService } from '../httpservice';
import {
  CallStatusApiResponse,
  CallStatusResponse,
} from '@/types/call';
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
      const response = await httpService.get('/call/status');
      
      // Backend returns { success: true, data: { ... }, meta: { ... } }
      if (response.data && response.data.success && response.data.data) {
        return {
          success: true,
          data: response.data.data as CallStatusResponse,
        };
      }

      // Fallback: if response structure is different (direct data)
      if (response.data && typeof response.data === 'object' && !response.data.success) {
        return {
          success: true,
          data: response.data as CallStatusResponse,
        };
      }

      throw new Error('Invalid response format from call status API');
    } catch (error) {
      const callError = toCallError(error);
      throw callError;
    }
  }
}

export const callService = new CallService();
