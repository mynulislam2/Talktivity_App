import { useCallback, useMemo, useState } from 'react';
import type { QuizQuestion } from '@/types/quiz';

function equalSets(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const as = new Set(a);
  for (const x of b) if (!as.has(x)) return false;
  return true;
}

export function useQuizEngine(questions: QuizQuestion[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [completed, setCompleted] = useState(false);

  const currentQuestion = useMemo(() => questions[currentIndex] || null, [questions, currentIndex]);

  const selectOption = useCallback((optionId: string) => {
    if (isAnswered) return;
    setSelectedOptionIds((prev) => {
      // default single-select behavior unless question is explicitly multi-correct
      const multi = (currentQuestion?.correctOptionIds?.length || 0) > 1;
      if (!multi) return [optionId];
      return prev.includes(optionId) ? prev.filter((x) => x !== optionId) : [...prev, optionId];
    });
  }, [currentQuestion?.correctOptionIds?.length, isAnswered]);

  const submitAnswer = useCallback(() => {
    if (!currentQuestion || isAnswered) return;

    // For pronunciation questions, correctness is determined externally
    // (via speech recognition in usePronunciationQuiz), so the standard
    // MCQ-based submit is a no-op here.
    const rawType = String(currentQuestion.meta?.type || '').toLowerCase();
    if (rawType === 'pronunciation') {
      return;
    }

    const correctIds = currentQuestion.correctOptionIds || [];
    const ok = equalSets(selectedOptionIds, correctIds);
    setIsCorrect(ok);
    setIsAnswered(true);
    if (ok) setScore((s) => s + 1);
  }, [currentQuestion, isAnswered, selectedOptionIds]);

  const submitPronunciation = useCallback((correct: boolean) => {
    if (!currentQuestion || isAnswered) return;
    const rawType = String(currentQuestion.meta?.type || '').toLowerCase();
    if (rawType !== 'pronunciation') return;

    setIsCorrect(correct);
    setIsAnswered(true);
    if (correct) setScore((s) => s + 1);
  }, [currentQuestion, isAnswered]);

  const goNext = useCallback(() => {
    if (!currentQuestion) return;
    const isLast = currentIndex >= questions.length - 1;
    if (isLast) {
      setCompleted(true);
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelectedOptionIds([]);
    setIsAnswered(false);
    setIsCorrect(false);
  }, [currentIndex, currentQuestion, questions.length]);

  const reset = useCallback(() => {
    setCurrentIndex(0);
    setSelectedOptionIds([]);
    setScore(0);
    setIsAnswered(false);
    setIsCorrect(false);
    setCompleted(false);
  }, []);

  return {
    currentQuestion,
    currentIndex,
    totalQuestions: questions.length,
    selectedOptionIds,
    score,
    isAnswered,
    isCorrect,
    completed,
    selectOption,
    submitAnswer,
    submitPronunciation,
    goNext,
    reset,
  };
}

