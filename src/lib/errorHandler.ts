/**
 * Error Handler Utility
 *
 * Centralized error handling, logging, and reporting
 * Handles API errors, validation errors, and runtime errors
 */

import { Alert } from 'react-native';

export enum ErrorType {
  NETWORK = 'NETWORK_ERROR',
  AUTH = 'AUTH_ERROR',
  VALIDATION = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  PERMISSION = 'PERMISSION_ERROR',
  SERVER = 'SERVER_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR',
}

export interface AppError extends Error {
  type: ErrorType;
  statusCode?: number;
  code?: string;
  details?: Record<string, any>;
  userMessage?: string;
}

/**
 * Create a standardized AppError
 */
export const createError = (
  message: string,
  type: ErrorType = ErrorType.UNKNOWN,
  details?: Record<string, any>
): AppError => {
  const error = new Error(message) as AppError;
  error.type = type;
  error.details = details;
  return error;
};

/**
 * Log error to console and analytics (development)
 */
export const logError = (error: any, context?: string) => {
  const timestamp = new Date().toISOString();
  const errorMessage =
    error instanceof Error ? error.message : JSON.stringify(error);
  const errorType =
    error instanceof Error && (error as AppError).type
      ? (error as AppError).type
      : 'UNKNOWN';

  console.error(
    `[${timestamp}] [${errorType}]${context ? ` [${context}]` : ''}:`,
    errorMessage,
    error
  );

  // TODO: Send to error tracking service (Sentry, etc.)
  // if (process.env.NODE_ENV === 'production') {
  //   captureException(error, { extra: { context } });
  // }
};

/**
 * Parse and handle API errors
 */
export const handleApiError = (error: any): AppError => {
  let appError: AppError;

  if (!error) {
    appError = createError('An unknown error occurred', ErrorType.UNKNOWN);
    return appError;
  }

  // Network error
  if (
    error.code === 'ECONNABORTED' ||
    error.code === 'ENOTFOUND' ||
    error.message === 'Network Error'
  ) {
    appError = createError(
      'Network connection failed. Please check your internet connection.',
      ErrorType.NETWORK,
      { originalError: error }
    );
  }
  // 401 Unauthorized
  else if (error.response?.status === 401) {
    appError = createError(
      'Your session has expired. Please login again.',
      ErrorType.AUTH,
      { originalError: error }
    );
  }
  // 403 Forbidden
  else if (error.response?.status === 403) {
    appError = createError(
      'You do not have permission to perform this action.',
      ErrorType.PERMISSION,
      { originalError: error }
    );
  }
  // 404 Not Found
  else if (error.response?.status === 404) {
    appError = createError(
      'The requested resource was not found.',
      ErrorType.NOT_FOUND,
      { originalError: error }
    );
  }
  // Validation error
  else if (error.response?.status === 422 || error.response?.data?.errors) {
    appError = createError(
      'Validation failed. Please check your input.',
      ErrorType.VALIDATION,
      { errors: error.response?.data?.errors, originalError: error }
    );
  }
  // 5xx Server error
  else if (error.response?.status >= 500) {
    appError = createError(
      'Server error. Please try again later.',
      ErrorType.SERVER,
      { statusCode: error.response.status, originalError: error }
    );
  }
  // Generic error
  else {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An error occurred. Please try again.';
    appError = createError(message, ErrorType.UNKNOWN, {
      originalError: error,
    });
  }

  appError.statusCode = error.response?.status;
  return appError;
};

/**
 * Show error alert to user
 */
export const showErrorAlert = (
  error: AppError | Error | string,
  title: string = 'Error'
) => {
  let message = 'An error occurred';

  if (typeof error === 'string') {
    message = error;
  } else if (error instanceof Error) {
    message = (error as AppError).userMessage || error.message;
  }

  Alert.alert(title, message, [{ text: 'OK', onPress: () => {} }]);
};

/**
 * Validate required fields
 */
export const validateRequired = (
  data: Record<string, any>,
  fields: string[]
): AppError | null => {
  const missingFields = fields.filter((field) => !data[field]);

  if (missingFields.length > 0) {
    return createError(
      `Missing required fields: ${missingFields.join(', ')}`,
      ErrorType.VALIDATION,
      { missingFields }
    );
  }

  return null;
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): AppError | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return createError('Invalid email format', ErrorType.VALIDATION, { email });
  }

  return null;
};

/**
 * Validate password strength
 */
export const validatePassword = (
  password: string,
  minLength: number = 6
): AppError | null => {
  if (password.length < minLength) {
    return createError(
      `Password must be at least ${minLength} characters`,
      ErrorType.VALIDATION,
      { minLength, actualLength: password.length }
    );
  }

  return null;
};

/**
 * Wrap async function with error handling
 */
export const withErrorHandling = async <T>(
  fn: () => Promise<T>,
  context?: string
): Promise<{ data: T | null; error: AppError | null }> => {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (error) {
    const appError =
      error instanceof Error && (error as AppError).type
        ? (error as AppError)
        : handleApiError(error);
    logError(appError, context);
    return { data: null, error: appError };
  }
};

export default {
  createError,
  logError,
  handleApiError,
  showErrorAlert,
  validateRequired,
  validateEmail,
  validatePassword,
  withErrorHandling,
};
