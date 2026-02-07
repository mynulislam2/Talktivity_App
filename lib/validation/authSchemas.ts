/**
 * Validation schemas for authentication forms
 */

import { LoginRequest, RegisterRequest } from '@/types/auth';

/**
 * Signup form data interface (extends RegisterRequest with additional fields)
 */
export interface SignupFormData extends RegisterRequest {
  confirmPassword: string;
  termsAgreed: string; // Stored as string for form compatibility, validated as boolean
  [key: string]: string; // Index signature to satisfy Record<string, string> constraint
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  message: string;
  custom?: (value: string, formData?: any) => boolean | string;
}

export type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule;
}

/**
 * Email validation pattern
 */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Login form validation schema
 */
export const loginSchema: ValidationSchema<LoginRequest> = {
  email: {
    required: true,
    pattern: EMAIL_PATTERN,
    message: 'Please enter a valid email address',
  },
  password: {
    required: true,
    minLength: 6,
    message: 'Password must be at least 6 characters',
  },
};

/**
 * Registration form validation schema
 */
export const registerSchema: ValidationSchema<RegisterRequest> = {
  email: {
    required: true,
    pattern: EMAIL_PATTERN,
    message: 'Please enter a valid email address',
  },
  password: {
    required: true,
    minLength: 6,
    message: 'Password must be at least 6 characters',
  },
  fullName: {
    required: true,
    minLength: 2,
    maxLength: 100,
    message: 'Full name must be between 2 and 100 characters',
    custom: (value: string) => {
      const trimmed = value.trim();
      if (trimmed.length < 2) {
        return 'Full name must be at least 2 characters';
      }
      if (trimmed.length > 100) {
        return 'Full name must not exceed 100 characters';
      }
      return true;
    },
  },
};

/**
 * Signup form validation schema (includes confirmPassword and termsAgreed)
 */
export const signupSchema: ValidationSchema<SignupFormData> = {
  email: {
    required: true,
    pattern: EMAIL_PATTERN,
    message: 'Please enter a valid email address',
  },
  password: {
    required: true,
    minLength: 6,
    message: 'Password must be at least 6 characters',
  },
  fullName: {
    required: true,
    minLength: 2,
    maxLength: 100,
    message: 'Full name must be between 2 and 100 characters',
    custom: (value: string) => {
      const trimmed = value.trim();
      if (trimmed.length < 2) {
        return 'Full name must be at least 2 characters';
      }
      if (trimmed.length > 100) {
        return 'Full name must not exceed 100 characters';
      }
      return true;
    },
  },
  confirmPassword: {
    required: true,
    message: 'Please confirm your password',
    custom: (value: string, formData?: SignupFormData) => {
      if (!formData || !formData.password) {
        return 'Password is required';
      }
      if (value !== formData.password) {
        return 'Passwords do not match';
      }
      return true;
    },
  },
  termsAgreed: {
    required: true,
    message: 'Please agree to the Terms and Conditions',
    custom: (value: string) => {
      // Convert string to boolean for validation
      const isAgreed = value === 'true' || value === true;
      if (!isAgreed) {
        return 'Please agree to the Terms and Conditions';
      }
      return true;
    },
  },
};
