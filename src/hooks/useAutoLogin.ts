/**
 * useAutoLogin Hook
 *
 * Automatically logs in user if they have a valid token in AsyncStorage
 * This is called when the app first loads to restore user session
 */

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { asyncStorageManager } from '@/lib/auth/asyncStorageManager';
import {
  setUser,
  setLoading as setAuthLoading,
} from '@/store/slices/authSlice';

interface UseAutoLoginReturn {
  isLoading: boolean;
  isCheckingAuth: boolean;
}

export const useAutoLogin = (): UseAutoLoginReturn => {
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false); // Start as false - don't block app
  const [isCheckingAuth, setIsCheckingAuth] = useState(false); // Start as false

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setIsCheckingAuth(true);
        dispatch(setAuthLoading(true));

        // First, quickly check if token exists (fast check)
        const token = await asyncStorageManager.getToken();

        // If no token, skip the full auth check and go straight to login
        if (!token) {
          setIsCheckingAuth(false);
          setIsLoading(false);
          dispatch(setAuthLoading(false));
          return;
        }

        // Only do full auth check if token exists
        const isAuthenticated = await asyncStorageManager.isAuthenticated();

        if (isAuthenticated) {
          // Get user from AsyncStorage and update Redux
          const user = await asyncStorageManager.getUser();
          if (user) {
            dispatch(setUser(user));
          }
        }
        // If not authenticated, Redux auth state will remain empty
        // User will be redirected to LoginScreen by RootNavigator
      } catch (error) {
        // Silent fail - user will be logged out
        console.error('Auto-login check failed:', error);
      } finally {
        setIsCheckingAuth(false);
        setIsLoading(false);
        dispatch(setAuthLoading(false));
      }
    };

    // Check auth in background - don't block app startup
    checkAuthStatus();
  }, [dispatch]);

  return {
    isLoading,
    isCheckingAuth,
  };
};
