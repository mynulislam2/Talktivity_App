/**
 * Custom hook for Google OAuth authentication
 * 
 * Provides Google OAuth functionality using Redux dispatch and selectors.
 */

import { useCallback } from 'react';
import { useAppDispatch } from '@/store/hooks';
import {
  googleOAuth,
  selectGoogleAuthLoading,
  selectGoogleAuthError,
} from '@/store/slices/authSlice';
import { useAppSelector } from '@/store/hooks';

export interface UseGoogleAuthReturn {
  handleGoogleAuth: (code: string) => Promise<ReturnType<typeof googleOAuth>>;
  isLoading: boolean;
  error: string | null;
}

export function useGoogleAuth(): UseGoogleAuthReturn {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectGoogleAuthLoading);
  const error = useAppSelector(selectGoogleAuthError);

  const handleGoogleAuth = useCallback(
    async (code: string) => {
      const result = await dispatch(googleOAuth(code));
      return result;
    },
    [dispatch]
  );

  return {
    handleGoogleAuth,
    isLoading,
    error,
  };
}
