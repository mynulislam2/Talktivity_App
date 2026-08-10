import { useState, useCallback } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { initializeCourse, loadCourseStatus } from '@/store/slices/courseSlice';

export interface UseCourseInitializationReturn {
  initialize: (level?: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  hasActiveCourse: boolean;
  isInitializing: boolean;
  isChecking: boolean;
  hasChecked: boolean;
  shouldAutoInit: boolean;
  initializeCourse: () => Promise<void>;
  retry: () => void;
}

export function useCourseInitialization(): UseCourseInitializationReturn {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  const initialize = useCallback(
    async (level?: string) => {
      setLoading(true);
      setError(null);
      try {
        await dispatch(initializeCourse()).unwrap();
        await dispatch(loadCourseStatus()).unwrap();
      } catch (err: any) {
        setError(err?.message || 'Failed to initialize course');
      } finally {
        setLoading(false);
      }
    },
    [dispatch]
  );

  const initializeNoArg = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await dispatch(initializeCourse()).unwrap();
      await dispatch(loadCourseStatus()).unwrap();
      setHasChecked(true);
      setHasChecked(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to initialize course');
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const retry = useCallback(() => {
    setError(null);
    initialize();
  }, [initialize]);

  return {
    initialize,
    loading,
    error,
    hasActiveCourse: false,
    isInitializing: loading,
    isChecking: loading && !hasChecked,
    hasChecked,
    shouldAutoInit: false,
    initializeCourse: initializeNoArg,
    retry,
  };
}
