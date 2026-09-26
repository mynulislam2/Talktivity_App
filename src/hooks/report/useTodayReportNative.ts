import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  loadTodayReport,
  refreshTodayReport,
  completeTodayReport,
  selectTodayReport,
  selectTodayReportLoading,
  selectTodayReportError,
  selectTodayReportErrorCode,
  selectTodayReportErrorStatus,
} from '@/store/slices/todayReportSlice';
import { classifyReportError } from '@/services/report';
import { selectCourseStatus } from '@/store/slices/courseSlice';
import type { TodayReport } from '@/types/report';

export interface UseTodayReportNativeResult {
  report: TodayReport | null;
  isLoading: boolean;
  error: string | null;
  errorCode: string | null;
  isExamDay: boolean;
  reload: () => Promise<void>;
  refresh: () => Promise<void>;
  complete: () => Promise<void>;
}

const MAX_AUTO_RETRIES = 6;
const RETRY_BACKOFF_MS = 2000;

export function useTodayReportNative(): UseTodayReportNativeResult {
  const dispatch = useAppDispatch();
  const report = useAppSelector(selectTodayReport);
  const isLoading = useAppSelector(selectTodayReportLoading);
  const error = useAppSelector(selectTodayReportError);
  const errorCode = useAppSelector(selectTodayReportErrorCode);
  const errorStatus = useAppSelector(selectTodayReportErrorStatus);
  const courseStatus = useAppSelector(selectCourseStatus);

  const attemptsRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [autoRetrying, setAutoRetrying] = useState(false);

  const isExamDay = useMemo(() => {
    return courseStatus?.course?.dayType === 'speaking_exam';
  }, [courseStatus]);

  const reload = useCallback(async () => {
    attemptsRef.current = 0;
    setAutoRetrying(false);
    await dispatch(loadTodayReport());
  }, [dispatch]);

  const refresh = useCallback(async () => {
    attemptsRef.current = 0;
    setAutoRetrying(false);
    await dispatch(refreshTodayReport());
  }, [dispatch]);

  const complete = useCallback(async () => {
    await dispatch(completeTodayReport());
  }, [dispatch]);

  useEffect(() => {
    reload();
  }, [reload]);

  // Silent bounded auto-retry for PENDING failures (409 REPORT_DATA_NOT_READY)
  useEffect(() => {
    if (isLoading || report || !error) return;
    const hint = classifyReportError(errorCode, errorStatus ?? undefined);
    if (hint === 'pending' && attemptsRef.current < MAX_AUTO_RETRIES) {
      attemptsRef.current += 1;
      setAutoRetrying(true);
      retryTimerRef.current = setTimeout(() => {
        void dispatch(loadTodayReport());
      }, RETRY_BACKOFF_MS);
    } else {
      setAutoRetrying(false);
    }

    return () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };
  }, [isLoading, report, error, errorCode, errorStatus, dispatch]);

  const effectiveLoading = isLoading || autoRetrying;
  const effectiveError = autoRetrying ? null : error;

  return {
    report,
    isLoading: effectiveLoading,
    error: effectiveError,
    errorCode,
    isExamDay,
    reload,
    refresh,
    complete,
  };
}
