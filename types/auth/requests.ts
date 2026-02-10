/**
 * Request payload types for authentication endpoints
 */

export interface LoginRequest {
  email: string;
  password: string;
  [key: string]: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface GoogleOAuthRequest {
  code: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
