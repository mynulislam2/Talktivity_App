/**
 * useReportGeneration Hook
 * 
 * Handles report generation using Redux actions.
 * Only needs userId from auth token (no conversationId needed).
 */

import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  generateCallReport,
  selectReportData,
  selectReportLoading,
  selectReportError,
  selectReportGenerating,
  clearReport,
} from '@/store/slices/reportSlice';

export interface UseReportGenerationReturn {
  reportData: any;
  loading: boolean;
  error: string | null;
  generating: boolean;
  generateReport: () => Promise<void>;
  refreshReport: () => Promise<void>;
}

export function useReportGeneration(autoFetch: boolean = true): UseReportGenerationReturn {
  const dispatch = useAppDispatch();
  const reportData = useAppSelector(selectReportData);
  const loading = useAppSelector(selectReportLoading);
  const error = useAppSelector(selectReportError);
  const generating = useAppSelector(selectReportGenerating);

  const generateReport = useCallback(async () => {
    const result = await dispatch(generateCallReport());
    if (generateCallReport.rejected.match(result)) {
      // Error is already set in Redux state
      // Failed to generate report
    }
  }, [dispatch]);

  const refreshReport = useCallback(async () => {
    dispatch(clearReport());
    await generateReport();
  }, [dispatch, generateReport]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch && !reportData && !loading && !error) {
      generateReport();
    }
  }, [autoFetch, reportData, loading, error, generateReport]);

  return {
    reportData,
    loading,
    error,
    generating,
    generateReport,
    refreshReport,
  };
}
