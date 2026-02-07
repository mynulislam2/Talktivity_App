import { useState, useEffect, useCallback } from 'react';
import { progressStateManager } from '@/service/ProgressStateManager';
import { authService } from '@/service/AuthService';
import type { UserProgress } from '@/types/progress';

interface UseProgressStateReturn {
  progress: UserProgress | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  update: (updates: Partial<UserProgress>, optimistic?: boolean) => Promise<boolean>;
}

export const useProgressState = (): UseProgressStateReturn => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const user = authService.getUser();
  const userId = user?.id;

  // Load initial progress
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
        // Error loading progress
        setError(err instanceof Error ? err : new Error('Failed to load progress'));
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [userId]);

  // Subscribe to progress changes
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = progressStateManager.subscribe((newProgress) => {
      setProgress(newProgress);
      setIsLoading(false);
      setError(null);
    });

    return () => {
      unsubscribe();
    };
  }, [userId]);

  // Refresh progress from server
  const refresh = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);
      const progressData = await progressStateManager.refreshProgress(userId);
      setProgress(progressData);
    } catch (err) {
      // Error refreshing progress
      setError(err instanceof Error ? err : new Error('Failed to refresh progress'));
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Update progress
  const update = useCallback(
    async (updates: Partial<UserProgress>, optimistic = true): Promise<boolean> => {
      if (!userId) return false;

      try {
        setError(null);
        const success = await progressStateManager.updateProgress(userId, updates, optimistic);
        if (success) {
          // Progress will be updated via subscription
          await refresh();
        }
        return success;
      } catch (err) {
        // Error updating progress
        setError(err instanceof Error ? err : new Error('Failed to update progress'));
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
