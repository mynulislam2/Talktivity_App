import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
} from '@/services/ielts';
import { hasAnswer, optionReviewState, questionTimestamp } from '@/lib/ielts/listeningReview';

// Real IELTS Listening gives 40 minutes for all four parts.
const MOCK_SECONDS = 40 * 60;

export const IeltsListeningScreen: React.FC = () => {
  const { s } = useResponsive();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isDrill = route.params?.mode === 'drill';

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [test, setTest] = useState<IeltsListeningTest | null>(null);
  const [activePartIndex, setActivePartIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string | string[]>>({});
  // Review comes only from the submit response, keyed by question number.
  const [results, setResults] = useState<Record<number, IeltsListeningResult> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Shown inline: Alert is a no-op on web.
  const [summary, setSummary] = useState<{ score: number; total: number; band: number | null } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);
  // Mock only: 40-minute countdown, auto-submitted once at 0.
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const autoSubmittedRef = useRef(false);

  // Audio State
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(1);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [audioReloadKey, setAudioReloadKey] = useState(0);

  // Load Test Data
  const loadTest = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const tests = await ieltsService.getListeningTests();
      const selected = tests.find((t) => t.parts.some((p) => p.questions.length > 0));
      if (selected) {
        setTest(selected);
      } else {
        setLoadError('No IELTS Listening test is available yet.');
      }
    } catch (err) {
      setLoadError(extractErrorMessage(err) || 'Failed to load the IELTS Listening test.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTest();
  }, [loadTest]);

  const parts = test?.parts || [];
  const activePart = parts[activePartIndex] || parts[0];
  const activeAudioUrl = activePart?.audio_url;
  const hasTest = !!test;
  const submitted = !!results;

  useEffect(() => {
    if (isDrill || !hasTest || submitted) return;
    setSecondsLeft(MOCK_SECONDS);
    const id = setInterval(() => {
      setSecondsLeft((prev) => (prev == null || prev <= 0 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [isDrill, hasTest, submitted]);

  // Audio Setup & Cleanup synced per part
  useEffect(() => {
    let isCancelled = false;

    async function initAudio() {
      if (!activeAudioUrl) return;
      try {
        setIsAudioLoading(true);
        setAudioError(false);
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: activeAudioUrl },
          { shouldPlay: false },
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
          newSound.unloadAsync();
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
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, [activeAudioUrl, audioReloadKey]);

  // Signed audio URLs expire; re-fetch the test for fresh ones, then reload the part.
  const reloadAudio = async () => {
    setAudioError(false);
    setIsAudioLoading(true);
    try {
      const tests = await ieltsService.getListeningTests();
      const fresh = tests.find((t) => t.id === test?.id);
      if (fresh) setTest(fresh);
    } catch (e) {
      console.warn('Listening test re-fetch failed:', e);
    }
    setAudioReloadKey((k) => k + 1);
  };

  // Drill: once this part has an answer, switching would silently drop it,
  // so the other tabs stay locked until the part is checked or reset.
  const partHasAnswers =
    !!activePart &&
    activePart.questions.some((q) => hasAnswer(userAnswers[q.question_number]));
  const tabsLocked = isDrill && (!!results || partHasAnswers);

  // Drill only: a mock keeps its review once submitted.
  const resetDrill = () => {
    setUserAnswers({});
    setResults(null);
    setSummary(null);
    setSubmitError(null);
    autoSubmittedRef.current = false;
  };

  const hasNextPart = activePartIndex < parts.length - 1;

  const handleNextPart = () => {
    if (hasNextPart) {
      resetDrill();
      switchPart(activePartIndex + 1, true);
    } else {
      navigation.goBack();
    }
  };

  const switchPart = async (index: number, force = false) => {
    // A drill stays on its part once answered or graded.
    if (!force && tabsLocked && index !== activePartIndex) return;
    setActivePartIndex(index);
    if (soundRef.current) {
      try {
        await soundRef.current.pauseAsync();
        await soundRef.current.setPositionAsync(0);
      } catch (e) {}
    }
    setPositionMillis(0);
    setIsPlaying(false);
  };

  const togglePlayPause = async () => {
    if (!soundRef.current) return;
    try {
      if (isPlaying) {
        await soundRef.current.pauseAsync();
      } else {
        await soundRef.current.playAsync();
      }
    } catch (e) {
      console.warn('Playback toggle error:', e);
    }
  };

  const seekRelative = async (offsetMillis: number) => {
    if (!soundRef.current) return;
    try {
      const newPos = Math.max(0, Math.min(positionMillis + offsetMillis, durationMillis));
      await soundRef.current.setPositionAsync(newPos);
    } catch (e) {
      console.warn('Seek error:', e);
    }
  };

  const seekToQuestion = async (seconds: number) => {
    if (!soundRef.current) return;
    try {
      const pos = Math.max(0, Math.min(seconds * 1000, durationMillis));
      await soundRef.current.setPositionAsync(pos);
      if (!isPlaying) {
        await soundRef.current.playAsync();
      }
    } catch (e) {
      console.warn('Seek to question error:', e);
    }
  };

  const handleAnswerChange = (questionNumber: number, answer: string | string[]) => {
    if (results) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionNumber]: answer,
    }));
  };

  const handleToggleMultiSelect = (
    qNum: number,
    option: string,
    maxSelections: number = 2
  ) => {
    if (results) return;
    setUserAnswers((prev) => {
      const current = Array.isArray(prev[qNum])
        ? (prev[qNum] as string[])
        : prev[qNum]
        ? [prev[qNum] as string]
        : [];
      let next: string[];
      if (current.includes(option)) {
        next = current.filter((o) => o !== option);
      } else {
        if (current.length >= maxSelections) {
          next = [...current.slice(1), option];
        } else {
          next = [...current, option];
        }
      }
      return { ...prev, [qNum]: next };
    });
  };

  const handleSubmit = async () => {
    if (!test || !activePart || isSubmitting || results) return;
    // A drill grades only the chosen part; a mock grades all four.
    const gradedQuestions = isDrill
      ? activePart.questions
      : parts.flatMap((p) => p.questions);
    const answers: Record<string, string | string[]> = {};
    gradedQuestions.forEach((q) => {
      answers[String(q.question_number)] = userAnswers[q.question_number] || '';
    });

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      const result = await ieltsService.submitListeningTest({
        testSetId: test.test_set_id,
        answers,
        part: isDrill ? activePart.part_number : undefined,
      });
      const byNumber: Record<number, IeltsListeningResult> = {};
      (result?.detailedResults || []).forEach((r) => {
        byNumber[Number(r.question_number)] = r;
      });
      setResults(byNumber);
      setSummary({
        score: result?.score ?? 0,
        total: result?.total ?? gradedQuestions.length,
        band: result?.band ?? null,
      });
    } catch (e) {
      setSubmitError(
        `${extractErrorMessage(e) || 'Your answers could not be checked.'} Your answers are still here.`
      );
    } finally {
      setIsSubmitting(false);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  // Time is up: submit everything once, whatever has been answered.
  useEffect(() => {
    if (secondsLeft === 0 && !results && !autoSubmittedRef.current) {
      autoSubmittedRef.current = true;
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, results]);

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const renderHeader = (title: string, subtitle?: string, showTimer = false) => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Feather name="arrow-left" size={s(20)} color="#FFFFFF" />
      </TouchableOpacity>
      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
      </View>
      {showTimer && secondsLeft != null && !results && (
        <View style={styles.timerPill}>
          <Feather name="clock" size={s(12)} color={secondsLeft <= 300 ? '#F87171' : '#FFFFFF'} />
          <Text style={[styles.timerText, secondsLeft <= 300 && { color: '#F87171' }]}>
            {formatTime(secondsLeft * 1000)}
          </Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <ScreenBackground>
        <SafeAreaView style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading IELTS Listening Test...</Text>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  if (loadError || !test || !activePart) {
    return (
      <ScreenBackground>
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
          {renderHeader('IELTS Listening')}
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>
              {loadError || 'Failed to load the IELTS Listening test.'}
            </Text>
            <TouchableOpacity onPress={loadTest} style={styles.retryButton}>
              <Feather name="refresh-cw" size={s(16)} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.submitHeaderText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        {renderHeader(
          test.title || 'IELTS Listening Test',
          isDrill ? 'Listening drill: choose one part' : 'Listening mock test: Parts 1-4',
          true
        )}

        {/* Part Switcher Tabs */}
        <View style={styles.partTabsContainer}>
          {parts.map((p, index) => (
            <TouchableOpacity
              key={p.part_number || index}
              onPress={() => switchPart(index)}
              disabled={tabsLocked && activePartIndex !== index}
              style={[
                styles.partTab,
                activePartIndex === index && styles.partTabActive,
                tabsLocked && activePartIndex !== index && { opacity: 0.4 },
              ]}
            >
              <Text
                style={[
                  styles.partTabText,
                  activePartIndex === index && styles.partTabTextActive,
                ]}
              >
                Part {p.part_number || index + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isDrill && partHasAnswers && !results && (
          <View style={styles.lockHintRow}>
            <Text style={styles.lockHintText}>Check this part or reset it to switch parts.</Text>
            <TouchableOpacity onPress={resetDrill}>
              <Text style={styles.lockHintAction}>Reset</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Part Questions Content */}
        <ScrollView
          ref={scrollRef}
          style={styles.contentScroll}
          contentContainerStyle={styles.contentBody}
        >
          {!!submitError && (
            <View style={[styles.resultBanner, styles.resultBannerError]}>
              <Text style={styles.resultErrorText}>{submitError}</Text>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting}
                style={[styles.retryButton, styles.bannerButton]}
              >
                <Feather name="refresh-cw" size={s(14)} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.submitHeaderText}>{isSubmitting ? 'Submitting…' : 'Retry'}</Text>
              </TouchableOpacity>
            </View>
          )}

          {summary && (
            <View style={styles.resultBanner}>
              <View style={styles.resultHeaderRow}>
                <View style={styles.resultBadge}>
                  <Feather name="check-circle" size={s(12)} color="#34D399" />
                  <Text style={styles.resultTitle}>
                    {isDrill ? `Part ${activePart.part_number} checked` : 'Test submitted'}
                  </Text>
                </View>
                {summary.band != null && (
                  <View style={styles.resultBandBadge}>
                    <Text style={styles.resultBandText}>
                      Estimated band {Number(summary.band).toFixed(1)}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.resultScoreRow}>
                <Text style={styles.resultScoreNumber}>{summary.score}</Text>
                <Text style={styles.resultScoreTotal}>/ {summary.total} correct</Text>
              </View>
              <Text style={styles.resultHint}>Review your answers below.</Text>
              {!isDrill && (
                <View style={styles.bannerActions}>
                  <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[styles.retryButton, styles.bannerButton]}
                  >
                    <Text style={styles.submitHeaderText}>Back to Home</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          <View style={styles.instructionsCard}>
            <View style={styles.instructionsHeaderRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.partCategoryTag}>PART {activePart.part_number} • LISTENING</Text>
                <Text style={styles.partTitle}>{activePart.title}</Text>
              </View>
            </View>
            <Text style={styles.partInstructions}>
              {isDrill
                ? 'Play the recording and answer this part, then submit.'
                : 'Answer all four parts, then submit for your score and band.'}
            </Text>
          </View>

          {activePart.questions.map((q: IeltsListeningQuestion) => {
            const result = results?.[q.question_number];
            const timestamp = questionTimestamp(q.timestamp_seconds);
            return (
              <View key={q.question_number} style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <View style={styles.qNumRow}>
                    <View style={styles.qNumBadge}>
                      <Text style={styles.qNumText}>{q.question_number}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      {!!q.matching_title && (
                        <Text style={styles.questionEyebrow}>{q.matching_title}</Text>
                      )}
                      <Text style={styles.questionText}>{q.question_text}</Text>
                    </View>
                  </View>
                  {timestamp !== null && (
                    <TouchableOpacity
                      onPress={() => seekToQuestion(timestamp)}
                      style={styles.timestampBtn}
                    >
                      <Feather name="volume-2" size={s(11)} color="#C55DFE" style={{ marginRight: 4 }} />
                      <Text style={styles.timestampBtnText}>{formatTime(timestamp * 1000)}</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* 1. Multiple Choice Render */}
                {q.type === 'multiple_choice' && q.options && (
                  <View style={styles.optionsList}>
                    {q.options.map((option, oIdx, options) => {
                      const isSelected = userAnswers[q.question_number] === option;
                      const state = optionReviewState({ option, options, selected: isSelected, result });
                      // The right option is shown green, whether picked or missed.
                      const isThisCorrect = state === 'correct' || state === 'missed';
                      let optionStyle: any = styles.optionItem;
                      let radioStyle: any = styles.radioIndicator;

                      if (state === 'selected') {
                        optionStyle = [styles.optionItem, styles.optionItemSelected];
                        radioStyle = [styles.radioIndicator, styles.radioIndicatorSelected];
                      } else if (isThisCorrect) {
                        optionStyle = [styles.optionItem, styles.optionItemCorrect];
                        radioStyle = [styles.radioIndicator, styles.radioIndicatorCorrect];
                      } else if (state === 'wrong') {
                        optionStyle = [styles.optionItem, styles.optionItemWrong];
                        radioStyle = [styles.radioIndicator, styles.radioIndicatorWrong];
                      }

                      return (
                        <TouchableOpacity
                          key={oIdx}
                          onPress={() => handleAnswerChange(q.question_number, option)}
                          disabled={!!results}
                          style={optionStyle}
                        >
                          <View style={radioStyle}>
                            {(isSelected || (result && isThisCorrect)) ? (
                              <View style={styles.radioInnerDot} />
                            ) : null}
                          </View>
                          <Text
                            style={[
                              styles.optionText,
                              isSelected && styles.optionTextSelected,
                              isThisCorrect && styles.optionTextCorrect,
                              { flex: 1 },
                            ]}
                          >
                            {option}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* 2. Multiple Select Render */}
                {q.type === 'multiple_select' && q.options && (
                  <View style={styles.optionsList}>
                    <Text style={styles.multiSelectHint}>
                      Choose {q.max_selections || 2} options • Selected:{' '}
                      {(Array.isArray(userAnswers[q.question_number])
                        ? (userAnswers[q.question_number] as string[]).length
                        : userAnswers[q.question_number] ? 1 : 0)}/{q.max_selections || 2}
                    </Text>
                    {q.options.map((option, oIdx, options) => {
                      const selectedList = Array.isArray(userAnswers[q.question_number])
                        ? (userAnswers[q.question_number] as string[])
                        : userAnswers[q.question_number]
                        ? [userAnswers[q.question_number] as string]
                        : [];
                      const isSelected = selectedList.includes(option);
                      const state = optionReviewState({
                        option,
                        options,
                        selected: isSelected,
                        result,
                        multi: true,
                      });
                      const isThisCorrect = state === 'correct' || state === 'missed';

                      let rowStyle: any = styles.multiOptionRow;
                      if (state === 'selected') rowStyle = [styles.multiOptionRow, styles.optionItemSelected];
                      else if (state === 'correct') rowStyle = [styles.multiOptionRow, styles.optionItemCorrect];
                      else if (state === 'wrong') rowStyle = [styles.multiOptionRow, styles.optionItemWrong];
                      else if (state === 'missed') rowStyle = [styles.multiOptionRow, styles.optionItemMissed];

                      return (
                        <TouchableOpacity
                          key={oIdx}
                          onPress={() => handleToggleMultiSelect(q.question_number, option, q.max_selections || 2)}
                          disabled={!!results}
                          style={rowStyle}
                        >
                          <View
                            style={[
                              styles.checkboxIndicator,
                              isSelected && styles.checkboxIndicatorSelected,
                              result && isThisCorrect && styles.checkboxIndicatorCorrect,
                              result && isSelected && !isThisCorrect && styles.checkboxIndicatorWrong,
                            ]}
                          >
                            {isSelected && <Feather name="check" size={s(11)} color="#FFFFFF" />}
                          </View>
                          <Text
                            style={[
                              styles.optionText,
                              isSelected && styles.optionTextSelected,
                              isThisCorrect && styles.optionTextCorrect,
                              { flex: 1 },
                            ]}
                          >
                            {option}
                          </Text>
                          {result && isThisCorrect && !isSelected && (
                            <View style={styles.missedBadgeContainer}>
                              <Text style={styles.missedBadgeText}>Missed</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* 3. Matching Render */}
                {q.type === 'matching' && q.options && (
                  <View style={styles.optionsList}>
                    {q.options.map((option, oIdx, options) => {
                      const currentAns = String(userAnswers[q.question_number] || '');
                      const isSelected =
                        currentAns === option ||
                        (currentAns.length === 1 && option.toUpperCase().startsWith(currentAns.toUpperCase()));

                      const state = optionReviewState({ option, options, selected: isSelected, result });
                      const isThisCorrect = state === 'correct' || state === 'missed';

                      let optionStyle: any = styles.matchingRow;
                      if (state === 'selected') optionStyle = [styles.matchingRow, styles.optionItemSelected];
                      else if (isThisCorrect) optionStyle = [styles.matchingRow, styles.optionItemCorrect];
                      else if (state === 'wrong') optionStyle = [styles.matchingRow, styles.optionItemWrong];

                      return (
                        <TouchableOpacity
                          key={oIdx}
                          onPress={() => handleAnswerChange(q.question_number, option)}
                          disabled={!!results}
                          style={optionStyle}
                        >
                          <View style={styles.matchingLetterBadge}>
                            <Text style={styles.matchingLetterText}>{option.charAt(0)}</Text>
                          </View>
                          <Text
                            style={[
                              styles.optionText,
                              isSelected && styles.optionTextSelected,
                              isThisCorrect && styles.optionTextCorrect,
                              { flex: 1 },
                            ]}
                          >
                            {option}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* 4. Form Completion Render */}
                {q.type === 'form_completion' && (
                  <View style={styles.formCompletionRow}>
                    {!!q.prefix_text && (
                      <Text style={styles.formPrefixText}>{q.prefix_text}</Text>
                    )}
                    <TextInput
                      value={String(userAnswers[q.question_number] || '')}
                      onChangeText={(text) => handleAnswerChange(q.question_number, text)}
                      editable={!results}
                      placeholder="Type answer..."
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      style={[
                        styles.formInlineInput,
                        result && (result.is_correct ? styles.fillBlankCorrect : styles.fillBlankWrong),
                      ]}
                      autoCapitalize="none"
                    />
                    {!!q.suffix_text && (
                      <Text style={styles.formSuffixText}>{q.suffix_text}</Text>
                    )}
                  </View>
                )}

                {/* 5. Fill in the Blank Render */}
                {!['multiple_choice', 'multiple_select', 'matching', 'form_completion'].includes(q.type) && (
                  <View style={styles.fillBlankContainer}>
                    <TextInput
                      value={String(userAnswers[q.question_number] || '')}
                      onChangeText={(text) => handleAnswerChange(q.question_number, text)}
                      editable={!results}
                      placeholder="Type your answer here..."
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      style={[
                        styles.fillBlankInput,
                        result && (result.is_correct ? styles.fillBlankCorrect : styles.fillBlankWrong),
                      ]}
                      autoCapitalize="none"
                    />
                  </View>
                )}

                {result && !result.is_correct && (
                  <View style={styles.correctAnswerCard}>
                    <Feather name="check-circle" size={s(14)} color="#34D399" />
                    <Text style={styles.correctAnswerCardText}>
                      Correct answer:{' '}
                      <Text style={styles.correctAnswerCardBold}>{String(result.correct_answer)}</Text>
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
          <View style={{ height: 200 }} />
        </ScrollView>

        {/* Fixed Footer: Action Button (Submit / New Attempt) + Audio Player */}
        <View style={styles.footerContainer}>
          <View style={styles.bottomActionBar}>
            {!summary ? (
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting}
                style={[styles.bottomPrimaryBtn, isSubmitting && { opacity: 0.5 }]}
              >
                <Text style={styles.bottomPrimaryBtnText}>
                  {isSubmitting ? 'Submitting…' : isDrill ? 'Submit Part' : 'Submit Test'}
                </Text>
              </TouchableOpacity>
            ) : !isDrill ? (
              // Mock: the review stays; no restart.
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.bottomPrimaryBtn}>
                <Text style={styles.bottomPrimaryBtnText}>Back to Home</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.bottomButtonsRow}>
                <TouchableOpacity
                  onPress={resetDrill}
                  style={styles.bottomSecondaryBtn}
                >
                  <Feather name="rotate-ccw" size={s(15)} color="#C55DFE" style={{ marginRight: 6 }} />
                  <Text style={styles.bottomSecondaryBtnText}>New Attempt</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleNextPart}
                  style={styles.bottomPrimaryBtnHalf}
                >
                  <Text style={styles.bottomPrimaryBtnText}>
                    {hasNextPart ? 'Next Part' : 'Back to Home'}
                  </Text>
                  <Feather name="arrow-right" size={s(15)} color="#FFFFFF" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Persistent Bottom Audio Player */}
          <View style={styles.bottomPlayer}>
            <View style={styles.playerInfoRow}>
              <Text style={styles.playerPartTitle}>Part {activePart.part_number} Audio</Text>
            </View>

            <View style={styles.playerProgressRow}>
              <Text style={styles.playerTime}>{formatTime(positionMillis)}</Text>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.min(100, (positionMillis / durationMillis) * 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.playerTime}>{formatTime(durationMillis)}</Text>
            </View>

            {audioError && (
              <TouchableOpacity onPress={reloadAudio} style={styles.audioErrorRow}>
                <Feather name="refresh-cw" size={s(14)} color="#F87171" style={{ marginRight: 6 }} />
                <Text style={styles.audioErrorText}>Audio couldn't load — tap to reload</Text>
              </TouchableOpacity>
            )}

            <View style={styles.playerControlsRow}>
              <TouchableOpacity onPress={() => seekRelative(-10000)} style={styles.skipButton}>
                <Feather name="rotate-ccw" size={s(18)} color="#FFFFFF" />
                <Text style={styles.skipText}>-10s</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={togglePlayPause} style={styles.playPauseButton}>
                {isAudioLoading ? (
                  <ActivityIndicator size="small" color="#151726" />
                ) : (
                  <Feather
                    name={isPlaying ? 'pause' : 'play'}
                    size={s(22)}
                    color="#151726"
                    style={{ marginLeft: isPlaying ? 0 : 2 }}
                  />
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => seekRelative(10000)} style={styles.skipButton}>
                <Feather name="rotate-cw" size={s(18)} color="#FFFFFF" />
                <Text style={styles.skipText}>+10s</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#F87171',
    fontSize: 14,
    textAlign: 'center',
    marginHorizontal: 24,
    marginBottom: 16,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  loadingText: {
    color: '#A0A0A0',
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 6,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  submitHeaderButton: {
    backgroundColor: '#8C6DFF',
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitHeaderText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  partTabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  partTab: {
    flex: 1,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  partTabActive: {
    backgroundColor: 'rgba(147, 51, 234, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.6)',
  },
  partTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  partTabTextActive: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  contentScroll: {
    flex: 1,
  },
  contentBody: {
    padding: 16,
  },
  audioUnavailableCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  audioUnavailableText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    flex: 1,
  },
  instructionsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 14,
  },
  instructionsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  instructionsScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  partCategoryTag: {
    color: '#C55DFE',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  partTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  partInstructions: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.65)',
    marginTop: 4,
    lineHeight: 18,
  },
  questionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  qNumRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 10,
  },
  qNumBadge: {
    backgroundColor: '#8C6DFF',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  qNumText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  questionEyebrow: {
    color: '#C55DFE',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  questionText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '500',
  },
  timestampBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: 'rgba(140, 109, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(140, 109, 255, 0.3)',
  },
  timestampBtnText: {
    color: '#C55DFE',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  playerInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  playerPartTitle: {
    color: '#C4B5FD',
    fontSize: 11,
    fontWeight: '600',
  },
  optionsList: {
    gap: 10,
    marginTop: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  optionItemSelected: {
    backgroundColor: 'rgba(147, 51, 234, 0.25)',
    borderColor: 'rgba(168, 85, 247, 0.6)',
  },
  optionItemCorrect: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  optionItemWrong: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#EF4444',
  },
  optionItemMissed: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10B981',
    borderStyle: 'dashed',
  },
  radioIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioIndicatorSelected: {
    borderColor: '#8C6DFF',
    backgroundColor: '#8C6DFF',
  },
  radioIndicatorCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#10B981',
  },
  radioIndicatorWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#EF4444',
  },
  radioInnerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  checkboxIndicator: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxIndicatorSelected: {
    borderColor: '#8C6DFF',
    backgroundColor: '#8C6DFF',
  },
  checkboxIndicatorCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#10B981',
  },
  checkboxIndicatorWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#EF4444',
  },
  missedBadgeContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  missedBadgeText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '600',
  },
  multiOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  matchingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  matchingLetterBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(140, 109, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(140, 109, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  matchingLetterText: {
    color: '#C55DFE',
    fontSize: 12,
    fontWeight: '700',
  },
  formCompletionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  formPrefixText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    fontWeight: '600',
  },
  formSuffixText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
  },
  formInlineInput: {
    height: 40,
    minWidth: 140,
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#FFFFFF',
    fontSize: 13,
  },
  multiSelectHint: {
    fontSize: 11,
    color: '#C4B5FD',
    marginBottom: 4,
    fontWeight: '500',
  },
  optionText: {
    color: '#E5E7EB',
    fontSize: 13,
  },
  optionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  optionTextCorrect: {
    color: '#34D399',
    fontWeight: '700',
  },
  fillBlankContainer: {
    marginTop: 6,
  },
  fillBlankInput: {
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#FFFFFF',
    fontSize: 13,
  },
  fillBlankCorrect: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    color: '#34D399',
  },
  fillBlankWrong: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    color: '#F87171',
  },
  correctAnswerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  correctAnswerHint: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  correctAnswerCardText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '500',
  },
  correctAnswerCardBold: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  bottomActionBar: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },
  bottomPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8C6DFF',
    height: 44,
    borderRadius: 8,
  },
  bottomPrimaryBtnHalf: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8C6DFF',
    height: 44,
    borderRadius: 8,
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bottomSecondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(140, 109, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(140, 109, 255, 0.4)',
  },
  bottomSecondaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  bottomPlayer: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 24,
  },
  playerProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playerTime: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: 'monospace',
  },
  progressBarBackground: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#8C6DFF',
  },
  playerControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    marginTop: 8,
  },
  playPauseButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  skipText: {
    color: '#9CA3AF',
    fontSize: 10,
    marginTop: 2,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  lockHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 19,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  lockHintText: {
    flex: 1,
    color: '#9CA3AF',
    fontSize: 11,
  },
  lockHintAction: {
    color: '#C4B5FD',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 12,
  },
  resultBanner: {
    backgroundColor: 'rgba(30, 34, 64, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.35)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  resultBannerError: {
    backgroundColor: 'rgba(88, 32, 52, 0.45)',
    borderColor: '#F87171',
  },
  resultHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.4)',
  },
  resultTitle: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '700',
  },
  resultBandBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: 'rgba(140, 109, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(140, 109, 255, 0.4)',
  },
  resultBandText: {
    color: '#C55DFE',
    fontSize: 12,
    fontWeight: '700',
  },
  resultScoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 4,
  },
  resultScoreNumber: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  resultScoreTotal: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '500',
  },
  resultHint: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 12,
    marginTop: 6,
  },
  resultErrorText: {
    color: '#F87171',
    fontSize: 13,
    lineHeight: 18,
  },
  bannerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  bannerButton: {
    alignSelf: 'flex-start',
  },
  bannerButtonSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  audioErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  audioErrorText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '600',
  },
});
export default IeltsListeningScreen;
