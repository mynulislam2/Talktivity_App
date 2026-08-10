import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  reportService,
  ReportData,
  GenerateCallReportOptions,
} from '@/services/report';

interface ReportState {
  reportData: ReportData | null;
  loading: boolean;
  error: string | null;
  errorCode: string | null;
  errorStatus: number | null;
  generating: boolean;
}

interface ReportRejectValue {
  message: string;
  code: string | null;
  status: number | null;
}

const initialState: ReportState = {
  reportData: null,
  loading: false,
  error: null,
  errorCode: null,
  errorStatus: null,
  generating: false,
};

export const generateCallReport = createAsyncThunk(
  'report/generateCallReport',
  async (
    options: GenerateCallReportOptions | undefined = undefined,
    { rejectWithValue }
  ) => {
    try {
      const response = await reportService.generateCallReport(options);
      if (response.success && response.data) {
        return response.data.report;
      } else {
        return rejectWithValue({
          message: response.error || 'Failed to generate report',
          code: response.code ?? null,
          status: response.status ?? null,
        } as ReportRejectValue);
      }
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error ? error.message : 'Failed to generate report';
      return rejectWithValue({
        message: errorMsg,
        code: null,
        status: null,
      } as ReportRejectValue);
    }
  }
);

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    clearReport: (state) => {
      state.reportData = null;
      state.loading = false;
      state.error = null;
      state.errorCode = null;
      state.errorStatus = null;
      state.generating = false;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateCallReport.pending, (state) => {
        state.loading = true;
        state.generating = true;
        state.error = null;
        state.errorCode = null;
        state.errorStatus = null;
      })
      .addCase(
        generateCallReport.fulfilled,
        (state, action: PayloadAction<ReportData>) => {
          state.loading = false;
          state.generating = false;
          state.reportData = action.payload;
          state.error = null;
          state.errorCode = null;
          state.errorStatus = null;
        }
      )
      .addCase(generateCallReport.rejected, (state, action) => {
        state.loading = false;
        state.generating = false;
        const payload = action.payload as ReportRejectValue | undefined;
        state.error = payload?.message || 'Failed to generate report';
        state.errorCode = payload?.code ?? null;
        state.errorStatus = payload?.status ?? null;
      });
  },
});

export const { clearReport, setError } = reportSlice.actions;

export const selectReportData = (state: { report: ReportState }) =>
  state.report.reportData;
export const selectReportLoading = (state: { report: ReportState }) =>
  state.report.loading;
export const selectReportError = (state: { report: ReportState }) =>
  state.report.error;
export const selectReportErrorCode = (state: { report: ReportState }) =>
  state.report.errorCode;
export const selectReportErrorStatus = (state: { report: ReportState }) =>
  state.report.errorStatus;
export const selectReportGenerating = (state: { report: ReportState }) =>
  state.report.generating;

export default reportSlice.reducer;
