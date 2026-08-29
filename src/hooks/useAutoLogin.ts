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
  clearAuth,
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
          dispatch(clearAuth());
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
          } else {
            await asyncStorageManager.clearAuthData();
            dispatch(clearAuth());
          }
        } else {
          // The stored session is unusable. `auth` is in the redux-persist
          // whitelist, so doing nothing here leaves the previous session's
          // `isAuthenticated: true` rehydrated and RootNavigator opens Main
          // with no credentials — every screen then renders the backend's
          // "No token provided". Drop both halves together.
          await asyncStorageManager.clearAuthData();
          dispatch(clearAuth());
        }
      } catch (error) {
        // Storage is unreadable, so there is no session we can trust.
        console.error('Auto-login check failed:', error);
        dispatch(clearAuth());
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
