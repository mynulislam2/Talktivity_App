import { useCallback } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { loadSubscriptionStatus } from '@/store/slices/subscriptionSlice';

export interface UseAuthSubmitNativeOptions {
  action: any;
  onError?: (error: string) => void;
  form?: any;
}

export interface UseAuthSubmitNativeReturn {
  handleSubmit: (data: any) => Promise<void>;
}

export function useAuthSubmitNative(
  options?: UseAuthSubmitNativeOptions
): UseAuthSubmitNativeReturn {
  const dispatch = useAppDispatch();

  const handleSubmit = useCallback(
    async (data: any) => {
      let actionToDispatch;

      if (typeof options?.action === 'function' && !data?.action) {
        // If options.action is an action creator (like a Redux Toolkit thunk), call it with data
        actionToDispatch = options.action(data);
      } else {
        // Otherwise use the provided action or data itself
        actionToDispatch = data?.action || options?.action || data;
      }

      const onError = data?.onError || options?.onError;
      const result = await dispatch(actionToDispatch);

      if (
        result?.meta?.requestStatus === 'fulfilled' ||
        (actionToDispatch.fulfilled && actionToDispatch.fulfilled.match(result))
      ) {
        await dispatch(loadSubscriptionStatus());
      } else {
        const errorMessage =
          (result?.payload as string) ||
          result?.error?.message ||
          'An error occurred';
        onError?.(errorMessage);
      }
    },
    [dispatch, options]
  );

  return { handleSubmit };
}
