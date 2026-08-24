import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { progressService } from '@/services/progress';
import { useListeningQuizNative } from '@/hooks/quiz/useListeningQuizNative';
import { useAppDispatch } from '@/store/hooks';
import { setLastListeningQuiz } from '@/store/slices/quizSlice';
import { FigmaPrimaryButton } from '@/components/ui/FigmaPrimaryButton';
import type { QuizOption, QuizQuestion } from '@/types/quiz';
import { AppBackground } from '../../components/common/AppBackground';
import { tokens } from '../../theme/tokens';

const PARTY_POPPER = require('../../../assets/figma/listening/party-popper.png');

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
        <Text style={lh.title}>{title}</Text>
        <View style={lh.headerSpacer} />
      </View>
    </View>
  );
}

const lh = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 12,
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
    const totalDuration = 12000;
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
            <View key={idx} style={[lc.taskItem, active && lc.taskItemActive]}>
              <View style={lc.taskIconWrap}>
                <Text style={{ fontSize: 16, fontFamily: 'Poppins' }}>{step.icon || '○'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    lc.taskLabel,
                    done || active ? lc.taskLabelActive : lc.taskLabelInactive,
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
                  <Ionicons name="checkmark" size={12} color="#fff" />
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
    width: '100%',
    maxWidth: 353,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Poppins',
    lineHeight: 17,
    color: tokens.color.text.secondary,
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Poppins',
    lineHeight: 17,
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
    marginTop: 32,
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Poppins',
    letterSpacing: 2.88,
    textAlign: 'center',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.42)',
  },
  headline: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    lineHeight: 28,
    textAlign: 'center',
    color: tokens.color.text.primary,
  },
  loadingMsg: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Poppins',
    lineHeight: 20,
    textAlign: 'center',
    color: tokens.color.text.secondary,
  },
  taskList: { marginTop: 32, gap: 12 },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  taskItemActive: { backgroundColor: 'rgba(255,255,255,0.08)' },
  taskIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(79,93,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskLabel: { fontSize: 14, fontWeight: '500', fontFamily: 'Poppins-Medium', lineHeight: 19 },
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
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1e8a37',
    alignItems: 'center',
    justifyContent: 'center',
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
            {score}/{totalQuestions}
          </Text>
        </View>
        {error ? <Text style={cs.errorText}>{error}</Text> : null}
      </View>
      <FigmaPrimaryButton
        onPress={onContinue}
        style={{ height: 45, borderRadius: 6, width: '100%' }}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '500', fontFamily: 'Poppins-Medium' }}>
          Continue
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
    paddingTop: 24,
  },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  popper: { width: 150, height: 150 },
  title: {
    marginTop: 16,
    fontSize: 36,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    lineHeight: 36,
    letterSpacing: -0.72,
    color: tokens.color.text.primary,
  },
  subtitle: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Poppins',
    lineHeight: 20,
    color: tokens.color.text.primary,
  },
  scoreWrap: { alignItems: 'center', marginTop: 64 },
  scoreText: {
    fontSize: 40,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    lineHeight: 48,
    letterSpacing: -0.8,
    color: tokens.color.text.primary,
  },
  scoreLabel: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    lineHeight: 20,
    color: tokens.color.text.secondary,
  },
  errorText: {
    marginTop: 24,
    fontSize: 12,
    fontFamily: 'Poppins',
    lineHeight: 18,
    color: '#ffd1d9',
    textAlign: 'center',
    maxWidth: 280,
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
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInner: {
    width: 6,
    height: 6,
    borderRadius: 2,
    backgroundColor: tokens.color.text.primary,
  },
  text: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    lineHeight: 22,
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
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#696d82',
    backgroundColor: 'rgba(45,50,89,0.88)',
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Poppins',
    lineHeight: 20,
    color: tokens.color.text.secondary,
  },
  text: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    lineHeight: 24,
    color: tokens.color.text.primary,
  },
});

export default function ListeningQuizScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const scrollRef = useRef<ScrollView>(null);
  const [completedUI, setCompletedUI] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);

  const {
    loading,
    loadingMessage,
    quizError,
    steps,
    currentQuestion,
    currentIndex,
    totalQuestions,
    selectedOptionIds,
    score,
    isAnswered,
    completed,
    selectOption,
    submitAnswer,
    goNext,
  } = useListeningQuizNative();

  const percentScore = useMemo(() => {
    if (!totalQuestions) return 0;
    return Math.round((score / totalQuestions) * 100);
  }, [score, totalQuestions]);

  useEffect(() => {
    if (!completed || completedUI) return;
    let cancelled = false;
    const run = async () => {
      try {
        const response = await progressService.updateDailyProgress({
          listening_quiz_completed: true,
          listening_quiz_score: percentScore,
        });
        if (!response.success) {
        }
        dispatch(
          setLastListeningQuiz({
            type: 'listening' as const,
            score: percentScore,
            total: totalQuestions,
            completedAt: new Date().toISOString(),
          })
        );
        if (!cancelled) setCompletedUI(true);
      } catch (e: any) {
        if (!cancelled)
          setCompletionError(
            e?.message || 'Failed to save listening quiz completion.'
          );
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [completed, completedUI, percentScore, totalQuestions, dispatch]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [currentIndex]);

  const goBack = useMemo(
    () => () => {
      navigation.goBack();
    },
    [navigation]
  );

  if (loading) {
    return (
      <AppBackground>
        <SafeAreaView style={ss.safe} edges={['top']}>
          <View style={{ paddingHorizontal: 20, paddingTop: 6 }}>
            <ListeningHeader title="Listening Quiz" onBack={goBack} />
          </View>
          <ScrollView contentContainerStyle={ss.centerScroll}>
            <LoadingCard loadingMessage={loadingMessage} steps={steps} />
          </ScrollView>
        </SafeAreaView>
      </AppBackground>
    );
  }

  if (quizError) {
    return (
      <AppBackground>
        <SafeAreaView style={ss.safe} edges={['top']}>
          <View style={{ paddingHorizontal: 20, paddingTop: 6 }}>
            <ListeningHeader title="Listening Quiz" onBack={goBack} />
          </View>
          <View style={ss.centerFlex}>
            <View style={ss.errorCard}>
              <Text style={ss.errorTitle}>Failed to generate your quiz</Text>
              <Text style={ss.errorText}>{quizError}</Text>
            </View>
          </View>
        </SafeAreaView>
      </AppBackground>
    );
  }

  if (completedUI) {
    return (
      <AppBackground>
        <SafeAreaView style={ss.safe} edges={['top']}>
          <CompletionScreen
            score={score}
            totalQuestions={totalQuestions}
            error={completionError}
            onContinue={() => (navigation as any).navigate('HomeScreen')}
          />
        </SafeAreaView>
      </AppBackground>
    );
  }

  if (!currentQuestion) {
    return (
      <AppBackground>
        <SafeAreaView style={ss.safe} edges={['top']}>
          <View style={{ paddingHorizontal: 20, paddingTop: 6 }}>
            <ListeningHeader title="Listening Quiz" onBack={goBack} />
          </View>
          <View style={ss.centerFlex}>
            <Text style={ss.emptyText}>
              No questions are available for this quiz yet.
            </Text>
          </View>
        </SafeAreaView>
      </AppBackground>
    );
  }

  const progressPercent = totalQuestions
    ? ((currentIndex + 1) / totalQuestions) * 100
    : 0;
  const selectedSet = new Set(selectedOptionIds);
  const correctSet = new Set(currentQuestion.correctOptionIds);
  const ctaLabel = !isAnswered
    ? 'Submit'
    : currentIndex + 1 >= totalQuestions
    ? 'Finish'
    : 'Next';

  return (
    <AppBackground>
      <SafeAreaView style={ss.safe} edges={['top']}>
        <View style={{ paddingHorizontal: 20, paddingTop: 6 }}>
          <ListeningHeader title="Listening Quiz" onBack={goBack} />
        </View>

        <View style={ss.progressCard}>
          <View style={ss.progressRow}>
            <Text style={ss.questionCount}>
              Question {currentIndex + 1} of {totalQuestions}
            </Text>
            <Text style={ss.scoreDisplay}>
              Score {score} of {totalQuestions}
            </Text>
          </View>
          <View style={ss.progressTrack}>
            <LinearGradient
              colors={['#5d4cff', '#c765fd']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                ss.progressFill,
                { width: `${Math.max(progressPercent, 8)}%` } as any,
              ]}
            />
            <View
              style={[
                ss.progressThumb,
                { left: `${Math.max(progressPercent, 8)}%` } as any,
              ]}
            />
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          style={ss.quizScroll}
          contentContainerStyle={ss.quizContent}
          showsVerticalScrollIndicator={false}
        >
          <QuizQuestionBlock question={currentQuestion} />
          <View style={ss.optionsList}>
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
                  onSelect={selectOption}
                />
              );
            })}
          </View>
          {isAnswered && currentQuestion.explanation ? (
            <View style={ss.explanationBox}>
              <Text style={ss.explanationText}>
                {currentQuestion.explanation}
              </Text>
            </View>
          ) : null}
        </ScrollView>

        <View style={ss.footer}>
          <FigmaPrimaryButton
            onPress={() => {
              if (!isAnswered) {
                submitAnswer();
                return;
              }
              goNext();
            }}
            disabled={!isAnswered && selectedOptionIds.length === 0}
            style={{ height: 45, borderRadius: 6, width: '100%' }}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '500', fontFamily: 'Poppins-Medium' }}>
              {ctaLabel}
            </Text>
            {!isAnswered && selectedOptionIds.length > 0 ? null : null}
            {isAnswered && currentIndex + 1 < totalQuestions ? (
              <Ionicons
                name="chevron-forward"
                size={18}
                color="#fff"
                style={{ marginLeft: 4 }}
              />
            ) : null}
          </FigmaPrimaryButton>
        </View>
      </SafeAreaView>
    </AppBackground>
  );
}

const ss = StyleSheet.create({
  safe: { flex: 1 },
  centerScroll: { flexGrow: 1, justifyContent: 'center' },
  centerFlex: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  errorCard: {
    width: '100%',
    maxWidth: 350,
    padding: 20,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    lineHeight: 24,
    color: tokens.color.text.primary,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Poppins',
    lineHeight: 21,
    color: '#f5d6de',
    textAlign: 'center',
  },
  retryBtn: { marginTop: 20, borderRadius: tokens.radius.sm, overflow: 'hidden' },
  retryText: {
    color: tokens.color.text.primary,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Poppins',
    lineHeight: 24,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  progressCard: {
    marginHorizontal: 20,
    marginTop: 48,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionCount: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    lineHeight: 20,
    color: tokens.color.text.primary,
  },
  scoreDisplay: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Poppins',
    lineHeight: 17,
    color: tokens.color.text.primary,
  },
  progressTrack: {
    marginTop: 13,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#bec6ff',
    position: 'relative',
  },
  progressFill: { height: '100%', borderRadius: 4 },
  progressThumb: {
    position: 'absolute',
    top: '50%',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#8c6dff',
    shadowColor: 'rgba(140,109,255,0.85)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 16,
    elevation: 4,
    marginTop: -8,
    marginLeft: -8,
  },
  quizScroll: { flex: 1, marginTop: 24, paddingHorizontal: 20 },
  quizContent: { paddingBottom: 32 },
  optionsList: { marginTop: 20, gap: 12 },
  explanationBox: {
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  explanationText: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'Poppins',
    lineHeight: 20,
    color: tokens.color.text.secondary,
  },
  footer: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 18 },
});
