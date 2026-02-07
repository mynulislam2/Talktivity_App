/**
 * useTopics Hook
 * 
 * Fetches and manages topics state from Redux.
 * Now uses Redux for global state management.
 */

import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  loadTopics,
  selectTopicsCategories,
  selectTopicsLoading,
  selectTopicsError,
} from '@/store/slices/topicsSlice';
import type { TopicCategory } from '@/types/topics';

export interface UseTopicsReturn {
  categories: TopicCategory[];
  isLoading: boolean;
  error: string | null;
  fetchTopics: () => Promise<void>;
  refreshTopics: () => Promise<void>;
}

/**
 * Hook to fetch and manage topics from Redux
 */
export function useTopics(): UseTopicsReturn {
  const dispatch = useAppDispatch();
  
  // Get topics data from Redux
  const categories = useAppSelector(selectTopicsCategories);
  const isLoading = useAppSelector(selectTopicsLoading);
  const error = useAppSelector(selectTopicsError);

  // Load topics on mount if not already loaded
  useEffect(() => {
    if (categories.length === 0 && !isLoading) {
      dispatch(loadTopics());
    }
  }, [dispatch, categories.length, isLoading]);

  const fetchTopics = useCallback(async () => {
    await dispatch(loadTopics());
  }, [dispatch]);

  const refreshTopics = useCallback(async () => {
    await dispatch(loadTopics());
  }, [dispatch]);

  return {
    categories,
    isLoading,
    error,
    fetchTopics,
    refreshTopics,
  };
}
