/**
 * useAuthGoogleLogin Hook
 * 
 * Encapsulates Google OAuth login logic using @react-oauth/google.
 * Handles the complete Google OAuth flow with success/error callbacks.
 */

import { useCallback } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { useGoogleAuth } from './useGoogleAuth';
import { googleOAuth } from '@/store/slices/authSlice';
import { loadLifecycle } from '@/store/slices/lifecycleSlice';
import { loadSubscriptionStatus } from '@/store/slices/subscriptionSlice';
import { getRedirectPath } from '@/lib/routing/getRedirectPath';
import type { AuthResponseData } from '@/types/auth';

export interface UseAuthGoogleLoginOptions {
  onError?: (error: string) => void;
  form?: {
    setError: (field: string, message: string) => void;
  };
}

export interface UseAuthGoogleLoginReturn {
  googleLogin: () => void;
  isLoading: boolean;
  error: string | null;
}

export function useAuthGoogleLogin(
  options: UseAuthGoogleLoginOptions = {}
): UseAuthGoogleLoginReturn {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { handleGoogleAuth, isLoading, error: googleError } = useGoogleAuth();
  const { onError, form } = options;

  const handleSuccess = useCallback(
    async (codeResponse: { code: string }) => {
      if (!codeResponse.code) {
        const errorMsg = 'Failed to get Google authorization code';
        form?.setError('email', errorMsg);
        onError?.(errorMsg);
        return;
      }

      const result = await handleGoogleAuth(codeResponse.code);

      if (googleOAuth.fulfilled.match(result)) {
        const authData = result.payload as AuthResponseData | undefined;

        // For brand-new Google registrations, send user to onboarding first
        if (authData?.isNewUser) {
          router.push('/onboarding');
          return;
        }

        // Load both lifecycle and subscription to ensure complete state
        const lifecycleResult = await dispatch(loadLifecycle());
        await dispatch(loadSubscriptionStatus()); // Load subscription in parallel
        
        if (loadLifecycle.fulfilled.match(lifecycleResult)) {
          const lifecycleData = lifecycleResult.payload;
          const redirectPath = getRedirectPath(lifecycleData);
          if (redirectPath) {
            router.push(redirectPath);
          } else {
            // If redirectPath is null, fallback to home
            router.push('/home');
          }
        } else {
          // If lifecycle load fails, fallback to home
          router.push('/home');
        }
      } else {
        // Error handling
        const errorMessage = (googleOAuth.rejected.match(result) ? (result.payload as string) : null) || 'Google authentication failed';
        form?.setError('email', errorMessage);
        onError?.(errorMessage);
      }
    },
    [handleGoogleAuth, onError, form, router, dispatch]
  );

  const handleError = useCallback(() => {
    const errorMsg = 'Google login was cancelled or failed';
    form?.setError('email', errorMsg);
    onError?.(errorMsg);
  }, [form, onError]);

  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: handleSuccess,
    onError: handleError,
  });

  return {
    googleLogin,
    isLoading,
    error: googleError,
  };
}
