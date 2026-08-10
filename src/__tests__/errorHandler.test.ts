/**
 * Error Handler Tests
 *
 * Unit tests for error handling utilities
 */

import { describe, it, expect } from '@jest/globals';
import {
  createError,
  handleApiError,
  validateRequired,
  validateEmail,
  validatePassword,
  ErrorType,
} from '../lib/errorHandler';

describe('errorHandler', () => {
  describe('createError', () => {
    it('should create an error with type and details', () => {
      const error = createError('Test error', ErrorType.VALIDATION, {
        field: 'email',
      });

      expect(error.message).toBe('Test error');
      expect(error.type).toBe(ErrorType.VALIDATION);
      expect(error.details?.field).toBe('email');
    });

    it('should default to UNKNOWN error type', () => {
      const error = createError('Generic error');
      expect(error.type).toBe(ErrorType.UNKNOWN);
    });
  });

  describe('handleApiError', () => {
    it('should handle network errors', () => {
      const error = new Error('Network Error');
      const appError = handleApiError(error);

      expect(appError.type).toBe(ErrorType.NETWORK);
      expect(appError.message).toContain('Network connection failed');
    });

    it('should handle 401 authentication errors', () => {
      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
      };
      const appError = handleApiError(error);

      expect(appError.type).toBe(ErrorType.AUTH);
      expect(appError.statusCode).toBe(401);
    });

    it('should handle 403 permission errors', () => {
      const error = {
        response: {
          status: 403,
          data: { message: 'Forbidden' },
        },
      };
      const appError = handleApiError(error);

      expect(appError.type).toBe(ErrorType.PERMISSION);
      expect(appError.statusCode).toBe(403);
    });

    it('should handle 404 not found errors', () => {
      const error = {
        response: {
          status: 404,
          data: { message: 'Not Found' },
        },
      };
      const appError = handleApiError(error);

      expect(appError.type).toBe(ErrorType.NOT_FOUND);
      expect(appError.statusCode).toBe(404);
    });

    it('should handle 5xx server errors', () => {
      const error = {
        response: {
          status: 500,
          data: { message: 'Internal Server Error' },
        },
      };
      const appError = handleApiError(error);

      expect(appError.type).toBe(ErrorType.SERVER);
      expect(appError.statusCode).toBe(500);
    });
  });

  describe('validateRequired', () => {
    it('should return null for valid data', () => {
      const data = { email: 'test@example.com', password: 'password123' };
      const error = validateRequired(data, ['email', 'password']);
      expect(error).toBeNull();
    });

    it('should catch missing required fields', () => {
      const data = { email: 'test@example.com' };
      const error = validateRequired(data, ['email', 'password']);

      expect(error).not.toBeNull();
      expect(error?.type).toBe(ErrorType.VALIDATION);
      expect(error?.details?.missingFields).toContain('password');
    });

    it('should handle empty strings as missing', () => {
      const data = { email: '', password: 'password123' };
      const error = validateRequired(data, ['email', 'password']);

      expect(error).not.toBeNull();
      expect(error?.details?.missingFields).toContain('email');
    });
  });

  describe('validateEmail', () => {
    it('should accept valid email', () => {
      const error = validateEmail('test@example.com');
      expect(error).toBeNull();
    });

    it('should reject invalid email format', () => {
      const error = validateEmail('invalid-email');
      expect(error).not.toBeNull();
      expect(error?.type).toBe(ErrorType.VALIDATION);
    });

    it('should reject email without domain', () => {
      const error = validateEmail('test@');
      expect(error).not.toBeNull();
    });
  });

  describe('validatePassword', () => {
    it('should accept password of minimum length', () => {
      const error = validatePassword('password123', 6);
      expect(error).toBeNull();
    });

    it('should reject password below minimum length', () => {
      const error = validatePassword('pass', 6);
      expect(error).not.toBeNull();
      expect(error?.type).toBe(ErrorType.VALIDATION);
      expect(error?.details?.minLength).toBe(6);
    });

    it('should use default minimum length of 6', () => {
      const error = validatePassword('short');
      expect(error).not.toBeNull();
    });
  });
});
