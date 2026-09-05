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
