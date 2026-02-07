/**
 * useAuthSubmit Hook
 * 
 * Handles authentication form submission (login & signup)
 * - Manages loading and error states
 * - Calls AuthService
 * - Stores tokens in AsyncStorage
 * - Dispatches auth actions to Redux
 */

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { authService } from '../../service/AuthService';
import { asyncStorageManager } from '../../lib/auth/asyncStorageManager';
import { setUser, setLoading as setAuthLoading, setError as setAuthError } from '../../store/slices/authSlice';
import { LoginRequest, RegisterRequest } from '../../types/auth';

interface AuthSubmitState {
  loading: boolean;
  error: string | null;
}

interface UseAuthSubmitReturn extends AuthSubmitState {
  login: (credentials: LoginRequest) => Promise<boolean>;
  signup: (data: RegisterRequest) => Promise<boolean>;
  clearError: () => void;
}

export const useAuthSubmit = (): UseAuthSubmitReturn => {
  const dispatch = useDispatch<AppDispatch>();
  const [state, setState] = useState<AuthSubmitState>({
    loading: false,
    error: null,
  });

  const handleAuthSuccess = async (response: any) => {
    try {
      // Store token and user in AsyncStorage
      await asyncStorageManager.storeAuthData(response.data);

      // Update Redux with user data
      dispatch(setUser(response.data.user));
      dispatch(setAuthLoading(false));

      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to store authentication data';
      setState({ loading: false, error: errorMsg });
      dispatch(setAuthError(errorMsg));
      return false;
    }
  };

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    setState({ loading: true, error: null });
    dispatch(setAuthLoading(true));

    try {
      const response = await authService.login(credentials);

      if (response.success) {
        return await handleAuthSuccess(response);
      } else {
        const errorMsg = response.message || 'Login failed';
        setState({ loading: false, error: errorMsg });
        dispatch(setAuthError(errorMsg));
        return false;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'An error occurred during login';
      setState({ loading: false, error: errorMsg });
      dispatch(setAuthError(errorMsg));
      return false;
    }
  };

  const signup = async (data: RegisterRequest): Promise<boolean> => {
    setState({ loading: true, error: null });
    dispatch(setAuthLoading(true));

    try {
      const response = await authService.register(data);

      if (response.success) {
        return await handleAuthSuccess(response);
      } else {
        const errorMsg = response.message || 'Signup failed';
        setState({ loading: false, error: errorMsg });
        dispatch(setAuthError(errorMsg));
        return false;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'An error occurred during signup';
      setState({ loading: false, error: errorMsg });
      dispatch(setAuthError(errorMsg));
      return false;
    }
  };

  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
    dispatch(setAuthError(null));
  };

  return {
    ...state,
    login,
    signup,
    clearError,
  };
};
