/**
 * Error handling utilities for authentication
 */

import { AxiosError } from 'axios';
import {
  AuthError,
  ValidationError,
  AuthenticationError,
  NetworkError,
  ServerError,
} from './errors';
import { AuthErrorCode } from '@/types/auth';
import { getErrorMessage, getStatusMessage } from './errorMessages';

/**
 * Extracts error message from various error types
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof AuthError) {
    return error.message;
  }

  if (error instanceof AxiosError) {
    // Try to get error message from response
    if (error.response?.data) {
      const data = error.response.data;
      
      // Handle different response formats
      if (typeof data === 'string') {
        return data;
      }
      
      if (typeof data === 'object') {
        // Check for common error message fields
        if ('error' in data && typeof data.error === 'string') {
          return data.error;
        }
        if ('message' in data && typeof data.message === 'string') {
          return data.message;
        }
        if ('errorMessage' in data && typeof data.errorMessage === 'string') {
          return data.errorMessage;
        }
      }
    }

    // Fall back to status code message
    if (error.response?.status) {
      return getStatusMessage(error.response.status);
    }

    // Network error - add detailed logging
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error('⏱️ [NetworkError] Request timed out:', {
        code: error.code,
        message: error.message,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullUrl: error.config?.baseURL ? `${error.config.baseURL}${error.config.url}` : error.config?.url,
        method: error.config?.method,
        timeout: error.config?.timeout,
      });
      return 'Request timed out. Please try again';
    }

    if (!error.response) {
      console.error('🚫 [NetworkError] No response from server:', {
        code: error.code,
        message: error.message,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullUrl: error.config?.baseURL ? `${error.config.baseURL}${error.config.url}` : error.config?.url,
        method: error.config?.method,
        requestHeaders: error.config?.headers,
        stack: error.stack,
      });
      return 'Network error. Please check your connection';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

/**
 * Converts an unknown error to an AuthError
 */
export function toAuthError(error: unknown): AuthError {
  if (error instanceof AuthError) {
    return error;
  }

  if (error instanceof AxiosError) {
    const statusCode = error.response?.status;
    const message = extractErrorMessage(error);

    switch (statusCode) {
      case 400:
        return new ValidationError(message);
      case 401:
        return new AuthenticationError(message);
      case 403:
        return new AuthError(message, AuthErrorCode.FORBIDDEN, 403);
      case 404:
        return new AuthError(message, AuthErrorCode.NOT_FOUND, 404);
      case 409:
        return new AuthError(message, AuthErrorCode.CONFLICT, 409);
      case 500:
      case 502:
      case 503:
        return new ServerError(message, statusCode);
      default:
        if (!error.response) {
          return new NetworkError(message);
        }
        return new ServerError(message, statusCode || 500);
    }
  }

  if (error instanceof Error) {
    return new AuthError(error.message, AuthErrorCode.UNKNOWN_ERROR);
  }

  return new AuthError('An unexpected error occurred', AuthErrorCode.UNKNOWN_ERROR);
}

/**
 * Gets error code from an error
 */
export function getErrorCode(error: unknown): AuthErrorCode {
  if (error instanceof AuthError) {
    return error.code;
  }

  if (error instanceof AxiosError) {
    const statusCode = error.response?.status;
    
    switch (statusCode) {
      case 400:
        return AuthErrorCode.VALIDATION_ERROR;
      case 401:
        return AuthErrorCode.AUTHENTICATION_ERROR;
      case 403:
        return AuthErrorCode.FORBIDDEN;
      case 404:
        return AuthErrorCode.NOT_FOUND;
      case 409:
        return AuthErrorCode.CONFLICT;
      case 500:
      case 502:
      case 503:
        return AuthErrorCode.SERVER_ERROR;
      default:
        return error.response ? AuthErrorCode.SERVER_ERROR : AuthErrorCode.NETWORK_ERROR;
    }
  }

  return AuthErrorCode.UNKNOWN_ERROR;
}
