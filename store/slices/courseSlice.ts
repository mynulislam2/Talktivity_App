/**
 * Redux Toolkit Course Slice
 * 
 * Manages global course state including course status, initialization, and batch progression.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { courseService, type CourseStatus } from '@/service/CourseService';

/**
 * Helper to calculate dayType based on currentDay
 * Day 7 = speaking_exam, else = all_activities
 */
function calculateDayType(currentDay: number): 'all_activities' | 'speaking_exam' {
  if (currentDay === 7) return 'speaking_exam';
  return 'all_activities';
}

/**
 * Course state interface
 */
interface CourseState {
  courseStatus: CourseStatus | null;
  loading: boolean;
  error: string | null;
  initializing: boolean;
  checkingBatch: boolean;
}

/**
 * Initial state
 */
const initialState: CourseState = {
  courseStatus: null,
  loading: false,
  error: null,
  initializing: false,
  checkingBatch: false,
};

/**
 * Async thunk: Load course status
 */
export const loadCourseStatus = createAsyncThunk(
  'course/loadCourseStatus',
  async (_, { rejectWithValue }) => {
    try {
      const status = await courseService.getCourseStatus();
      
      // Add dayType if not present (for backward compatibility)
      if (status.course && !status.course.dayType) {
        status.course.dayType = calculateDayType(status.course.currentDay);
      }
      
      return status;
    } catch (error: any) {
      // Handle 404/NO_ACTIVE_COURSE gracefully (no active course yet)
      if (error?.status === 404 || error?.code === 'NO_ACTIVE_COURSE' || error?.message?.includes('No active course')) {
        return null;
      }
      return rejectWithValue(error.message || 'Failed to load course status');
    }
  }
);

/**
 * Async thunk: Initialize course
 */
export const initializeCourse = createAsyncThunk(
  'course/initializeCourse',
  async (_, { rejectWithValue }) => {
    try {
      await courseService.initializeCourse();
      // After initialization, load the course status
      const status = await courseService.getCourseStatus();
      
      // Add dayType if not present
      if (status.course && !status.course.dayType) {
        status.course.dayType = calculateDayType(status.course.currentDay);
      }
      
      return status;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to initialize course');
    }
  }
);

/**
 * Async thunk: Check and create next batch
 */
export const checkAndCreateNextBatch = createAsyncThunk(
  'course/checkAndCreateNextBatch',
  async (_, { rejectWithValue }) => {
    try {
      await courseService.checkAndCreateNextBatch();
      // After batch check, reload course status to get updated batch info
      const status = await courseService.getCourseStatus();
      
      // Add dayType if not present
      if (status.course && !status.course.dayType) {
        status.course.dayType = calculateDayType(status.course.currentDay);
      }
      
      return status;
    } catch (error: any) {
      // Don't treat batch check errors as critical - just log and continue
      // Batch check failed
      return rejectWithValue(error.message || 'Failed to check batch progression');
    }
  }
);

/**
 * Async thunk: Refresh course status
 */
export const refreshCourseStatus = createAsyncThunk(
  'course/refreshCourseStatus',
  async (_, { dispatch }) => {
    await dispatch(loadCourseStatus());
  }
);

/**
 * Course slice
 */
const courseSlice = createSlice({
  name: 'course',
  initialState,
  reducers: {
    /**
     * Set course status manually (if needed)
     */
    setCourseStatus: (state, action: PayloadAction<CourseStatus | null>) => {
      state.courseStatus = action.payload;
    },
    /**
     * Clear error state
     */
    clearError: (state) => {
      state.error = null;
    },
    resetCourse: (state) => {
      state.courseStatus = null;
      state.loading = false;
      state.error = null;
      state.initializing = false;
      state.checkingBatch = false;
    },
  },
  extraReducers: (builder) => {
    // Load course status
    builder
      .addCase(loadCourseStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadCourseStatus.fulfilled, (state, action) => {
        state.courseStatus = action.payload;
        state.loading = false;
      })
      .addCase(loadCourseStatus.rejected, (state, action) => {
        state.loading = false;
        // Only set error if it's not a 404 (no course is valid state)
        if (action.payload !== 'No active course found') {
          state.error = action.payload as string;
        }
      });

    // Initialize course
    builder
      .addCase(initializeCourse.pending, (state) => {
        state.initializing = true;
        state.error = null;
      })
      .addCase(initializeCourse.fulfilled, (state, action) => {
        state.courseStatus = action.payload;
        state.initializing = false;
        state.loading = false;
      })
      .addCase(initializeCourse.rejected, (state, action) => {
        state.initializing = false;
        state.loading = false;
        state.error = action.payload as string;
      });

    // Check and create next batch
    builder
      .addCase(checkAndCreateNextBatch.pending, (state) => {
        state.checkingBatch = true;
      })
      .addCase(checkAndCreateNextBatch.fulfilled, (state, action) => {
        // Update course status with latest batch info
        if (action.payload) {
          state.courseStatus = action.payload;
        }
        state.checkingBatch = false;
      })
      .addCase(checkAndCreateNextBatch.rejected, (state) => {
        // Don't set error for batch check failures (non-critical)
        state.checkingBatch = false;
      });

    // Refresh course status
    builder
      .addCase(refreshCourseStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshCourseStatus.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(refreshCourseStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCourseStatus, clearError, resetCourse } = courseSlice.actions;

/**
 * Selectors
 */
export const selectCourseStatus = (state: { course: CourseState }) => state.course.courseStatus;
export const selectCourseLoading = (state: { course: CourseState }) => 
  state.course.loading || state.course.initializing;
export const selectCourseError = (state: { course: CourseState }) => state.course.error;
export const selectIsInitializing = (state: { course: CourseState }) => state.course.initializing;
export const selectIsCheckingBatch = (state: { course: CourseState }) => state.course.checkingBatch;

export default courseSlice.reducer;
