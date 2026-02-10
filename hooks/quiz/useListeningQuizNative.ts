/**
 * useListeningQuiz Hook (React Native)
 * 
 * Manages listening quiz state and logic.
 * Note: Audio playback needs to be implemented with expo-av or react-native-sound.
 */

import { useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { QuizQuestion } from '@/types/quiz';
import { quizService } from '@/service/QuizService';
import { useQuizEngine } from './useQuizEngine';
import constants from '@/constants';

export function useListeningQuizNative() {
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');
  const [quizError, setQuizError] = useState<string>('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentTopic, setCurrentTopic] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [listeningCount, setListeningCount] = useState(0);
  const maxListens = 3;

  const engine = useQuizEngine(questions);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setQuizError('');
      setLoadingMessage('Loading listening topic...');

      try {
        const storedTopic = await AsyncStorage.getItem('selectedListeningTopic');
        const topic = storedTopic ? JSON.parse(storedTopic) : constants[0];
        setCurrentTopic(topic);

        setLoadingMessage('Generating your listening comprehension quiz...');
        const res = await quizService.generateListeningQuiz(topic.conversation);
        if (!res.success) throw new Error(res.error || 'Failed to generate listening quiz');
        if (!Array.isArray(res.data) || res.data.length === 0) throw new Error('Invalid quiz data generated');

        if (cancelled) return;
        setLoadingMessage('Listening quiz generated! Preparing your questions...');
        setTimeout(() => {
          if (cancelled) return;
          setQuestions(res.data);
          setLoading(false);
        }, 800);
      } catch (e: any) {
        if (cancelled) return;
        setQuizError(e?.message || 'Failed to generate your listening quiz. Please try again.');
        setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  // TODO: Implement audio playback with expo-av or react-native-sound
  const togglePlay = () => {
    if (listeningCount >= maxListens && !isPlaying) {
      return;
    }

    if (!isPlaying) {
      setIsPlaying(true);
      setListeningCount((prev) => prev + 1);
      // TODO: Start audio playback
      // Simulate progress for now
      const interval = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsPlaying(false);
            return 0;
          }
          return prev + 2;
        });
      }, 900);
    } else {
      setIsPlaying(false);
      setAudioProgress(0);
      // TODO: Pause audio playback
    }
  };

  const steps = useMemo(
    () => [
      { name: 'Loading listening topic', icon: '🎧', color: 'bg-blue-500' },
      { name: 'Analyzing conversation content', icon: '📝', color: 'bg-purple-500' },
      { name: 'Creating comprehension questions', icon: '🧠', color: 'bg-green-500' },
      { name: 'Generating detail recall questions', icon: '🎯', color: 'bg-yellow-500' },
      { name: 'Preparing speaker identification', icon: '👥', color: 'bg-indigo-500' },
      { name: 'Finalizing your listening quiz', icon: '✨', color: 'bg-pink-500' },
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
    audioProgress,
    listeningCount,
    maxListens,
    ...engine,
  };
}
