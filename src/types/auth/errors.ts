/**
 * Error types for authentication
 */

export enum AuthErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AuthErrorDetails {
  code: AuthErrorCode;
  message: string;
  statusCode?: number;
  field?: string;
  originalError?: unknown;
}
