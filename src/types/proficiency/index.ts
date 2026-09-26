export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type ProficiencyConfidence =
  | 'none'
  | 'preliminary'
  | 'developing'
  | 'established';
export type ProficiencyTrend = 'improving' | 'stable' | 'declining';

export interface VocabBreakdown {
  A1: number;
  A2: number;
  B1: number;
  B2: number;
  C1: number;
  C2: number;
}

export interface SessionScore {
  date: string;
  overall_band?: number | string | null;
  target_band?: number | string | null;
  band_gap?: number | string | null;
  fluencyBand?: number | string | null;
  grammarBand?: number | string | null;
  vocabularyBand?: number | string | null;
  pronunciationBand?: number | string | null;
  fluency: number;
  grammar: number;
  vocabulary: number;
  discourse: number;
  pronunciation?: number;
  vocabBreakdown: VocabBreakdown;
}

export type IeltsBand =
  | '1.0'
  | '1.5'
  | '2.0'
  | '2.5'
  | '3.0'
  | '3.5'
  | '4.0'
  | '4.5'
  | '5.0'
  | '5.5'
  | '6.0'
  | '6.5'
  | '7.0'
  | '7.5'
  | '8.0'
  | '8.5'
  | '9.0';

export interface ProficiencySkillResult {
  score: number;
  level: CefrLevel;
  ieltsBand?: IeltsBand;
  trend: ProficiencyTrend;
}

export interface ProficiencyResult {
  overallScore: number;
  overallLevel: CefrLevel | 'Not yet assessed';
  ieltsBand?: IeltsBand;
  ieltsDescriptor?: string;
  targetBand?: number | string;
  bandGap?: number | string;
  confidence: ProficiencyConfidence;
  skills: {
    fluency: ProficiencySkillResult;
    grammar: ProficiencySkillResult;
    vocabulary: ProficiencySkillResult;
    pronunciation?: ProficiencySkillResult;
  };
  sessionCount: number;
}

/** GET /reports/proficiency `current`: the server-computed profile progress (single source of truth). */
export interface ProfileProgressCriterion {
  band: number | null;
  cefr: string | null;
}

export interface ProfileProgress {
  overall_band: number | null;
  overall_cefr: string | null;
  approximate: boolean;
  criteria: {
    fc: ProfileProgressCriterion;
    lr: ProfileProgressCriterion;
    gra: ProfileProgressCriterion;
    pron: ProfileProgressCriterion | null;
  };
  target_band: number | null;
  band_gap: number | null;
  trend_7d: string | null;
  last_assessed_at: string | null;
  sources: number;
}

export interface ProficiencyResponse {
  success: boolean;
  data?: {
    sessionCount: number;
    sessions: SessionScore[];
    current?: ProfileProgress | null;
  };
  error?: string;
}
