/**
 * Speech Hook for Vocabulary Coach (Mobile)
 * Handles client-side Text-To-Speech (expo-speech)
 * and client-side Speech-To-Text (expo-speech-recognition).
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import * as Speech from 'expo-speech';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

export interface UseVocabularySpeechOptions {
  onTranscriptChange?: (text: string, isFinal: boolean) => void;
  onListeningEnd?: () => void;
}

export function useVocabularySpeech(options: UseVocabularySpeechOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Listen to speech recognition events
  useSpeechRecognitionEvent('start', () => {
    setIsListening(true);
  });

  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results?.[0]?.transcript || '';
    setTranscript(text);
    if (optionsRef.current.onTranscriptChange) {
      optionsRef.current.onTranscriptChange(text, event.isFinal);
    }
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
    if (optionsRef.current.onListeningEnd) {
      optionsRef.current.onListeningEnd();
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.warn('[useVocabularySpeech] speech recognition error:', event.error, event.message);
    setIsListening(false);
    if (optionsRef.current.onListeningEnd) {
      optionsRef.current.onListeningEnd();
    }
  });

  // TTS: speak text
  const speak = useCallback((text: string, opts?: { slow?: boolean }) => {
    if (!text) return;
    try {
      Speech.stop();
      setIsSpeaking(true);
      Speech.speak(text, {
        language: 'en-GB',
        rate: opts?.slow ? 0.65 : 0.95,
        pitch: 1.0,
        onStart: () => setIsSpeaking(true),
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch (err) {
      console.warn('[useVocabularySpeech] TTS error:', err);
      setIsSpeaking(false);
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    try {
      Speech.stop();
    } catch {
      // ignore
    }
    setIsSpeaking(false);
  }, []);

  // STT: start listening
  const startListening = useCallback(async () => {
    try {
      stopSpeaking();
      setTranscript('');

      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      setHasPermission(permission.granted);

      if (!permission.granted) {
        console.warn('[useVocabularySpeech] Audio recording permission not granted');
        return false;
      }

      ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
        continuous: true,
      });
      return true;
    } catch (err) {
      console.warn('[useVocabularySpeech] start listening error:', err);
      setIsListening(false);
      return false;
    }
  }, [stopSpeaking]);

  // STT: stop listening
  const stopListening = useCallback(() => {
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch {
      // ignore
    }
    setIsListening(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        Speech.stop();
      } catch {
        // ignore
      }
      try {
        ExpoSpeechRecognitionModule.stop();
      } catch {
        // ignore
      }
    };
  }, []);

  return {
    isSpeaking,
    isListening,
    transcript,
    setTranscript,
    hasPermission,
    speak,
    stopSpeaking,
    startListening,
    stopListening,
  };
}

/**
 * Client-side similarity calculation between target sentence and spoken sentence
 */
export function calculateSentenceSimilarity(target: string, spoken: string): number {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .trim();

  const targetWords = normalize(target).split(/\s+/).filter(Boolean);
  const spokenWords = normalize(spoken).split(/\s+/).filter(Boolean);

  if (targetWords.length === 0 || spokenWords.length === 0) return 0;

  let matched = 0;
  for (const word of targetWords) {
    if (spokenWords.includes(word)) {
      matched++;
    }
  }

  return Math.min(100, Math.round((matched / targetWords.length) * 100));
}
