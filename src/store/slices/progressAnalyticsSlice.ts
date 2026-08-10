/**
 * Redux Toolkit Progress Analytics Slice
 *
 * Manages global progress analytics state including analytics and achievements data.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  courseService,
  type CourseAnalytics,
  type UserAchievements,
} from '@/services/course';

/**
 * Progress Analytics state interface
 */
interface ProgressAnalyticsState {
  analytics: CourseAnalytics | null;
  achievements: UserAchievements | null;
  loading: boolean;
  error: string | null;
}

/**
 * Initial state
 */
const initialState: ProgressAnalyticsState = {
  analytics: null,
  achievements: null,
  loading: false,
  error: null,
};

/**
 * Async thunk: Load progress analytics
 */
export const loadProgressAnalytics = createAsyncThunk(
  'progressAnalytics/loadProgressAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const data = await courseService.getProgressPageData();

      // If no active course (404), return null (not an error)
      if (!data) {
        return null;
      }

      return data;
    } catch (error: any) {
      // Handle 404 gracefully (no active course) - don't treat as error
      if (
        error?.message?.includes('404') ||
        error?.message?.includes('No active course')
      ) {
        return null;
      }
      return rejectWithValue(
        error.message || 'Failed to load progress analytics'
      );
    }
  }
);

/**
 * Async thunk: Refresh progress analytics
 */
export const refreshProgressAnalytics = createAsyncThunk(
  'progressAnalytics/refreshProgressAnalytics',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await dispatch(loadProgressAnalytics());
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Failed to refresh progress analytics'
      );
    }
  }
);

/**
 * Progress Analytics slice
 */
const progressAnalyticsSlice = createSlice({
  name: 'progressAnalytics',
  initialState,
  reducers: {
    /**
     * Clear error state
     */
    clearError: (state) => {
      state.error = null;
    },
    resetProgressAnalytics: (state) => {
      state.analytics = null;
      state.achievements = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Load progress analytics
    builder
      .addCase(loadProgressAnalytics.pending, (state) => {
        if (!state.analytics && !state.achievements) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(loadProgressAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.analytics = action.payload.analytics;
          state.achievements = action.payload.achievements;
        } else {
          // No active course - set to null (valid state)
          state.analytics = null;
          state.achievements = null;
        }
      })
      .addCase(loadProgressAnalytics.rejected, (state, action) => {
        state.loading = false;
        // Only set error if it's not a 404 (no course is valid state)
        if (
          action.payload &&
          !String(action.payload).includes('404') &&
          !String(action.payload).includes('No active course')
        ) {
          state.error = action.payload as string;
        }
      });

    // Refresh progress analytics
    builder
      .addCase(refreshProgressAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshProgressAnalytics.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(refreshProgressAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetProgressAnalytics } =
  progressAnalyticsSlice.actions;

/**
 * Selectors
 */
export const selectProgressAnalytics = (state: {
  progressAnalytics: ProgressAnalyticsState;
}) => state.progressAnalytics.analytics;
export const selectProgressAchievements = (state: {
  progressAnalytics: ProgressAnalyticsState;
}) => state.progressAnalytics.achievements;
export const selectProgressLoading = (state: {
  progressAnalytics: ProgressAnalyticsState;
}) => state.progressAnalytics.loading;
export const selectProgressError = (state: {
  progressAnalytics: ProgressAnalyticsState;
}) => state.progressAnalytics.error;

export default progressAnalyticsSlice.reducer;
