/**
 * useLogout Hook
 * 
 * Handles user logout
 * - Clears AsyncStorage tokens
 * - Resets Redux auth state
 * - Calls backend logout endpoint (optional)
 */

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { authService } from '@/service/AuthService';
import { asyncStorageManager } from '@/lib/auth/asyncStorageManager';
import { clearAuth } from '@/store/slices/authSlice';

interface UseLogoutReturn {
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const useLogout = (): UseLogoutReturn => {
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to call backend logout endpoint
      await authService.logout();
    } catch (err) {
      // Even if backend logout fails, clear local data
      console.warn('Backend logout failed:', err);
    }

    try {
      // Clear AsyncStorage
      await asyncStorageManager.clearAuthData();

      // Reset Redux auth state
      dispatch(clearAuth());
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMsg);
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    logout,
    isLoading,
    error,
  };
};
