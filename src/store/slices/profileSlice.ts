/**
 * Redux Toolkit Profile Slice
 *
 * Manages global profile state including user profile data and progress stats.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { profileService } from '@/services/profile';
import { courseService } from '@/services/course';
import { proficiencyService } from '@/services/report/ProficiencyService';
import { calculateProficiency } from '@/lib/report/cefrProficiency';
import type { ProfileData } from '@/types/profile';
import type { ProgressStats } from '@/types/profile';
import type { ProficiencyResult, SessionScore } from '@/types/proficiency';
import type { RootState } from '@/store';
import { selectCourseStatus, loadCourseStatus } from './courseSlice';

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

/**
 * Profile state interface
 */
interface ProfileState {
  profile: ProfileData | null;
  progressStats: ProgressStats | null;
  proficiency: ProficiencyResult | null;
  proficiencySessions: SessionScore[] | null;
  loading: boolean;
  error: string | null;
  profileLoading: boolean;
  progressLoading: boolean;
  proficiencyLoading: boolean;
}

/**
 * Initial state
 */
const initialState: ProfileState = {
  profile: null,
  progressStats: null,
  proficiency: null,
  proficiencySessions: null,
  loading: false,
  error: null,
  profileLoading: false,
  progressLoading: false,
  proficiencyLoading: false,
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
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to load profile'));
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
        } catch {
          // If course status load fails, use null
          courseStatus = null;
        }
      }

      const courseAnalytics = await courseService
        .getCourseAnalytics()
        .catch(() => null);

      return {
        courseStatus,
        courseProgress: courseAnalytics,
        monthlyReport: null,
      } as ProgressStats;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, 'Failed to load progress stats')
      );
    }
  }
);

/**
 * Async thunk: Load CEFR proficiency inputs + calculated profile
 */
export const loadProficiency = createAsyncThunk(
  'profile/loadProficiency',
  async (_, { rejectWithValue }) => {
    try {
      const response = await proficiencyService.getProficiency();

      if (!response.success || !response.data) {
        return rejectWithValue(response.error || 'Failed to load proficiency');
      }

      return {
        sessions: response.data.sessions || [],
        proficiency: calculateProficiency(response.data.sessions || []),
      };
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, 'Failed to load proficiency')
      );
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
        dispatch(loadProficiency()),
      ]);
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, 'Failed to refresh profile')
      );
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
      state.proficiency = null;
      state.proficiencySessions = null;
      state.loading = false;
      state.error = null;
      state.profileLoading = false;
      state.progressLoading = false;
      state.proficiencyLoading = false;
    },
  },
  extraReducers: (builder) => {
    // Load profile
    builder
      .addCase(loadProfile.pending, (state) => {
        if (!state.profile) {
          state.profileLoading = true;
        }
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
        if (!state.progressStats) {
          state.progressLoading = true;
        }
        state.error = null;
      })
      .addCase(loadProgressStats.fulfilled, (state, action) => {
        state.progressStats = action.payload;
        state.progressLoading = false;
      })
      .addCase(loadProgressStats.rejected, (state) => {
        state.progressLoading = false;
        // Don't set error for progress stats - it's optional
        // state.error = action.payload as string;
      });

    // Load proficiency
    builder
      .addCase(loadProficiency.pending, (state) => {
        if (!state.proficiency) {
          state.proficiencyLoading = true;
        }
      })
      .addCase(loadProficiency.fulfilled, (state, action) => {
        state.proficiency = action.payload.proficiency;
        state.proficiencySessions = action.payload.sessions;
        state.proficiencyLoading = false;
      })
      .addCase(loadProficiency.rejected, (state) => {
        state.proficiencyLoading = false;
        state.proficiency = null;
        state.proficiencySessions = null;
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
export const selectProfile = (state: RootState) => state.profile.profile;
export const selectProgressStats = (state: RootState) =>
  state.profile.progressStats;
export const selectProficiency = (state: RootState) =>
  state.profile.proficiency;
export const selectProficiencySessions = (state: RootState) =>
  state.profile.proficiencySessions;
export const selectProfileLoading = (state: RootState) =>
  state.profile.loading ||
  state.profile.profileLoading ||
  state.profile.progressLoading ||
  state.profile.proficiencyLoading;
export const selectProfileError = (state: RootState) => state.profile.error;
export const selectProfileDataLoading = (state: RootState) =>
  state.profile.profileLoading;
export const selectProgressLoading = (state: RootState) =>
  state.profile.progressLoading;
export const selectProficiencyLoading = (state: RootState) =>
  state.profile.proficiencyLoading;

export default profileSlice.reducer;
