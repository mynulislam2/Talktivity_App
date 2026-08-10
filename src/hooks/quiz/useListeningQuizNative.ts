import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { QuizQuestion } from '@/types/quiz';
import { quizService } from '@/services/quiz';
import { useQuizEngine } from './useQuizEngine';
import { courseService } from '@/services/course';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LISTENING_TOPIC_KEY = 'listeningTopic';

export function useListeningQuizNative() {
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');
  const [quizError, setQuizError] = useState<string>('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentTopic, setCurrentTopic] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const engine = useQuizEngine(questions);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setQuizError('');
      setLoadingMessage('Loading listening topic...');

      try {
        let topic: any = null;
        const stored = await AsyncStorage.getItem(LISTENING_TOPIC_KEY);
        if (stored) {
          try {
            topic = JSON.parse(stored);
          } catch {}
        }

        if (!topic?.conversation) {
          try {
            const courseStatus = await courseService.getCourseStatus();
            topic = courseStatus?.course?.todayListeningTopic || topic;
          } catch {}
        }

        if (topic) {
          await AsyncStorage.setItem(
            LISTENING_TOPIC_KEY,
            JSON.stringify(topic)
          );
        }
        setCurrentTopic(topic);

        setLoadingMessage('Generating your listening comprehension quiz...');
        const res = await quizService.generateListeningQuiz(topic.conversation);
        if (!res.success)
          throw new Error(res.error || 'Failed to generate listening quiz');
        if (!Array.isArray(res.data) || res.data.length === 0)
          throw new Error('Invalid quiz data generated');

        if (cancelled) return;
        setLoadingMessage(
          'Listening quiz generated! Preparing your questions...'
        );
        setTimeout(() => {
          if (cancelled) return;
          setQuestions(res.data);
          setLoading(false);
        }, 800);
      } catch (e: any) {
        if (cancelled) return;
        setQuizError(
          e?.message ||
            'Failed to generate your listening quiz. Please try again.'
        );
        setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const steps = useMemo(
    () => [
      { name: 'Loading listening topic', icon: 'ðŸŽ§', color: 'bg-blue-500' },
      {
        name: 'Analyzing conversation content',
        icon: 'ðŸ“',
        color: 'bg-purple-500',
      },
      {
        name: 'Creating comprehension questions',
        icon: 'ðŸ§ ',
        color: 'bg-green-500',
      },
      {
        name: 'Generating detail recall questions',
        icon: 'ðŸŽ¯',
        color: 'bg-yellow-500',
      },
      {
        name: 'Preparing speaker identification',
        icon: 'ðŸ‘¥',
        color: 'bg-indigo-500',
      },
      {
        name: 'Finalizing your listening quiz',
        icon: 'âœ¨',
        color: 'bg-pink-500',
      },
    ],
    []
  );

  return {
    loading,
    loadingMessage,
    quizError,
    steps,
    currentTopic,
    isPlaying,
    togglePlay,
    audioProgress: 0,
    listeningCount: 0,
    maxListens: 3,
    ...engine,
  };
}
