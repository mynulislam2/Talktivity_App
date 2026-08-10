/**
 * Error handling utilities for onboarding
 */

import { AxiosError } from 'axios';
import {
  OnboardingError,
  OnboardingLoadError,
  OnboardingSaveError,
  OnboardingValidationError,
} from '@/types/onboarding/errors';

/**
 * Extracts error message from various error types
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof OnboardingError) {
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
 * Gets user-friendly message for HTTP status codes
 */
function getStatusMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input';
    case 401:
      return 'Authentication required. Please log in';
    case 403:
      return 'You do not have permission to perform this action';
    case 404:
      return 'Resource not found';
    case 409:
      return 'Conflict. This resource already exists';
    case 500:
      return 'Server error. Please try again later';
    case 502:
      return 'Bad gateway. Please try again later';
    case 503:
      return 'Service unavailable. Please try again later';
    default:
      return 'An error occurred. Please try again';
  }
}

/**
 * Converts an unknown error to an OnboardingError
 */
export function toOnboardingError(error: unknown): OnboardingError {
  if (error instanceof OnboardingError) {
    return error;
  }

  if (error instanceof AxiosError) {
    const statusCode = error.response?.status;
    const message = extractErrorMessage(error);

    switch (statusCode) {
      case 400:
        return new OnboardingValidationError(message);
      case 401:
        return new OnboardingLoadError('Authentication required');
      case 404:
        return new OnboardingLoadError('Onboarding data not found');
      case 500:
      case 502:
      case 503:
        return new OnboardingSaveError(message);
      default:
        if (!error.response) {
          return new OnboardingLoadError(
            'Network error. Please check your connection'
          );
        }
        return new OnboardingSaveError(message);
    }
  }

  if (error instanceof Error) {
    return new OnboardingError(error.message, 'UNKNOWN_ERROR');
  }

  return new OnboardingError('An unexpected error occurred', 'UNKNOWN_ERROR');
}
