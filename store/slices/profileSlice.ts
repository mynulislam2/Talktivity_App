/**
 * Redux Toolkit Profile Slice
 * 
 * Manages global profile state including user profile data and progress stats.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { profileService } from '@/service/ProfileService';
import { courseService } from '@/service/CourseService';
import type { ProfileData } from '@/types/profile';
import type { ProgressStats } from '@/types/profile';
import type { RootState } from '@/store';
import { selectCourseStatus, loadCourseStatus } from './courseSlice';

/**
 * Profile state interface
 */
interface ProfileState {
  profile: ProfileData | null;
  progressStats: ProgressStats | null;
  loading: boolean;
  error: string | null;
  profileLoading: boolean;
  progressLoading: boolean;
}

/**
 * Initial state
 */
const initialState: ProfileState = {
  profile: null,
  progressStats: null,
  loading: false,
  error: null,
  profileLoading: false,
  progressLoading: false,
};

/**
 * Async thunk: Load profile
 */
export const loadProfile = createAsyncThunk(
  'profile/loadProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await profileService.getProfile();
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.error || 'Failed to load profile');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load profile');
    }
  }
);

/**
 * Async thunk: Load progress stats
 */
export const loadProgressStats = createAsyncThunk(
  'profile/loadProgressStats',
  async (_, { rejectWithValue, getState, dispatch }) => {
    try {
      // Get course status from Redux store (courseSlice)
      const state = getState() as RootState;
      let courseStatus = selectCourseStatus(state);
      
      // If course status not in Redux, load it
      if (!courseStatus) {
        try {
          const result = await dispatch(loadCourseStatus()).unwrap();
          courseStatus = result;
        } catch (error) {
          // If course status load fails, use null
          courseStatus = null;
        }
      }

      const courseAnalytics = await courseService.getCourseAnalytics().catch(() => null);

      return {
        courseStatus,
        courseProgress: courseAnalytics,
        monthlyReport: null,
      } as ProgressStats;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load progress stats');
    }
  }
);

/**
 * Async thunk: Refresh all profile data
 */
export const refreshProfile = createAsyncThunk(
  'profile/refreshProfile',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await Promise.all([
        dispatch(loadProfile()),
        dispatch(loadProgressStats()),
      ]);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to refresh profile');
    }
  }
);

/**
 * Profile slice
 */
const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    /**
     * Clear error state
     */
    clearError: (state) => {
      state.error = null;
    },
    resetProfile: (state) => {
      state.profile = null;
      state.progressStats = null;
      state.loading = false;
      state.error = null;
      state.profileLoading = false;
      state.progressLoading = false;
    },
  },
  extraReducers: (builder) => {
    // Load profile
    builder
      .addCase(loadProfile.pending, (state) => {
        state.profileLoading = true;
        state.error = null;
      })
      .addCase(loadProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.profileLoading = false;
      })
      .addCase(loadProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.error = action.payload as string;
      });

    // Load progress stats
    builder
      .addCase(loadProgressStats.pending, (state) => {
        state.progressLoading = true;
        state.error = null;
      })
      .addCase(loadProgressStats.fulfilled, (state, action) => {
        state.progressStats = action.payload;
        state.progressLoading = false;
      })
      .addCase(loadProgressStats.rejected, (state, action) => {
        state.progressLoading = false;
        // Don't set error for progress stats - it's optional
        // state.error = action.payload as string;
      });

    // Refresh profile
    builder
      .addCase(refreshProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshProfile.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(refreshProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetProfile } = profileSlice.actions;

/**
 * Selectors
 */
export const selectProfile = (state: { profile: ProfileState }) => state.profile.profile;
export const selectProgressStats = (state: { profile: ProfileState }) => state.profile.progressStats;
export const selectProfileLoading = (state: { profile: ProfileState }) => 
  state.profile.loading || state.profile.profileLoading || state.profile.progressLoading;
export const selectProfileError = (state: { profile: ProfileState }) => state.profile.error;
export const selectProfileDataLoading = (state: { profile: ProfileState }) => state.profile.profileLoading;
export const selectProgressLoading = (state: { profile: ProfileState }) => state.profile.progressLoading;

export default profileSlice.reducer;
