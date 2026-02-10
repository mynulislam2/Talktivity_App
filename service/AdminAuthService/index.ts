import AsyncStorage from '@react-native-async-storage/async-storage';
import { httpService } from '../httpservice';

type SuccessEnvelope<T> = { success: boolean; data: T; message?: string };

export interface AdminAuthUser {
  id?: number;
  email?: string;
  full_name?: string;
  is_admin?: boolean;
  [key: string]: any;
}

export interface AdminAuthResponse {
  success: boolean;
  message?: string;
}

class AdminAuthService {
  private readonly ACCESS_TOKEN_KEY = 'adminAccessToken';
  private readonly REFRESH_TOKEN_KEY = 'adminRefreshToken';
  private readonly TOKEN_EXPIRY_KEY = 'adminTokenExpiry';
  private readonly ADMIN_USER_KEY = 'adminUser';

  private async storeAdminAuth(data: { token: string; refreshToken?: string; expiresIn?: number; user?: any }) {
    const expiryTime = Math.floor(Date.now() / 1000) + (data.expiresIn || 7 * 24 * 60 * 60);

    await AsyncStorage.setItem(this.ACCESS_TOKEN_KEY, data.token);
    if (data.refreshToken) await AsyncStorage.setItem(this.REFRESH_TOKEN_KEY, data.refreshToken);
    await AsyncStorage.setItem(this.TOKEN_EXPIRY_KEY, String(expiryTime));
    if (data.user) await AsyncStorage.setItem(this.ADMIN_USER_KEY, JSON.stringify(data.user));
  }

  private async clearAdminAuth() {
    await AsyncStorage.multiRemove([
      this.ACCESS_TOKEN_KEY,
      this.REFRESH_TOKEN_KEY,
      this.TOKEN_EXPIRY_KEY,
      this.ADMIN_USER_KEY,
    ]);
  }

  private async isTokenValid(): Promise<boolean> {
    const token = await AsyncStorage.getItem(this.ACCESS_TOKEN_KEY);
    const exp = await AsyncStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!token || !exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return now < Number(exp);
  }

  /**
   * Gets the admin access token
   * Public method to access token without direct storage access
   */
  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * @deprecated Use getToken() instead
   */
  async getAdminToken(): Promise<string | null> {
    return await this.getToken();
  }

  /**
   * Gets the token expiry timestamp
   */
  async getTokenExpiry(): Promise<number | null> {
    const exp = await AsyncStorage.getItem(this.TOKEN_EXPIRY_KEY);
    return exp ? parseInt(exp, 10) : null;
  }

  async getAdminUser(): Promise<AdminAuthUser | null> {
    try {
      const raw = await AsyncStorage.getItem(this.ADMIN_USER_KEY);
      return raw ? (JSON.parse(raw) as AdminAuthUser) : null;
    } catch {
      return null;
    }
  }

  async isAdminAuthenticated(): Promise<boolean> {
    return await this.isTokenValid();
  }

  /**
   * Uses the standard auth login endpoint, then stores the token under admin keys.
   * If the backend supports admin status checking, we validate it via /api/admin/check-admin-status.
   */
  async login(email: string, password: string): Promise<AdminAuthResponse> {
    const response = await httpService.post('/auth/login', { email, password });

    const backendData =
      (response.data as SuccessEnvelope<{ token: string; refreshToken?: string; expiresIn?: number; user?: any }>)?.data ??
      response.data?.data ??
      null;

    if (!response.data?.success || !backendData?.token) {
      return { success: false, message: response.data?.message || 'Admin login failed' };
    }

    // Store as admin session
    await this.storeAdminAuth({
      token: backendData.token,
      refreshToken: backendData.refreshToken,
      expiresIn: backendData.expiresIn,
      user: backendData.user,
    });

    // Optional: verify admin status (if endpoint exists); if not, keep session.
    try {
      const check = await httpService.get('/check-admin-status', { serviceType: 'admin' });
      const isAdmin =
        (check.data as SuccessEnvelope<{ isAdmin: boolean }>)?.data?.isAdmin ??
        check.data?.data?.isAdmin ??
        false;

      if (!isAdmin) {
        await this.clearAdminAuth();
        return { success: false, message: 'Access denied. Admin privileges required.' };
      }
    } catch {
      // If backend doesn't expose this route, don't block login at compile-time.
    }

    return { success: true, message: response.data?.message || 'Login successful' };
  }

  async logout() {
    await this.clearAdminAuth();
  }
}

export const adminAuthService = new AdminAuthService();

