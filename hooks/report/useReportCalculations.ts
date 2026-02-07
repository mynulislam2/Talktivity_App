/**
 * useReportCalculations Hook
 * 
 * Unified hook for calculating report values from any report data source.
 * Uses pure calculation utilities - works with both call report and daily report.
 */

import { useMemo } from 'react';
import { calculateOverallScores, calculateRadarData } from '@/lib/report/calculations';
import type { ReportData } from '@/service/ReportService';
import type { TodayReport } from '@/types/report';
import type { OverallScores, RadarDataPoint } from '@/lib/report/calculations';

export interface UseReportCalculationsReturn {
  overallScores: OverallScores | null;
  radarData: RadarDataPoint[];
}

/**
 * Unified hook for report calculations
 * Works with any report data (call report or daily report)
 * 
 * @param reportData - Report data from either call report or daily report
 * @returns Calculated overall scores and radar data
 */
export function useReportCalculations(
  reportData: ReportData | TodayReport | null
): UseReportCalculationsReturn {
  const overallScores = useMemo(
    () => calculateOverallScores(reportData),
    [reportData]
  );

  const radarData = useMemo(
    () => calculateRadarData(overallScores),
    [overallScores]
  );

  return {
    overallScores,
    radarData,
  };
}