/**
 * Response types for authentication endpoints
 */

import { User } from './user';

/**
 * Canonical token data used throughout the frontend.
 * - `accessToken` is the primary field.
 * - `token` is kept for backward compatibility with older backend responses.
 */
export interface AuthTokenData {
  accessToken: string;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface AuthResponseData extends AuthTokenData {
  user: User;
  /**
   * Present for Google OAuth flows to indicate a brand-new account
   * created during this authentication.
   */
  isNewUser?: boolean;
}

export interface AuthResponse {
  success: boolean;
  data: AuthResponseData;
  message?: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  data: {
    accessToken: string;
    expiresIn: number;
    refreshToken?: string;
  };
}
