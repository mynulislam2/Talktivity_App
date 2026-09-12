/**
 * Today's Report Types
 *
 * Type definitions for the daily report feature, matching the backend API response structure
 */

/**
 * Improvement target information
 */
export interface ImprovementTarget {
  percentToNextLevel: number;
  nextLevel: string;
}

/**
 * Words per minute analysis
 */
export interface WordsPerMinute {
  value: number;
  emoji: string;
  feedback: string;
  speedBarPercent: number;
}

/**
 * Filler words analysis
 */
export interface FillerWords {
  percentage: number;
  feedback: string;
  topFillers?: Record<string, number>;
}

/**
 * Hesitations and corrections analysis
 */
export interface HesitationsAndCorrections {
  rate: number;
  feedback: string;
}

/**
 * Fluency section of the report
 */
export interface FluencyReport {
  band?: number;
  fluencyBand?: number;
  fluencyScore: number;
  fluencyLevel: string;
  improvementTarget: ImprovementTarget | null;
  fillerWords: FillerWords;
  wordsPerMinute: WordsPerMinute;
  hesitationsAndCorrections: HesitationsAndCorrections;
  strengths?: string[];
  improvements?: string[];
}

/**
 * Sentence complexity analysis
 */
export interface SentenceComplexity {
  score: number;
  complexSentenceRatio?: number;
  feedback: string;
}

/**
 * Grammar error details
 */
export interface GrammarError {
  description: string;
  incorrectSentence: string;
  correctedSentence: string;
}

/**
 * Grammar section of the report
 */
export interface GrammarReport {
  band?: number;
  grammarBand?: number;
  grammarScore: number;
  grammarLevel: string;
  improvementTarget: ImprovementTarget | null;
  growthPoints?: string[];
  improvementDescription?: string;
  grammarErrors?: Record<string, GrammarError[]>;
  sentenceComplexity: SentenceComplexity;
  strengths?: string[];
  improvements?: string[];
}

/**
 * Lexical diversity analysis
 */
export interface LexicalDiversity {
  score: number;
  feedback: string;
}

/**
 * Vocabulary level breakdown
 */
export interface LevelBreakdown {
  A1?: number;
  A2?: number;
  B1?: number;
  B2?: number;
  C1?: number;
  C2?: number;
}

/**
 * Word suggestion
 */
export interface WordSuggestion {
  word: string;
  level: string;
  color: string;
  definition: string;
}

/**
 * Idiomatic language analysis
 */
export interface IdiomaticLanguage {
  usedCorrectly?: number;
  missedOpportunities?: number;
  feedback?: string;
}

export interface SentenceUpgrade {
  original: string;
  improved: string;
  targetBand?: string;
  explanation?: string;
}

export interface PronunciationStruggledWord {
  word: string;
  phonetic?: string;
  syllableStress?: string;
  tip?: string;
}

export interface PronunciationReport {
  band?: number;
  pronunciationBand?: number;
  pronunciationScore?: number;
  pronunciationLevel?: string;
  feedback?: string;
  struggledWords?: PronunciationStruggledWord[];
  strengths?: string[];
  improvements?: string[];
}

/**
 * Vocabulary section of the report
 */
export interface VocabularyReport {
  band?: number;
  vocabularyBand?: number;
  vocabularyScore: number;
  vocabularyLevel: string;
  improvementTarget: ImprovementTarget | null;
  activeVocabulary: number;
  uniqueWords: number;
  sentenceUpgrades?: SentenceUpgrade[];
  lexicalDiversity: LexicalDiversity;
  levelBreakdown?: LevelBreakdown;
  wordSuggestions?: Record<string, WordSuggestion[]>;
  exampleSentences?: Record<string, string>;
  idiomaticLanguage?: IdiomaticLanguage;
  newWords?: string[];
  strengths?: string[];
  improvements?: string[];
}

/**
 * Cohesion and coherence analysis
 */
export interface CohesionCoherence {
  score: number;
  feedback: string;
}

/**
 * Discourse section of the report
 */
export interface DiscourseReport {
  discourseScore: number;
  discourseLevel: string;
  improvementTarget: ImprovementTarget | null;
  cohesion: CohesionCoherence;
  coherence: CohesionCoherence;
  organization?: string;
  feedback?: string[];
}

/**
 * Overall scores summary
 */
export interface OverallScores {
  grammar: number;
  vocabulary: number;
  fluency: number;
  discourse: number;
  overall: number;
  level: string;
  overall_band?: number | string;
  target_band?: number | string;
  band_gap?: number | string;
}

/**
 * Complete today's report structure
 */
export interface TodayReport {
  overall_band?: number;
  target_band?: number;
  band_gap?: number;
  action_plan_priorities?: string[];
  fluency: FluencyReport;
  grammar: GrammarReport;
  vocabulary: VocabularyReport;
  discourse: DiscourseReport;
  pronunciation?: PronunciationReport;
  report_date?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Report step/page type
 */
export type ReportStep =
  | 'overview'
  | 'fluency'
  | 'grammar'
  | 'vocabulary'
  | 'discourse';
