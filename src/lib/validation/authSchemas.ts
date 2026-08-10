/**
 * Validation schemas for authentication forms
 */

import { LoginRequest } from '@/types/auth';

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
};

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
