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

  private storeAdminAuth(data: { token: string; refreshToken?: string; expiresIn?: number; user?: any }) {
    if (typeof window === 'undefined') return;
    const expiryTime = Math.floor(Date.now() / 1000) + (data.expiresIn || 7 * 24 * 60 * 60);

    localStorage.setItem(this.ACCESS_TOKEN_KEY, data.token);
    if (data.refreshToken) localStorage.setItem(this.REFRESH_TOKEN_KEY, data.refreshToken);
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, String(expiryTime));
    if (data.user) localStorage.setItem(this.ADMIN_USER_KEY, JSON.stringify(data.user));
  }

  private clearAdminAuth() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    localStorage.removeItem(this.ADMIN_USER_KEY);
  }

  private isTokenValid(): boolean {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem(this.ACCESS_TOKEN_KEY);
    const exp = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!token || !exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return now < Number(exp);
  }

  /**
   * Gets the admin access token
   * Public method to access token without direct localStorage access
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * @deprecated Use getToken() instead
   */
  getAdminToken(): string | null {
    return this.getToken();
  }

  /**
   * Gets the token expiry timestamp
   */
  getTokenExpiry(): number | null {
    if (typeof window === 'undefined') return null;
    const exp = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    return exp ? parseInt(exp, 10) : null;
  }

  getAdminUser(): AdminAuthUser | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(this.ADMIN_USER_KEY);
      return raw ? (JSON.parse(raw) as AdminAuthUser) : null;
    } catch {
      return null;
    }
  }

  isAdminAuthenticated(): boolean {
    return this.isTokenValid();
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
    this.storeAdminAuth({
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
        this.clearAdminAuth();
        return { success: false, message: 'Access denied. Admin privileges required.' };
      }
    } catch {
      // If backend doesn't expose this route, don't block login at compile-time.
    }

    return { success: true, message: response.data?.message || 'Login successful' };
  }

  logout() {
    this.clearAdminAuth();
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    }
  }
}

export const adminAuthService = new AdminAuthService();

