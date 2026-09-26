/**
 * Today's Report Mapper
 *
 * Maps backend API response to frontend types, ensuring type safety
 * and providing default values for missing fields
 */

import type {
  TodayReport,
  FluencyReport,
  GrammarReport,
  VocabularyReport,
  DiscourseReport,
  PronunciationReport,
} from '@/types/report';

/**
 * Bands arrive from JSON and are sometimes strings, sometimes out of range.
 * IELTS runs 0.0-9.0; anything else is a model error, not data. Returns
 * undefined for absent/garbage so "no band" stays distinguishable from a score.
 */
function toBand(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return undefined;
  return Math.min(9, Math.max(0, numericValue));
}

/** First band-ish value wins. Written out so a legitimate 0 is not skipped. */
function pickBand(...values: unknown[]): number | undefined {
  for (const value of values) {
    const band = toBand(value);
    if (band !== undefined) return band;
  }
  return undefined;
}

/** The cards call .map() on these. A non-array from the API would throw. */
function toArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

/** A CEFR level is only ever a short server-supplied string; anything else is garbage. */
function toCefr(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}

const PRONUNCIATION_STATUSES = ['pending', 'measured', 'not_measured'] as const;

/**
 * `pronunciation_status` is new; a report saved before it existed has no such
 * field. The only reports that ever measured real pronunciation were sourced
 * from audio, so that's the sole fallback signal — never "measured" by default.
 */
export function derivePronunciationStatus(
  status: unknown,
  source: unknown
): 'pending' | 'measured' | 'not_measured' {
  if ((PRONUNCIATION_STATUSES as readonly unknown[]).includes(status)) {
    return status as 'pending' | 'measured' | 'not_measured';
  }
  return source === 'audio' ? 'measured' : 'not_measured';
}

/**
 * The backend contract does not pin this scale: some payloads carry a percentage
 * (40), others a fraction (0.4). A fraction fed straight into a width renders
 * a 0.4%-wide bar labelled "0.4% Complex".
 */
function toPercent(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return undefined;
  const scaled = numericValue > 0 && numericValue <= 1 ? numericValue * 100 : numericValue;
  return Math.min(100, Math.max(0, Math.round(scaled)));
}

/**
 * Normalize backend report data to match frontend types
 */
export function normalizeTodayReport(backendData: any): TodayReport {
  // Handle nested report structure
  const reportData = backendData?.report || backendData;

  // Normalize each section with defaults
  const fluency: FluencyReport = {
    band: pickBand(reportData?.fluency?.band, reportData?.fluency?.fluencyBand),
    fluencyBand: pickBand(reportData?.fluency?.fluencyBand, reportData?.fluency?.band),
    cefr: toCefr(reportData?.fluency?.cefr),
    fluencyScore: reportData?.fluency?.fluencyScore || reportData?.fluency?.score || 0,
    fluencyLevel: reportData?.fluency?.fluencyLevel || reportData?.fluency?.level || 'A1',
    improvementTarget: reportData?.fluency?.improvementTarget
      ? {
          percentToNextLevel: reportData.fluency.improvementTarget.percentToNextLevel || 0,
          nextLevel: reportData.fluency.improvementTarget.nextLevel || 'A2',
        }
      : null,
    fillerWords: {
      percentage:
        typeof reportData?.fluency?.fillerWords?.percentage === 'number'
          ? reportData.fluency.fillerWords.percentage
          : null as any,
      feedback: reportData?.fluency?.fillerWords?.feedback || '',
      topFillers: reportData?.fluency?.fillerWords?.topFillers,
    },
    wordsPerMinute: {
      value:
        typeof reportData?.fluency?.wordsPerMinute?.value === 'number'
          ? reportData.fluency.wordsPerMinute.value
          : null as any,
      emoji: reportData?.fluency?.wordsPerMinute?.emoji || '📊',
      feedback: reportData?.fluency?.wordsPerMinute?.feedback || '',
      speedBarPercent: reportData?.fluency?.wordsPerMinute?.speedBarPercent || 0,
    },
    hesitationsAndCorrections: {
      rate:
        typeof reportData?.fluency?.hesitationsAndCorrections?.rate === 'number'
          ? reportData.fluency.hesitationsAndCorrections.rate
          : null as any,
      feedback: reportData?.fluency?.hesitationsAndCorrections?.feedback || '',
    },
    strengths: reportData?.fluency?.strengths || [],
    improvements: reportData?.fluency?.improvements || [],
  };

  const grammar: GrammarReport = {
    band: pickBand(reportData?.grammar?.band, reportData?.grammar?.grammarBand),
    grammarBand: pickBand(reportData?.grammar?.grammarBand, reportData?.grammar?.band),
    cefr: toCefr(reportData?.grammar?.cefr),
    grammarScore: reportData?.grammar?.grammarScore || reportData?.grammar?.score || 0,
    grammarLevel: reportData?.grammar?.grammarLevel || reportData?.grammar?.level || 'A1',
    improvementTarget: reportData?.grammar?.improvementTarget
      ? {
          percentToNextLevel: reportData.grammar.improvementTarget.percentToNextLevel || 0,
          nextLevel: reportData.grammar.improvementTarget.nextLevel || 'A2',
        }
      : null,
    growthPoints: reportData?.grammar?.growthPoints || [],
    improvementDescription: reportData?.grammar?.improvementDescription,
    grammarErrors: reportData?.grammar?.grammarErrors,
    sentenceComplexity: {
      score: reportData?.grammar?.sentenceComplexity?.score || 0,
      complexSentenceRatio: toPercent(reportData?.grammar?.sentenceComplexity?.complexSentenceRatio),
      feedback: reportData?.grammar?.sentenceComplexity?.feedback || '',
    },
    strengths: reportData?.grammar?.strengths || [],
    improvements: reportData?.grammar?.improvements || [],
  };

  const vocabulary: VocabularyReport = {
    band: pickBand(reportData?.vocabulary?.band, reportData?.vocabulary?.vocabularyBand),
    vocabularyBand: pickBand(reportData?.vocabulary?.vocabularyBand, reportData?.vocabulary?.band),
    cefr: toCefr(reportData?.vocabulary?.cefr),
    vocabularyScore: reportData?.vocabulary?.vocabularyScore || reportData?.vocabulary?.score || 0,
    vocabularyLevel: reportData?.vocabulary?.vocabularyLevel || reportData?.vocabulary?.level || 'A1',
    improvementTarget: reportData?.vocabulary?.improvementTarget
      ? {
          percentToNextLevel: reportData.vocabulary.improvementTarget.percentToNextLevel || 0,
          nextLevel: reportData.vocabulary.improvementTarget.nextLevel || 'A2',
        }
      : null,
    activeVocabulary: reportData?.vocabulary?.activeVocabulary || 0,
    uniqueWords: reportData?.vocabulary?.uniqueWords || 0,
    sentenceUpgrades: toArray(reportData?.vocabulary?.sentenceUpgrades).map((item: any) => {
      if (typeof item === 'string') {
        const match = item.match(/instead of ['"](.*?)['"],?\s*try ['"](.*?)['"]/i);
        if (match) {
          return {
            original: match[1],
            improved: match[2],
            targetBand: '7.5',
            explanation: item,
          };
        }
        return {
          original: item,
          improved: item,
          targetBand: '7.5',
          explanation: '',
        };
      }
      return item;
    }),
    lexicalDiversity: {
      score: reportData?.vocabulary?.lexicalDiversity?.score || 0,
      feedback: reportData?.vocabulary?.lexicalDiversity?.feedback || '',
    },
    levelBreakdown: reportData?.vocabulary?.levelBreakdown,
    wordSuggestions: reportData?.vocabulary?.wordSuggestions,
    exampleSentences: reportData?.vocabulary?.exampleSentences,
    idiomaticLanguage: reportData?.vocabulary?.idiomaticLanguage,
    strengths: reportData?.vocabulary?.strengths || [],
    improvements: reportData?.vocabulary?.improvements || [],
  };

  const discourse: DiscourseReport = {
    discourseScore: reportData?.discourse?.discourseScore || reportData?.discourse?.score || 0,
    discourseLevel: reportData?.discourse?.discourseLevel || reportData?.discourse?.level || 'A1',
    improvementTarget: reportData?.discourse?.improvementTarget
      ? {
          percentToNextLevel: reportData.discourse.improvementTarget.percentToNextLevel || 0,
          nextLevel: reportData.discourse.improvementTarget.nextLevel || 'A2',
        }
      : null,
    cohesion: {
      score: reportData?.discourse?.cohesion?.score || 0,
      feedback: reportData?.discourse?.cohesion?.feedback || '',
    },
    coherence: {
      score: reportData?.discourse?.coherence?.score || 0,
      feedback: reportData?.discourse?.coherence?.feedback || '',
    },
  };

  const pronunciation: PronunciationReport | undefined = reportData?.pronunciation
    ? {
        band: pickBand(reportData.pronunciation.band, reportData.pronunciation.pronunciationBand),
        pronunciationBand:
          pickBand(reportData.pronunciation.pronunciationBand, reportData.pronunciation.band),
        cefr: toCefr(reportData.pronunciation.cefr),
        pronunciationScore:
          reportData.pronunciation.pronunciationScore || reportData.pronunciation.score || 0,
        pronunciationLevel: reportData.pronunciation.pronunciationLevel,
        feedback: reportData.pronunciation.feedback,
        struggledWords: toArray(reportData.pronunciation.struggledWords),
        strengths: reportData.pronunciation.strengths || [],
        improvements: reportData.pronunciation.improvements || [],
      }
    : undefined;

  return {
    overall_band: toBand(reportData?.overall_band),
    overall_cefr: toCefr(reportData?.overall_cefr),
    target_band: toBand(reportData?.target_band),
    band_gap: reportData?.band_gap,
    insufficient_speech: reportData?.insufficient_speech === true,
    low_confidence: reportData?.low_confidence === true,
    short_sample_capped: reportData?.short_sample_capped === true,
    pronunciation_status: derivePronunciationStatus(
      reportData?.pronunciation_status,
      reportData?.source ?? backendData?.source
    ),
    action_plan_priorities: reportData?.action_plan_priorities,
    fluency,
    grammar,
    vocabulary,
    discourse,
    pronunciation,
    report_date: backendData?.report_date,
    created_at: backendData?.created_at,
    updated_at: backendData?.updated_at,
  };
}
