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
  fluency: number;
  grammar: number;
  vocabulary: number;
  discourse: number;
  vocabBreakdown: VocabBreakdown;
}

export interface ProficiencySkillResult {
  score: number;
  level: CefrLevel;
  trend: ProficiencyTrend;
}

export interface ProficiencyResult {
  overallScore: number;
  overallLevel: CefrLevel | 'Not yet assessed';
  confidence: ProficiencyConfidence;
  skills: {
    fluency: ProficiencySkillResult;
    grammar: ProficiencySkillResult;
    vocabulary: ProficiencySkillResult;
    discourse: ProficiencySkillResult;
  };
  progressToNextLevel: number;
  nextLevel: CefrLevel;
  sessionCount: number;
}

export interface ProficiencyResponse {
  success: boolean;
  data?: {
    sessionCount: number;
    sessions: SessionScore[];
  };
  error?: string;
}
