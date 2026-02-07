/**
 * useRedirectPath Hook
 * 
 * Returns the correct redirect path based on lifecycle status.
 * Uses lifecycle API to determine routing.
 */

import { useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';
import {
  selectLifecycleData,
  selectLifecycleLoading,
} from '@/store/slices/lifecycleSlice';
import { getRedirectPath } from '@/lib/routing/getRedirectPath';

export interface UseRedirectPathReturn {
  redirectPath: string | null;
  isLoading: boolean;
}

/**
 * Hook to get redirect path based on lifecycle state
 * 
 * @returns Object with redirectPath (null if lifecycle not loaded) and isLoading flag
 */
export function useRedirectPath(): UseRedirectPathReturn {
  const lifecycle = useAppSelector(selectLifecycleData);
  const isLoading = useAppSelector(selectLifecycleLoading);

  const redirectPath = useMemo(() => {
    return getRedirectPath(lifecycle);
  }, [lifecycle]);

  return {
    redirectPath,
    isLoading,
  };
}
