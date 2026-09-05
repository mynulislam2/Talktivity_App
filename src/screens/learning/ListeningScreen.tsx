import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';

import { courseService } from '@/services/course';
import { progressService } from '@/services/progress';
import { quizService } from '@/services/quiz';
import { useAppDispatch } from '@/store/hooks';
import { setLastListeningQuiz } from '@/store/slices/quizSlice';
import { AppBackground } from '../../components/common/AppBackground';
import { tokens } from '../../theme/tokens';
import { FigmaPrimaryButton } from '@/components/ui/FigmaPrimaryButton';
import type { QuizOption, QuizQuestion } from '@/types/quiz';

const PARTY_POPPER = require('../../../assets/figma/listening/party-popper.png');
const LISTENING_TOPIC_KEY = 'listeningTopic';

const QUIZ_STEPS = [
  { name: 'Loading listening topic', icon: '🎧', color: 'bg-blue-500' },
  { name: 'Analyzing dialogue comprehension', icon: '🧠', color: 'bg-indigo-500' },
  { name: 'Generating comprehension questions', icon: '⚡', color: 'bg-purple-500' },
  { name: 'Finalizing your quiz', icon: '✨', color: 'bg-green-500' },
];


interface TranscriptLine {
  id: string;
  speaker?: string;
  text: string;
  fullText: string;
}

function formatAudioTime(value: number): string {
  if (!Number.isFinite(value) || value < 0) return '00:00';
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function parseTranscript(conversation?: string): TranscriptLine[] {
  if (!conversation) return [];
  return conversation
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const match = line.match(/^([^:]{1,40}):\s*(.+)$/);
      if (match) {
        return {
          id: `line-${index}`,
          speaker: match[1].trim(),
          text: match[2].trim(),
          fullText: line,
        };
      }
      return { id: `line-${index}`, text: line, fullText: line };
    });
}

function getQuoteLabel(topic: any): string {
  if (!topic) return 'Listening';
  const trimmedTitle = (topic.title || '').trim();
  const withoutSuffix = trimmedTitle.replace(/\s+listening$/i, '').trim();
  if (withoutSuffix && withoutSuffix.toLowerCase() !== trimmedTitle.toLowerCase()) {
    return withoutSuffix;
  }
  return topic.category?.trim() || trimmedTitle || 'Listening';
}

function resolveAudioUrl(audioPath?: string): string {
  if (!audioPath) return '';
  if (audioPath.startsWith('http://') || audioPath.startsWith('https://'))
    return audioPath;
  const normalizedPath = audioPath.replace(/^\/+/, '');
  return `https://audio.talktivity.app/${normalizedPath}`;
}

function ListeningHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <View style={lh.container}>
      <View style={lh.inner}>
        <TouchableOpacity onPress={onBack} style={lh.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
        <View style={lh.headerSpacer} />
        <Text style={lh.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={lh.headerSpacer} />
      </View>
    </View>
  );
}

const lh = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: tokens.control.height,
    height: tokens.control.height,
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
    borderColor: tokens.color.border.card,
    backgroundColor: tokens.color.surface.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: { flex: 1 },
  title: {
    fontSize: 18,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    color: tokens.color.text.primary,
    textAlign: 'center',
    maxWidth: '70%',
  },
});

function SeekBar({
  currentTime,
  duration,
  playbackRate,
  onCyclePlaybackRate,
  onSeek,
}: {
  currentTime: number;
  duration: number;
  playbackRate: number;
  onCyclePlaybackRate: () => void;
  onSeek: (value: number) => void;
}) {
  const progressRatio = duration > 0 ? Math.min(1, currentTime / duration) : 0;
  const barRef = useRef<View>(null);
  const barWidth = useRef(0);

  const handlePress = (evt: any) => {
    if (duration <= 0 || barWidth.current <= 0) return;
    const x = evt.nativeEvent.locationX;
    const ratio = Math.max(0, Math.min(1, x / barWidth.current));
    onSeek(ratio * duration);
  };

  const onLayout = (e: LayoutChangeEvent) => {
    barWidth.current = e.nativeEvent.layout.width;
  };

  return (
    <View style={sb.container}>
      <Text style={sb.time} numberOfLines={1}>
        {formatAudioTime(currentTime)}
      </Text>
      <View
        ref={barRef}
        onLayout={onLayout}
        onStartShouldSetResponder={() => true}
        onResponderRelease={handlePress}
        style={sb.track}
      >
        <View style={[sb.fill, { width: `${progressRatio * 100}%` }] as any} />
        <View style={[sb.thumb, { left: `${progressRatio * 100}%` }] as any} />
      </View>
      <Text style={sb.time} numberOfLines={1}>
        {formatAudioTime(duration)}
      </Text>
      <TouchableOpacity
        onPress={onCyclePlaybackRate}
        style={sb.rateBtn}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
      >
        <Text style={sb.rateText}>
          {playbackRate
            .toFixed(playbackRate % 1 === 0 ? 0 : 2)
            .replace(/\.00$/, '')}x
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const sb = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  time: {
    minWidth: 36,
    flexShrink: 0,
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Poppins',
    lineHeight: 17,
    color: tokens.color.text.secondary,
    textAlign: 'left',
    fontVariant: ['tabular-nums'],
  } as any,
  track: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    position: 'relative',
    justifyContent: 'center',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#5d4cff',
  },
  thumb: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#8c6dff',
    marginLeft: -7,
    shadowColor: 'rgba(140,109,255,0.85)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 6,
    elevation: 3,
  },
  rateBtn: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rateText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Poppins-Medium',
    color: 'rgba(255,255,255,0.9)',
  },
});


function LoadingCard({
  loadingMessage,
  steps,
}: {
  loadingMessage?: string;
  steps: { name: string; icon?: string; color?: string }[];
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalDuration = 8000;
    const stepDuration = totalDuration / steps.length;
    const tick = 50;
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + 100 / (totalDuration / tick);
      });
    }, tick);
    const stepTimer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(stepTimer);
          return steps.length - 1;
        }
        return prev + 1;
      });
    }, stepDuration);
    return () => {
      clearInterval(progressTimer);
      clearInterval(stepTimer);
    };
  }, [steps.length]);

  const percent = Math.round(progress);

  return (
    <View style={lc.container}>
      <View style={lc.progressRow}>
        <Text style={lc.progressLabel}>Progress</Text>
        <Text style={lc.progressValue}>{percent}%</Text>
      </View>
      <View style={lc.track}>
        <LinearGradient
          colors={['#2a14ff', '#6a4bff', '#c55dfe']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[lc.fill, { width: `${percent}%` } as any]}
        />
      </View>
      <Text style={lc.eyebrow}>ANALYSIS</Text>
      <Text style={lc.headline}>Preparing Your Listening Quiz</Text>
      {loadingMessage ? (
        <Text style={lc.loadingMsg}>{loadingMessage}</Text>
      ) : null}
      <View style={lc.taskList}>
        {steps.map((step, idx) => {
          const done = idx < currentStep;
          const active = idx === currentStep;
          return (
            <View
              key={step.name}
              style={[lc.taskItem, active && lc.taskItemActive]}
            >
              <View style={lc.taskIconWrap}>
                <Text style={{ fontSize: 16 }}>{step.icon || '📝'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    lc.taskLabel,
                    active ? lc.taskLabelActive : lc.taskLabelInactive,
                  ]}
                >
                  {step.name}
                </Text>
                {active ? (
                  <Text style={lc.taskProcessing}>Processing...</Text>
                ) : null}
              </View>
              {done ? (
                <View style={lc.taskCheck}>
                  <Feather name="check" size={14} color="#fff" />
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const lc = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.color.border.card,
    backgroundColor: tokens.color.surface.card,
    padding: 24,
    marginHorizontal: 16,
    marginTop: 16,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    color: tokens.color.text.secondary,
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: tokens.color.text.primary,
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 3 },
  eyebrow: {
    marginTop: 24,
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    letterSpacing: 2,
    textAlign: 'center',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.42)',
  },
  headline: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    lineHeight: 26,
    textAlign: 'center',
    color: tokens.color.text.primary,
  },
  loadingMsg: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'Poppins',
    lineHeight: 18,
    textAlign: 'center',
    color: tokens.color.text.secondary,
  },
  taskList: { marginTop: 24, gap: 10 },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  taskItemActive: { backgroundColor: 'rgba(255,255,255,0.08)' },
  taskIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(79,93,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskLabel: { fontSize: 13, fontWeight: '500', fontFamily: 'Poppins-Medium', lineHeight: 18 },
  taskLabelActive: { color: tokens.color.text.primary },
  taskLabelInactive: { color: 'rgba(255,255,255,0.7)' },
  taskProcessing: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    color: '#5cff4d',
  },
  taskCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1e8a37',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

function QuizOptionButton({
  option,
  isSelected,
  isCorrect,
  isIncorrectSelection,
  disabled,
  onSelect,
}: {
  option: QuizOption;
  isSelected: boolean;
  isCorrect: boolean;
  isIncorrectSelection: boolean;
  disabled: boolean;
  onSelect: (id: string) => void;
}) {
  const borderColor = isCorrect
    ? tokens.color.state.success
    : isIncorrectSelection
    ? tokens.color.state.danger
    : isSelected
    ? '#8c6dff'
    : '#696d82';
  const bgColor = isCorrect
    ? 'rgba(33,74,53,0.45)'
    : isIncorrectSelection
    ? 'rgba(88,32,52,0.45)'
    : 'rgba(45,50,89,0.88)';
  const checkBg = isCorrect
    ? tokens.color.state.success
    : isIncorrectSelection
    ? tokens.color.state.danger
    : isSelected
    ? '#8c6dff'
    : 'transparent';
  const checkBorder = isCorrect
    ? tokens.color.state.success
    : isIncorrectSelection
    ? tokens.color.state.danger
    : isSelected
    ? '#8c6dff'
    : '#e6e6ef';

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={() => onSelect(option.id)}
      activeOpacity={0.8}
      style={[qo.button, { borderColor, backgroundColor: bgColor }]}
    >
      <View style={qo.inner}>
        <View
          style={[
            qo.checkbox,
            { borderColor: checkBorder, backgroundColor: checkBg },
          ]}
        >
          {isCorrect || isSelected ? <View style={qo.checkInner} /> : null}
        </View>
        <Text style={qo.text}>{option.text}</Text>
      </View>
    </TouchableOpacity>
  );
}

const qo = StyleSheet.create({
  button: {
    width: '100%',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
  },
  inner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  text: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    lineHeight: 21,
    color: tokens.color.text.primary,
  },
});

function QuizQuestionBlock({ question }: { question: QuizQuestion }) {
  return (
    <View style={qq.container}>
      <Text style={qq.label}>Question</Text>
      <Text style={qq.text}>{question.question}</Text>
    </View>
  );
}

const qq = StyleSheet.create({
  container: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#696d82',
    backgroundColor: 'rgba(45,50,89,0.88)',
    padding: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'Poppins',
    lineHeight: 18,
    color: tokens.color.text.secondary,
  },
  text: {
    marginTop: 6,
    fontSize: 17,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    lineHeight: 23,
    color: tokens.color.text.primary,
  },
});

function CompletionScreen({
  score,
  totalQuestions,
  error,
  onContinue,
}: {
  score: number;
  totalQuestions: number;
  error?: string | null;
  onContinue: () => void;
}) {
  const percentage =
    totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  return (
    <View style={cs.container}>
      <View style={cs.content}>
        <Image source={PARTY_POPPER} style={cs.popper} resizeMode="contain" />
        <Text style={cs.title}>Congratulations!</Text>
        <Text style={cs.subtitle}>You've completed the listening quiz!</Text>
        <View style={cs.scoreWrap}>
          <Text style={cs.scoreText}>{percentage}%</Text>
          <Text style={cs.scoreLabel}>
            Score: {score}/{totalQuestions}
          </Text>
        </View>
        {error ? <Text style={cs.errorText}>{error}</Text> : null}
      </View>
      <FigmaPrimaryButton
        onPress={onContinue}
        style={{ height: 46, borderRadius: 8, width: '100%' }}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '500', fontFamily: 'Poppins-Medium' }}>
          Done
        </Text>
        <Ionicons
          name="chevron-forward"
          size={18}
          color="#fff"
          style={{ marginLeft: 4 }}
        />
      </FigmaPrimaryButton>
    </View>
  );
}

const cs = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 16,
  },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  popper: { width: 130, height: 130 },
  title: {
    marginTop: 16,
    fontSize: 30,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    lineHeight: 36,
    color: tokens.color.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Poppins',
    lineHeight: 20,
    color: tokens.color.text.secondary,
    textAlign: 'center',
  },
  scoreWrap: { alignItems: 'center', marginTop: 32 },
  scoreText: {
    fontSize: 42,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    lineHeight: 50,
    color: '#34d399',
  },
  scoreLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    color: tokens.color.text.secondary,
  },
  errorText: {
    marginTop: 16,
    fontSize: 12,
    fontFamily: 'Poppins',
    lineHeight: 18,
    color: '#ffd1d9',
    textAlign: 'center',
    maxWidth: 280,
  },
});

export default function ListeningScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();

  // Tab State: 'listening' | 'quiz'
  const [activeTab, setActiveTab] = useState<'listening' | 'quiz'>('listening');

  // Audio State
  const soundRef = useRef<Audio.Sound | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const activeLineRef = useRef<View>(null);
  const prevActiveLineIdRef = useRef<string | null>(null);
  const listeningDoneRef = useRef(false);

  const [currentTopic, setCurrentTopic] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [audioError, setAudioError] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [playbackCompleted, setPlaybackCompleted] = useState(false);

  // Quiz State
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizLoading, setQuizLoading] = useState(true);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [completedQuiz, setCompletedQuiz] = useState(false);
  const [quizCompletionError, setQuizCompletionError] = useState<string | null>(null);
  const quizDoneRef = useRef(false);

  // Mark listening as completed in daily progress
  const markListeningCompleted = useCallback(async () => {
    if (listeningDoneRef.current) return;
    listeningDoneRef.current = true;
    try {
      await progressService.updateDailyProgress({ listening_completed: true });
    } catch {}
  }, []);

  const setupAudio = useCallback(async (url: string) => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        playThroughEarpieceAndroid: false,
      });
      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: false, progressUpdateIntervalMillis: 250 },
        (status: any) => {
          if (!status.isLoaded) return;
          setCurrentTime(status.positionMillis / 1000);
          setDuration(status.durationMillis / 1000);
          setIsPlaying(status.isPlaying);
          if (status.didJustFinish) {
            setIsPlaying(false);
            setPlaybackCompleted(true);
            markListeningCompleted();
          }
        }
      );
      soundRef.current = sound;
    } catch {
      setAudioError(true);
    }
  }, [markListeningCompleted]);

  // Load topic & trigger background audio + quiz generation in parallel
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
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

        if (topic && !cancelled) {
          await AsyncStorage.setItem(LISTENING_TOPIC_KEY, JSON.stringify(topic));
          setCurrentTopic(topic);

          // 1. Setup Audio
          if (topic.audio) {
            await setupAudio(resolveAudioUrl(topic.audio));
          } else {
            setAudioError(true);
          }

          // 2. Background AI Quiz Generation (parallel)
          if (topic.conversation) {
            setQuizLoading(true);
            try {
              const res = await quizService.generateListeningQuiz(topic.conversation);
              if (!cancelled) {
                if (res.success && Array.isArray(res.data) && res.data.length > 0) {
                  setQuestions(res.data);
                } else {
                  setQuizError(res.error || 'Failed to load quiz questions.');
                }
              }
            } catch (err: any) {
              if (!cancelled) {
                setQuizError(err?.message || 'Failed to generate quiz questions.');
              }
            } finally {
              if (!cancelled) setQuizLoading(false);
            }
          } else {
            if (!cancelled) setQuizLoading(false);
          }
        }
      } catch {
        if (!cancelled) {
          setAudioError(true);
          setQuizLoading(false);
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [setupAudio]);

  const quoteLabel = useMemo(() => getQuoteLabel(currentTopic), [currentTopic]);
  const transcriptLines = useMemo(
    () => parseTranscript(currentTopic?.conversation),
    [currentTopic?.conversation]
  );

  const lineTimings = useMemo(() => {
    if (transcriptLines.length === 0 || duration <= 0) {
      return transcriptLines.map((line) => ({ id: line.id, start: 0, end: 0 }));
    }
    const totalChars = transcriptLines.reduce(
      (sum, line) => sum + Math.max(1, line.fullText.length),
      0
    );
    let cursor = 0;
    return transcriptLines.map((line, index) => {
      const weight = Math.max(1, line.fullText.length) / totalChars;
      const start = cursor;
      const end =
        index === transcriptLines.length - 1
          ? duration
          : cursor + weight * duration;
      cursor = end;
      return { id: line.id, start, end };
    });
  }, [transcriptLines, duration]);

  const activeLineIndex = useMemo(() => {
    if (transcriptLines.length === 0) return -1;
    if (audioError || playbackCompleted) return transcriptLines.length - 1;
    if (!hasStarted || duration <= 0) return -1;
    for (let i = 0; i < lineTimings.length; i++) {
      const { start, end } = lineTimings[i];
      if (currentTime >= start && currentTime < end) return i;
    }
    return lineTimings.length - 1;
  }, [
    transcriptLines,
    lineTimings,
    currentTime,
    duration,
    audioError,
    hasStarted,
    playbackCompleted,
  ]);

  const activeTranscriptId =
    activeLineIndex >= 0 ? transcriptLines[activeLineIndex]?.id : null;

  useEffect(() => {
    const lineChanged = prevActiveLineIdRef.current !== activeTranscriptId;
    prevActiveLineIdRef.current = activeTranscriptId;
    if (!lineChanged || !activeTranscriptId || activeTab !== 'listening') return;
    setTimeout(() => {
      activeLineRef.current?.measureInWindow((_x, y) => {
        scrollRef.current?.scrollTo({
          y: Math.max(0, y - 240),
          animated: isPlaying,
        });
      });
    }, 50);
  }, [activeTranscriptId, isPlaying, activeTab]);

  const handleTogglePlayback = useCallback(async () => {
    const sound = soundRef.current;
    if (!sound) {
      setAudioError(true);
      return;
    }
    try {
      const status = await sound.getStatusAsync();
      if (!status.isLoaded) {
        setAudioError(true);
        return;
      }
      if (status.isPlaying) {
        await sound.pauseAsync();
      } else {
        await (sound as any).setRateAsync(playbackRate, false);
        await sound.playAsync();
        setHasStarted(true);
      }
    } catch {
      setAudioError(true);
      setIsPlaying(false);
    }
  }, [playbackRate]);

  const handleSeek = useCallback(async (value: number) => {
    const sound = soundRef.current;
    if (!sound) return;
    try {
      await sound.setPositionAsync(value * 1000);
      setCurrentTime(value);
    } catch {}
  }, []);

  const handleSkip = useCallback(
    async (seconds: number) => {
      const sound = soundRef.current;
      if (!sound) return;
      try {
        const status = await sound.getStatusAsync();
        if (!status.isLoaded) return;
        const nextTime = Math.max(
          0,
          Math.min(status.positionMillis / 1000 + seconds, duration)
        );
        await sound.setPositionAsync(nextTime * 1000);
        setCurrentTime(nextTime);
      } catch {}
    },
    [duration]
  );

  const handleCyclePlaybackRate = useCallback(() => {
    setPlaybackRate((current) => {
      const rates = [1, 1.25, 1.5];
      const idx = rates.indexOf(current);
      const nextRate = rates[(idx + 1) % rates.length];
      (soundRef.current as any)?.setRateAsync(nextRate, false).catch(() => {});
      return nextRate;
    });
  }, []);

  const handleTabChange = useCallback(
    (tab: 'listening' | 'quiz') => {
      if (tab === 'quiz' && isPlaying && soundRef.current) {
        soundRef.current.pauseAsync().catch(() => {});
        setIsPlaying(false);
      }
      setActiveTab(tab);
    },
    [isPlaying]
  );

  // Quiz Interaction Handlers
  const currentQuestion = questions[currentQuestionIndex] || null;

  const handleSelectOption = useCallback((optionId: string) => {
    if (isAnswered || !currentQuestion) return;
    const isMulti = (currentQuestion.correctOptionIds?.length ?? 1) > 1;
    if (isMulti) {
      setSelectedOptionIds((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptionIds([optionId]);
    }
  }, [isAnswered, currentQuestion]);

  const handleSubmitAnswer = useCallback(() => {
    if (isAnswered || !currentQuestion || selectedOptionIds.length === 0) return;
    const correctIds = currentQuestion.correctOptionIds || [];
    const isCorrect =
      selectedOptionIds.length === correctIds.length &&
      selectedOptionIds.every((id) => correctIds.includes(id));
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    setIsAnswered(true);
  }, [isAnswered, currentQuestion, selectedOptionIds]);

  const handleNextQuestion = useCallback(async () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptionIds([]);
      setIsAnswered(false);
    } else {
      // Quiz Finished!
      const total = questions.length;
      const finalScore = score;
      const percentScore = total > 0 ? Math.round((finalScore / total) * 100) : 0;
      setCompletedQuiz(true);

      if (!quizDoneRef.current) {
        quizDoneRef.current = true;
        try {
          await progressService.updateDailyProgress({
            listening_quiz_completed: true,
            listening_quiz_score: percentScore,
          });
          dispatch(
            setLastListeningQuiz({
              type: 'listening',
              score: percentScore,
              total,
              completedAt: new Date().toISOString(),
            })
          );
        } catch (err: any) {
          setQuizCompletionError(err?.message || 'Failed to record quiz score.');
        }
      }
    }
  }, [currentQuestionIndex, questions.length, score, dispatch]);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleDone = useCallback(() => {
    navigation.navigate('HomeScreen');
  }, [navigation]);

  if (!currentTopic) {
    return (
      <AppBackground>
        <SafeAreaView style={s.safe} edges={['top']}>
          <ListeningHeader title="Listening" onBack={goBack} />
        </SafeAreaView>
      </AppBackground>
    );
  }

  const selectedSet = new Set(selectedOptionIds);
  const correctSet = new Set(currentQuestion?.correctOptionIds || []);
  const quizPercent = questions.length
    ? ((currentQuestionIndex + 1) / questions.length) * 100
    : 0;

  return (
    <AppBackground>
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
        {/* Top Header */}
        <ListeningHeader
          title={currentTopic.title || 'Listening & Quiz'}
          onBack={goBack}
        />

        {/* 2-Tab Segmented Switcher with Distinct Styles */}
        <View style={s.tabWrap}>
          <TouchableOpacity
            onPress={() => handleTabChange('listening')}
            activeOpacity={0.8}
            style={s.tabBtnWrap}
          >
            {activeTab === 'listening' ? (
              <LinearGradient
                colors={['#2C5BFF', '#7856FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.tabActiveListening}
              >
                <Feather name="headphones" size={15} color="#fff" />
                <Text style={s.tabTextActive}>Listening</Text>
              </LinearGradient>
            ) : (
              <View style={s.tabInactive}>
                <Feather name="headphones" size={15} color="rgba(255,255,255,0.5)" />
                <Text style={s.tabTextInactive}>Listening</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleTabChange('quiz')}
            activeOpacity={0.8}
            style={s.tabBtnWrap}
          >
            {activeTab === 'quiz' ? (
              <LinearGradient
                colors={['#7856FF', '#C55DFE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.tabActiveQuiz}
              >
                <Feather name="check-circle" size={15} color="#fff" />
                <Text style={s.tabTextActive}>
                  Quiz {questions.length > 0 ? `(${questions.length})` : ''}
                </Text>
              </LinearGradient>
            ) : (
              <View style={s.tabInactive}>
                <Feather name="check-circle" size={15} color="rgba(255,255,255,0.5)" />
                <Text style={s.tabTextInactive}>
                  Quiz {questions.length > 0 ? `(${questions.length})` : ''}
                </Text>
                {questions.length > 0 && !completedQuiz && (
                  <View style={s.quizReadyDot} />
                )}
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Main Content Area */}
        <View style={s.contentArea}>
          {activeTab === 'listening' ? (
            /* TAB 1: LISTENING & TRANSCRIPT */
            <View style={s.tabContentFlex}>
              <View style={s.heroCompact}>
                <Text style={s.quoteText}>&ldquo;{quoteLabel}&rdquo;</Text>
              </View>

              <ScrollView
                ref={scrollRef}
                style={s.transcriptScroll}
                contentContainerStyle={s.transcriptContent}
                showsVerticalScrollIndicator={false}
              >
                {transcriptLines.length > 0 ? (
                  transcriptLines.map((line, index) => {
                    const isActiveLine = index === activeLineIndex;
                    const isPastLine =
                      activeLineIndex >= 0 && index < activeLineIndex;
                    const tone = isActiveLine
                      ? tokens.color.text.primary
                      : isPastLine
                      ? tokens.color.text.secondary
                      : tokens.color.text.placeholder;

                    return (
                      <View
                        key={line.id}
                        ref={isActiveLine ? activeLineRef : null}
                        style={s.transcriptLine}
                      >
                        <Text style={[s.transcriptText, { color: tone }]}>
                          {line.fullText}
                        </Text>
                      </View>
                    );
                  })
                ) : (
                  <View style={s.noTranscript}>
                    <Text style={[s.transcriptText, { color: tokens.color.text.secondary }]}>
                      {audioError
                        ? 'Transcript unavailable.'
                        : hasStarted
                        ? 'Listening in progress...'
                        : 'Press play to begin the listening passage.'}
                    </Text>
                  </View>
                )}

                {/* Prompt banner to switch to Quiz after audio finishes */}
                {playbackCompleted && !completedQuiz ? (
                  <TouchableOpacity
                    onPress={() => setActiveTab('quiz')}
                    style={s.promptQuizCard}
                    activeOpacity={0.8}
                  >
                    <View style={s.promptIconWrap}>
                      <Feather name="check-circle" size={18} color="#fff" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.promptQuizTitle}>Passage Finished!</Text>
                      <Text style={s.promptQuizSubtitle}>Ready to test your comprehension?</Text>
                    </View>
                    <View style={s.promptQuizBtn}>
                      <Text style={s.promptQuizBtnText}>Take Quiz</Text>
                      <Feather name="arrow-right" size={14} color="#fff" />
                    </View>
                  </TouchableOpacity>
                ) : null}
              </ScrollView>
            </View>
          ) : (
            /* TAB 2: COMPREHENSION QUIZ */
            <View style={s.tabContentFlex}>
              {completedQuiz ? (
                <CompletionScreen
                  score={score}
                  totalQuestions={questions.length}
                  error={quizCompletionError}
                  onContinue={handleDone}
                />
              ) : quizLoading ? (
                <ScrollView contentContainerStyle={s.quizScrollContent}>
                  <LoadingCard steps={QUIZ_STEPS} />
                </ScrollView>
              ) : quizError ? (
                <View style={s.errorCenter}>
                  <Ionicons name="alert-circle" size={36} color="#ffd1d9" />
                  <Text style={s.errorTitle}>Failed to generate quiz</Text>
                  <Text style={s.errorMsg}>{quizError}</Text>
                </View>
              ) : !currentQuestion ? (
                <View style={s.errorCenter}>
                  <Text style={s.errorMsg}>No questions available for this topic.</Text>
                </View>
              ) : (
                <View style={s.quizContentWrap}>
                  {/* Progress Header */}
                  <View style={s.quizProgressWrap}>
                    <View style={s.quizProgressRow}>
                      <Text style={s.quizProgressText}>
                        Question {currentQuestionIndex + 1} of {questions.length}
                      </Text>
                      <Text style={s.quizScoreText}>
                        Score: {score}/{questions.length}
                      </Text>
                    </View>
                    <View style={s.quizTrack}>
                      <LinearGradient
                        colors={['#5d4cff', '#c765fd']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[
                          s.quizFill,
                          { width: `${Math.max(quizPercent, 8)}%` } as any,
                        ]}
                      />
                    </View>
                  </View>

                  <ScrollView
                    style={s.quizQuestionsScroll}
                    contentContainerStyle={s.quizQuestionsContent}
                    showsVerticalScrollIndicator={false}
                  >
                    <QuizQuestionBlock question={currentQuestion} />

                    <View style={s.optionsList}>
                      {currentQuestion.options.map((option) => {
                        const isSel = selectedSet.has(option.id);
                        const isCorr = isAnswered && correctSet.has(option.id);
                        const isBad = isAnswered && isSel && !isCorr;
                        return (
                          <QuizOptionButton
                            key={option.id}
                            option={option}
                            isSelected={isSel}
                            isCorrect={isCorr}
                            isIncorrectSelection={isBad}
                            disabled={isAnswered}
                            onSelect={handleSelectOption}
                          />
                        );
                      })}
                    </View>

                    {/* Quiz CTA */}
                    {!isAnswered ? (
                      <FigmaPrimaryButton
                        onPress={handleSubmitAnswer}
                        disabled={selectedOptionIds.length === 0}
                        style={s.quizCtaBtn}
                      >
                        <Text style={s.quizCtaText}>Submit Answer</Text>
                      </FigmaPrimaryButton>
                    ) : (
                      <FigmaPrimaryButton
                        onPress={handleNextQuestion}
                        style={s.quizCtaBtn}
                      >
                        <Text style={s.quizCtaText}>
                          {currentQuestionIndex + 1 >= questions.length
                            ? 'Finish Quiz'
                            : 'Next Question'}
                        </Text>
                        <Feather name="arrow-right" size={16} color="#fff" style={{ marginLeft: 6 }} />
                      </FigmaPrimaryButton>
                    )}
                  </ScrollView>
                </View>
              )}
            </View>
          )}
        </View>

        {/* AUDIO PLAYER: ONLY on Listening Tab */}
        {!completedQuiz && activeTab === 'listening' && (
          <View style={s.playerContainer}>
            <View style={s.playerCard}>
              {/* Scrubber Bar with Speed Increase right on the line */}
              <SeekBar
                currentTime={currentTime}
                duration={duration}
                playbackRate={playbackRate}
                onCyclePlaybackRate={handleCyclePlaybackRate}
                onSeek={handleSeek}
              />

              {/* Controls Row matching app vibe */}
              <View style={s.controls}>
                {/* Rewind 10s */}
                <TouchableOpacity
                  onPress={() => handleSkip(-10)}
                  style={s.controlBtn}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="play-skip-back" size={24} color="#fff" />
                </TouchableOpacity>

                {/* Play / Pause Primary Button */}
                <TouchableOpacity
                  onPress={handleTogglePlayback}
                  style={s.playBtn}
                  activeOpacity={0.8}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={isPlaying ? 'pause-circle' : 'play-circle'}
                    size={46}
                    color="#fff"
                  />
                </TouchableOpacity>

                {/* Forward 10s */}
                <TouchableOpacity
                  onPress={() => handleSkip(10)}
                  style={s.controlBtn}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="play-skip-forward" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    </AppBackground>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },

  /* Segmented Tabs */
  tabWrap: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 10,
  },
  tabBtnWrap: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tabActiveListening: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: 'rgba(44,91,255,0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  tabActiveQuiz: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: 'rgba(197,93,254,0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  tabInactive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    position: 'relative',
  },
  tabTextActive: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '600',
    color: '#fff',
  },
  tabTextInactive: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    fontWeight: '500',
    color: 'rgba(255,255,255,0.55)',
  },
  quizReadyDot: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34d399',
  },

  /* Content Area */
  contentArea: {
    flex: 1,
  },
  tabContentFlex: {
    flex: 1,
  },

  /* Tab 1: Listening Styles */
  heroCompact: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  quoteText: {
    marginTop: 6,
    fontSize: 15,
    fontFamily: 'Poppins',
    fontStyle: 'italic',
    color: tokens.color.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  transcriptScroll: {
    flex: 1,
    marginTop: 10,
    paddingHorizontal: 20,
  },
  transcriptContent: {
    paddingBottom: 28,
  },
  transcriptLine: {
    marginBottom: 14,
  },
  transcriptText: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Poppins',
    lineHeight: 24,
  },
  noTranscript: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  promptQuizCard: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(93,76,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(140,109,255,0.4)',
  },
  promptIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#5d4cff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptQuizTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  promptQuizSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.7)',
  },
  promptQuizBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#5d4cff',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
  },
  promptQuizBtnText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },

  /* Tab 2: Quiz Styles */
  quizContentWrap: {
    flex: 1,
  },
  quizProgressWrap: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
  },
  quizProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  quizProgressText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: tokens.color.text.secondary,
  },
  quizScoreText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#34d399',
  },
  quizTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  quizFill: {
    height: '100%',
    borderRadius: 3,
  },
  quizQuestionsScroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  quizQuestionsContent: {
    paddingBottom: 24,
  },
  optionsList: {
    marginBottom: 16,
  },
  quizCtaBtn: {
    height: 46,
    borderRadius: 8,
    width: '100%',
  },
  quizCtaText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  quizScrollContent: {
    paddingBottom: 24,
  },
  errorCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: tokens.color.text.primary,
  },
  errorMsg: {
    marginTop: 6,
    fontSize: 14,
    fontFamily: 'Poppins',
    color: tokens.color.text.secondary,
    textAlign: 'center',
  },

  /* Persistent Bottom Audio Player */
  playerContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: 'transparent',
  },
  playerCard: {
    alignItems: 'center',
    gap: 10,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 46,
  },
  controlBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
