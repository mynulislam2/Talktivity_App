import type {
  CefrLevel,
  ProficiencyConfidence,
  ProficiencyResult,
  ProficiencyTrend,
  SessionScore,
  VocabBreakdown,
} from '@/types/proficiency';

export const CEFR_LEVELS: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const CEFR_DESCRIPTORS: Record<CefrLevel, string> = {
  A1: 'Beginner',
  A2: 'Elementary',
  B1: 'Intermediate',
  B2: 'Upper Intermediate',
  C1: 'Advanced',
  C2: 'Proficiency',
};

const SCORE_RANGES: Record<CefrLevel, { min: number; max: number }> = {
  A1: { min: 0, max: 19 },
  A2: { min: 20, max: 39 },
  B1: { min: 40, max: 59 },
  B2: { min: 60, max: 74 },
  C1: { min: 75, max: 89 },
  C2: { min: 90, max: 100 },
};

const EMA_ALPHA = 0.3;

const SKILL_WEIGHTS = {
  fluency: 0.3,
  grammar: 0.3,
  vocabulary: 0.25,
  discourse: 0.15,
} as const;

const EMPTY_BREAKDOWN: VocabBreakdown = {
  A1: 0,
  A2: 0,
  B1: 0,
  B2: 0,
  C1: 0,
  C2: 0,
};

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function roundScore(value: number): number {
  return Math.round(clampScore(value));
}

function average(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function normalizeBreakdown(
  breakdown?: Partial<VocabBreakdown> | null
): VocabBreakdown {
  return {
    A1: roundScore(Number(breakdown?.A1 || 0)),
    A2: roundScore(Number(breakdown?.A2 || 0)),
    B1: roundScore(Number(breakdown?.B1 || 0)),
    B2: roundScore(Number(breakdown?.B2 || 0)),
    C1: roundScore(Number(breakdown?.C1 || 0)),
    C2: roundScore(Number(breakdown?.C2 || 0)),
  };
}

function getVocabularyDistributionBonus(
  breakdown?: Partial<VocabBreakdown> | null
): number {
  const normalizedBreakdown = normalizeBreakdown(breakdown);
  const totalWords = Object.values(normalizedBreakdown).reduce(
    (sum, value) => sum + value,
    0
  );
  if (!totalWords) return 0;
  const advancedWords =
    normalizedBreakdown.B2 + normalizedBreakdown.C1 + normalizedBreakdown.C2;
  const advancedPercentage = (advancedWords / totalWords) * 100;
  if (advancedPercentage >= 30) return 5;
  if (advancedPercentage >= 20) return 3;
  if (advancedPercentage >= 10) return 0;
  if (advancedPercentage >= 5) return -3;
  return -5;
}

function calculateEmaSeries(values: number[], alpha = EMA_ALPHA): number[] {
  if (!values.length) return [];
  const emaValues: number[] = [values[0]];
  for (let index = 1; index < values.length; index += 1) {
    const current = values[index];
    const previous = emaValues[index - 1];
    emaValues.push(alpha * current + (1 - alpha) * previous);
  }
  return emaValues;
}

function getRecentTrend(values: number[]): ProficiencyTrend {
  if (!values.length) return 'stable';
  const recentWindow = values.slice(-3);
  const previousWindow = values.slice(-6, -3);
  const delta = previousWindow.length
    ? average(recentWindow) - average(previousWindow)
    : values.length > 1
    ? values[values.length - 1] - values[0]
    : 0;
  if (delta > 3) return 'improving';
  if (delta < -3) return 'declining';
  return 'stable';
}

export function getCefrLevelFromScore(score: number): CefrLevel {
  const normalizedScore = clampScore(score);
  if (normalizedScore >= SCORE_RANGES.C2.min) return 'C2';
  if (normalizedScore >= SCORE_RANGES.C1.min) return 'C1';
  if (normalizedScore >= SCORE_RANGES.B2.min) return 'B2';
  if (normalizedScore >= SCORE_RANGES.B1.min) return 'B1';
  if (normalizedScore >= SCORE_RANGES.A2.min) return 'A2';
  return 'A1';
}

export function getCefrDescriptor(level: CefrLevel): string {
  return CEFR_DESCRIPTORS[level];
}

export function getCefrLevelIndex(level: CefrLevel): number {
  return CEFR_LEVELS.indexOf(level);
}

export function getNextCefrLevel(level: CefrLevel): CefrLevel {
  const currentIndex = getCefrLevelIndex(level);
  return CEFR_LEVELS[Math.min(currentIndex + 1, CEFR_LEVELS.length - 1)];
}

function getConfidence(sessionCount: number): ProficiencyConfidence {
  if (sessionCount === 0) return 'none';
  if (sessionCount <= 2) return 'preliminary';
  if (sessionCount <= 4) return 'developing';
  return 'established';
}

function getProgressToNextLevel(score: number, level: CefrLevel): number {
  if (level === 'C2') return 100;
  const currentRange = SCORE_RANGES[level];
  const nextLevel = getNextCefrLevel(level);
  const nextThreshold = SCORE_RANGES[nextLevel].min;
  const distanceToNext = nextThreshold - currentRange.min;
  if (distanceToNext <= 0) return 0;
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(
        ((clampScore(score) - currentRange.min) / distanceToNext) * 100
      )
    )
  );
}

function getEmptyResult(): ProficiencyResult {
  return {
    overallScore: 0,
    overallLevel: 'Not yet assessed',
    confidence: 'none',
    skills: {
      fluency: { score: 0, level: 'A1', trend: 'stable' },
      grammar: { score: 0, level: 'A1', trend: 'stable' },
      vocabulary: { score: 0, level: 'A1', trend: 'stable' },
      discourse: { score: 0, level: 'A1', trend: 'stable' },
    },
    progressToNextLevel: 0,
    nextLevel: 'A1',
    sessionCount: 0,
  };
}

function getWeightedSessionScore(
  session: SessionScore,
  adjustedVocabulary: number
): number {
  return (
    clampScore(session.fluency) * SKILL_WEIGHTS.fluency +
    clampScore(session.grammar) * SKILL_WEIGHTS.grammar +
    clampScore(adjustedVocabulary) * SKILL_WEIGHTS.vocabulary +
    clampScore(session.discourse) * SKILL_WEIGHTS.discourse
  );
}

export function calculateProficiency(
  sessions: SessionScore[] | null | undefined
): ProficiencyResult {
  if (!sessions?.length) return getEmptyResult();

  const sortedSessions = [...sessions]
    .map((session) => ({
      ...session,
      fluency: roundScore(Number(session.fluency || 0)),
      grammar: roundScore(Number(session.grammar || 0)),
      vocabulary: roundScore(Number(session.vocabulary || 0)),
      discourse: roundScore(Number(session.discourse || 0)),
      vocabBreakdown: normalizeBreakdown(
        session.vocabBreakdown || EMPTY_BREAKDOWN
      ),
    }))
    .sort(
      (first, second) =>
        new Date(first.date).getTime() - new Date(second.date).getTime()
    );

  const fluencySeries = sortedSessions.map((session) => session.fluency);
  const grammarSeries = sortedSessions.map((session) => session.grammar);
  const vocabularySeries = sortedSessions.map((session) =>
    clampScore(
      session.vocabulary +
        getVocabularyDistributionBonus(session.vocabBreakdown)
    )
  );
  const discourseSeries = sortedSessions.map((session) => session.discourse);
  const overallSeries = sortedSessions.map((session, index) =>
    getWeightedSessionScore(session, vocabularySeries[index])
  );

  const fluencyEmaSeries = calculateEmaSeries(fluencySeries);
  const grammarEmaSeries = calculateEmaSeries(grammarSeries);
  const vocabularyEmaSeries = calculateEmaSeries(vocabularySeries);
  const discourseEmaSeries = calculateEmaSeries(discourseSeries);
  const overallEmaSeries = calculateEmaSeries(overallSeries);

  const finalFluencyScore = roundScore(
    fluencyEmaSeries[fluencyEmaSeries.length - 1] || 0
  );
  const finalGrammarScore = roundScore(
    grammarEmaSeries[grammarEmaSeries.length - 1] || 0
  );
  const finalVocabularyScore = roundScore(
    vocabularyEmaSeries[vocabularyEmaSeries.length - 1] || 0
  );
  const finalDiscourseScore = roundScore(
    discourseEmaSeries[discourseEmaSeries.length - 1] || 0
  );

  const fluencyLevel = getCefrLevelFromScore(finalFluencyScore);
  const grammarLevel = getCefrLevelFromScore(finalGrammarScore);
  const vocabularyLevel = getCefrLevelFromScore(finalVocabularyScore);
  const discourseLevel = getCefrLevelFromScore(finalDiscourseScore);

  const weakestSkillLevelIndex = Math.min(
    getCefrLevelIndex(fluencyLevel),
    getCefrLevelIndex(grammarLevel),
    getCefrLevelIndex(vocabularyLevel),
    getCefrLevelIndex(discourseLevel)
  );

  const rawOverallScore = clampScore(
    overallEmaSeries[overallEmaSeries.length - 1] || 0
  );
  const rawOverallLevel = getCefrLevelFromScore(rawOverallScore);
  const cappedOverallLevelIndex = Math.min(
    getCefrLevelIndex(rawOverallLevel),
    weakestSkillLevelIndex + 1
  );
  const overallLevel = CEFR_LEVELS[cappedOverallLevelIndex];
  const overallScore = roundScore(
    Math.min(rawOverallScore, SCORE_RANGES[overallLevel].max)
  );

  return {
    overallScore,
    overallLevel,
    confidence: getConfidence(sortedSessions.length),
    skills: {
      fluency: {
        score: finalFluencyScore,
        level: fluencyLevel,
        trend: getRecentTrend(fluencyEmaSeries),
      },
      grammar: {
        score: finalGrammarScore,
        level: grammarLevel,
        trend: getRecentTrend(grammarEmaSeries),
      },
      vocabulary: {
        score: finalVocabularyScore,
        level: vocabularyLevel,
        trend: getRecentTrend(vocabularyEmaSeries),
      },
      discourse: {
        score: finalDiscourseScore,
        level: discourseLevel,
        trend: getRecentTrend(discourseEmaSeries),
      },
    },
    progressToNextLevel: getProgressToNextLevel(overallScore, overallLevel),
    nextLevel: getNextCefrLevel(overallLevel),
    sessionCount: sortedSessions.length,
  };
}
