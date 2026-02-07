import { useEffect, useMemo, useRef, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import type { QuizQuestion } from '@/types/quiz';
import { quizService } from '@/service/QuizService';
import { useQuizEngine } from './useQuizEngine';

export function usePronunciationQuiz() {
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');
  const [quizError, setQuizError] = useState<string>('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const incorrectSoundRef = useRef<HTMLAudioElement | null>(null);

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition, isMicrophoneAvailable } =
    useSpeechRecognition();

  const engine = useQuizEngine(questions);

  // Load sounds once
  useEffect(() => {
    if (correctSoundRef.current == null) correctSoundRef.current = new Audio();
    if (incorrectSoundRef.current == null) incorrectSoundRef.current = new Audio();

    if (correctSoundRef.current) correctSoundRef.current.src = 'https://files.catbox.moe/cygtp8.mp3';
    if (incorrectSoundRef.current) incorrectSoundRef.current.src = 'https://files.catbox.moe/oeedw9.mp3';
  }, []);

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

  const userSpeech = transcript;

  const startListening = () => {
    resetTranscript();
    SpeechRecognition.startListening({ continuous: false, language: 'en-US' });
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
  };

  const submitAnswerWithFeedback = () => {
    const q = engine.currentQuestion;
    const rawType = String(q?.meta?.type || '').toLowerCase();

    // Special handling for pronunciation question (5th question)
    if (rawType === 'pronunciation') {
      const target = String(q?.meta?.targetWord?.text || q?.meta?.target_word?.text || '')
        .trim()
        .toLowerCase()
        .replace(/[.,!?;:]/g, ''); // Remove punctuation from target
      const spoken = (transcript || userSpeech || '')
        .trim()
        .toLowerCase()
        .replace(/[.,!?;:]/g, ''); // Remove punctuation from spoken
      
      // Compare: exact match (case-insensitive, punctuation-ignored)
      const ok = target.length > 0 && spoken.length > 0 && spoken === target;

      engine.submitPronunciation(ok);

      const sound = ok ? correctSoundRef.current : incorrectSoundRef.current;
      try {
        sound?.play?.();
      } catch {}
      return;
    }

    // Default MCQ flow for the first four questions
    engine.submitAnswer();
    const correctIds = engine.currentQuestion?.correctOptionIds || [];
    const ok =
      correctIds.length === engine.selectedOptionIds.length &&
      correctIds.every((id) => engine.selectedOptionIds.includes(id));
    const sound = ok ? correctSoundRef.current : incorrectSoundRef.current;
    try {
      sound?.play?.();
    } catch {}
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

