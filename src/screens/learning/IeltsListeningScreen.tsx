import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import Feather from '@expo/vector-icons/Feather';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenBackground from '@/components/common/ScreenBackground';
import { useResponsive } from '@/theme/responsive';
import { extractErrorMessage } from '@/lib/auth/errorHandler';
import {
  ieltsService,
  IeltsListeningTest,
  IeltsListeningQuestion,
  IeltsListeningResult,
  IeltsListeningSubmitResponse,
} from '@/services/ielts';
import {
  IeltsHeader,
  IeltsPillTabs,
  IeltsButton,
  IeltsAudioPlayer,
  IeltsTabItem,
} from '@/components/ielts';

// Per-part allocated time: 10 minutes per part (audio + answer time)
const PART_SECONDS = 10 * 60;

function formatAudioTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

const normalize = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toLowerCase();

function answerMatchesOption(answer: unknown, option: string, index: number) {
  const a = normalize(answer);
  if (!a) return false;
  if (a === normalize(option)) return true;
  return /^[a-h]$/.test(a) && a.charCodeAt(0) - 97 === index;
}

function correctOptionList(answer: unknown) {
  return String(answer ?? '')
    .split(/,\s*/)
    .filter(Boolean);
}

export const IeltsListeningScreen: React.FC = () => {
  const { s } = useResponsive();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const mode: 'drill' | 'mock' | undefined = route.params?.mode;
  const isDrill = mode === 'drill';
  const drillPart = route.params?.part ? Number(route.params.part) : 1;

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [test, setTest] = useState<IeltsListeningTest | null>(null);
  const [activePartIndex, setActivePartIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string | string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<IeltsListeningSubmitResponse | null>(null);
  const [partSecondsLeft, setPartSecondsLeft] = useState(PART_SECONDS);

  // Per-part review cache for full-drill-style progression
  const [partResults, setPartResults] = useState<Record<number, IeltsListeningSubmitResponse>>({});
  // Drill answers per part so answers don't leak between parts
  const [partAnswers, setPartAnswers] = useState<Record<number, Record<number, string | string[]>>>({});
  const [overallMockResult, setOverallMockResult] = useState<IeltsListeningSubmitResponse | null>(null);

  const scrollRef = useRef<ScrollView | null>(null);

  // Audio State
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(1);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Load Test Data
  const loadTest = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const tests = await ieltsService.getListeningTests(mode);
      const hasRealQuestion = (t: IeltsListeningTest) =>
        t.parts.some((p) =>
          p.questions.some(
            (q) => q.question_text && !/^question\s*\d+$/i.test(q.question_text.trim())
          )
        );
      const selected =
        (route.params?.testSetId
          ? tests.find((t) => t.test_set_id === route.params.testSetId)
          : null) ||
        tests.find(hasRealQuestion) ||
        tests.find((t) => t.parts.some((p) => p.questions.length > 0)) ||
        tests[0];
      if (selected) {
        setTest(selected);
        const initialIdx = isDrill && [1, 2, 3, 4].includes(drillPart) ? drillPart - 1 : 0;
        setActivePartIndex(initialIdx);
      } else {
        setLoadError('No IELTS Listening test is available yet.');
      }
    } catch (err) {
      setLoadError(extractErrorMessage(err) || 'Failed to load the IELTS Listening test.');
    } finally {
      setLoading(false);
    }
  }, [mode, route.params?.testSetId, isDrill, drillPart]);

  useEffect(() => {
    loadTest();
  }, [loadTest]);

  const activePart = test?.parts?.[activePartIndex] || test?.parts?.[0];
  const activeAudioUrl = activePart?.audio_url;
  const cleanPartTopic = (activePart?.title || '')
    .replace(/^part\s*\d+\s*:\s*/i, '')
    .trim() || 'Everyday conversation';

  // Audio Setup & Cleanup synced per part
  useEffect(() => {
    let isCancelled = false;

    async function initAudio() {
      if (!activeAudioUrl) {
        setPositionMillis(0);
        setDurationMillis(1);
        setIsPlaying(false);
        return;
      }
      try {
        setIsAudioLoading(true);
        setAudioError(false);
        if (soundRef.current) {
          await soundRef.current.unloadAsync().catch(() => {});
          soundRef.current = null;
        }
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: activeAudioUrl },
          { shouldPlay: false, rate: playbackRate, shouldCorrectPitch: true },
          (status) => {
            if (status.isLoaded) {
              setPositionMillis(status.positionMillis);
              setDurationMillis(status.durationMillis || 1);
              setIsPlaying(status.isPlaying);
            }
          }
        );
        if (!isCancelled) {
          soundRef.current = newSound;
        } else {
          newSound.unloadAsync().catch(() => {});
        }
      } catch (e) {
        console.warn('Audio load error:', e);
        if (!isCancelled) setAudioError(true);
      } finally {
        if (!isCancelled) setIsAudioLoading(false);
      }
    }

    initAudio();

    return () => {
      isCancelled = true;
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    };
  }, [activeAudioUrl]);

  const reloadAudio = async () => {
    setAudioError(false);
    setIsAudioLoading(true);
    try {
      const tests = await ieltsService.getListeningTests(mode);
      const fresh = tests.find((t) => t.test_set_id === test?.test_set_id);
      if (fresh) setTest(fresh);
    } catch {
      setAudioError(true);
    } finally {
      setIsAudioLoading(false);
    }
  };

  const switchPart = (idx: number) => {
    setActivePartIndex(idx);
    setAudioError(false);
    if (soundRef.current) {
      soundRef.current.pauseAsync().catch(() => {});
      setIsPlaying(false);
    }
    const partNum = test?.parts?.[idx]?.part_number || idx + 1;
    if (isDrill) {
      const leavingPartNum = test?.parts?.[activePartIndex]?.part_number || activePartIndex + 1;
      setPartAnswers((prev) => ({ ...prev, [leavingPartNum]: userAnswers }));
      setUserAnswers(partAnswers[partNum] || {});
    }
    setResult(partResults[partNum] || null);
    setPartSecondsLeft(PART_SECONDS);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const startDrill = (idx: number) => {
    const partNum = test?.parts?.[idx]?.part_number || idx + 1;
    switchPart(idx);
    setResult(null);
    setSubmitError(null);
    setUserAnswers({});
    setPartAnswers((prev) => {
      const next = { ...prev };
      delete next[partNum];
      return next;
    });
    setPartResults((prev) => {
      const next = { ...prev };
      delete next[partNum];
      return next;
    });
  };

  const togglePlay = async () => {
    if (!soundRef.current) return;
    try {
      if (isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await soundRef.current.playAsync();
        setIsPlaying(true);
        setAudioError(false);
      }
    } catch {
      setAudioError(true);
    }
  };

  const handleSeek = async (millis: number) => {
    if (!soundRef.current) return;
    try {
      const target = Math.max(0, Math.min(millis, durationMillis));
      await soundRef.current.setPositionAsync(target);
      setPositionMillis(target);
    } catch {}
  };

  const seekRelative = async (deltaSeconds: number) => {
    if (!soundRef.current) return;
    try {
      const next = Math.max(0, Math.min(positionMillis + deltaSeconds * 1000, durationMillis));
      await soundRef.current.setPositionAsync(next);
      setPositionMillis(next);
    } catch {}
  };

  const handleCyclePlaybackRate = async () => {
    const rates = [1, 1.25, 1.5, 0.8];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (soundRef.current) {
      await (soundRef.current as any).setStatusAsync({ rate: nextRate, shouldCorrectPitch: true }).catch(() => {});
    }
  };

  const seekToQuestion = async (timestampSec?: number) => {
    if (typeof timestampSec !== 'number' || !soundRef.current) return;
    try {
      const targetMillis = Math.max(0, Math.min(timestampSec * 1000, durationMillis));
      await soundRef.current.setPositionAsync(targetMillis);
      setPositionMillis(targetMillis);
      if (!isPlaying) {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      }
    } catch {}
  };

  const handleAnswerChange = (qNum: number, ans: string | string[]) => {
    if (result) return;
    setUserAnswers((prev) => ({ ...prev, [qNum]: ans }));
  };

  const handleToggleMultiSelect = (qNum: number, opt: string, maxSelections: number = 2) => {
    if (result) return;
    setUserAnswers((prev) => {
      const current = Array.isArray(prev[qNum])
        ? (prev[qNum] as string[])
        : prev[qNum]
        ? [prev[qNum] as string]
        : [];
      let next: string[];
      if (current.includes(opt)) {
        next = current.filter((o) => o !== opt);
      } else {
        if (current.length >= maxSelections) {
          next = [...current.slice(1), opt];
        } else {
          next = [...current, opt];
        }
      }
      return { ...prev, [qNum]: next };
    });
  };

  const handleSubmit = useCallback(async () => {
    if (!test || submitting || result || !activePart) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const partNum = activePart.part_number;
      const res = await ieltsService.submitListeningTest({
        testSetId: test.test_set_id,
        answers: userAnswers,
        part: partNum as any,
      });
      setResult(res);
      if (res) {
        const updated = { ...partResults, [partNum]: res };
        setPartResults(updated);

        // When all parts [1, 2, 3, 4] are completed, compute overall 40-question band
        if (test.parts.every((p) => updated[p.part_number])) {
          ieltsService
            .submitListeningTest({
              testSetId: test.test_set_id,
              answers: isDrill ? {} : userAnswers,
            })
            .then((overallRes) => {
              setOverallMockResult(overallRes || null);
            })
            .catch(() => {});
        }
      }
      soundRef.current?.pauseAsync().catch(() => {});
      setIsPlaying(false);
    } catch (err) {
      setSubmitError(extractErrorMessage(err) || 'Failed to submit answers. Please try again.');
    } finally {
      setSubmitting(false);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  }, [test, submitting, result, activePart, userAnswers, partResults, isDrill]);

  // Per-part timer countdown
  const timerRunning = !!test && !result;
  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => setPartSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  useEffect(() => {
    if (timerRunning && partSecondsLeft === 0) {
      void handleSubmit();
    }
  }, [timerRunning, partSecondsLeft, handleSubmit]);

  const resultByQuestion = useMemo(() => {
    const map = new Map<number, IeltsListeningResult>();
    result?.detailedResults?.forEach((r) => map.set(Number(r.question_number), r));
    return map;
  }, [result]);

  const currentActiveQuestionNumber = useMemo(() => {
    if (!activePart?.questions) return null;
    const currentSeconds = positionMillis / 1000;
    const qsWithTime = activePart.questions
      .filter(
        (q) =>
          typeof q.timestamp_seconds === 'number' && (q.timestamp_seconds as number) <= currentSeconds
      )
      .sort(
        (a, b) => ((b.timestamp_seconds || 0) as number) - ((a.timestamp_seconds || 0) as number)
      );
    return qsWithTime.length > 0 ? qsWithTime[0].question_number : null;
  }, [activePart, positionMillis]);

  const hasNextPart = !!test && activePartIndex < test.parts.length - 1;
  const allPartsCompleted =
    !!test && test.parts.length > 0 && test.parts.every((p) => !!partResults[p.part_number]);

  const drillTabsLocked =
    isDrill &&
    !result &&
    !!activePart?.questions.some((q) => {
      const a = userAnswers[q.question_number];
      return Array.isArray(a) ? a.length > 0 : String(a ?? '').trim() !== '';
    });

  const headerTitle = isDrill ? 'IELTS Listening Drill' : 'IELTS Listening Mock';

  const tabItems: IeltsTabItem[] = useMemo(() => {
    if (!test) return [];
    return test.parts.map((p, idx) => ({
      id: idx,
      label: `Part ${p.part_number || idx + 1}`,
      isCompleted: !!partResults[p.part_number],
      disabled: drillTabsLocked && activePartIndex !== idx,
    }));
  }, [test, partResults, drillTabsLocked, activePartIndex]);

  if (loading || loadError || !test || !activePart) {
    return (
      <ScreenBackground>
        <SafeAreaView style={styles.centerContainer} edges={['top', 'bottom']}>
          <IeltsHeader title={headerTitle} onBack={() => navigation.goBack()} />
          <View style={styles.stateCenter}>
            {loading ? (
              <>
                <ActivityIndicator size="large" color="#7856FF" />
                <Text style={styles.loadingText}>Loading IELTS Listening Test...</Text>
              </>
            ) : (
              <>
                <Text style={styles.errorText}>
                  {loadError || 'No IELTS listening test is available yet.'}
                </Text>
                <View style={styles.errorActions}>
                  <IeltsButton variant="secondary" onPress={() => navigation.goBack()}>
                    Back to Home
                  </IeltsButton>
                  <IeltsButton variant="primary" onPress={loadTest}>
                    Retry
                  </IeltsButton>
                </View>
              </>
            )}
          </View>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Top Header */}
          <IeltsHeader
            title={headerTitle}
            onBack={() => navigation.goBack()}
            timerSeconds={!result ? partSecondsLeft : null}
          />

          {/* Part Step Navigation Bar */}
          {test.parts.length > 1 && (
            <View>
              <IeltsPillTabs
                tabs={tabItems}
                activeId={activePartIndex}
                onSelect={(id) =>
                  isDrill && !partResults[test.parts[id]?.part_number]
                    ? startDrill(id)
                    : switchPart(id)
                }
                locked={drillTabsLocked}
              />
              {drillTabsLocked && (
                <View style={styles.drillLockedHint}>
                  <Text style={styles.drillLockedText}>
                    Check this part or reset it to switch parts.{' '}
                  </Text>
                  <TouchableOpacity onPress={() => startDrill(activePartIndex)}>
                    <Text style={styles.drillResetLink}>Reset</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* Mock Exam Overall Band Completion Banner */}
          {!isDrill && allPartsCompleted && overallMockResult && (
            <View style={styles.mockCompletionBanner}>
              <View style={styles.mockCompletionLeft}>
                <Feather name="award" size={s(20)} color="#34D399" />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.mockCompletionTitle}>Full Mock Exam Completed</Text>
                  <Text style={styles.mockCompletionSub}>
                    Total Score: {overallMockResult.score} / {overallMockResult.total} questions
                    correct
                  </Text>
                </View>
              </View>
              <View style={styles.mockCompletionRight}>
                <Text style={styles.mockBandText}>
                  Band {overallMockResult.band ?? '—'}
                </Text>
                {!!overallMockResult.band_cefr && (
                  <Text style={styles.mockCefrText}>({overallMockResult.band_cefr})</Text>
                )}
              </View>
            </View>
          )}

          {/* Instructions & Score / Status Bar */}
          <View style={styles.instructionsRow}>
            <View style={styles.instructionsTextCol}>
              <Text style={styles.partSingleLineHeader} numberOfLines={1}>
                <Text style={styles.partHeading}>{cleanPartTopic}</Text>
                <Text style={styles.partDividerText}> — </Text>
                <Text style={styles.partInstructions}>
                  {activePart.instructions || 'Answer the questions as you listen.'}
                </Text>
              </Text>
            </View>

            {result && (
              <View style={styles.partScoreBadge}>
                <Text style={styles.partScoreText}>
                  Part {activePart.part_number}: {result.score}/{result.total} Correct
                  {result.estimated_band != null ? ` · Est. Band ${result.estimated_band}` : ''}
                </Text>
              </View>
            )}
          </View>

          {/* Scrollable Questions Body */}
          <ScrollView
            ref={scrollRef}
            style={styles.contentScroll}
            contentContainerStyle={styles.contentBody}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {submitError && (
              <View style={styles.errorBanner}>
                <Feather name="alert-circle" size={s(14)} color="#F87171" style={{ marginRight: 6 }} />
                <Text style={styles.errorBannerText}>{submitError}</Text>
              </View>
            )}

            {activePart.questions.map((q: IeltsListeningQuestion) => {
              const review = resultByQuestion.get(Number(q.question_number));
              const isQuestionActive = currentActiveQuestionNumber === q.question_number;
              const isMultipleChoice = q.type === 'multiple_choice' && !!q.options?.length;
              const isMultipleSelect = q.type === 'multiple_select' && !!q.options?.length;
              const isMatching = q.type === 'matching' && !!q.options?.length;
              const isFormCompletion = q.type === 'form_completion';

              const selectedMultiList: string[] = Array.isArray(userAnswers[q.question_number])
                ? (userAnswers[q.question_number] as string[])
                : userAnswers[q.question_number]
                ? [userAnswers[q.question_number] as string]
                : [];
              const maxSelections = q.max_selections || 2;

              return (
                <View
                  key={q.question_number}
                  style={[
                    styles.questionCard,
                    isQuestionActive && styles.questionCardActive,
                  ]}
                >
                  <View style={styles.questionHeader}>
                    <View style={styles.qNumBadgeCol}>
                      <View
                        style={[
                          styles.qNumBadge,
                          isQuestionActive && styles.qNumBadgeActive,
                        ]}
                      >
                        <Text style={styles.qNumText}>{q.question_number}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        {!!q.matching_title && (
                          <Text style={styles.matchingEyebrow}>{q.matching_title}</Text>
                        )}
                        <Text style={styles.questionPrompt}>{q.question_text}</Text>
                        {isMultipleSelect && (
                          <Text style={styles.multiSelectHint}>
                            Choose {maxSelections} options • Selected: {selectedMultiList.length}/
                            {maxSelections}
                          </Text>
                        )}
                      </View>
                    </View>

                    {q.timestamp_seconds !== undefined && (
                      <TouchableOpacity
                        onPress={() => seekToQuestion(q.timestamp_seconds)}
                        style={styles.timestampBtn}
                        activeOpacity={0.7}
                      >
                        <Feather name="volume-2" size={s(12)} color="#C55DFE" style={{ marginRight: 4 }} />
                        <Text style={styles.timestampBtnText}>
                          {formatAudioTime(q.timestamp_seconds)}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* 1. Multiple Choice */}
                  {isMultipleChoice && (
                    <View style={styles.optionsList}>
                      {q.options!.map((opt, oIdx) => {
                        const isSelected = userAnswers[q.question_number] === opt;
                        const isThisCorrect =
                          !!review && answerMatchesOption(review.correct_answer, opt, oIdx);

                        let optionStyle: any = styles.optionItem;
                        let textStyle: any = styles.optionText;

                        if (isSelected) {
                          optionStyle = [styles.optionItem, styles.optionItemSelected];
                          textStyle = [styles.optionText, styles.optionTextSelected];
                        }
                        if (review) {
                          if (isSelected) {
                            if (review.is_correct) {
                              optionStyle = [styles.optionItem, styles.optionItemCorrect];
                              textStyle = [styles.optionText, styles.optionTextCorrect];
                            } else {
                              optionStyle = [styles.optionItem, styles.optionItemWrong];
                              textStyle = [styles.optionText, styles.optionTextWrong];
                            }
                          } else if (isThisCorrect && !review.is_correct) {
                            optionStyle = [styles.optionItem, styles.optionItemCorrect];
                            textStyle = [styles.optionText, styles.optionTextCorrect];
                          }
                        }

                        return (
                          <TouchableOpacity
                            key={oIdx}
                            onPress={() => handleAnswerChange(q.question_number, opt)}
                            disabled={!!result}
                            activeOpacity={0.75}
                            style={optionStyle}
                          >
                            <Text style={textStyle}>{opt}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}

                  {/* 2. Multiple Select */}
                  {isMultipleSelect && (
                    <View style={styles.optionsList}>
                      {q.options!.map((opt, oIdx) => {
                        const isSelected = selectedMultiList.includes(opt);
                        const isThisCorrect =
                          !!review &&
                          correctOptionList(review.correct_answer).some((answer) =>
                            answerMatchesOption(answer, opt, oIdx)
                          );

                        let optionStyle: any = styles.optionItem;
                        let textStyle: any = styles.optionText;

                        if (isSelected) {
                          optionStyle = [styles.optionItem, styles.optionItemSelected];
                          textStyle = [styles.optionText, styles.optionTextSelected];
                        }
                        if (review) {
                          if (isSelected && (review.is_correct || isThisCorrect)) {
                            optionStyle = [styles.optionItem, styles.optionItemCorrect];
                            textStyle = [styles.optionText, styles.optionTextCorrect];
                          } else if (isSelected) {
                            optionStyle = [styles.optionItem, styles.optionItemWrong];
                            textStyle = [styles.optionText, styles.optionTextWrong];
                          } else if (isThisCorrect && !review.is_correct) {
                            optionStyle = [styles.optionItem, styles.optionItemMissed];
                            textStyle = [styles.optionText, styles.optionTextCorrect];
                          }
                        }

                        return (
                          <TouchableOpacity
                            key={oIdx}
                            onPress={() =>
                              handleToggleMultiSelect(q.question_number, opt, maxSelections)
                            }
                            disabled={!!result}
                            activeOpacity={0.75}
                            style={optionStyle}
                          >
                            <View style={styles.multiSelectRow}>
                              <Text style={[{ flex: 1 }, textStyle]}>{opt}</Text>
                              {review && isThisCorrect && !isSelected && !review.is_correct && (
                                <Text style={styles.missedTag}>(Missed)</Text>
                              )}
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}

                  {/* 3. Matching */}
                  {isMatching && (
                    <View style={styles.optionsList}>
                      {q.options!.map((opt, oIdx) => {
                        const currentAns = String(userAnswers[q.question_number] || '');
                        const isSelected =
                          currentAns === opt ||
                          (currentAns.length === 1 &&
                            opt.toUpperCase().startsWith(currentAns.toUpperCase()));

                        const isThisCorrect =
                          !!review && answerMatchesOption(review.correct_answer, opt, oIdx);

                        let optionStyle: any = styles.optionItem;
                        let textStyle: any = styles.optionText;

                        if (isSelected) {
                          optionStyle = [styles.optionItem, styles.optionItemSelected];
                          textStyle = [styles.optionText, styles.optionTextSelected];
                        }
                        if (review) {
                          if (isSelected) {
                            if (review.is_correct) {
                              optionStyle = [styles.optionItem, styles.optionItemCorrect];
                              textStyle = [styles.optionText, styles.optionTextCorrect];
                            } else {
                              optionStyle = [styles.optionItem, styles.optionItemWrong];
                              textStyle = [styles.optionText, styles.optionTextWrong];
                            }
                          } else if (isThisCorrect && !review.is_correct) {
                            optionStyle = [styles.optionItem, styles.optionItemCorrect];
                            textStyle = [styles.optionText, styles.optionTextCorrect];
                          }
                        }

                        return (
                          <TouchableOpacity
                            key={oIdx}
                            onPress={() => handleAnswerChange(q.question_number, opt)}
                            disabled={!!result}
                            activeOpacity={0.75}
                            style={optionStyle}
                          >
                            <Text style={textStyle}>{opt}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}

                  {/* 4. Form Completion (Inline Input Row) */}
                  {isFormCompletion && (
                    <View style={styles.formCompletionRow}>
                      {!!q.prefix_text && (
                        <Text style={styles.formPrefixText}>{q.prefix_text}</Text>
                      )}
                      <TextInput
                        value={String(userAnswers[q.question_number] || '')}
                        editable={!result}
                        onChangeText={(t) => handleAnswerChange(q.question_number, t)}
                        placeholder="Type answer..."
                        placeholderTextColor="rgba(255, 255, 255, 0.4)"
                        style={[
                          styles.formInlineInput,
                          review &&
                            (review.is_correct ? styles.inputCorrect : styles.inputWrong),
                        ]}
                        autoCapitalize="none"
                      />
                      {!!q.suffix_text && (
                        <Text style={styles.formSuffixText}>{q.suffix_text}</Text>
                      )}
                    </View>
                  )}

                  {/* 5. Fill in the Blank / Short Answer */}
                  {!isMultipleChoice && !isMultipleSelect && !isMatching && !isFormCompletion && (
                    <View style={styles.fillBlankRow}>
                      <TextInput
                        value={String(userAnswers[q.question_number] || '')}
                        editable={!result}
                        onChangeText={(t) => handleAnswerChange(q.question_number, t)}
                        placeholder="Type your answer here..."
                        placeholderTextColor="rgba(255, 255, 255, 0.4)"
                        style={[
                          styles.fillBlankInput,
                          review &&
                            (review.is_correct ? styles.inputCorrect : styles.inputWrong),
                        ]}
                        autoCapitalize="none"
                      />
                    </View>
                  )}

                  {/* Feedback on wrong answers */}
                  {review && !review.is_correct && (
                    <Text style={styles.correctFeedbackText}>
                      Correct answer: {String(review.correct_answer ?? '')}
                    </Text>
                  )}
                </View>
              );
            })}

            {/* Scrollable Action CTA (Submit, Proceed, Re-attempt, View Report) */}
            <View style={styles.scrollActionContainer}>
              {!result ? (
                <IeltsButton
                  variant="primary"
                  onPress={handleSubmit}
                  loading={submitting}
                  style={styles.fullWidthButton}
                >
                  {submitting
                    ? 'Submitting...'
                    : `Submit Part ${activePart?.part_number || activePartIndex + 1}`}
                </IeltsButton>
              ) : hasNextPart ? (
                <View style={styles.nextPartActionRow}>
                  {isDrill && (
                    <IeltsButton
                      variant="secondary"
                      onPress={() => startDrill(activePartIndex)}
                      style={styles.reattemptButton}
                      icon={<Feather name="rotate-ccw" size={s(15)} color="#C4B5FD" />}
                    >
                      Re-attempt
                    </IeltsButton>
                  )}
                  <IeltsButton
                    variant="primary"
                    onPress={() => switchPart(activePartIndex + 1)}
                    style={styles.proceedButton}
                    icon={<Feather name="arrow-right" size={s(16)} color="#FFFFFF" />}
                    iconPosition="right"
                  >
                    Proceed to Part {activePartIndex + 2}
                  </IeltsButton>
                </View>
              ) : (
                <IeltsButton
                  variant="primary"
                  onPress={() =>
                    navigation.navigate('TodaysReportScreen', {
                      track: isDrill ? 'drill' : 'mock',
                    })
                  }
                  style={styles.fullWidthButton}
                  icon={<Feather name="arrow-right" size={s(16)} color="#FFFFFF" />}
                  iconPosition="right"
                >
                  View Performance Report
                </IeltsButton>
              )}
            </View>
          </ScrollView>

          {/* Fixed Bottom Audio Player Dock */}
          <View
            style={[
              styles.bottomDock,
              { paddingBottom: Math.max(insets.bottom, 10) },
            ]}
          >

            {/* Inline Audio Player */}
            <IeltsAudioPlayer
              positionMillis={positionMillis}
              durationMillis={durationMillis}
              isPlaying={isPlaying}
              isLoading={isAudioLoading}
              audioError={audioError}
              playbackRate={playbackRate}
              onTogglePlay={togglePlay}
              onSeek={handleSeek}
              onSkip={seekRelative}
              onCyclePlaybackRate={handleCyclePlaybackRate}
              onReload={reloadAudio}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
  },
  stateCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 14,
    fontSize: 14,
  },
  errorText: {
    color: '#F87171',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12,
  },
  drillLockedHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  drillLockedText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  drillResetLink: {
    color: '#C4B5FD',
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  mockCompletionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginVertical: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.35)',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  mockCompletionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mockCompletionTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  mockCompletionSub: {
    color: '#6EE7B7',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  mockCompletionRight: {
    alignItems: 'flex-end',
  },
  mockBandText: {
    color: '#34D399',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  mockCefrText: {
    color: '#A7F3D0',
    fontSize: 11,
    fontWeight: '600',
  },
  instructionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  instructionsTextCol: {
    flex: 1,
    marginRight: 10,
  },
  partSingleLineHeader: {
    fontSize: 13,
  },
  partHeading: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  partDividerText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
  },
  partInstructions: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 12,
  },
  partScoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  partScoreText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  contentScroll: {
    flex: 1,
  },
  contentBody: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 36,
    gap: 12,
  },
  scrollActionContainer: {
    marginTop: 18,
    marginBottom: 10,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.4)',
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
  },
  errorBannerText: {
    color: '#FDA4AF',
    fontSize: 12,
    flex: 1,
  },
  questionCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 14,
  },
  questionCardActive: {
    borderColor: 'rgba(120, 86, 255, 0.8)',
    backgroundColor: 'rgba(120, 86, 255, 0.08)',
    shadowColor: '#7856FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  qNumBadgeCol: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
  },
  qNumBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#5D4CFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  qNumBadgeActive: {
    backgroundColor: '#7856FF',
  },
  qNumText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  matchingEyebrow: {
    color: '#C4B5FD',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  questionPrompt: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  multiSelectHint: {
    color: '#C4B5FD',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  timestampBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(120, 86, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(120, 86, 255, 0.35)',
  },
  timestampBtnText: {
    color: '#C55DFE',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  optionsList: {
    marginTop: 10,
    marginLeft: 34,
    gap: 8,
  },
  optionItem: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  optionItemSelected: {
    borderColor: '#7856FF',
    backgroundColor: 'rgba(120, 86, 255, 0.25)',
  },
  optionItemCorrect: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  optionItemWrong: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  optionItemMissed: {
    borderColor: '#10B981',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  optionText: {
    color: '#E5E7EB',
    fontSize: 13,
    lineHeight: 18,
  },
  optionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  optionTextCorrect: {
    color: '#6EE7B7',
    fontWeight: '700',
  },
  optionTextWrong: {
    color: '#FCA5A5',
    fontWeight: '600',
  },
  multiSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  missedTag: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 6,
  },
  formCompletionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    marginLeft: 34,
  },
  formPrefixText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    fontWeight: '500',
  },
  formSuffixText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    fontWeight: '500',
  },
  formInlineInput: {
    height: 38,
    minWidth: 130,
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 10,
    color: '#FFFFFF',
    fontSize: 13,
  },
  fillBlankRow: {
    marginTop: 10,
    marginLeft: 34,
  },
  fillBlankInput: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 12,
    color: '#FFFFFF',
    fontSize: 13,
  },
  inputCorrect: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: '#6EE7B7',
  },
  inputWrong: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: '#FCA5A5',
  },
  correctFeedbackText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
    marginLeft: 34,
  },
  bottomDock: {
    backgroundColor: 'rgba(15, 18, 34, 0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  actionBtnContainer: {
    marginBottom: 6,
  },
  fullWidthButton: {
    width: '100%',
  },
  nextPartActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reattemptButton: {
    width: 130,
  },
  proceedButton: {
    flex: 1,
  },
});

export default IeltsListeningScreen;
