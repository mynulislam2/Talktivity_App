/**
 * Redux Toolkit Auth Slice
 * 
 * Manages global authentication state including user data, tokens,
 * loading states, and errors for login, registration, and OAuth flows.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '@/service/AuthService';
import {
  LoginRequest,
  RegisterRequest,
  User,
  AuthResponseData,
} from '@/types/auth';
import { toAuthError, extractErrorMessage } from '@/lib/auth/errorHandler';

/**
 * Authentication state interface
 */
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  // Login specific states
  loginLoading: boolean;
  loginError: string | null;
  // Register specific states
  registerLoading: boolean;
  registerError: string | null;
  // Google OAuth specific states
  googleAuthLoading: boolean;
  googleAuthError: string | null;
}

/**
 * Initial state
 */
const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  loginLoading: false,
  loginError: null,
  registerLoading: false,
  registerError: null,
  googleAuthLoading: false,
  googleAuthError: null,
};

/**
 * Async thunk for user login
 */
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue('Login failed: Invalid response');
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Async thunk for user registration
 */
export const registerUser = createAsyncThunk(
  'auth/register',
  async (data: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await authService.register(data);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue('Registration failed: Invalid response');
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Async thunk for Google OAuth authentication
 */
export const googleOAuth = createAsyncThunk(
  'auth/googleOAuth',
  async (code: string, { rejectWithValue }) => {
    try {
      const response = await authService.googleOAuth({ code });
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue('Google authentication failed: Invalid response');
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Async thunk for user logout
 */
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return null;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Auth slice
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Clears all error states
     */
    clearError: (state) => {
      state.error = null;
      state.loginError = null;
      state.registerError = null;
      state.googleAuthError = null;
    },
    /**
     * Sets user data manually (useful for initialization)
     */
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    /**
     * Set global loading state
     */
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    /**
     * Set global error state
     */
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    /**
     * Clear all auth data (logout)
     */
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loginError = null;
      state.registerError = null;
      state.googleAuthError = null;
      state.isLoading = false;
      state.loginLoading = false;
      state.registerLoading = false;
      state.googleAuthLoading = false;
    },
    /**
     * Initializes auth state - Placeholder for backward compatibility
     */
    initializeAuth: (state) => {
      // In React Native with Redux Persist, initialization is handled by PersistGate.
      // Direct storage access is asynchronous and cannot be done in a synchronous reducer.
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loginLoading = true;
        state.loginError = null;
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthResponseData>) => {
        state.loginLoading = false;
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken || null;
        state.isAuthenticated = true;
        state.loginError = null;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginLoading = false;
        state.isLoading = false;
        state.loginError = action.payload as string || 'Login failed';
        state.error = action.payload as string || 'Login failed';
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.registerLoading = true;
        state.registerError = null;
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<AuthResponseData>) => {
        state.registerLoading = false;
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken || null;
        state.isAuthenticated = true;
        state.registerError = null;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.registerLoading = false;
        state.isLoading = false;
        state.registerError = action.payload as string || 'Registration failed';
        state.error = action.payload as string || 'Registration failed';
      });

    // Google OAuth
    builder
      .addCase(googleOAuth.pending, (state) => {
        state.googleAuthLoading = true;
        state.googleAuthError = null;
        state.isLoading = true;
      })
      .addCase(googleOAuth.fulfilled, (state, action: PayloadAction<AuthResponseData>) => {
        state.googleAuthLoading = false;
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken || null;
        state.isAuthenticated = true;
        state.googleAuthError = null;
        state.error = null;
      })
      .addCase(googleOAuth.rejected, (state, action) => {
        state.googleAuthLoading = false;
        state.isLoading = false;
        state.googleAuthError = action.payload as string || 'Google authentication failed';
        state.error = action.payload as string || 'Google authentication failed';
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
        state.loginError = null;
        state.registerError = null;
        state.googleAuthError = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        // Even if logout fails, clear the state
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = action.payload as string || 'Logout failed';
      });
  },
});

// Export actions
export const { clearError, setUser, setLoading, setError, clearAuth, initializeAuth } = authSlice.actions;

// Export selectors
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.accessToken;
export const selectRefreshToken = (state: { auth: AuthState }) => state.auth.refreshToken;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectLoginLoading = (state: { auth: AuthState }) => state.auth.loginLoading;
export const selectLoginError = (state: { auth: AuthState }) => state.auth.loginError;
export const selectRegisterLoading = (state: { auth: AuthState }) => state.auth.registerLoading;
export const selectRegisterError = (state: { auth: AuthState }) => state.auth.registerError;
export const selectGoogleAuthLoading = (state: { auth: AuthState }) => state.auth.googleAuthLoading;
export const selectGoogleAuthError = (state: { auth: AuthState }) => state.auth.googleAuthError;

export default authSlice.reducer;
