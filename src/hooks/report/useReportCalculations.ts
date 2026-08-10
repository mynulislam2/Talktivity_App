import { useMemo } from 'react';
import {
  calculateOverallScores,
  calculateRadarData,
} from '@/lib/report/calculations';
import type { ReportData } from '@/services/report';
import type { TodayReport } from '@/types/report';
import type { RadarDataPoint } from '@/lib/report/calculations';
import type { OverallScores } from '@/types/report';

export interface UseReportCalculationsReturn {
  overallScores: OverallScores | null;
  radarData: RadarDataPoint[];
}

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
