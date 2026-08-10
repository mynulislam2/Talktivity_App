import { useState, useEffect, useCallback } from 'react';
import { progressStateManager } from '@/services/progress/ProgressStateManager';
import { authService } from '@/services/auth';
import type { UserProgress } from '@/types/progress';

interface UseProgressStateReturn {
  progress: UserProgress | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  update: (
    updates: Partial<UserProgress>,
    optimistic?: boolean
  ) => Promise<boolean>;
}

export const useProgressState = (): UseProgressStateReturn => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    authService.getUser().then((user) => {
      setUserId(Number(user?.id) || null);
    });
  }, []);

  useEffect(() => {
    if (!userId) {
      setProgress(null);
      setIsLoading(false);
      return;
    }

    const loadProgress = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const progressData = await progressStateManager.getProgress(userId);
        setProgress(progressData);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to load progress')
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = progressStateManager.subscribe(
      (newProgress: UserProgress) => {
        setProgress(newProgress);
        setIsLoading(false);
        setError(null);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [userId]);

  const refresh = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);
      const progressData = await progressStateManager.refreshProgress(userId);
      setProgress(progressData);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to refresh progress')
      );
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const update = useCallback(
    async (
      updates: Partial<UserProgress>,
      optimistic = true
    ): Promise<boolean> => {
      if (!userId) return false;

      try {
        setError(null);
        const success = await progressStateManager.updateProgress(
          userId,
          updates,
          optimistic
        );
        if (success) {
          await refresh();
        }
        return success;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to update progress')
        );
        return false;
      }
    },
    [userId, refresh]
  );

  return {
    progress,
    isLoading,
    error,
    refresh,
    update,
  };
};
