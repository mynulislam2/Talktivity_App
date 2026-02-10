/**
 * Redux Toolkit Lifecycle Slice
 * 
 * Manages global lifecycle state including onboarding status, milestones,
 * and user progress tracking. Shared by onboarding and call pages.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { lifecycleService } from '@/service/LifecycleService';
import { authService } from '@/service/AuthService';
import { LifecycleResponseData } from '@/types/onboarding/responses';
import { extractErrorMessage } from '@/lib/onboarding/errorHandler';

/**
 * Lifecycle state interface
 */
interface LifecycleState {
  data: LifecycleResponseData | null;
  loading: boolean;
  error: string | null;
}

/**
 * Initial state
 */
const initialState: LifecycleState = {
  data: null,
  loading: false,
  error: null,
};

/**
 * Async thunk: Load lifecycle data
 * GET /api/lifecycle: Returns onboarding status, milestones, and timestamps
 */
export const loadLifecycle = createAsyncThunk(
  'lifecycle/load',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Get user from Redux state (synchronous)
      const state = getState() as any;
      const userId = state?.auth?.user?.id;
      if (!userId) {
        // Fallback: try async getUser if Redux state not available yet
        const user = await authService.getUser();
        if (!user?.id) {
          throw new Error('User not authenticated');
        }
      }
      
      console.log('📡 Calling lifecycle API...');
      const response = await lifecycleService.getLifecycle();
      console.log('✅ Lifecycle API response:', { success: response.success, hasData: !!response.data });
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return rejectWithValue('Failed to load lifecycle data');
    } catch (error) {
      console.error('❌ Lifecycle API error:', error);
      const errorMessage = extractErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Async thunk: Update lifecycle fields
 * POST /api/lifecycle: Updates lifecycle milestones (report_completed, upgrade_completed, etc.)
 */
export const updateLifecycle = createAsyncThunk(
  'lifecycle/update',
  async (updates: {
    report_completed?: boolean;
    upgrade_completed?: boolean;
    onboarding_completed?: boolean;
    onboarding_steps?: number;
    call_completed?: boolean;
  }, { rejectWithValue, getState }) => {
    try {
      // Get user from Redux state (synchronous)
      const state = getState() as any;
      const userId = state?.auth?.user?.id;
      if (!userId) {
        // Fallback: try async getUser if Redux state not available yet
        const user = await authService.getUser();
        if (!user?.id) {
          throw new Error('User not authenticated');
        }
      }
      
      const response = await lifecycleService.updateLifecycle(updates);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return rejectWithValue('Failed to update lifecycle data');
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Lifecycle slice
 */
const lifecycleSlice = createSlice({
  name: 'lifecycle',
  initialState,
  reducers: {
    /**
     * Clears all error states
     */
    clearError: (state) => {
      state.error = null;
    },
    
    /**
     * Resets lifecycle state
     */
    resetLifecycle: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Handle loadLifecycle
    builder
      .addCase(loadLifecycle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadLifecycle.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(loadLifecycle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to load lifecycle data';
      })
      // Handle updateLifecycle
      .addCase(updateLifecycle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLifecycle.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(updateLifecycle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to update lifecycle data';
      });
  },
});

// Export actions
export const { clearError, resetLifecycle } = lifecycleSlice.actions;

// Export selectors
export const selectLifecycleData = (state: { lifecycle: LifecycleState }) => state.lifecycle.data;
export const selectLifecycleLoading = (state: { lifecycle: LifecycleState }) => state.lifecycle.loading;
export const selectLifecycleError = (state: { lifecycle: LifecycleState }) => state.lifecycle.error;
export const selectCallCompleted = (state: { lifecycle: LifecycleState }) => 
  state.lifecycle.data?.milestones?.callCompleted ?? false;
export const selectReportCompleted = (state: { lifecycle: LifecycleState }) => 
  state.lifecycle.data?.milestones?.reportCompleted ?? false;
export const selectUpgradeCompleted = (state: { lifecycle: LifecycleState }) => 
  state.lifecycle.data?.milestones?.upgradeCompleted ?? false;

// Lifecycle-derived selectors for auth context compatibility
export const selectHasOnboarding = (state: { lifecycle: LifecycleState }) => 
  state.lifecycle.data?.onboarding?.completed || false;

export const selectHasConversationExperience = (state: { lifecycle: LifecycleState }) => 
  state.lifecycle.data?.milestones?.callCompleted || false;

export const selectHasSubscription = (state: { lifecycle: LifecycleState }) => 
  state.lifecycle.data?.milestones?.upgradeCompleted || false;

// Export reducer
export default lifecycleSlice.reducer;
