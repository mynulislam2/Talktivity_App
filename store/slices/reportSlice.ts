/**
 * Report Slice
 * 
 * Manages report state globally using Redux Toolkit.
 * Handles call report generation and state management.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { reportService, ReportData, GenerateCallReportResponse } from '@/service/ReportService';

// Define the state interface
interface ReportState {
  reportData: ReportData | null;
  loading: boolean;
  error: string | null;
  generating: boolean;
}

// Initial state
const initialState: ReportState = {
  reportData: null,
  loading: false,
  error: null,
  generating: false,
};

// Async thunk for generating call report
export const generateCallReport = createAsyncThunk(
  'report/generateCallReport',
  async (_, { rejectWithValue }) => {
    try {
      const response = await reportService.generateCallReport();
      if (response.success && response.data) {
        return response.data.report;
      } else {
        const errorMsg = response.error || 'Failed to generate report';
        // [ReportSlice] Report generation failed
        return rejectWithValue(errorMsg);
      }
    } catch (error: any) {
      // Extract error message from various possible locations
      const errorMsg = 
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message || 
        'Failed to generate report';
      // [ReportSlice] Error generating report
      return rejectWithValue(errorMsg);
    }
  }
);

// Create the slice
const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    clearReport: (state) => {
      state.reportData = null;
      state.loading = false;
      state.error = null;
      state.generating = false;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle generateCallReport
      .addCase(generateCallReport.pending, (state) => {
        state.loading = true;
        state.generating = true;
        state.error = null;
      })
      .addCase(generateCallReport.fulfilled, (state, action: PayloadAction<ReportData>) => {
        state.loading = false;
        state.generating = false;
        state.reportData = action.payload;
        state.error = null;
      })
      .addCase(generateCallReport.rejected, (state, action) => {
        state.loading = false;
        state.generating = false;
        state.error = action.payload as string || 'Failed to generate report';
      });
  },
});

// Export actions
export const { clearReport, setError } = reportSlice.actions;

// Base selectors
export const selectReportData = (state: { report: ReportState }) => state.report.reportData;
export const selectReportLoading = (state: { report: ReportState }) => state.report.loading;
export const selectReportError = (state: { report: ReportState }) => state.report.error;
export const selectReportGenerating = (state: { report: ReportState }) => state.report.generating;

export default reportSlice.reducer;