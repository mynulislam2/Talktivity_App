/**
 * Custom hook for managing authentication form state and validation
 * 
 * Provides form state management, validation, and submission handling
 * for login and registration forms.
 */

import { useState, useCallback } from 'react';
import { ValidationSchema, validateForm } from '@/lib/validation/validators';

export interface UseAuthFormReturn<T extends Record<string, string>> {
  formState: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  handleChange: (field: keyof T, value: string) => void;
  handleSubmit: (onSubmit: (data: T) => Promise<void>) => Promise<void>;
  setError: (field: keyof T, error: string) => void;
  setErrors: (errors: Record<string, string>) => void;
  reset: () => void;
}

export function useAuthForm<T extends Record<string, string>>(
  initialValues: T,
  validationSchema: ValidationSchema<T>
): UseAuthFormReturn<T> {
  const [formState, setFormState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((field: keyof T, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[field as string]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  }, [errors]);

  const setError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({
      ...prev,
      [field as string]: error,
    }));
  }, []);

  const setAllErrors = useCallback((newErrors: Record<string, string>) => {
    setErrors(newErrors);
  }, []);

  const handleSubmit = useCallback(
    async (onSubmit: (data: T) => Promise<void>) => {
      // Validate form
      const validation = validateForm(formState, validationSchema);

      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }

      // Clear previous errors
      setErrors({});
      setIsSubmitting(true);

      try {
        await onSubmit(formState);
      } catch (error) {
        // Error handling is done by the caller (Redux thunk)
        // Form submission error
      } finally {
        setIsSubmitting(false);
      }
    },
    [formState, validationSchema]
  );

  const reset = useCallback(() => {
    setFormState(initialValues);
    setErrors({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    formState,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setError,
    setErrors: setAllErrors,
    reset,
  };
}
