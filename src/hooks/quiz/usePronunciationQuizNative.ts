import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import type { QuizQuestion } from '@/types/quiz';
import { quizService } from '@/services/quiz';
import { reviewService } from '@/services/review';
import { useQuizEngine } from './useQuizEngine';

const AudioRecording = Audio.Recording;
const AudioRecordingOptionsPresets = Audio.RecordingOptionsPresets;
const requestAudioPermissionsAsync = Audio.requestPermissionsAsync;

// A single spoken word. Well under any payload limit, but capped so a stuck
// mic cannot build a request the API will reject.
const MAX_RECORDING_MS = 15000;

export function usePronunciationQuizNative() {
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');
  const [quizError, setQuizError] = useState<string>('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  const [listening, setListening] = useState(false);
  const [userSpeech, setUserSpeech] = useState('');
  const [micAvailable, setMicAvailable] = useState(true);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const maxDurationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The server decides whether the word was said correctly; hold that verdict
  // so `submitAnswer` scores from the actual audio rather than re-guessing
  // from the transcript.
  const lastVerdictRef = useRef<boolean>(false);

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

  const targetWord = useCallback(
    (q: QuizQuestion | undefined) =>
      String(q?.meta?.targetWord?.text || q?.meta?.target_word?.text || '').trim(),
    []
  );

  const startListening = useCallback(async () => {
    if (listening || !AudioRecording) return;
    try {
      const perm = requestAudioPermissionsAsync
        ? await requestAudioPermissionsAsync()
        : { granted: true };
      if (!perm?.granted) {
        setMicAvailable(false);
        return;
      }
      setMicAvailable(true);
      setUserSpeech('');
      lastVerdictRef.current = false;

      const { recording } = await AudioRecording.createAsync(
        AudioRecordingOptionsPresets?.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setListening(true);
      maxDurationTimerRef.current = setTimeout(() => {
        stopListeningRef.current();
      }, MAX_RECORDING_MS);
    } catch (e: any) {
      console.warn('[PronunciationQuiz] start recording failed:', e?.message);
      setListening(false);
    }
  }, [listening]);

  const stopListening = useCallback(async () => {
    if (maxDurationTimerRef.current) {
      clearTimeout(maxDurationTimerRef.current);
      maxDurationTimerRef.current = null;
    }
    const recording = recordingRef.current;
    recordingRef.current = null;
    setListening(false);
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (!uri) return;

      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      if (!base64Audio) return;

      const word = targetWord(engine.currentQuestion);
      const result = await reviewService.evaluateAudio({
        audioBase64: base64Audio,
        mimeType: 'audio/m4a',
        original: '',
        corrected: word,
        explanation: `Pronounce the word "${word}" clearly.`,
        cardIndex: 0,
        totalCards: 1,
      });

      lastVerdictRef.current = Boolean(result.isValid);
      // Surface what was heard so the Submit button un-gates and the learner
      // can see the attempt was registered. Fall back to the word itself when
      // the model returned a verdict but no transcript.
      setUserSpeech(result.userSpokenText || (result.success ? word : ''));
    } catch (e: any) {
      console.warn('[PronunciationQuiz] evaluate failed:', e?.message);
    }
  }, [engine.currentQuestion, targetWord]);

  // startListening's timeout needs the latest stopListening without making the
  // two callbacks circularly dependent.
  const stopListeningRef = useRef(stopListening);
  useEffect(() => {
    stopListeningRef.current = stopListening;
  }, [stopListening]);

  useEffect(
    () => () => {
      if (maxDurationTimerRef.current) clearTimeout(maxDurationTimerRef.current);
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
        recordingRef.current = null;
      }
    },
    []
  );

  const submitAnswerWithFeedback = useCallback(() => {
    const q = engine.currentQuestion;
    const rawType = String(q?.meta?.type || '').toLowerCase();

    if (rawType === 'pronunciation') {
      // Scored from the recorded audio by the server, not by string-matching a
      // transcript: an STT engine autocorrects to the intended word, so it can
      // never tell a good attempt from a poor one.
      engine.submitPronunciation(lastVerdictRef.current);
      return;
    }

    engine.submitAnswer();
  }, [engine]);

  // Clear the previous attempt when the question changes, so a stale verdict
  // can never score the next word.
  useEffect(() => {
    setUserSpeech('');
    lastVerdictRef.current = false;
  }, [engine.currentIndex]);

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
    // Native records audio and the server evaluates it, so the capability no
    // longer depends on a browser speech API being present.
    browserSupportsSpeechRecognition: Boolean(AudioRecording),
    isMicrophoneAvailable: micAvailable,
    listening,
    userSpeech,
    startListening,
    stopListening,
    ...engine,
    submitAnswer: submitAnswerWithFeedback,
  };
}
