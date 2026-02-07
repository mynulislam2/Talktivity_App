/**
 * Today's Report Mapper
 * 
 * Maps backend API response to frontend types, ensuring type safety
 * and providing default values for missing fields
 */

import type { TodayReport, FluencyReport, GrammarReport, VocabularyReport, DiscourseReport } from '@/types/report';

/**
 * Normalize backend report data to match frontend types
 */
export function normalizeTodayReport(backendData: any): TodayReport {
  // Handle nested report structure
  const reportData = backendData?.report || backendData;

  // Normalize each section with defaults
  const fluency: FluencyReport = {
    fluencyScore: reportData?.fluency?.fluencyScore || reportData?.fluency?.score || 0,
    fluencyLevel: reportData?.fluency?.fluencyLevel || reportData?.fluency?.level || 'A1',
    improvementTarget: reportData?.fluency?.improvementTarget ? {
      percentToNextLevel: reportData.fluency.improvementTarget.percentToNextLevel || 0,
      nextLevel: reportData.fluency.improvementTarget.nextLevel || 'A2',
    } : null,
    fillerWords: {
      percentage: reportData?.fluency?.fillerWords?.percentage || 0,
      feedback: reportData?.fluency?.fillerWords?.feedback || '',
      topFillers: reportData?.fluency?.fillerWords?.topFillers,
    },
    wordsPerMinute: {
      value: reportData?.fluency?.wordsPerMinute?.value || 0,
      emoji: reportData?.fluency?.wordsPerMinute?.emoji || '📊',
      feedback: reportData?.fluency?.wordsPerMinute?.feedback || '',
      speedBarPercent: reportData?.fluency?.wordsPerMinute?.speedBarPercent || 0,
    },
    hesitationsAndCorrections: {
      rate: reportData?.fluency?.hesitationsAndCorrections?.rate || 0,
      feedback: reportData?.fluency?.hesitationsAndCorrections?.feedback || '',
    },
  };

  const grammar: GrammarReport = {
    grammarScore: reportData?.grammar?.grammarScore || reportData?.grammar?.score || 0,
    grammarLevel: reportData?.grammar?.grammarLevel || reportData?.grammar?.level || 'A1',
    improvementTarget: reportData?.grammar?.improvementTarget ? {
      percentToNextLevel: reportData.grammar.improvementTarget.percentToNextLevel || 0,
      nextLevel: reportData.grammar.improvementTarget.nextLevel || 'A2',
    } : null,
    growthPoints: reportData?.grammar?.growthPoints || [],
    improvementDescription: reportData?.grammar?.improvementDescription,
    grammarErrors: reportData?.grammar?.grammarErrors,
    sentenceComplexity: {
      score: reportData?.grammar?.sentenceComplexity?.score || 0,
      feedback: reportData?.grammar?.sentenceComplexity?.feedback || '',
    },
  };

  const vocabulary: VocabularyReport = {
    vocabularyScore: reportData?.vocabulary?.vocabularyScore || reportData?.vocabulary?.score || 0,
    vocabularyLevel: reportData?.vocabulary?.vocabularyLevel || reportData?.vocabulary?.level || 'A1',
    improvementTarget: reportData?.vocabulary?.improvementTarget ? {
      percentToNextLevel: reportData.vocabulary.improvementTarget.percentToNextLevel || 0,
      nextLevel: reportData.vocabulary.improvementTarget.nextLevel || 'A2',
    } : null,
    activeVocabulary: reportData?.vocabulary?.activeVocabulary || 0,
    uniqueWords: reportData?.vocabulary?.uniqueWords || 0,
    lexicalDiversity: {
      score: reportData?.vocabulary?.lexicalDiversity?.score || 0,
      feedback: reportData?.vocabulary?.lexicalDiversity?.feedback || '',
    },
    levelBreakdown: reportData?.vocabulary?.levelBreakdown,
    wordSuggestions: reportData?.vocabulary?.wordSuggestions,
    exampleSentences: reportData?.vocabulary?.exampleSentences,
    idiomaticLanguage: reportData?.vocabulary?.idiomaticLanguage,
  };

  const discourse: DiscourseReport = {
    discourseScore: reportData?.discourse?.discourseScore || reportData?.discourse?.score || 0,
    discourseLevel: reportData?.discourse?.discourseLevel || reportData?.discourse?.level || 'A1',
    improvementTarget: reportData?.discourse?.improvementTarget ? {
      percentToNextLevel: reportData.discourse.improvementTarget.percentToNextLevel || 0,
      nextLevel: reportData.discourse.improvementTarget.nextLevel || 'A2',
    } : null,
    cohesion: {
      score: reportData?.discourse?.cohesion?.score || 0,
      feedback: reportData?.discourse?.cohesion?.feedback || '',
    },
    coherence: {
      score: reportData?.discourse?.coherence?.score || 0,
      feedback: reportData?.discourse?.coherence?.feedback || '',
    },
  };

  return {
    fluency,
    grammar,
    vocabulary,
    discourse,
    report_date: backendData?.report_date,
    created_at: backendData?.created_at,
    updated_at: backendData?.updated_at,
  };
}
