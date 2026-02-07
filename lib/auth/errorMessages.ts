/**
 * User-friendly error messages for authentication errors
 */

import { AuthErrorCode } from '@/types/auth';

export const ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  [AuthErrorCode.VALIDATION_ERROR]: 'Please check your input and try again',
  [AuthErrorCode.AUTHENTICATION_ERROR]: 'Invalid email or password. Please try again',
  [AuthErrorCode.NETWORK_ERROR]: 'Network error. Please check your connection and try again',
  [AuthErrorCode.SERVER_ERROR]: 'Server error. Please try again later',
  [AuthErrorCode.UNAUTHORIZED]: 'You are not authorized to perform this action',
  [AuthErrorCode.FORBIDDEN]: 'Access denied',
  [AuthErrorCode.NOT_FOUND]: 'Resource not found',
  [AuthErrorCode.CONFLICT]: 'This email is already registered',
  [AuthErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again',
};

/**
 * Maps HTTP status codes to user-friendly error messages
 */
export const STATUS_CODE_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input',
  401: 'Invalid email or password. Please try again',
  403: 'Access denied',
  404: 'Resource not found',
  409: 'This email is already registered',
  500: 'Server error. Please try again later',
  502: 'Service temporarily unavailable',
  503: 'Service temporarily unavailable',
};

/**
 * Gets a user-friendly error message for a given error code
 */
export function getErrorMessage(code: AuthErrorCode): string {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES[AuthErrorCode.UNKNOWN_ERROR];
}

/**
 * Gets a user-friendly error message for a given HTTP status code
 */
export function getStatusMessage(statusCode: number): string {
  return STATUS_CODE_MESSAGES[statusCode] || ERROR_MESSAGES[AuthErrorCode.UNKNOWN_ERROR];
}
