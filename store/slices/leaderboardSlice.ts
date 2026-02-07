/**
 * Redux Toolkit Leaderboard Slice
 * 
 * Manages global leaderboard state including weekly/overall leaderboards and user positions.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { leaderboardService } from '@/service/LeaderboardService';
import type { LeaderboardUser, UserPositionData, LeaderboardType } from '@/types/leaderboard';

/**
 * Leaderboard state interface
 */
interface LeaderboardState {
  weeklyLeaderboard: LeaderboardUser[];
  overallLeaderboard: LeaderboardUser[];
  userPosition: {
    weekly: UserPositionData | null;
    overall: UserPositionData | null;
  };
  currentType: LeaderboardType;
  loading: boolean;
  error: string | null;
  weeklyLoading: boolean;
  overallLoading: boolean;
  positionLoading: {
    weekly: boolean;
    overall: boolean;
  };
}

/**
 * Initial state
 */
const initialState: LeaderboardState = {
  weeklyLeaderboard: [],
  overallLeaderboard: [],
  userPosition: {
    weekly: null,
    overall: null,
  },
  currentType: "weekly",
  loading: false,
  error: null,
  weeklyLoading: false,
  overallLoading: false,
  positionLoading: {
    weekly: false,
    overall: false,
  },
};

/**
 * Async thunk: Load weekly leaderboard
 */
export const loadWeeklyLeaderboard = createAsyncThunk(
  'leaderboard/loadWeeklyLeaderboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await leaderboardService.getWeeklyLeaderboard();
      if (response.success && response.data) {
        return {
          leaderboard: response.data.leaderboard,
          userRank: response.data.userRank,
        };
      }
      return rejectWithValue(response.error || 'Failed to load weekly leaderboard');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load weekly leaderboard');
    }
  }
);

/**
 * Async thunk: Load overall leaderboard
 */
export const loadOverallLeaderboard = createAsyncThunk(
  'leaderboard/loadOverallLeaderboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await leaderboardService.getOverallLeaderboard();
      if (response.success && response.data) {
        return {
          leaderboard: response.data.leaderboard,
          userRank: response.data.userRank,
        };
      }
      return rejectWithValue(response.error || 'Failed to load overall leaderboard');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load overall leaderboard');
    }
  }
);

/**
 * Async thunk: Load user position
 * Note: The backend returns userRank in the leaderboard response,
 * but we have a separate method that fetches it
 */
export const loadUserPosition = createAsyncThunk(
  'leaderboard/loadUserPosition',
  async (type: LeaderboardType, { rejectWithValue }) => {
    try {
      const response = await leaderboardService.getMyPosition(type);
      if (response.success) {
        return { type, position: response.data };
      }
      // Don't reject if position is null - it's optional
      return { type, position: null };
    } catch (error: any) {
      // Don't reject for position errors - it's optional
      return { type, position: null };
    }
  }
);

/**
 * Async thunk: Refresh leaderboard data
 */
export const refreshLeaderboard = createAsyncThunk(
  'leaderboard/refreshLeaderboard',
  async (type: LeaderboardType | undefined, { dispatch, rejectWithValue }) => {
    try {
      if (type === 'weekly' || !type) {
        await dispatch(loadWeeklyLeaderboard());
        await dispatch(loadUserPosition('weekly'));
      }
      if (type === 'overall' || !type) {
        await dispatch(loadOverallLeaderboard());
        await dispatch(loadUserPosition('overall'));
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to refresh leaderboard');
    }
  }
);

/**
 * Leaderboard slice
 */
const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState,
  reducers: {
    /**
     * Set current leaderboard type
     */
    setLeaderboardType: (state, action: PayloadAction<LeaderboardType>) => {
      state.currentType = action.payload;
    },
    /**
     * Clear error state
     */
    clearError: (state) => {
      state.error = null;
    },
    resetLeaderboard: (state) => {
      state.weeklyLeaderboard = [];
      state.overallLeaderboard = [];
      state.userPosition = {
        weekly: null,
        overall: null,
      };
      state.currentType = "weekly";
      state.loading = false;
      state.error = null;
      state.weeklyLoading = false;
      state.overallLoading = false;
      state.positionLoading = {
        weekly: false,
        overall: false,
      };
    },
  },
  extraReducers: (builder) => {
    // Load weekly leaderboard
    builder
      .addCase(loadWeeklyLeaderboard.pending, (state) => {
        state.weeklyLoading = true;
        state.error = null;
      })
      .addCase(loadWeeklyLeaderboard.fulfilled, (state, action) => {
        state.weeklyLeaderboard = action.payload.leaderboard;
        // Update user position if included in response
        if (action.payload.userRank) {
          state.userPosition.weekly = {
            ...action.payload.userRank,
            type: 'weekly',
          };
        }
        state.weeklyLoading = false;
      })
      .addCase(loadWeeklyLeaderboard.rejected, (state, action) => {
        state.weeklyLoading = false;
        state.error = action.payload as string;
      });

    // Load overall leaderboard
    builder
      .addCase(loadOverallLeaderboard.pending, (state) => {
        state.overallLoading = true;
        state.error = null;
      })
      .addCase(loadOverallLeaderboard.fulfilled, (state, action) => {
        state.overallLeaderboard = action.payload.leaderboard;
        // Update user position if included in response
        if (action.payload.userRank) {
          state.userPosition.overall = {
            ...action.payload.userRank,
            type: 'overall',
          };
        }
        state.overallLoading = false;
      })
      .addCase(loadOverallLeaderboard.rejected, (state, action) => {
        state.overallLoading = false;
        state.error = action.payload as string;
      });

    // Load user position
    builder
      .addCase(loadUserPosition.pending, (state, action) => {
        state.positionLoading[action.meta.arg] = true;
      })
      .addCase(loadUserPosition.fulfilled, (state, action) => {
        state.userPosition[action.payload.type] = action.payload.position;
        state.positionLoading[action.payload.type] = false;
      })
      .addCase(loadUserPosition.rejected, (state, action) => {
        // Don't set error for position - it's optional
        if (action.meta.arg) {
          state.positionLoading[action.meta.arg] = false;
        }
      });

    // Refresh leaderboard
    builder
      .addCase(refreshLeaderboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshLeaderboard.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(refreshLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setLeaderboardType, clearError, resetLeaderboard } = leaderboardSlice.actions;

/**
 * Selectors
 */
export const selectWeeklyLeaderboard = (state: { leaderboard: LeaderboardState }) => 
  state.leaderboard.weeklyLeaderboard;
export const selectOverallLeaderboard = (state: { leaderboard: LeaderboardState }) => 
  state.leaderboard.overallLeaderboard;
export const selectCurrentType = (state: { leaderboard: LeaderboardState }) => 
  state.leaderboard.currentType;
export const selectUserPosition = (type: LeaderboardType) => (state: { leaderboard: LeaderboardState }) => 
  state.leaderboard.userPosition[type];
export const selectLeaderboardLoading = (state: { leaderboard: LeaderboardState }) => 
  state.leaderboard.loading || state.leaderboard.weeklyLoading || state.leaderboard.overallLoading;
export const selectLeaderboardError = (state: { leaderboard: LeaderboardState }) => 
  state.leaderboard.error;

/**
 * Computed selectors
 */
export const selectCurrentLeaderboard = (state: { leaderboard: LeaderboardState }) => {
  const currentType = state.leaderboard.currentType;
  return currentType === 'weekly' 
    ? state.leaderboard.weeklyLeaderboard 
    : state.leaderboard.overallLeaderboard;
};

export const selectCurrentUserPosition = (state: { leaderboard: LeaderboardState }) => {
  const currentType = state.leaderboard.currentType;
  return state.leaderboard.userPosition[currentType];
};

export default leaderboardSlice.reducer;
