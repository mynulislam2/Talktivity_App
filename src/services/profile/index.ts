/**
 * Profile Service
 *
 * Handles user profile data fetching and management.
 * Uses the /api/auth/me endpoint to get current user information.
 */

import { httpService } from '../http/httpservice';
import { lifecycleService } from '../lifecycle';
import { API_URLS } from '@/services/urls';

export interface ProfileData {
  id: number;
  email: string;
  full_name: string;
  profile_picture?: string;
  startingLevel?: string;
  created_at?: string;
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
      const response = await httpService.get(API_URLS.AUTH.ME);
      const lifecycleResponse = await lifecycleService
        .getLifecycle()
        .catch(() => null);
      const startingLevel =
        (lifecycleResponse?.data?.onboarding?.data?.current_level as string) ??
        null;

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
            startingLevel: startingLevel || undefined,
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
            startingLevel: startingLevel || undefined,
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
        error:
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.message ||
          'Failed to load profile',
      };
    }
  }

  async updateProfile(data: Partial<ProfileData>): Promise<ProfileResponse> {
    try {
      const response = await httpService.put(API_URLS.AUTH.PROFILE, data);
      if (response.data?.success) {
        return { success: true, data: response.data.data };
      }
      return {
        success: false,
        error: response.data?.error || 'Failed to update profile',
      };
    } catch (error: any) {
      return {
        success: false,
        error:
          error?.response?.data?.error ||
          error?.message ||
          'Failed to update profile',
      };
    }
  }

  async updateProfilePicture(uri: string): Promise<ProfileResponse> {
    try {
      const formData = new FormData();
      const filename = uri.split('/').pop() || 'profile.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('profile_picture', {
        uri,
        name: filename,
        type,
      } as any);

      const response = await httpService.post(
        API_URLS.AUTH.PROFILE_PICTURE,
        formData
      );

      if (response.data?.success) {
        return { success: true, data: response.data.data };
      }
      return {
        success: false,
        error: response.data?.error || 'Failed to update profile picture',
      };
    } catch (error: any) {
      return {
        success: false,
        error:
          error?.response?.data?.error ||
          error?.message ||
          'Failed to update profile picture',
      };
    }
  }
}

// Export singleton instance for app usage
export const profileService = ProfileService.getInstance();
export { ProfileService };
