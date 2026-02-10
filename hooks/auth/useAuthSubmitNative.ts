/**
 * useAuthSubmit Hook (React Native Version)
 * 
 * Handles form submission with error handling for authentication actions.
 * Provides a consistent pattern for login/register form submissions.
 * Adapted from Next.js version to use React Navigation instead of Next Router.
 */

import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
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

export function useAuthSubmitNative<TRequest = undefined, TResponse = any>(
  options: UseAuthSubmitOptions<TRequest, TResponse>
): UseAuthSubmitReturn<TRequest> {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
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
        console.log('✅ Registration successful, loading lifecycle...');
        // Load both lifecycle and subscription to ensure complete state before redirecting
        let lifecycleResult: any = null;
        try {
          console.log('📡 Dispatching loadLifecycle...');
          lifecycleResult = await dispatch(loadLifecycle());
          console.log('📊 Lifecycle result:', {
            type: lifecycleResult.type,
            success: loadLifecycle.fulfilled.match(lifecycleResult),
            rejected: loadLifecycle.rejected.match(lifecycleResult),
            hasLifecycle: !!lifecycleResult.payload,
            error: lifecycleResult.type.includes('rejected') ? lifecycleResult.payload : null,
          });
          
          if (loadLifecycle.rejected.match(lifecycleResult)) {
            console.error('❌ Lifecycle load failed:', lifecycleResult.payload);
          }
        } catch (error) {
          console.error('❌ Error dispatching loadLifecycle:', error);
        }
        
        try {
          await dispatch(loadSubscriptionStatus()); // Load subscription in parallel
        } catch (error) {
          console.error('❌ Error loading subscription:', error);
        }
        
        // CRITICAL: Check lifecycle and navigate appropriately
        // RootNavigator will handle keeping user in Auth stack if onboarding is needed
        // But we should also navigate directly to Onboarding if we're still in Auth stack
        if (redirectOnSuccess && lifecycleResult && loadLifecycle.fulfilled.match(lifecycleResult)) {
          const lifecycle = lifecycleResult.payload;
          const redirectPath = getRedirectPath(lifecycle);
          
          console.log('🔄 Redirect path:', redirectPath);
          
          if (redirectPath === '/onboarding') {
            // User needs onboarding - navigate to Onboarding screen within Auth stack
            console.log('📱 Navigating to Onboarding...');
            setTimeout(() => {
              try {
                (navigation as any).navigate('Onboarding');
                console.log('✅ Navigated to Onboarding');
              } catch (err) {
                console.log('⚠️ Navigation to Onboarding failed, RootNavigator will handle it:', err);
              }
            }, 200);
          } else if (redirectPath === '/call?CallStart=true') {
            // User finished onboarding but still needs initial test call
            console.log('📱 Navigating to initial CallScreen in Auth stack with reset...');
            setTimeout(() => {
              try {
                (navigation as any).reset({
                  index: 0,
                  routes: [
                    {
                      name: 'CallScreen',
                      params: { CallStart: true } as any,
                    } as any,
                  ],
                });
                console.log('✅ Reset stack to CallScreen (onboarding flow)');
              } catch (err) {
                console.log('⚠️ Navigation reset to CallScreen failed, RootNavigator will handle it:', err);
              }
            }, 200);
          } else {
            console.log('📱 User fully onboarded or other state, RootNavigator/useGlobalRouteGuard will handle navigation.');
          }
        } else if (redirectOnSuccess) {
          console.log('⚠️ Lifecycle not loaded yet, will retry...');
          // Lifecycle not loaded yet - wait a bit and try again
          // This handles the case where lifecycle API is slow
          setTimeout(async () => {
            const retryResult = await dispatch(loadLifecycle());
            if (loadLifecycle.fulfilled.match(retryResult)) {
              const lifecycle = retryResult.payload;
              const redirectPath = getRedirectPath(lifecycle);
              console.log('🔄 Retry - Redirect path:', redirectPath);
              if (redirectPath === '/onboarding') {
                try {
                  (navigation as any).navigate('Onboarding');
                  console.log('✅ Navigated to Onboarding (retry)');
                } catch (err) {
                  console.log('⚠️ Navigation to Onboarding failed (retry):', err);
                }
              }
            }
          }, 1000);
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
    [dispatch, action, onError, form, redirectOnSuccess, navigation]
  );

  return {
    handleSubmit,
  };
}
