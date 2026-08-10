import { useState, useCallback } from 'react';
import { validateForm } from '@/lib/validation/validators';
import type { ValidationSchema } from '@/lib/validation/authSchemas';

export interface UseAuthFormReturn<T extends Record<string, string>> {
  formData: T;
  errors: Record<string, string>;
  loading: boolean;
  isSubmitting: boolean;
  formState: any;
  handleChange: (field: keyof T, value: string) => void;
  validate: () => boolean;
  reset: () => void;
  setFormField: (field: keyof T, value: string) => void;
  setErrors: (errors: Record<string, string>) => void;
  setError: (field: keyof T, error: string) => void;
  setLoading: (loading: boolean) => void;
  handleSubmit: (onSubmit: (data: T) => Promise<void>) => Promise<void>;
}

export function useAuthForm<T extends Record<string, string>>(
  initialValues: T,
  validationSchema: ValidationSchema<T>
): UseAuthFormReturn<T> {
  const [formData, setFormData] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback(
    (field: keyof T, value: string) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      if (errors[field as string]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field as string];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const setFormField = handleChange;

  const setError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({
      ...prev,
      [field as string]: error,
    }));
  }, []);

  const setAllErrors = useCallback((newErrors: Record<string, string>) => {
    setErrors(newErrors);
  }, []);

  const validate = useCallback(() => {
    const validation = validateForm(formData, validationSchema);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return false;
    }
    setErrors({});
    return true;
  }, [formData, validationSchema]);

  const handleSubmit = useCallback(
    async (onSubmit: (data: T) => Promise<void>) => {
      if (!validate()) return;
      setLoading(true);
      try {
        await onSubmit(formData);
      } catch {
        // error handled by caller
      } finally {
        setLoading(false);
      }
    },
    [formData, validate]
  );

  const reset = useCallback(() => {
    setFormData(initialValues);
    setErrors({});
    setLoading(false);
  }, [initialValues]);

  return {
    formData,
    errors,
    loading,
    isSubmitting: loading,
    formState: formData as any,
    handleChange,
    validate,
    reset,
    setFormField,
    setErrors: setAllErrors,
    setError,
    setLoading,
    handleSubmit,
  };
}
