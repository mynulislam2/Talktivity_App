import { useCallback, useEffect, useMemo } from 'react';
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

export interface UseTodayReportNativeResult {
  report: TodayReport | null;
  isLoading: boolean;
  error: string | null;
  isExamDay: boolean;
  reload: () => Promise<void>;
  refresh: () => Promise<void>;
  complete: () => Promise<void>;
}

export function useTodayReportNative(): UseTodayReportNativeResult {
  const dispatch = useAppDispatch();
  const report = useAppSelector(selectTodayReport);
  const isLoading = useAppSelector(selectTodayReportLoading);
  const error = useAppSelector(selectTodayReportError);
  const courseStatus = useAppSelector(selectCourseStatus);

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

  useEffect(() => {
    reload();
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
