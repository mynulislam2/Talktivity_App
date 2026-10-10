/**
 * Report Calculation Utilities
 *
 * Pure functions for all report calculations.
 * No side effects, fully testable, reusable.
 */

import type { ReportData } from '@/services/report';
import type { TodayReport, OverallScores, CriterionBand } from '@/types/report';
import { derivePronunciationStatus } from '@/lib/report/todayReportMapper';

function toFiniteOrNull(value: unknown): number | null {
  const num = Number(value);
  return typeof value === 'number' || typeof value === 'string'
    ? Number.isFinite(num)
      ? num
      : null
    : null;
}

function toCefrOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value : null;
}

function criterionBand(section: unknown): CriterionBand {
  const record = (section ?? {}) as Record<string, unknown>;
  return {
    band: toFiniteOrNull(record.band ?? record.fluencyBand ?? record.grammarBand ?? record.vocabularyBand),
    cefr: toCefrOrNull(record.cefr),
  };
}

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

  // Real per-criterion bands, sourced only from their own section — never
  // from discourse, which is a different (general-mode-only) quantity.
  const pronunciationStatus = derivePronunciationStatus(
    (report as any).pronunciation_status,
    (report as any).source
  );
  const measuredPronunciation =
    pronunciationStatus === 'measured'
      ? criterionBand((report as TodayReport).pronunciation)
      : { band: null, cefr: null };

  const criteria = {
    fluency: criterionBand((report as TodayReport).fluency),
    vocabulary: criterionBand((report as TodayReport).vocabulary),
    grammar: criterionBand((report as TodayReport).grammar),
    pronunciation: { ...measuredPronunciation, status: pronunciationStatus },
  };

  return {
    ...scores,
    overall,
    level,
    overall_band: (report as any).overall_band ?? undefined,
    overall_cefr: toCefrOrNull((report as any).overall_cefr),
    target_band: (report as any).target_band ?? undefined,
    band_gap: (report as any).band_gap ?? undefined,
    insufficient_speech: (report as any).insufficient_speech === true,
    low_confidence: (report as any).low_confidence === true,
    short_sample_capped: (report as any).short_sample_capped === true,
    criteria,
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
