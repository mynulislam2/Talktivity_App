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

export function useTopics(): UseTopicsReturn {
  const dispatch = useAppDispatch();

  const categories = useAppSelector(selectTopicsCategories);
  const isLoading = useAppSelector(selectTopicsLoading);
  const error = useAppSelector(selectTopicsError);

  useEffect(() => {
    // Always fetch in background — Redux persist provides the cached data
    // instantly on mount, while this refreshes in case anything changed.
    // The loading state only shows on first-ever load (no cache yet).
    dispatch(loadTopics());
  }, [dispatch]);

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
