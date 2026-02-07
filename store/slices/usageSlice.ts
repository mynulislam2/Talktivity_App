/**
 * Usage Slice
 * 
 * Manages usage tracking and limits using Redux Toolkit.
 * Handles session recording and limit checking.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { usageService } from '@/service/UsageService';
import type { RootState } from '@/store';

export interface RoleplayLimits {
  success: boolean;
  canPlay: boolean;
  limit: number;
  used: number;
  remaining: number;
}

interface UsageState {
  limits: RoleplayLimits | null;
  loading: boolean;
  error: string | null;
  recording: boolean;
}

const initialState: UsageState = {
  limits: null,
  loading: false,
  error: null,
  recording: false,
};

// Async thunk for checking roleplay limit
export const checkRoleplayLimit = createAsyncThunk(
  'usage/checkRoleplayLimit',
  async (sectionName: string, { rejectWithValue }) => {
    try {
      const result = await usageService.checkRoleplayLimit(sectionName);
      if (result.success) {
        return result;
      }
      return rejectWithValue('Failed to check roleplay limit');
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.error || error?.message || 'Failed to check roleplay limit'
      );
    }
  }
);

// Async thunk for recording roleplay session
export const recordRoleplaySession = createAsyncThunk(
  'usage/recordRoleplaySession',
  async (sectionName: string, { rejectWithValue }) => {
    try {
      const result = await usageService.recordRoleplaySession(sectionName);
      if (result) {
        return { success: true };
      }
      return rejectWithValue('Failed to record session');
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.error || error?.message || 'Failed to record session'
      );
    }
  }
);

const usageSlice = createSlice({
  name: 'usage',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearLimits: (state) => {
      state.limits = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Check Roleplay Limit
      .addCase(checkRoleplayLimit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkRoleplayLimit.fulfilled, (state, action) => {
        state.loading = false;
        state.limits = action.payload;
        state.error = null;
      })
      .addCase(checkRoleplayLimit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to check limit';
      })
      // Record Roleplay Session
      .addCase(recordRoleplaySession.pending, (state) => {
        state.recording = true;
        state.error = null;
      })
      .addCase(recordRoleplaySession.fulfilled, (state) => {
        state.recording = false;
        state.error = null;
      })
      .addCase(recordRoleplaySession.rejected, (state, action) => {
        state.recording = false;
        state.error = action.payload as string || 'Failed to record session';
      });
  },
});

export const { clearError, clearLimits } = usageSlice.actions;
export default usageSlice.reducer;

// Selectors
export const selectRoleplayLimits = (state: RootState) => state.usage.limits;
export const selectUsageLoading = (state: RootState) => state.usage.loading;
export const selectUsageError = (state: RootState) => state.usage.error;
export const selectUsageRecording = (state: RootState) => state.usage.recording;
export const selectCanPlayRoleplay = (state: RootState) => state.usage.limits?.canPlay ?? false;
export const selectRemainingTime = (state: RootState) => state.usage.limits?.remaining ?? 0;
