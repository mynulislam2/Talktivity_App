/**
 * Profile Service
 * 
 * Handles user profile data fetching and management.
 * Uses the /api/auth/me endpoint to get current user information.
 */

import { httpService } from '../httpservice';

export interface ProfileData {
  id: number;
  email: string;
  full_name: string;
  profile_picture?: string;
  lifecycle?: {
    onboardingCompleted: boolean;
    callCompleted: boolean;
    reportCompleted: boolean;
    upgradeCompleted: boolean;
  };
}

export interface ProfileResponse {
  success: boolean;
  data?: ProfileData;
  error?: string;
}

class ProfileService {
  private static instance: ProfileService;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): ProfileService {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService();
    }
    return ProfileService.instance;
  }

  /**
   * Get current user profile
   * GET /api/auth/me
   */
  async getProfile(): Promise<ProfileResponse> {
    try {
      const response = await httpService.get('/auth/me');
      
      // Backend returns { success: true, data: { ... }, message?: string }
      if (response.data?.success && response.data?.data) {
        const userData = response.data.data;
        
        return {
          success: true,
          data: {
            id: userData.id,
            email: userData.email,
            full_name: userData.fullName || userData.full_name || '',
            profile_picture: userData.profile_picture || undefined,
            created_at: userData.created_at || undefined,
            lifecycle: userData.lifecycle || undefined,
          },
        };
      }

      // Fallback: if response structure is different (backward compatibility)
      if (response.data && !response.data.success) {
        return {
          success: true,
          data: {
            id: response.data.id,
            email: response.data.email,
            full_name: response.data.fullName || response.data.full_name || '',
            profile_picture: response.data.profile_picture || undefined,
            created_at: response.data.created_at || undefined,
            lifecycle: response.data.lifecycle || undefined,
          },
        };
      }

      return {
        success: false,
        error: 'Invalid response format',
      };
    } catch (error: any) {
      // Failed to get profile
      
      // Handle 401/403 as authentication errors
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return {
          success: false,
          error: 'Authentication required',
        };
      }

      return {
        success: false,
        error: error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Failed to load profile',
      };
    }
  }
}

// Export singleton instance for app usage
export const profileService = ProfileService.getInstance();
export { ProfileService };
