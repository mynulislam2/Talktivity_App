import { httpService } from '../httpservice';

type SuccessEnvelope<T> = { success: boolean; data: T; message?: string };

export interface AdminRegistrationPayload {
  email: string;
  password: string;
  full_name: string;
  adminToken: string;
}

export interface AdminRegistrationResponse {
  success: boolean;
  message?: string;
}

class AdminRegistrationService {
  /**
   * Lightweight client-side token validation (server must still validate).
   * If you add a backend endpoint later, swap this to an API call.
   */
  async validateAdminToken(token: string): Promise<boolean> {
    return typeof token === 'string' && token.trim().length >= 10;
  }

  /**
   * Attempts to register an admin via a backend endpoint (if present).
   * Backend may be implemented as /api/auth/admin-register in the future.
   */
  async register(payload: AdminRegistrationPayload): Promise<AdminRegistrationResponse> {
    try {
      const response = await httpService.post('/auth/admin-register', payload);
      const ok = !!response.data?.success;
      return {
        success: ok,
        message: response.data?.message,
      };
    } catch (error: any) {
      // Preserve axios-style errors for the page to interpret
      throw error;
    }
  }
}

export const adminRegistrationService = new AdminRegistrationService();

