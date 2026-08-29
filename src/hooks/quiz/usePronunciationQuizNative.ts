import { useCallback, useEffect, useMemo, useState } from 'react';
import type { QuizQuestion } from '@/types/quiz';
import { quizService } from '@/services/quiz';
import { useQuizEngine } from './useQuizEngine';

export function usePronunciationQuizNative() {
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');
  const [quizError, setQuizError] = useState<string>('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  const engine = useQuizEngine(questions);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setQuizError('');
      setLoadingMessage('Generating your personalized quiz...');
      try {
        const res = await quizService.generateQuizForConversation();
        if (!res.success)
          throw new Error(res.error || 'Failed to generate quiz');
        if (!Array.isArray(res.data) || res.data.length === 0)
          throw new Error('Invalid quiz data generated');

        if (cancelled) return;
        setLoadingMessage('Quiz generated! Preparing your questions...');
        setTimeout(() => {
          if (cancelled) return;
          setQuestions(res.data);
          setLoading(false);
        }, 800);
      } catch (e: any) {
        if (cancelled) return;
        setQuizError(
          e?.message || 'Failed to generate your quiz. Please try again.'
        );
        setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const submitAnswerWithFeedback = useCallback(() => {
    const q = engine.currentQuestion;
    const rawType = String(q?.meta?.type || '').toLowerCase();

    if (rawType === 'pronunciation') {
      const target = String(
        q?.meta?.targetWord?.text || q?.meta?.target_word?.text || ''
      )
        .trim()
        .toLowerCase()
        .replace(/[.,!?;:]/g, '');
      const spoken = ''
        .trim()
        .toLowerCase()
        .replace(/[.,!?;:]/g, '');
      const ok = target.length > 0 && spoken.length > 0 && spoken === target;
      engine.submitPronunciation(ok);
      return;
    }

    engine.submitAnswer();
  }, [engine]);

  const steps = useMemo(
    () => [
      {
        name: 'Finding your latest conversation',
        icon: 'ðŸ”',
        color: 'bg-blue-500',
      },
      {
        name: 'Analyzing conversation content',
        icon: 'ðŸ“',
        color: 'bg-purple-500',
      },
      {
        name: 'Identifying learning opportunities',
        icon: 'ðŸŽ¯',
        color: 'bg-green-500',
      },
      {
        name: 'Creating personalized questions',
        icon: 'ðŸ§ ',
        color: 'bg-yellow-500',
      },
      { name: 'Generating quiz content', icon: 'âš¡', color: 'bg-indigo-500' },
      { name: 'Finalizing your quiz', icon: 'âœ¨', color: 'bg-pink-500' },
    ],
    []
  );

  return {
    loading,
    loadingMessage,
    quizError,
    steps,
    browserSupportsSpeechRecognition: false,
    isMicrophoneAvailable: false,
    listening: false,
    userSpeech: '',
    startListening: () => {},
    stopListening: () => {},
    ...engine,
    submitAnswer: submitAnswerWithFeedback,
  };
}
