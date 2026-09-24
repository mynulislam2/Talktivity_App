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
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
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
    activePart.questions.some((q) => (userAnswers[q.question_number] ?? '') !== '');
  const tabsLocked = isDrill && (!!results || partHasAnswers);

  const resetDrill = () => {
    setUserAnswers({});
    setResults(null);
    setSummary(null);
    setSubmitError(null);
  };

  const switchPart = async (index: number) => {
    // A drill stays on its part once answered or graded.
    if (tabsLocked && index !== activePartIndex) return;
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

  const handleAnswerChange = (questionNumber: number, answer: string) => {
    if (results) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionNumber]: answer,
    }));
  };

  const handleSubmit = async () => {
    if (!test || !activePart || isSubmitting || results) return;
    // A drill grades only the chosen part; a mock grades all four.
    const gradedQuestions = isDrill
      ? activePart.questions
      : parts.flatMap((p) => p.questions);
    const answers: Record<string, string> = {};
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

  const renderHeader = (title: string, subtitle?: string, showSubmit = false) => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Feather name="arrow-left" size={s(20)} color="#FFFFFF" />
      </TouchableOpacity>
      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
      </View>
      {showSubmit && secondsLeft != null && !results && (
        <View style={styles.timerPill}>
          <Feather name="clock" size={s(12)} color={secondsLeft <= 300 ? '#F87171' : '#FFFFFF'} />
          <Text style={[styles.timerText, secondsLeft <= 300 && { color: '#F87171' }]}>
            {formatTime(secondsLeft * 1000)}
          </Text>
        </View>
      )}
      {showSubmit && (
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting || !!results}
          style={[styles.submitHeaderButton, (isSubmitting || !!results) && { opacity: 0.5 }]}
        >
          <Text style={styles.submitHeaderText}>
            {isSubmitting ? 'Submitting…' : results ? 'Submitted' : isDrill ? 'Check part' : 'Submit'}
          </Text>
        </TouchableOpacity>
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
              <Text style={styles.resultTitle}>
                {isDrill ? `Part ${activePart.part_number} checked` : 'Test submitted'}
              </Text>
              <Text style={styles.resultScore}>
                Score: {summary.score} / {summary.total}
              </Text>
              {summary.band != null && (
                <Text style={styles.resultBand}>
                  Estimated band: {Number(summary.band).toFixed(1)}
                </Text>
              )}
              <Text style={styles.resultHint}>Review your answers below.</Text>
              <View style={styles.bannerActions}>
                {isDrill && (
                  <TouchableOpacity
                    onPress={resetDrill}
                    style={[styles.retryButton, styles.bannerButton, styles.bannerButtonSecondary]}
                  >
                    <Text style={styles.submitHeaderText}>Try another part</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={[styles.retryButton, styles.bannerButton]}
                >
                  <Text style={styles.submitHeaderText}>Back to Home</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.instructionsCard}>
            <Text style={styles.partTitle}>{activePart.title}</Text>
            <Text style={styles.partInstructions}>
              {isDrill
                ? 'Play the recording and answer this part, then tap "Check part".'
                : 'Answer all four parts, then tap "Submit" for your score and band.'}
            </Text>
          </View>

          {activePart.questions.map((q: IeltsListeningQuestion) => {
            const result = results?.[q.question_number];
            return (
              <View key={q.question_number} style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <View style={styles.qNumRow}>
                    <View style={styles.qNumBadge}>
                      <Text style={styles.qNumText}>{q.question_number}</Text>
                    </View>
                    <Text style={styles.questionText}>{q.question_text}</Text>
                  </View>
                </View>

                {/* Multiple Choice Render */}
                {q.type === 'multiple_choice' && q.options && (
                  <View style={styles.optionsList}>
                    {q.options.map((option, oIdx) => {
                      const isSelected = userAnswers[q.question_number] === option;
                      const isThisCorrect =
                        !!result && String(result.correct_answer ?? '').trim() === option.trim();
                      let optionStyle: any = styles.optionItem;
                      if (isSelected) optionStyle = [styles.optionItem, styles.optionItemSelected];
                      if (result) {
                        if (isThisCorrect) optionStyle = [styles.optionItem, styles.optionItemCorrect];
                        else if (isSelected) optionStyle = [styles.optionItem, styles.optionItemWrong];
                      }

                      return (
                        <TouchableOpacity
                          key={oIdx}
                          onPress={() => handleAnswerChange(q.question_number, option)}
                          disabled={!!results}
                          style={optionStyle}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              isSelected && styles.optionTextSelected,
                              isThisCorrect && styles.optionTextCorrect,
                            ]}
                          >
                            {option}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* Fill in the Blank Render */}
                {q.type === 'fill_in_the_blank' && (
                  <View style={styles.fillBlankContainer}>
                    <TextInput
                      value={userAnswers[q.question_number] || ''}
                      onChangeText={(text) => handleAnswerChange(q.question_number, text)}
                      editable={!results}
                      placeholder="Type your answer here..."
                      placeholderTextColor="#777"
                      style={[
                        styles.fillBlankInput,
                        result && (result.is_correct ? styles.fillBlankCorrect : styles.fillBlankWrong),
                      ]}
                      autoCapitalize="none"
                    />
                    {result && !result.is_correct && (
                      <Text style={styles.correctAnswerHint}>
                        Correct: {result.correct_answer}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            );
          })}
          <View style={{ height: 120 }} />
        </ScrollView>

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
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Feather
                  name={isPlaying ? 'pause' : 'play'}
                  size={s(22)}
                  color="#FFFFFF"
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
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  submitHeaderText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  partTabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  partTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  partTabActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.35)',
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  partTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  partTabTextActive: {
    color: '#FFFFFF',
  },
  contentScroll: {
    flex: 1,
  },
  contentBody: {
    padding: 16,
  },
  instructionsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  partTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  partInstructions: {
    fontSize: 12,
    color: '#D1D5DB',
    marginTop: 6,
    lineHeight: 18,
  },
  questionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
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
    backgroundColor: '#8B5CF6',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qNumText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  questionText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
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
    gap: 8,
  },
  optionItem: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionItemSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.25)',
    borderColor: '#8B5CF6',
  },
  optionItemCorrect: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderColor: '#22C55E',
  },
  optionItemWrong: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: '#EF4444',
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
    color: '#4ADE80',
    fontWeight: '700',
  },
  fillBlankContainer: {
    marginTop: 4,
  },
  fillBlankInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 14,
  },
  fillBlankCorrect: {
    borderColor: '#22C55E',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  fillBlankWrong: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  correctAnswerHint: {
    color: '#4ADE80',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  bottomPlayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(20, 20, 30, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 20,
    paddingTop: 10,
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
    backgroundColor: '#8B5CF6',
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
    backgroundColor: '#8B5CF6',
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
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderWidth: 1,
    borderColor: '#8B5CF6',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  resultBannerError: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#EF4444',
  },
  resultTitle: {
    color: '#C4B5FD',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  resultScore: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 6,
  },
  resultBand: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  resultHint: {
    color: '#9CA3AF',
    fontSize: 11,
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
  },
  bannerButton: {
    alignSelf: 'flex-start',
    marginTop: 10,
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
