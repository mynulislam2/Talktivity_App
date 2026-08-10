/**
 * useReportGeneration Hook (React Native)
 *
 * Drives the report screen as a 4-phase state machine:
 *   preparing | ready | talkMore | terminal
 * Transient/"pending" failures are auto-retried SILENTLY within a bounded budget
 * so the loader stays up and the report resolves.
 * Matches talktivity_frontend/Hooks/report/useReportGeneration.ts
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { GenerateCallReportOptions } from '@/services/report';
import { classifyReportError } from '@/services/report';
import {
  generateCallReport,
  selectReportData,
  selectReportLoading,
  selectReportError,
  selectReportErrorCode,
  selectReportErrorStatus,
  selectReportGenerating,
  clearReport,
} from '@/store/slices/reportSlice';

export type ReportPhase = 'preparing' | 'ready' | 'talkMore' | 'terminal';

const MAX_AUTO_RETRIES = 6;
const RETRY_BACKOFF_MS = 2000;

export interface UseReportGenerationReturn {
  reportData: any;
  phase: ReportPhase;
  error: string | null;
  errorCode: string | null;
  retry: () => Promise<void>;
}

export function useReportGeneration(
  autoFetch: boolean = true,
  options?: GenerateCallReportOptions
): UseReportGenerationReturn {
  const dispatch = useAppDispatch();
  const reportData = useAppSelector(selectReportData);
  const loading = useAppSelector(selectReportLoading);
  const generating = useAppSelector(selectReportGenerating);
  const error = useAppSelector(selectReportError);
  const errorCode = useAppSelector(selectReportErrorCode);
  const errorStatus = useAppSelector(selectReportErrorStatus);

  const lastAutoFetchKeyRef = useRef<string | null>(null);
  const attemptsRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [autoRetrying, setAutoRetrying] = useState(false);

  const generateReport = useCallback(async () => {
    await dispatch(generateCallReport(options));
  }, [dispatch, options]);

  const retry = useCallback(async () => {
    attemptsRef.current = 0;
    setAutoRetrying(false);
    dispatch(clearReport());
    await generateReport();
  }, [dispatch, generateReport]);

  // Auto-fetch once per room
  useEffect(() => {
    if (!autoFetch || loading) return;
    const key = options?.roomName || 'latest';
    if (lastAutoFetchKeyRef.current === key) return;
    lastAutoFetchKeyRef.current = key;
    attemptsRef.current = 0;
    dispatch(clearReport());
    void generateReport();
  }, [autoFetch, loading, options?.roomName, dispatch, generateReport]);

  // Silent bounded auto-retry for PENDING failures
  useEffect(() => {
    if (loading || generating || reportData || !error) return;
    const hint = classifyReportError(errorCode, errorStatus ?? undefined);
    if (hint === 'pending' && attemptsRef.current < MAX_AUTO_RETRIES) {
      attemptsRef.current += 1;
      setAutoRetrying(true);
      retryTimerRef.current = setTimeout(() => {
        void generateReport();
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
  }, [
    loading,
    generating,
    reportData,
    error,
    errorCode,
    errorStatus,
    generateReport,
  ]);

  let phase: ReportPhase = 'preparing';
  if (reportData) phase = 'ready';
  else if (loading || generating || autoRetrying) phase = 'preparing';
  else if (error) {
    const hint = classifyReportError(errorCode, errorStatus ?? undefined);
    phase =
      hint === 'talkMore'
        ? 'talkMore'
        : hint === 'pending'
        ? 'preparing'
        : 'terminal';
  }

  return { reportData, phase, error, errorCode, retry };
}
