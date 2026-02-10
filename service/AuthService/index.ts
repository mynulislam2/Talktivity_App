/**
 * Authentication Service
 * 
 * Handles all authentication-related operations including login, registration,
 * OAuth, token management, and user state queries.
 * 
 * This service acts as the data access layer for authentication, managing
 * API calls and localStorage operations. State management is handled by Redux.
 */

import { httpService } from '../httpservice';
import {
  LoginRequest,
  RegisterRequest,
  GoogleOAuthRequest,
  RefreshTokenRequest,
  AuthResponse,
  RefreshTokenResponse,
  User,
  AuthResponseData,
} from '@/types/auth';
import { toAuthError } from '@/lib/auth/errorHandler';
import { asyncStorageManager } from '@/lib/auth/asyncStorageManager';

class AuthService {
  // Storage keys - keeping them for reference but using asyncStorageManager mostly
  private readonly ACCESS_TOKEN_KEY = 'token';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly TOKEN_EXPIRY_KEY = 'tokenExpiry';
  private readonly USER_KEY = 'user';
  
  // Guard against multiple simultaneous logout calls
  private isLoggingOut = false;

  /**
   * Stores authentication data
   * @private
   */
  private async storeAuthData(data: AuthResponseData): Promise<void> {
    try {
      await asyncStorageManager.storeAuthData(data);
    } catch (error) {
      // Failed to store auth data
      throw new Error('Failed to store authentication data');
    }
  }

  /**
   * Clears all authentication data
   * @private
   */
  private async clearAuthData(): Promise<void> {
    try {
      await asyncStorageManager.clearAuthData();
    } catch (error) {
      // Failed to clear auth data
    }
  }

  /**
   * Gets stored access token
   * @private
   */
  private async getStoredToken(): Promise<string | null> {
    return await asyncStorageManager.getToken();
  }

  /**
   * Gets stored user
   * @private
   */
  private async getStoredUser(): Promise<User | null> {
    return await asyncStorageManager.getUser();
  }

  /**
   * Checks if the stored token is valid (not expired)
   * @private
   */
  private async isTokenValid(): Promise<boolean> {
    try {
      const expiryTime = await asyncStorageManager.getTokenExpiry();
      if (!expiryTime) return false;

      const currentTime = Math.floor(Date.now() / 1000);
      
      return currentTime < expiryTime;
    } catch (error) {
      // Failed to check token validity
      return false;
    }
  }

  /**
   * Authenticates a user with email and password
   * 
   * @param credentials - User login credentials
   * @returns Promise resolving to authentication response with tokens and user data
   * @throws {AuthError} If authentication fails
   * 
   * @example
   * ```ts
   * try {
   *   const response = await authService.login({ email, password });
   *   // Logged in
   * } catch (error) {
   *   // Login failed
   * }
   * ```
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await httpService.post('/auth/login', credentials);
      
      // Backend returns { success: true, data: { user, token?/accessToken, refreshToken?, expiresIn? } }
      if (response.data && response.data.success && response.data.data) {
        const backendData = response.data.data;

        const accessToken = backendData.accessToken || backendData.token;
        if (!accessToken) {
          throw new Error('Missing access token in login response');
        }

        const authData: AuthResponseData = {
          user: backendData.user,
          accessToken,
          // keep raw token for backward compatibility if present
          token: backendData.token,
          refreshToken: backendData.refreshToken,
          expiresIn: backendData.expiresIn, // Optional, defaults to 7 days in storeAuthData
        };

        // Store tokens and user data
        await this.storeAuthData(authData);

        return {
          success: true,
          data: authData,
          message: response.data.message,
        };
      }

      throw new Error('Invalid response format from login API');
    } catch (error) {
      throw toAuthError(error);
    }
  }

  /**
   * Registers a new user account
   * 
   * @param data - User registration data
   * @returns Promise resolving to authentication response with tokens and user data
   * @throws {AuthError} If registration fails
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      // Map fullName to the expected API format
      const payload = {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
      };

      const response = await httpService.post('/auth/register', payload);
      
      // Backend returns { success: true, data: { user, token?/accessToken, refreshToken?, expiresIn? } }
      if (response.data && response.data.success && response.data.data) {
        const backendData = response.data.data;

        const accessToken = backendData.accessToken || backendData.token;
        if (!accessToken) {
          throw new Error('Missing access token in register response');
        }

        const authData: AuthResponseData = {
          user: backendData.user,
          accessToken,
          token: backendData.token,
          refreshToken: backendData.refreshToken,
          expiresIn: backendData.expiresIn, // Optional, defaults to 7 days in storeAuthData
        };

        // Store tokens and user data
        await this.storeAuthData(authData);

        return {
          success: true,
          data: authData,
          message: response.data.message,
        };
      }

      throw new Error('Invalid response format from register API');
    } catch (error) {
      throw toAuthError(error);
    }
  }

  /**
   * Authenticates a user using Google OAuth
   * 
   * @param data - Google OAuth request data containing the authorization code
   * @returns Promise resolving to authentication response with tokens and user data
   * @throws {AuthError} If OAuth authentication fails
   */
  async googleOAuth(data: GoogleOAuthRequest): Promise<AuthResponse> {
    try {
      const response = await httpService.post('/auth/google', data);
      
      // Backend returns { success: true, data: { user, accessToken, token, refreshToken?, expiresIn?, isNew? } }
      if (response.data && response.data.success && response.data.data) {
        const backendData = response.data.data;

        const accessToken = backendData.accessToken || backendData.token;
        if (!accessToken) {
          throw new Error('Missing access token in Google OAuth response');
        }

        const authData: AuthResponseData = {
          user: backendData.user,
          accessToken,
          token: backendData.token,
          refreshToken: backendData.refreshToken,
          expiresIn: backendData.expiresIn, // Optional, defaults to 7 days in storeAuthData
          isNewUser: backendData.isNew,
        };

        // Store tokens and user data
        await this.storeAuthData(authData);

        return {
          success: true,
          data: authData,
          message: response.data.message,
        };
      }

      throw new Error('Invalid response format from Google OAuth API');
    } catch (error) {
      throw toAuthError(error);
    }
  }

  /**
   * Refreshes the access token using a refresh token
   * 
   * @param data - Refresh token request data
   * @returns Promise resolving to new token data
   * @throws {AuthError} If token refresh fails
   */
  async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    try {
      const response = await httpService.post('/auth/refresh-token', data);
      const refreshResponse = response.data as RefreshTokenResponse;

      if (refreshResponse.success && refreshResponse.data) {
        const token = refreshResponse.data.accessToken;
        const refreshToken = refreshResponse.data.refreshToken;
        const expiresIn = refreshResponse.data.expiresIn;

        await asyncStorageManager.storeAuthData({
          accessToken: token,
          refreshToken: refreshToken,
          expiresIn: expiresIn,
          user: await this.getStoredUser() as User // Preserve current user
        });
      }

      return refreshResponse;
    } catch (error) {
      throw toAuthError(error);
    }
  }

  /**
   * Gets the current authenticated user from the server
   * 
   * @returns Promise resolving to user data
   * @throws {AuthError} If request fails or user is not authenticated
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await httpService.get('/auth/me');
      const userData = response.data as { success: boolean; data: User };

      if (userData.success && userData.data) {
        // Update stored user data
        await asyncStorageManager.storeAuthData({
          user: userData.data,
          accessToken: await this.getStoredToken() || '',
          refreshToken: await this.getRefreshToken() || undefined,
        });
        return userData.data;
      }

      throw new Error('Failed to get current user');
    } catch (error) {
      throw toAuthError(error);
    }
  }

  /**
   * Logs out the current user
   * 
   * Clears all authentication data from localStorage and optionally
   * notifies the server (if the API supports it).
   * 
   * @returns Promise resolving when logout is complete
   * @throws {AuthError} If logout fails
   */
  async logout(): Promise<void> {
    // Prevent multiple simultaneous logout calls
    if (this.isLoggingOut) {
      return; // Already logging out, don't call twice
    }
    
    this.isLoggingOut = true;
    
    try {
      // Get token BEFORE clearing anything
      const token = await this.getStoredToken();
      
      // Try to notify server (optional - may fail if already logged out)
      // Only attempt if we have a token
      if (token) {
        try {
          await httpService.post('/auth/logout', {});
        } catch (error) {
          // Ignore server errors during logout - we still want to clear local data
          // Server logout failed, clearing local data anyway
        }
      }

      // Always clear local data
      await this.clearAuthData();
    } catch (error) {
      // Even if there's an error, clear local data
      await this.clearAuthData();
      throw toAuthError(error);
    } finally {
      this.isLoggingOut = false;
    }
  }

  /**
   * Gets the current user from storage
   * 
   * @returns User object if authenticated, null otherwise
   */
  async getUser(): Promise<User | null> {
    return await this.getStoredUser();
  }

  /**
   * Gets the current access token from storage
   * 
   * @returns Access token if available, null otherwise
   */
  async getToken(): Promise<string | null> {
    return await this.getStoredToken();
  }

  /**
   * Gets the stored refresh token from storage
   * 
   * @returns Refresh token if available, null otherwise
   */
  async getRefreshToken(): Promise<string | null> {
    return await asyncStorageManager.getRefreshToken();
  }

  /**
   * Gets the token expiry timestamp
   * 
   * @returns Token expiry timestamp in seconds, or null if not set
   */
  async getTokenExpiry(): Promise<number | null> {
    return await asyncStorageManager.getTokenExpiry();
  }

  /**
   * Checks if the user is currently authenticated
   * 
   * @returns true if user has a valid token and user data, false otherwise
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getStoredToken();
    const user = await this.getStoredUser();
    const isValid = await this.isTokenValid();

    return !!(token && user && isValid);
  }

  // Legacy methods for backward compatibility (deprecated)
  
  /**
   * @deprecated Use googleOAuth instead
   */
  async googleToken(data: any): Promise<any> {
    const response = await httpService.post('/auth/google-token', data);
    return response.data;
  }

  /**
   * @deprecated Use refreshToken instead
   */
  async googleRefresh(data: any): Promise<any> {
    const response = await httpService.post('/auth/refresh', data);
    return response.data;
  }

  /**
   * @deprecated This method is no longer needed
   */
  async autoVerifyEmails(data: any = {}): Promise<any> {
    const response = await httpService.post('/auth/auto-verify-emails', data);
    return response.data;
  }
}

export const authService = new AuthService();
