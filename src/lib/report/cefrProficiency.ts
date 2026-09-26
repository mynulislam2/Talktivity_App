import type {
  CefrLevel,
  IeltsBand,
  ProficiencyConfidence,
  ProficiencyResult,
  ProficiencySkillResult,
  ProfileProgress,
  ProfileProgressCriterion,
} from '@/types/proficiency';

export const CEFR_LEVELS: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const IELTS_MILESTONES = ['4.0', '5.0', '6.0', '7.0', '8.0', '9.0'] as const;

export const IELTS_DESCRIPTORS: Record<string, string> = {
  '9.0': 'Expert User',
  '8.5': 'Very Good User',
  '8.0': 'Very Good User',
  '7.5': 'Good User',
  '7.0': 'Good User',
  '6.5': 'Competent User',
  '6.0': 'Competent User',
  '5.5': 'Modest User',
  '5.0': 'Modest User',
  '4.5': 'Limited User',
  '4.0': 'Limited User',
  '3.5': 'Extremely Limited',
  '3.0': 'Extremely Limited',
  '2.5': 'Intermittent User',
  '2.0': 'Intermittent User',
  '1.5': 'Non User',
  '1.0': 'Non User',
};

export function formatIeltsBand(band: unknown): IeltsBand | undefined {
  if (band === null || band === undefined || band === '') return undefined;
  const num = Number(band);
  if (!Number.isFinite(num)) return undefined;
  const clamped = Math.max(1.0, Math.min(9.0, Math.round(num * 2) / 2));
  return clamped.toFixed(1) as IeltsBand;
}

export function getIeltsDescriptor(band?: IeltsBand | string | null): string {
  if (!band) return 'Not yet assessed';
  return IELTS_DESCRIPTORS[band] || 'Competent User';
}

export function getIeltsBarFillPercentage(band?: IeltsBand | string | null): number {
  if (!band) return 0;
  const numeric = parseFloat(band);
  if (Number.isNaN(numeric)) return 0;
  const minMilestone = 4.0;
  const maxMilestone = 9.0;
  if (numeric <= minMilestone) {
    return Math.max(6, Math.round((numeric / minMilestone) * 14));
  }
  return Math.min(
    100,
    Math.max(
      14,
      Math.round(14 + ((numeric - minMilestone) / (maxMilestone - minMilestone)) * 86)
    )
  );
}

/** Self-rated onboarding level shown as "Self-rated start:" — not a proficiency band source. */
export function startingLevelToIeltsBand(level?: string | null): IeltsBand | null {
  if (!level) return null;
  switch (level.toLowerCase()) {
    case 'beginner':
    case 'a1':
      return '2.0';
    case 'elementary':
    case 'a2':
      return '3.5';
    case 'intermediate':
    case 'b1':
      return '4.5';
    case 'upper':
    case 'upper-intermediate':
    case 'upper_intermediate':
    case 'b2':
      return '6.0';
    case 'advanced':
    case 'c1':
      return '7.5';
    case 'proficiency':
    case 'c2':
      return '9.0';
    default:
      return null;
  }
}

function getEmptyResult(): ProficiencyResult {
  return {
    overallScore: 0,
    overallLevel: 'Not yet assessed',
    ieltsBand: undefined,
    ieltsDescriptor: undefined,
    confidence: 'none',
    skills: {
      fluency: { score: 0, level: 'A1', ieltsBand: undefined, trend: 'stable' },
      grammar: { score: 0, level: 'A1', ieltsBand: undefined, trend: 'stable' },
      vocabulary: { score: 0, level: 'A1', ieltsBand: undefined, trend: 'stable' },
    },
    sessionCount: 0,
  };
}

/** Band (0-9) as a 0-100 chart-geometry value only — never shown as a number. */
function bandChartScore(band: number | null | undefined): number {
  return typeof band === 'number' && Number.isFinite(band)
    ? Math.max(0, Math.min(100, (band / 9) * 100))
    : 0;
}

function cefrToLevel(cefr: string | null | undefined): CefrLevel {
  return cefr && (CEFR_LEVELS as string[]).includes(cefr) ? (cefr as CefrLevel) : 'A1';
}

function confidenceFromSources(sources: number): ProficiencyConfidence {
  if (sources >= 5) return 'established';
  if (sources >= 3) return 'developing';
  if (sources >= 1) return 'preliminary';
  return 'none';
}

function skillFromCriterion(
  criterion: ProfileProgressCriterion | null | undefined
): ProficiencySkillResult {
  return {
    score: bandChartScore(criterion?.band),
    level: cefrToLevel(criterion?.cefr),
    ieltsBand: formatIeltsBand(criterion?.band ?? null),
    trend: 'stable',
  };
}

/**
 * Maps the server's `current` profile progress (GET /reports/proficiency) to
 * the shape the Profile CEFRProgressCard already renders. This is the ONLY
 * band source for the Profile card — no client EMA, weakest-skill cap, or
 * discourse-as-pronunciation fallback.
 */
export function mapProfileProgressToProficiency(
  current: ProfileProgress | null | undefined
): ProficiencyResult {
  if (!current || current.overall_band == null) {
    // A target band can be set before the first assessment; keep it visible.
    return {
      ...getEmptyResult(),
      targetBand: current?.target_band ?? undefined,
      bandGap: current?.band_gap ?? undefined,
    };
  }

  const overallIeltsBand = formatIeltsBand(current.overall_band);
  const pron = current.criteria?.pron ?? null;

  return {
    overallScore: bandChartScore(current.overall_band),
    overallLevel: cefrToLevel(current.overall_cefr),
    ieltsBand: overallIeltsBand,
    ieltsDescriptor: getIeltsDescriptor(overallIeltsBand),
    targetBand: current.target_band ?? undefined,
    bandGap: current.band_gap ?? undefined,
    confidence: confidenceFromSources(current.sources ?? 0),
    skills: {
      fluency: skillFromCriterion(current.criteria?.fc),
      grammar: skillFromCriterion(current.criteria?.gra),
      vocabulary: skillFromCriterion(current.criteria?.lr),
      ...(pron?.band != null ? { pronunciation: skillFromCriterion(pron) } : {}),
    },
    sessionCount: current.sources ?? 0,
  };
}
