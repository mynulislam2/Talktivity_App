/**
 * Validation utilities for form validation
 */

import { ValidationSchema, ValidationRule } from './authSchemas';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates a single field value against a validation rule
 */
function validateField<T extends Record<string, any>>(
  value: string,
  rule: ValidationRule,
  fieldName: string,
  formData?: T
): string | null {
  // Check required
  if (rule.required && (!value || value.trim() === '')) {
    return `${fieldName} is required`;
  }

  // Skip other validations if value is empty and not required
  if (!value || value.trim() === '') {
    return null;
  }

  // Check minLength
  if (rule.minLength && value.length < rule.minLength) {
    return rule.message || `${fieldName} must be at least ${rule.minLength} characters`;
  }

  // Check maxLength
  if (rule.maxLength && value.length > rule.maxLength) {
    return rule.message || `${fieldName} must not exceed ${rule.maxLength} characters`;
  }

  // Check pattern
  if (rule.pattern && !rule.pattern.test(value)) {
    return rule.message;
  }

  // Check custom validator
  if (rule.custom) {
    const customResult = rule.custom(value, formData);
    if (customResult !== true) {
      return typeof customResult === 'string' ? customResult : rule.message;
    }
  }

  return null;
}

/**
 * Validates form data against a validation schema
 */
export function validateForm<T extends Record<string, any>>(
  data: T,
  schema: ValidationSchema<T>
): ValidationResult {
  const errors: Record<string, string> = {};

  for (const fieldName in schema) {
    const rule = schema[fieldName];
    if (!rule) continue;

    const value = String(data[fieldName] || '');
    const error = validateField(value, rule, fieldName, data);

    if (error) {
      errors[fieldName] = error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates a single field
 */
export function validateFieldValue<T extends Record<string, any>>(
  value: string,
  rule: ValidationRule,
  fieldName: string,
  formData?: T
): string | null {
  return validateField(value, rule, fieldName, formData);
}
