/**
 * Error handling utilities for call operations
 */

import { AxiosError } from 'axios';
import {
  CallError,
  CallStatusError,
  CallConnectionError,
} from '@/types/call/errors';

/**
 * Extracts error message from various error types
 */
export function extractCallErrorMessage(error: unknown): string {
  if (error instanceof CallError) {
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
      const status = error.response.status;
      if (status === 403) {
        return 'Lifetime call limit reached';
      }
      if (status === 404) {
        return 'Call status not found';
      }
      if (status >= 500) {
        return 'Server error. Please try again later';
      }
    }

    // Network error
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return 'Request timed out. Please try again';
    }

    if (!error.response) {
      return 'Network error. Please check your connection';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

/**
 * Converts an unknown error to a CallError
 */
export function toCallError(error: unknown): CallError {
  if (error instanceof CallError) {
    return error;
  }

  if (error instanceof AxiosError) {
    const statusCode = error.response?.status;
    const message = extractCallErrorMessage(error);

    if (statusCode === 403) {
      return new CallStatusError(message, statusCode);
    }
    if (statusCode === 404) {
      return new CallStatusError(message, statusCode);
    }
    if (statusCode && statusCode >= 500) {
      return new CallStatusError(message, statusCode);
    }
    if (!error.response) {
      return new CallConnectionError(message);
    }
    return new CallStatusError(message, statusCode || 500);
  }

  if (error instanceof Error) {
    return new CallError(error.message);
  }

  return new CallError('An unexpected error occurred');
}
