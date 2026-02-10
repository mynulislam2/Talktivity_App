/**
 * useTodayReport Hook (React Native)
 * 
 * Manages today's report data loading and state.
 * Uses AppState instead of document.hidden for visibility changes.
 */

import { useCallback, useEffect, useMemo } from 'react';
import { AppState } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  loadTodayReport,
  refreshTodayReport,
  completeTodayReport,
  selectTodayReport,
  selectTodayReportLoading,
  selectTodayReportError,
} from '@/store/slices/todayReportSlice';
import { selectCourseStatus } from '@/store/slices/courseSlice';
import type { TodayReport } from '@/types/report';

export interface UseTodayReportResult {
  report: TodayReport | null;
  isLoading: boolean;
  error: string | null;
  isExamDay: boolean;
  reload: () => Promise<void>;
  refresh: () => Promise<void>;
  complete: () => Promise<void>;
}

export function useTodayReportNative(): UseTodayReportResult {
  const dispatch = useAppDispatch();
  const report = useAppSelector(selectTodayReport);
  const isLoading = useAppSelector(selectTodayReportLoading);
  const error = useAppSelector(selectTodayReportError);
  const courseStatus = useAppSelector(selectCourseStatus);

  // Determine if today is an exam day
  const isExamDay = useMemo(() => {
    return courseStatus?.course?.dayType === 'speaking_exam';
  }, [courseStatus]);

  const reload = useCallback(async () => {
    await dispatch(loadTodayReport());
  }, [dispatch]);

  const refresh = useCallback(async () => {
    await dispatch(refreshTodayReport());
  }, [dispatch]);

  const complete = useCallback(async () => {
    await dispatch(completeTodayReport());
  }, [dispatch]);

  // Load on mount if we don't have a report yet
  useEffect(() => {
    if (!report && !isLoading && !error) {
      reload();
    }
  }, [report, isLoading, error, reload]);

  // Refresh when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        reload();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [reload]);

  return {
    report,
    isLoading,
    error,
    isExamDay,
    reload,
    refresh,
    complete,
  };
}
