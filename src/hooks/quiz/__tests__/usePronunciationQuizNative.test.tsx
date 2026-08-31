/**
 * Regression tests for the native pronunciation quiz.
 *
 * The hook previously hardcoded `const spoken = ''` when scoring a
 * pronunciation question, so `spoken.length > 0` was never true and a
 * pronunciation answer could NEVER be marked correct. It also reported
 * `browserSupportsSpeechRecognition: false`, which made QuizScreen render a
 * permanent "Speech Recognition Not Supported" dead end — for the whole quiz,
 * not just the spoken questions.
 *
 * It now records the attempt and lets the server judge the audio, which is the
 * only approach that can work: an STT engine autocorrects to the intended word,
 * so a transcript cannot distinguish a good attempt from a poor one.
 */

import { act, renderHook, waitFor } from '@testing-library/react-native';

const mockEvaluateAudio = jest.fn();
const mockCreateAsync = jest.fn();
const mockStopAndUnload = jest.fn();
const mockGetURI = jest.fn();

jest.mock('expo-av', () => ({
  Audio: {
    Recording: {
      createAsync: (...args: unknown[]) => mockCreateAsync(...args),
    },
    RecordingOptionsPresets: { HIGH_QUALITY: {} },
    requestPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  },
}));

jest.mock('expo-file-system', () => ({
  readAsStringAsync: jest.fn().mockResolvedValue('BASE64AUDIODATA'),
  EncodingType: { Base64: 'base64' },
}));

jest.mock('@/services/review', () => ({
  reviewService: { evaluateAudio: (...args: unknown[]) => mockEvaluateAudio(...args) },
}));

jest.mock('@/services/quiz', () => ({
  quizService: {
    generateQuizForConversation: jest.fn().mockResolvedValue({
      success: true,
      data: [
        {
          id: 'q1',
          question: 'Say the word',
          options: [],
          meta: { type: 'pronunciation', targetWord: { text: 'itinerary' } },
        },
      ],
    }),
  },
}));

import { usePronunciationQuizNative } from '../usePronunciationQuizNative';

const flushQuizLoad = async (result: { current: { loading: boolean } }) => {
  // The hook defers setting questions behind an 800ms timer.
  await act(async () => {
    jest.advanceTimersByTime(1000);
  });
  await waitFor(() => expect(result.current.loading).toBe(false));
};

describe('usePronunciationQuizNative', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockGetURI.mockReturnValue('file:///tmp/attempt.m4a');
    mockStopAndUnload.mockResolvedValue(undefined);
    mockCreateAsync.mockResolvedValue({
      recording: { stopAndUnloadAsync: mockStopAndUnload, getURI: mockGetURI },
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('reports speech capture as supported so the quiz is reachable', () => {
    const { result } = renderHook(() => usePronunciationQuizNative());
    expect(result.current.browserSupportsSpeechRecognition).toBe(true);
    expect(result.current.isMicrophoneAvailable).toBe(true);
  });

  test('records the attempt and uploads it for evaluation', async () => {
    mockEvaluateAudio.mockResolvedValue({
      success: true,
      isValid: true,
      accuracyScore: 92,
      userSpokenText: 'itinerary',
      feedbackText: 'Nicely said.',
      audioBase64: '',
      audioAvailable: false,
    });

    const { result } = renderHook(() => usePronunciationQuizNative());
    await flushQuizLoad(result);

    await act(async () => {
      await result.current.startListening();
    });
    expect(mockCreateAsync).toHaveBeenCalled();

    await act(async () => {
      await result.current.stopListening();
    });

    expect(mockEvaluateAudio).toHaveBeenCalledWith(
      expect.objectContaining({ audioBase64: 'BASE64AUDIODATA', corrected: 'itinerary' })
    );
    expect(result.current.userSpeech).toBe('itinerary');
  });

  // The actual bug: this could never be true before.
  test('marks a correct pronunciation attempt as correct', async () => {
    mockEvaluateAudio.mockResolvedValue({
      success: true,
      isValid: true,
      accuracyScore: 95,
      userSpokenText: 'itinerary',
      feedbackText: 'Great.',
      audioBase64: '',
      audioAvailable: false,
    });

    const { result } = renderHook(() => usePronunciationQuizNative());
    await flushQuizLoad(result);

    await act(async () => {
      await result.current.startListening();
    });
    await act(async () => {
      await result.current.stopListening();
    });
    act(() => {
      result.current.submitAnswer();
    });

    expect(result.current.isAnswered).toBe(true);
    expect(result.current.isCorrect).toBe(true);
    expect(result.current.score).toBe(1);
  });

  test('marks a poor attempt as incorrect', async () => {
    mockEvaluateAudio.mockResolvedValue({
      success: true,
      isValid: false,
      accuracyScore: 30,
      userSpokenText: 'itinery',
      feedbackText: 'Try once more.',
      audioBase64: '',
      audioAvailable: false,
    });

    const { result } = renderHook(() => usePronunciationQuizNative());
    await flushQuizLoad(result);

    await act(async () => {
      await result.current.startListening();
    });
    await act(async () => {
      await result.current.stopListening();
    });
    act(() => {
      result.current.submitAnswer();
    });

    expect(result.current.isAnswered).toBe(true);
    expect(result.current.isCorrect).toBe(false);
    expect(result.current.score).toBe(0);
  });
});
