import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { reportService } from '@/service/ReportService';
import { httpService } from '@/service/httpservice';
import type { RootState } from '@/store';
import type { TodayReport } from '@/types/report';
import { normalizeTodayReport } from '@/lib/report/todayReportMapper';

export interface TodayReportState {
  report: TodayReport | null;
  loading: boolean;
  error: string | null;
}

const initialState: TodayReportState = {
  report: null,
  loading: false,
  error: null,
};

// Load today's report (backend handles fetch or generate automatically)
export const loadTodayReport = createAsyncThunk(
  'todayReport/loadTodayReport',
  async (_, { rejectWithValue }) => {
    try {
      const response: any = await reportService.getDailyReport();
      const report = response?.data?.report ?? response?.data ?? response?.report ?? null;
      
      if (response?.success && report) {
        return normalizeTodayReport(report);
      }
      
      return rejectWithValue(response?.error || 'Failed to load today\'s report');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load today\'s report');
    }
  }
);

// Refresh today's report (backend handles regeneration automatically)
export const refreshTodayReport = createAsyncThunk(
  'todayReport/refreshTodayReport',
  async (_, { rejectWithValue }) => {
    try {
      // Backend will regenerate if needed
      const response: any = await reportService.getDailyReport();
      const report = response?.data?.report ?? response?.data ?? response?.report ?? null;
      
      if (response?.success && report) {
        return normalizeTodayReport(report);
      }
      
      return rejectWithValue(response?.error || 'Failed to regenerate today\'s report');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to regenerate today\'s report');
    }
  }
);

// Complete weekly exam based on today's report (exam day)
export const completeTodayReport = createAsyncThunk(
  'todayReport/completeTodayReport',
  async (_, { rejectWithValue }) => {
    try {
      // Use UTC date for API calls (business logic)
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { getUtcToday } = require('@/utils/timezoneUtils');
      const today = getUtcToday();
      const response = await httpService.post('/progress/weekly-exam/complete', { date: today });
      if (response.data?.success) {
        return response.data.data || null;
      }
      return rejectWithValue(response.data?.error || response.data?.message || 'Failed to complete weekly exam');
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error || error.message || 'Failed to complete weekly exam');
    }
  }
);

const todayReportSlice = createSlice({
  name: 'todayReport',
  initialState,
  reducers: {
    clearTodayReportError: (state) => {
      state.error = null;
    },
    resetTodayReport: (state) => {
      state.report = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTodayReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadTodayReport.fulfilled, (state, action: PayloadAction<TodayReport>) => {
        state.loading = false;
        state.report = action.payload;
      })
      .addCase(loadTodayReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.report = null;
      })
      .addCase(refreshTodayReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshTodayReport.fulfilled, (state, action: PayloadAction<TodayReport>) => {
        state.loading = false;
        state.report = action.payload;
      })
      .addCase(refreshTodayReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(completeTodayReport.pending, (state) => {
        // Don't set loading to true for completion, as it's a background action
      })
      .addCase(completeTodayReport.fulfilled, (state) => {
        // Successfully completed exam - no state change needed
      })
      .addCase(completeTodayReport.rejected, (state, action) => {
        // Don't break UI on exam completion failure; just log error
        state.error = action.payload as string;
      });
  },
});

export const { clearTodayReportError, resetTodayReport } = todayReportSlice.actions;

// Base selectors
export const selectTodayReport = (state: RootState) => state.todayReport.report;
export const selectTodayReportLoading = (state: RootState) => state.todayReport.loading;
export const selectTodayReportError = (state: RootState) => state.todayReport.error;

export default todayReportSlice.reducer;