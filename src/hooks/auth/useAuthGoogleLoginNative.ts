import { useCallback, useState, useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/slices/authSlice';
import { authService } from '@/services/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

export interface UseAuthGoogleLoginNativeReturn {
  googleLogin: () => Promise<void>;
  googleLogout: () => void;
  loading: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useAuthGoogleLoginNative(options?: {
  form?: { setError: (field: string, message: string) => void };
  onError?: (error: string) => void;
}): UseAuthGoogleLoginNativeReturn {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const webClientId =
      process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
      '845075130244-kr1afnggeqb0qjvn6gd3j3k8rbr9rrge.apps.googleusercontent.com';
    const iosClientId =
      process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ||
      '845075130244-kr1afnggeqb0qjvn6gd3j3k8rbr9rrge.apps.googleusercontent.com';

    GoogleSignin.configure({
      webClientId: webClientId,
      iosClientId: iosClientId,
    });
  }, []);

  const handleGoogleToken = async (idToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.googleToken({ idToken });

      if (result.success && result.data) {
        // Store auth data
        const { asyncStorageManager } = require('@/lib/auth/asyncStorageManager');
        await asyncStorageManager.storeAuthData(result.data);
        // Update redux state
        dispatch(setUser(result.data.user));
      } else {
        throw new Error(result.error || 'Google authentication failed');
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Google login failed';
      setError(errorMsg);
      options?.onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useCallback(async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      // Handle the newer v13 API (response.data) or older fallback (response.idToken)
      const idToken = response.data?.idToken || (response as any).idToken;
      if (idToken) {
        await handleGoogleToken(idToken);
      } else {
        throw new Error('No ID token returned from Google');
      }
    } catch (err: any) {
      console.log('Google login error', err);
      let errorMsg = 'Failed to start Google login';
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        errorMsg = 'Sign in was cancelled';
      } else if (err.code === statusCodes.IN_PROGRESS) {
        errorMsg = 'Sign in is already in progress';
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorMsg = 'Play services not available or outdated';
      } else {
        errorMsg = err?.message || errorMsg;
      }
      setError(errorMsg);
      options?.onError?.(errorMsg);
    }
  }, [options]);

  const googleLogout = useCallback(async () => {
    try {
      await GoogleSignin.signOut();
    } catch (err) {
      console.error('Google sign out error', err);
    }
  }, []);

  return { googleLogin, googleLogout, loading, isLoading: loading, error };
}

export async function handleGoogleOAuthNative(
  dispatch: ReturnType<typeof useAppDispatch>,
  code: string
) {
  throw new Error('Use the googleLogin method returned by the hook instead.');
}
