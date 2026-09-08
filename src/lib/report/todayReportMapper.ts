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
} from '@/types/report';

/**
 * Normalize backend report data to match frontend types
 */
export function normalizeTodayReport(backendData: any): TodayReport {
  // Handle nested report structure
  const reportData = backendData?.report || backendData;

  // Normalize each section with defaults
  const fluency: FluencyReport = {
    band: reportData?.fluency?.band || reportData?.fluency?.fluencyBand,
    fluencyBand: reportData?.fluency?.fluencyBand || reportData?.fluency?.band,
    fluencyScore:
      reportData?.fluency?.fluencyScore || reportData?.fluency?.score || 0,
    fluencyLevel:
      reportData?.fluency?.fluencyLevel || reportData?.fluency?.level || 'A1',
    improvementTarget: reportData?.fluency?.improvementTarget
      ? {
          percentToNextLevel:
            reportData.fluency.improvementTarget.percentToNextLevel || 0,
          nextLevel: reportData.fluency.improvementTarget.nextLevel || 'A2',
        }
      : null,
    fillerWords: {
      percentage: reportData?.fluency?.fillerWords?.percentage || 0,
      feedback: reportData?.fluency?.fillerWords?.feedback || '',
      topFillers: reportData?.fluency?.fillerWords?.topFillers,
    },
    wordsPerMinute: {
      value: reportData?.fluency?.wordsPerMinute?.value || 0,
      emoji: reportData?.fluency?.wordsPerMinute?.emoji || '📊',
      feedback: reportData?.fluency?.wordsPerMinute?.feedback || '',
      speedBarPercent:
        reportData?.fluency?.wordsPerMinute?.speedBarPercent || 0,
    },
    hesitationsAndCorrections: {
      rate: reportData?.fluency?.hesitationsAndCorrections?.rate || 0,
      feedback: reportData?.fluency?.hesitationsAndCorrections?.feedback || '',
    },
    strengths: reportData?.fluency?.strengths || [],
    improvements: reportData?.fluency?.improvements || [],
  };

  const grammar: GrammarReport = {
    band: reportData?.grammar?.band || reportData?.grammar?.grammarBand,
    grammarBand: reportData?.grammar?.grammarBand || reportData?.grammar?.band,
    grammarScore:
      reportData?.grammar?.grammarScore || reportData?.grammar?.score || 0,
    grammarLevel:
      reportData?.grammar?.grammarLevel || reportData?.grammar?.level || 'A1',
    improvementTarget: reportData?.grammar?.improvementTarget
      ? {
          percentToNextLevel:
            reportData.grammar.improvementTarget.percentToNextLevel || 0,
          nextLevel: reportData.grammar.improvementTarget.nextLevel || 'A2',
        }
      : null,
    growthPoints: reportData?.grammar?.growthPoints || [],
    improvementDescription: reportData?.grammar?.improvementDescription,
    grammarErrors: reportData?.grammar?.grammarErrors,
    sentenceComplexity: {
      score: reportData?.grammar?.sentenceComplexity?.score || 0,
      complexSentenceRatio:
        reportData?.grammar?.sentenceComplexity?.complexSentenceRatio,
      feedback: reportData?.grammar?.sentenceComplexity?.feedback || '',
    },
    strengths: reportData?.grammar?.strengths || [],
    improvements: reportData?.grammar?.improvements || [],
  };

  const vocabulary: VocabularyReport = {
    band: reportData?.vocabulary?.band || reportData?.vocabulary?.vocabularyBand,
    vocabularyBand:
      reportData?.vocabulary?.vocabularyBand || reportData?.vocabulary?.band,
    vocabularyScore:
      reportData?.vocabulary?.vocabularyScore ||
      reportData?.vocabulary?.score ||
      0,
    vocabularyLevel:
      reportData?.vocabulary?.vocabularyLevel ||
      reportData?.vocabulary?.level ||
      'A1',
    improvementTarget: reportData?.vocabulary?.improvementTarget
      ? {
          percentToNextLevel:
            reportData.vocabulary.improvementTarget.percentToNextLevel || 0,
          nextLevel: reportData.vocabulary.improvementTarget.nextLevel || 'A2',
        }
      : null,
    activeVocabulary: reportData?.vocabulary?.activeVocabulary || 0,
    uniqueWords: reportData?.vocabulary?.uniqueWords || 0,
    sentenceUpgrades: reportData?.vocabulary?.sentenceUpgrades || [],
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
    discourseScore:
      reportData?.discourse?.discourseScore ||
      reportData?.discourse?.score ||
      0,
    discourseLevel:
      reportData?.discourse?.discourseLevel ||
      reportData?.discourse?.level ||
      'A1',
    improvementTarget: reportData?.discourse?.improvementTarget
      ? {
          percentToNextLevel:
            reportData.discourse.improvementTarget.percentToNextLevel || 0,
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

  const pronunciation = reportData?.pronunciation
    ? {
        band: reportData.pronunciation.band || reportData.pronunciation.pronunciationBand,
        pronunciationBand:
          reportData.pronunciation.pronunciationBand || reportData.pronunciation.band,
        pronunciationScore:
          reportData.pronunciation.pronunciationScore || reportData.pronunciation.score || 0,
        pronunciationLevel: reportData.pronunciation.pronunciationLevel,
        feedback: reportData.pronunciation.feedback,
        struggledWords: reportData.pronunciation.struggledWords || [],
        strengths: reportData.pronunciation.strengths || [],
        improvements: reportData.pronunciation.improvements || [],
      }
    : undefined;

  return {
    overall_band: reportData?.overall_band,
    target_band: reportData?.target_band,
    band_gap: reportData?.band_gap,
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
