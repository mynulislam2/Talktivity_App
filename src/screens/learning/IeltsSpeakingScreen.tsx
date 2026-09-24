import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { Audio } from 'expo-av';
import ScreenBackground from '@/components/common/ScreenBackground';
import { useResponsive } from '@/theme/responsive';
import { extractErrorMessage } from '@/lib/auth/errorHandler';
import {
  ieltsService,
  IeltsSpeakingTest,
  IeltsTestSession,
  IeltsCompleteResponse,
} from '@/services/ielts';

type SpeakingPart = 1 | 2 | 3;

const CRITERIA = [
  { key: 'fluency_band', label: 'Fluency & Coherence' },
  { key: 'lexical_band', label: 'Lexical Resource' },
  { key: 'grammar_band', label: 'Grammatical Range & Accuracy' },
  { key: 'pronunciation_band', label: 'Pronunciation' },
] as const;

function formatBand(value: unknown): string {
  const n = Number(value);
  return value != null && value !== '' && Number.isFinite(n) ? n.toFixed(1) : '—';
}

// The agent saves a Part 1/3 call only after hang-up, so poll for it.
const POLL_INTERVAL_MS = 3000;
const POLL_ATTEMPTS = 30; // ~90s

function apiErrorCode(e: unknown): string | undefined {
  return (e as any)?.response?.data?.code;
}

export const IeltsSpeakingScreen: React.FC = () => {
  const { s } = useResponsive();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const mode: 'drill' | 'mock' = route.params?.mode === 'drill' ? 'drill' : 'mock';
  const drillPart: SpeakingPart = [1, 2, 3].includes(route.params?.part)
    ? route.params.part
    : 1;
  const plan: SpeakingPart[] = mode === 'drill' ? [drillPart] : [1, 2, 3];

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [test, setTest] = useState<IeltsSpeakingTest | null>(null);
  const [session, setSession] = useState<IeltsTestSession | null>(null);

  // Band report (POST /sessions/:id/complete)
  const [report, setReport] = useState<IeltsCompleteResponse | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const completeRequestedRef = useRef(false);

  // Waiting for the server to record a Part 1/3 call.
  const [waitingPart, setWaitingPart] = useState<SpeakingPart | null>(null);
  const [waitExpired, setWaitExpired] = useState(false);
  const awaitingPartRef = useRef<SpeakingPart | null>(null);
  const afterSavedRef = useRef<(() => void) | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollTokenRef = useRef(0);

  // Part 2 Prep & Recording States
  const [prepSecondsLeft, setPrepSecondsLeft] = useState(60);
  const [isPrepping, setIsPrepping] = useState(false);
  const [speakingSecondsLeft, setSpeakingSecondsLeft] = useState(120);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [part2Saved, setPart2Saved] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const prepTimerRef = useRef<any>(null);
  const recordingTimerRef = useRef<any>(null);
  const mountedRef = useRef(true);

  const masterSessionId = session?.id ?? null;

  const isPartDone = (part: SpeakingPart) =>
    session?.[`part${part}_status` as const] === 'completed' || (part === 2 && part2Saved);
  const currentPart = plan.find((p) => !isPartDone(p)) ?? null;
  const allPartsDone = !!session && currentPart === null;

  // Load test data and start (or resume) the session for this mode.
  const loadTest = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const tests = await ieltsService.getSpeakingTests();
      const selected = tests[0];
      if (!selected) {
        setLoadError('No IELTS Speaking test is available yet.');
        return;
      }
      setTest(selected);
      setPrepSecondsLeft(selected.part2_prep_seconds || 60);
      setSpeakingSecondsLeft(selected.part2_speaking_seconds || 120);

      const sess = await ieltsService.startTestSession({
        testSetId: selected.test_set_id,
        sessionMode: mode,
        testType: 'speaking',
        part: mode === 'drill' ? drillPart : undefined,
      });
      if (!sess?.id) {
        setLoadError('Could not start the speaking session.');
        return;
      }
      setSession(sess);
    } catch (e) {
      setLoadError(extractErrorMessage(e) || 'Failed to load the IELTS Speaking test.');
    } finally {
      setLoading(false);
    }
  }, [mode, drillPart]);

  useEffect(() => {
    loadTest();
  }, [loadTest]);

  const stopPolling = useCallback(() => {
    pollTokenRef.current += 1; // drops any in-flight check
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    pollTimerRef.current = null;
  }, []);

  // Re-read the session every 3s (up to ~90s) until part N is saved.
  const pollUntilSaved = useCallback(
    (part: SpeakingPart, afterSaved?: () => void) => {
      if (!masterSessionId) return;
      stopPolling();
      const token = pollTokenRef.current;
      awaitingPartRef.current = part;
      if (afterSaved) afterSavedRef.current = afterSaved;
      setWaitingPart(part);
      setWaitExpired(false);
      let attempts = 0;
      const check = async () => {
        attempts += 1;
        let fresh: IeltsTestSession | null = null;
        try {
          fresh = await ieltsService.getSession(masterSessionId);
        } catch {
          // Network blip: keep polling.
        }
        if (token !== pollTokenRef.current) return;
        if (fresh?.id) setSession(fresh);
        if (fresh?.[`part${part}_status` as const] === 'completed') {
          awaitingPartRef.current = null;
          setWaitingPart(null);
          const next = afterSavedRef.current;
          afterSavedRef.current = null;
          next?.();
          return;
        }
        if (attempts >= POLL_ATTEMPTS) {
          setWaitExpired(true);
          return;
        }
        pollTimerRef.current = setTimeout(check, POLL_INTERVAL_MS);
      };
      check();
    },
    [masterSessionId, stopPolling]
  );

  // Parts 1 and 3 are saved server-side after the call; on coming back from
  // the call screen, wait for that part. Polling stops on blur and unmount.
  useFocusEffect(
    useCallback(() => {
      if (!masterSessionId) return;
      if (awaitingPartRef.current) {
        pollUntilSaved(awaitingPartRef.current);
      } else {
        ieltsService
          .getSession(masterSessionId)
          .then((fresh) => {
            if (fresh?.id) setSession(fresh);
          })
          .catch(() => {});
      }
      return stopPolling;
    }, [masterSessionId, pollUntilSaved, stopPolling])
  );

  const requestReport: (isRetry?: boolean) => Promise<void> = useCallback(async (isRetry = false) => {
    if (!masterSessionId) return;
    completeRequestedRef.current = true;
    setIsCompleting(true);
    setCompleteError(null);
    try {
      const result = await ieltsService.completeTestSession(masterSessionId);
      setReport(result);
    } catch (e) {
      if (apiErrorCode(e) === 'PART_PENDING' && !isRetry) {
        // A call is still being saved: wait for it, then retry once.
        const pending =
          plan.find((p) => p !== 2 && session?.[`part${p}_status` as const] !== 'completed') ??
          plan[plan.length - 1];
        pollUntilSaved(pending, () => requestReport(true));
      } else {
        setCompleteError(extractErrorMessage(e) || 'Could not score this test.');
      }
    } finally {
      setIsCompleting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masterSessionId, session, pollUntilSaved]);

  // Every part in the plan is done: ask the server for the band report once.
  useEffect(() => {
    if (allPartsDone && !completeRequestedRef.current) {
      requestReport();
    }
  }, [allPartsDone, requestReport]);

  // Release the recorder and its audio mode if we leave mid-recording.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (prepTimerRef.current) clearTimeout(prepTimerRef.current);
      if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
      const recording = recordingRef.current;
      recordingRef.current = null;
      if (recording) {
        recording.stopAndUnloadAsync().catch(() => {});
        Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(() => {});
      }
    };
  }, []);

  // Prep Countdown Timer
  useEffect(() => {
    if (isPrepping && prepSecondsLeft > 0) {
      prepTimerRef.current = setTimeout(() => {
        setPrepSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (isPrepping && prepSecondsLeft === 0) {
      setIsPrepping(false);
      Alert.alert('Preparation time is up', 'Start speaking now. You have up to 2 minutes.');
      startRecording();
    }
    return () => {
      if (prepTimerRef.current) clearTimeout(prepTimerRef.current);
    };
  }, [isPrepping, prepSecondsLeft]);

  // Speaking Recording Countdown
  useEffect(() => {
    if (isRecording && speakingSecondsLeft > 0) {
      recordingTimerRef.current = setTimeout(() => {
        setSpeakingSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRecording && speakingSecondsLeft === 0) {
      stopRecording();
    }
    return () => {
      if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
    };
  }, [isRecording, speakingSecondsLeft]);

  const startPart1LiveCall = () => {
    awaitingPartRef.current = 1;
    navigation.navigate('PracticeScreen', {
      topicId: test?.test_set_id || 'IELTS-P1',
      topicName: `IELTS Speaking Part 1: ${test?.title || 'Everyday Topics'}`,
      ieltsMasterSessionId: masterSessionId,
      ieltsPart: 1,
      targetDurationSeconds: test?.part1_duration_seconds || 240,
      prompt: test?.part1_context_prompt || 'You are an IELTS Speaking examiner conducting Part 1.',
      firstPrompt: test?.part1_example_questions?.[0] || 'Welcome to Part 1. Can you tell me a little about yourself?',
    });
  };

  const startPart3LiveCall = async () => {
    let contextBridging = '';
    if (masterSessionId) {
      try {
        const ctx = await ieltsService.getPart3Context(masterSessionId);
        if (ctx?.part2_summary || ctx?.part2_topic) {
          contextBridging = ` Candidate Part 2 context: "${ctx.part2_summary || ctx.part2_topic}". Bridging guideline: Reference their cue card topic in your initial transition into Part 3.`;
        }
      } catch (e) {
        // Non-blocking fallback
      }
    }

    awaitingPartRef.current = 3;
    navigation.navigate('PracticeScreen', {
      topicId: test?.test_set_id || 'IELTS-P3',
      topicName: `IELTS Speaking Part 3: ${test?.part3_theme || 'Two-Way Discussion'}`,
      ieltsMasterSessionId: masterSessionId,
      ieltsPart: 3,
      targetDurationSeconds: test?.part3_duration_seconds || 240,
      prompt: `${test?.part3_context_prompt || 'You are an IELTS Speaking examiner conducting Part 3.'}${contextBridging ? `\n\n${contextBridging}` : ''}`,
      firstPrompt: test?.part3_example_questions?.[0] || 'Welcome to Part 3. Let us discuss broader themes connected with your talk.',
    });
  };

  const startPrep = () => {
    setIsPrepping(true);
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission needed', 'Microphone permission is required to record Part 2.');
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      if (!mountedRef.current) {
        // Left the screen while the recorder was starting: release it.
        recording.stopAndUnloadAsync().catch(() => {});
        Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(() => {});
        return;
      }
      recordingRef.current = recording;
      setIsPrepping(false);
      setIsRecording(true);
    } catch (err) {
      console.warn('Failed to start recording', err);
      Alert.alert('Recording failed', 'Could not start the microphone. Please try again.');
    }
  };

  const uploadPart2Audio = async (uri: string) => {
    if (!uri || !masterSessionId) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const audioKey = await ieltsService.uploadPart2Audio(uri);
      const updated = await ieltsService.savePart2Submission(masterSessionId, {
        audioKey,
        topic: test?.part2_title,
      });
      if (updated?.id) setSession(updated);
      setPart2Saved(true);
    } catch (uploadErr) {
      console.warn('Part 2 upload error:', uploadErr);
      if (apiErrorCode(uploadErr) === 'TRANSCRIPTION_FAILED') {
        // Re-sending the same audio won't help: only offer "Record again".
        setRecordingUri(null);
        setUploadError(
          extractErrorMessage(uploadErr) ||
            'We could not hear your answer in that recording. Please record again.'
        );
      } else {
        setUploadError('Your recording could not be saved. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const stopRecording = async () => {
    const recording = recordingRef.current;
    if (!recording) return;
    recordingRef.current = null;
    setIsRecording(false);
    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = recording.getURI();
      setRecordingUri(uri);
      if (uri) {
        await uploadPart2Audio(uri);
      }
    } catch (err) {
      console.warn('Failed to stop recording', err);
      setUploadError('The recording could not be finished. Please record again.');
    }
  };

  const resetPart2 = () => {
    setUploadError(null);
    setRecordingUri(null);
    setSpeakingSecondsLeft(test?.part2_speaking_seconds || 120);
    setPrepSecondsLeft(test?.part2_prep_seconds || 60);
  };

  const renderHeader = (title: string, subtitle?: string) => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Feather name="arrow-left" size={s(20)} color="#FFFFFF" />
      </TouchableOpacity>
      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );

  if (loading) {
    return (
      <ScreenBackground>
        <SafeAreaView style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading IELTS Speaking Test...</Text>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  if (loadError || !test || !session) {
    return (
      <ScreenBackground>
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
          {renderHeader('IELTS Speaking')}
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>
              {loadError || 'Failed to load the IELTS Speaking test.'}
            </Text>
            <TouchableOpacity onPress={loadTest} style={[styles.actionButton, styles.retryButton]}>
              <Feather name="refresh-cw" size={s(16)} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.actionButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  const subtitle =
    mode === 'drill' ? `Part ${drillPart} drill` : 'Speaking mock test: Parts 1, 2 and 3';
  const reportBands = { ...session, ...(report ?? {}), ...(report?.report ?? {}) } as Record<string, unknown>;
  const feedback = report?.report?.feedback;
  const feedbackItems = Array.isArray(feedback) ? feedback : feedback ? [feedback] : [];
  // While a call is being saved, hide its "start call" card (back after "Check again" expires).
  const waiting = waitingPart !== null && !waitExpired;

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        {renderHeader(test.title, subtitle)}

        {/* Step Indicator (mock runs Parts 1 → 2 → 3) */}
        {mode === 'mock' && (
          <View style={styles.stepperContainer}>
            {([1, 2, 3] as const).map((p, idx) => (
              <React.Fragment key={p}>
                {idx > 0 && <View style={styles.stepDivider} />}
                <View style={styles.stepItem}>
                  <Text
                    style={[
                      styles.stepNum,
                      (currentPart === p || isPartDone(p)) && styles.stepNumActive,
                    ]}
                  >
                    {isPartDone(p) ? '✓' : p}
                  </Text>
                  <Text style={[styles.stepLabel, currentPart === p && styles.stepLabelActive]}>
                    {p === 1 ? 'Part 1' : p === 2 ? 'Part 2' : 'Part 3'}
                  </Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        )}

        <ScrollView style={styles.contentScroll} contentContainerStyle={styles.contentBody}>
          {/* Waiting for a Part 1/3 call to be saved */}
          {waitingPart !== null && (
            <View style={[styles.timerDisplayBox, { marginBottom: 16 }]}>
              {waitExpired ? (
                <>
                  <Text style={styles.timerLabel}>
                    Your Part {waitingPart} answers haven't arrived yet.
                  </Text>
                  <TouchableOpacity
                    onPress={() => pollUntilSaved(waitingPart)}
                    style={[styles.prepButton, { marginTop: 8, flex: 0, paddingHorizontal: 20 }]}
                  >
                    <Feather name="refresh-cw" size={s(16)} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.actionButtonText}>Check again</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <ActivityIndicator size="small" color="#8B5CF6" style={{ marginBottom: 8 }} />
                  <Text style={styles.timerLabel}>Saving your Part {waitingPart} answers…</Text>
                </>
              )}
            </View>
          )}

          {/* Band report */}
          {allPartsDone && (
            <View style={styles.partCard}>
              <View style={styles.badgeRow}>
                <Feather name="award" size={s(16)} color="#8B5CF6" />
                <Text style={styles.partBadgeText}>Estimated band report</Text>
              </View>
              {isCompleting ? (
                <View style={styles.timerDisplayBox}>
                  <ActivityIndicator size="small" color="#8B5CF6" style={{ marginBottom: 8 }} />
                  <Text style={styles.timerLabel}>Scoring your answers…</Text>
                </View>
              ) : completeError ? (
                <View style={styles.timerDisplayBox}>
                  <Text style={[styles.timerLabel, { color: '#F87171' }]}>{completeError}</Text>
                  <TouchableOpacity onPress={() => requestReport()} style={[styles.prepButton, { marginTop: 8 }]}>
                    <Feather name="refresh-cw" size={s(16)} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.actionButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : report ? (
                <>
                  <Text style={styles.partHeading}>
                    Overall band {formatBand(reportBands.overall_band)}
                  </Text>
                  {CRITERIA.map((c) => (
                    <View key={c.key} style={styles.criterionRow}>
                      <Text style={styles.bulletText}>{c.label}</Text>
                      <Text style={styles.criterionBand}>{formatBand(reportBands[c.key])}</Text>
                    </View>
                  ))}
                  {feedbackItems.length > 0 && (
                    <View style={[styles.topicsPreviewCard, { marginTop: 12 }]}>
                      <Text style={styles.previewTitle}>Feedback</Text>
                      {feedbackItems.map((f, idx) => (
                        <Text key={idx} style={[styles.bulletText, { marginTop: 3 }]}>{f}</Text>
                      ))}
                    </View>
                  )}
                  <Text style={[styles.timerHint, { marginTop: 8 }]}>
                    Estimated by AI from this practice session. It is not an official IELTS score.
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[styles.actionButton, { marginTop: 16 }]}
                  >
                    <Text style={styles.actionButtonText}>Back to Home</Text>
                  </TouchableOpacity>
                </>
              ) : null}
            </View>
          )}

          {/* Part 1 Screen */}
          {currentPart === 1 && !waiting && (
            <View style={styles.partCard}>
              <View style={styles.badgeRow}>
                <Feather name="mic" size={s(16)} color="#8B5CF6" />
                <Text style={styles.partBadgeText}>Part 1: Introduction & Interview</Text>
              </View>
              <Text style={styles.partHeading}>Familiar Everyday Topics</Text>
              <Text style={styles.partDescription}>
                You will speak with an AI examiner about everyday topics (home, work, studies, interests). Keep your answers natural and direct (2-3 sentences per answer).
              </Text>

              <View style={styles.topicsPreviewCard}>
                <Text style={styles.previewTitle}>Example Questions:</Text>
                {(test.part1_example_questions ?? []).map((q: string, idx: number) => (
                  <View key={idx} style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{q}</Text>
                  </View>
                ))}
                {!!test.part1_theme && (
                  <Text style={[styles.previewTitle, { marginTop: 8 }]}>Theme: {test.part1_theme}</Text>
                )}
              </View>

              <TouchableOpacity onPress={startPart1LiveCall} style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Start Live Part 1 Call (~4 mins)</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Part 2 Cue Card Screen */}
          {currentPart === 2 && (
            <View style={styles.partCard}>
              <View style={styles.badgeRow}>
                <Feather name="file-text" size={s(16)} color="#8B5CF6" />
                <Text style={styles.partBadgeText}>Part 2: Individual Long Turn</Text>
              </View>

              {/* Cue Card Frame */}
              <View style={styles.cueCardBox}>
                <Text style={styles.cueCardTopic}>{test.part2_title || 'Cue Card Topic'}</Text>
                <Text style={styles.cueCardSubtitle}>You should say:</Text>
                {(test.part2_bullet_points ?? []).map((b: string, idx: number) => (
                  <View key={idx} style={styles.cueBulletRow}>
                    <Text style={styles.cueBulletDot}>-</Text>
                    <Text style={styles.cueBulletText}>{b}</Text>
                  </View>
                ))}
                {!!test.part2_preparation_hint && (
                  <Text style={[styles.timerHint, { marginTop: 10 }]}>
                    💡 {test.part2_preparation_hint}
                  </Text>
                )}
              </View>

              {/* Prep Timer & Monologue Status */}
              <View style={styles.timerSection}>
                {isPrepping ? (
                  <View style={styles.timerDisplayBox}>
                    <Text style={styles.timerLabel}>Preparation Time Remaining:</Text>
                    <Text style={styles.timerDigits}>{prepSecondsLeft}s</Text>
                    <Text style={styles.timerHint}>Jot down ideas and keywords in your mind</Text>
                  </View>
                ) : isRecording ? (
                  <View style={styles.recordingDisplayBox}>
                    <View style={styles.redRecordingDot} />
                    <Text style={styles.timerLabel}>Recording Monologue...</Text>
                    <Text style={styles.timerDigits}>{speakingSecondsLeft}s</Text>
                    <TouchableOpacity onPress={stopRecording} style={styles.stopButton}>
                      <Text style={styles.stopButtonText}>Finish Early</Text>
                    </TouchableOpacity>
                  </View>
                ) : isUploading ? (
                  <View style={styles.timerDisplayBox}>
                    <ActivityIndicator size="small" color="#8B5CF6" style={{ marginBottom: 8 }} />
                    <Text style={styles.timerLabel}>Saving your recording...</Text>
                  </View>
                ) : uploadError ? (
                  <View style={styles.timerDisplayBox}>
                    <Text style={[styles.timerLabel, { color: '#F87171' }]}>{uploadError}</Text>
                    {recordingUri ? (
                      <TouchableOpacity
                        onPress={() => uploadPart2Audio(recordingUri)}
                        style={[styles.prepButton, { marginTop: 8 }]}
                      >
                        <Feather name="refresh-cw" size={s(16)} color="#FFFFFF" style={{ marginRight: 6 }} />
                        <Text style={styles.actionButtonText}>Retry upload</Text>
                      </TouchableOpacity>
                    ) : null}
                    <TouchableOpacity onPress={resetPart2} style={{ marginTop: 10 }}>
                      <Text style={styles.skipPrepText}>Record again</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.prepActionRow}>
                    <TouchableOpacity onPress={startPrep} style={styles.prepButton}>
                      <Text style={styles.prepButtonText}>Start 1-Min Prep</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={startRecording} style={styles.skipPrepButton}>
                      <Text style={styles.skipPrepText}>Skip Prep & Record</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Part 3 Screen */}
          {currentPart === 3 && !waiting && (
            <View style={styles.partCard}>
              <View style={styles.badgeRow}>
                <Feather name="message-circle" size={s(16)} color="#8B5CF6" />
                <Text style={styles.partBadgeText}>Part 3: Two-Way Discussion</Text>
              </View>
              <Text style={styles.partHeading}>Abstract & Societal Topics</Text>
              <Text style={styles.partDescription}>
                The AI examiner will ask deeper, analytical questions connected to your Part 2 topic. Provide reasons, examples, and consider multiple perspectives.
              </Text>

              <TouchableOpacity onPress={startPart3LiveCall} style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Start Live Part 3 Discussion (~4 mins)</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
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
  loadingText: {
    color: '#A0A0A0',
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 6,
  },
  headerTitleContainer: {
    marginLeft: 10,
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
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  stepItem: {
    alignItems: 'center',
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '700',
    fontSize: 12,
  },
  stepNumActive: {
    backgroundColor: '#8B5CF6',
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  stepLabelActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  stepDivider: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 12,
    marginBottom: 16,
  },
  contentScroll: {
    flex: 1,
  },
  contentBody: {
    padding: 16,
  },
  partCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  partBadgeText: {
    color: '#8B5CF6',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  partHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  partDescription: {
    fontSize: 13,
    color: '#D1D5DB',
    lineHeight: 20,
    marginBottom: 16,
  },
  topicsPreviewCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 6,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  bulletDot: {
    color: '#8B5CF6',
    marginRight: 6,
    fontSize: 14,
  },
  bulletText: {
    color: '#E5E7EB',
    fontSize: 13,
  },
  cueCardBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
    marginBottom: 20,
  },
  cueCardTopic: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  cueCardSubtitle: {
    fontSize: 13,
    color: '#A0A0A0',
    marginBottom: 6,
  },
  cueBulletRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  cueBulletDot: {
    color: '#8B5CF6',
    marginRight: 8,
    fontWeight: '700',
  },
  cueBulletText: {
    color: '#FFFFFF',
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  timerSection: {
    marginTop: 8,
  },
  timerDisplayBox: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  recordingDisplayBox: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  redRecordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
    marginBottom: 8,
  },
  timerLabel: {
    fontSize: 12,
    color: '#D1D5DB',
  },
  timerDigits: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'monospace',
    marginVertical: 4,
  },
  timerHint: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  prepActionRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  prepButton: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  prepButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  skipPrepButton: {
    flex: 1,
    height: 44,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipPrepText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  stopButton: {
    marginTop: 10,
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  stopButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  actionButton: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  errorText: {
    color: '#F87171',
    fontSize: 14,
    textAlign: 'center',
    marginHorizontal: 24,
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
  },
  criterionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  criterionBand: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
export default IeltsSpeakingScreen;
