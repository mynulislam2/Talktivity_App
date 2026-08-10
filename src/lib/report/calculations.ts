/**
 * Report Calculation Utilities
 *
 * Pure functions for all report calculations.
 * No side effects, fully testable, reusable.
 */

import type { ReportData } from '@/services/report';
import type { TodayReport, OverallScores } from '@/types/report';

/**
 * Calculate level from overall score (A1-C2)
 */
export function calculateLevelFromScore(overall: number): string {
  if (overall > 90) return 'C2';
  if (overall > 75) return 'C1';
  if (overall > 60) return 'B2';
  if (overall > 40) return 'B1';
  if (overall > 20) return 'A2';
  return 'A1';
}

/**
 * Calculate overall scores from report data
 * Works with both ReportData (call report) and TodayReport (daily report)
 */
export function calculateOverallScores(
  report: ReportData | TodayReport | null
): OverallScores | null {
  if (!report) {
    return null;
  }

  // Extract scores - handle both ReportData (any) and TodayReport (typed)
  const grammarScore =
    (report as TodayReport).grammar?.grammarScore ||
    (report as ReportData).grammar?.grammarScore ||
    0;

  const vocabularyScore =
    (report as TodayReport).vocabulary?.vocabularyScore ||
    (report as ReportData).vocabulary?.vocabularyScore ||
    0;

  const fluencyScore =
    (report as TodayReport).fluency?.fluencyScore ||
    (report as ReportData).fluency?.fluencyScore ||
    0;

  const discourseScore =
    (report as TodayReport).discourse?.discourseScore ||
    (report as ReportData).discourse?.discourseScore ||
    0;

  const scores = {
    grammar: grammarScore,
    vocabulary: vocabularyScore,
    fluency: fluencyScore,
    discourse: discourseScore,
  };

  const overall = Math.round(
    (scores.grammar + scores.vocabulary + scores.fluency + scores.discourse) / 4
  );

  const level = calculateLevelFromScore(overall);

  return {
    ...scores,
    overall,
    level,
  };
}

/**
 * Radar chart data point
 */
export interface RadarDataPoint {
  subject: string;
  A: number;
  icon?: React.ComponentType<{ className?: string }> | any;
  iconColor?: string;
  bgColor?: string;
  description?: string;
}

/**
 * Calculate radar chart data from overall scores
 */
export function calculateRadarData(
  overallScores: OverallScores | null
): RadarDataPoint[] {
  if (!overallScores) {
    return [];
  }

  return [
    {
      subject: 'Fluency',
      A: overallScores.fluency,
    },
    {
      subject: 'Vocabulary',
      A: overallScores.vocabulary,
    },
    {
      subject: 'Grammar',
      A: overallScores.grammar,
    },
    {
      subject: 'Discourse',
      A: overallScores.discourse,
    },
  ];
}

/**
 * Enhanced radar data with icons and descriptions (for ScoreSummary UI)
 */
export interface EnhancedRadarDataPoint extends RadarDataPoint {
  icon: React.ComponentType<{ className?: string }> | any;
  iconColor: string;
  bgColor: string;
  description: string;
}

/**
 * Calculate enhanced radar data with icons and descriptions
 * Note: Icons should be passed from the component to avoid SSR issues
 */
export function calculateEnhancedRadarData(
  overallScores: OverallScores | null
): Omit<EnhancedRadarDataPoint, 'icon'>[] {
  if (!overallScores) {
    return [];
  }

  return [
    {
      subject: 'Fluency',
      A: overallScores.fluency,
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      description:
        'Fluency is the ability to speak smoothly and confidently without unnecessary pauses.',
    },
    {
      subject: 'Vocabulary',
      A: overallScores.vocabulary,
      iconColor: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      description:
        'Vocabulary is the range of words you know and can use to express your thoughts clearly.',
    },
    {
      subject: 'Grammar',
      A: overallScores.grammar,
      iconColor: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      description:
        'Grammar is the set of rules that structure sentences correctly and meaningfully.',
    },
    {
      subject: 'Discourse',
      A: overallScores.discourse,
      iconColor: 'text-indigo-400',
      bgColor: 'bg-indigo-500/20',
      description:
        'Discourse refers to how ideas are connected and organized in longer speech or writing.',
    },
  ];
}
