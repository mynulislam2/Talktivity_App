/**
 * usePronunciationQuiz Hook (React Native)
 * 
 * Manages pronunciation quiz state and logic.
 * Note: Speech recognition needs to be implemented with a React Native library
 * like @react-native-voice/voice or similar.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import type { QuizQuestion } from '@/types/quiz';
import { quizService } from '@/service/QuizService';
import { useQuizEngine } from './useQuizEngine';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function usePronunciationQuizNative() {
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');
  const [quizError, setQuizError] = useState<string>('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [listening, setListening] = useState(false);
  const [userSpeech, setUserSpeech] = useState('');
  const [browserSupportsSpeechRecognition, setBrowserSupportsSpeechRecognition] = useState(true);
  const [isMicrophoneAvailable, setIsMicrophoneAvailable] = useState(true);

  const engine = useQuizEngine(questions);

  // Generate quiz
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setQuizError('');
      setLoadingMessage('Generating your personalized quiz...');
      try {
        const res = await quizService.generateQuizForConversation();
        if (!res.success) throw new Error(res.error || 'Failed to generate quiz');
        if (!Array.isArray(res.data) || res.data.length === 0) throw new Error('Invalid quiz data generated');

        if (cancelled) return;
        setLoadingMessage('Quiz generated! Preparing your questions...');
        setTimeout(() => {
          if (cancelled) return;
          setQuestions(res.data);
          setLoading(false);
        }, 800);
      } catch (e: any) {
        if (cancelled) return;
        setQuizError(e?.message || 'Failed to generate your quiz. Please try again.');
        setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  // TODO: Implement speech recognition with React Native library
  // For now, using placeholder functions
  const startListening = () => {
    setListening(true);
    // TODO: Start speech recognition
    // Example with @react-native-voice/voice:
    // Voice.start('en-US');
  };

  const stopListening = () => {
    setListening(false);
    // TODO: Stop speech recognition
    // Voice.stop();
  };

  const submitAnswerWithFeedback = () => {
    const q = engine.currentQuestion;
    const rawType = String(q?.meta?.type || '').toLowerCase();

    // Special handling for pronunciation question
    if (rawType === 'pronunciation') {
      const target = String(q?.meta?.targetWord?.text || q?.meta?.target_word?.text || '')
        .trim()
        .toLowerCase()
        .replace(/[.,!?;:]/g, '');
      const spoken = (userSpeech || '')
        .trim()
        .toLowerCase()
        .replace(/[.,!?;:]/g, '');
      
      const ok = target.length > 0 && spoken.length > 0 && spoken === target;
      engine.submitPronunciation(ok);
      return;
    }

    // Default MCQ flow
    engine.submitAnswer();
  };

  const steps = useMemo(
    () => [
      { name: 'Finding your latest conversation', icon: '🔍', color: 'bg-blue-500' },
      { name: 'Analyzing conversation content', icon: '📝', color: 'bg-purple-500' },
      { name: 'Identifying learning opportunities', icon: '🎯', color: 'bg-green-500' },
      { name: 'Creating personalized questions', icon: '🧠', color: 'bg-yellow-500' },
      { name: 'Generating quiz content', icon: '⚡', color: 'bg-indigo-500' },
      { name: 'Finalizing your quiz', icon: '✨', color: 'bg-pink-500' },
    ],
    []
  );

  return {
    loading,
    loadingMessage,
    quizError,
    steps,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
    listening,
    userSpeech,
    startListening,
    stopListening,
    ...engine,
    submitAnswer: submitAnswerWithFeedback,
  };
}
