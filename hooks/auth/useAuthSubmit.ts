/**
 * useAuthSubmit Hook
 * 
 * Handles form submission with error handling for authentication actions.
 * Provides a consistent pattern for login/register form submissions.
 */

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { AsyncThunk } from '@reduxjs/toolkit';
import { loadLifecycle } from '@/store/slices/lifecycleSlice';
import { loadSubscriptionStatus } from '@/store/slices/subscriptionSlice';
import { getRedirectPath } from '@/lib/routing/getRedirectPath';

import type { AsyncThunkConfig } from '@reduxjs/toolkit';

export interface UseAuthSubmitOptions<TRequest = undefined, TResponse = any> {
  action: AsyncThunk<TResponse, TRequest, AsyncThunkConfig>;
  onError?: (error: string, setFormError?: (field: string, message: string) => void) => void;
  form?: {
    setError: (field: string, message: string) => void;
  };
  redirectOnSuccess?: boolean;
}

export interface UseAuthSubmitReturn<TRequest = undefined> {
  handleSubmit: (data: TRequest) => Promise<void>;
}

export function useAuthSubmit<TRequest = undefined, TResponse = any>(
  options: UseAuthSubmitOptions<TRequest, TResponse>
): UseAuthSubmitReturn<TRequest> {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    action,
    onError,
    form,
    redirectOnSuccess = true,
  } = options;

  const handleSubmit = useCallback(
    async (data: TRequest) => {
      const result = await dispatch(action(data as TRequest));

      if (action.fulfilled.match(result)) {
        // Load both lifecycle and subscription to ensure complete state before redirecting
        const lifecycleResult = await dispatch(loadLifecycle());
        await dispatch(loadSubscriptionStatus()); // Load subscription in parallel
        
        if (redirectOnSuccess) {
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
        }
      } else {
        // Error handling
        const errorMessage = (result.payload as string) || 'An error occurred';
        
        if (onError) {
          onError(errorMessage, form?.setError);
        } else {
          // Default: set error on email field
          form?.setError('email', errorMessage);
        }
      }
    },
    [dispatch, action, onError, form, redirectOnSuccess, router]
  );

  return {
    handleSubmit,
  };
}
