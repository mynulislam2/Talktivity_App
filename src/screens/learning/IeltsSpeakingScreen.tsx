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
} from '@/services/ielts';
import {
  IeltsHeader,
  IeltsPillTabs,
  IeltsButton,
  IeltsTabItem,
} from '@/components/ielts';

type SpeakingPart = 1 | 2 | 3;

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

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [test, setTest] = useState<IeltsSpeakingTest | null>(null);
  const [session, setSession] = useState<IeltsTestSession | null>(null);

  // Band report (POST /sessions/:id/complete)
  const [isCompleting, setIsCompleting] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);

  // Waiting for server to record Part 1/3 call
  const [waitingPart, setWaitingPart] = useState<SpeakingPart | null>(null);
  const [waitExpired, setWaitExpired] = useState(false);
  const awaitingPartRef = useRef<SpeakingPart | null>(null);
  const afterSavedRef = useRef<(() => void) | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollTokenRef = useRef(0);
  const callStartTimeRef = useRef<number | null>(null);
  const [part1Attempted, setPart1Attempted] = useState(false);
  const [part3Attempted, setPart3Attempted] = useState(false);

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
  const playbackSoundRef = useRef<Audio.Sound | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const prepTimerRef = useRef<any>(null);
  const recordingTimerRef = useRef<any>(null);
  const mountedRef = useRef(true);

  const masterSessionId = session?.id ?? null;

  const requestedPart = route.params?.part ? (route.params.part as SpeakingPart) : 1;
  const [currentPart, setCurrentPart] = useState<SpeakingPart>(requestedPart);

  const isPartDone = (part: SpeakingPart) =>
    session?.[`part${part}_status` as const] === 'completed' || (part === 2 && part2Saved);

  // Load test data and start (or resume) the session for this mode.
  const loadTest = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const tests = await ieltsService.getSpeakingTests(mode);
      const selected =
        (route.params?.testSetId
          ? tests.find((t) => t.test_set_id === route.params.testSetId)
          : null) || tests[0];
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
      });
      if (!sess?.id) {
        setLoadError('Could not start the speaking session.');
        return;
      }
      setSession(sess);
      if (sess.part2_status === 'completed') setPart2Saved(true);
      const p1Duration = selected.part1_duration_seconds || 240;
      const part1Done =
        ((sess as any)?.part1_elapsed_seconds || 0) >= Math.max(30, p1Duration - 20);
      if (!route.params?.part) {
        if (!part1Done) setCurrentPart(1);
        else if (sess.part2_status !== 'completed') setCurrentPart(2);
        else setCurrentPart(3);
      }
    } catch (e) {
      setLoadError(extractErrorMessage(e) || 'Failed to load the IELTS Speaking test.');
    } finally {
      setLoading(false);
    }
  }, [mode, route.params?.part, route.params?.testSetId]);

  useEffect(() => {
    loadTest();
  }, [loadTest]);

  const stopPolling = useCallback(() => {
    pollTokenRef.current += 1;
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    pollTimerRef.current = null;
  }, []);

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
        } catch {}
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

  const requestReport = useCallback(
    async (isRetry = false) => {
      if (!masterSessionId) return;
      setIsCompleting(true);
      setCompleteError(null);
      try {
        const existing = await ieltsService.getSession(masterSessionId);
        if (existing?.overall_status === 'completed') {
          navigation.replace('TodaysReportScreen', { track: mode });
          return;
        }
        await ieltsService.completeTestSession(masterSessionId);
        navigation.replace('TodaysReportScreen', { track: mode });
      } catch (e) {
        if (apiErrorCode(e) === 'PART_PENDING' && !isRetry) {
          pollUntilSaved(3, () => void requestReport(true));
        } else {
          setCompleteError(extractErrorMessage(e) || 'Could not score this test.');
        }
      } finally {
        setIsCompleting(false);
      }
    },
    [masterSessionId, mode, navigation, pollUntilSaved]
  );

  useFocusEffect(
    useCallback(() => {
      if (!masterSessionId) return;

      if (awaitingPartRef.current === 1) {
        awaitingPartRef.current = null;
        setPart1Attempted(true);

        const startTime = callStartTimeRef.current;
        callStartTimeRef.current = null;
        const callElapsed = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
        const targetDuration = test?.part1_duration_seconds || 240;
        const isTimeFinished = callElapsed >= Math.max(30, targetDuration - 20);

        if (isTimeFinished) {
          setCurrentPart(2);
        } else {
          setCurrentPart(1);
        }

        ieltsService
          .getSession(masterSessionId)
          .then((fresh) => {
            if (fresh?.id) {
              setSession(fresh);
              if (fresh.part2_status === 'completed') setPart2Saved(true);
              const totalElapsed = (fresh as any).part1_elapsed_seconds || 0;
              if (totalElapsed >= Math.max(30, targetDuration - 20)) {
                setCurrentPart(2);
              }
            }
          })
          .catch(() => {});
      } else if (awaitingPartRef.current === 3) {
        awaitingPartRef.current = null;
        setPart3Attempted(true);

        const startTime = callStartTimeRef.current;
        callStartTimeRef.current = null;
        const callElapsed = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
        const targetDuration = test?.part3_duration_seconds || 240;
        const isTimeFinished = callElapsed >= Math.max(30, targetDuration - 20);

        if (isTimeFinished) {
          void requestReport(false);
        } else {
          setCurrentPart(3);
        }

        ieltsService
          .getSession(masterSessionId)
          .then((fresh) => {
            if (fresh?.id) {
              setSession(fresh);
            }
          })
          .catch(() => {});
      }

      return () => {
        stopPolling();
      };
    }, [masterSessionId, requestReport, stopPolling, test])
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (prepTimerRef.current) clearInterval(prepTimerRef.current);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (playbackSoundRef.current) {
        playbackSoundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, []);

  // Prep timer countdown
  useEffect(() => {
    if (isPrepping) {
      prepTimerRef.current = setInterval(() => {
        setPrepSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(prepTimerRef.current);
            void startRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (prepTimerRef.current) clearInterval(prepTimerRef.current);
    }
    return () => {
      if (prepTimerRef.current) clearInterval(prepTimerRef.current);
    };
  }, [isPrepping]);

  // Speaking timer countdown
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setSpeakingSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(recordingTimerRef.current);
            void stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecording]);

  const startPart1LiveCall = () => {
    if (!masterSessionId) return;
    callStartTimeRef.current = Date.now();
    awaitingPartRef.current = 1;
    navigation.navigate('PracticeScreen', {
      topicId: test?.test_set_id || 'IELTS-P1',
      topicName: `IELTS Speaking Part 1: ${test?.title || 'Everyday Topics'}`,
      ieltsMasterSessionId: masterSessionId,
      ieltsPart: 1,
      targetDurationSeconds: test?.part1_duration_seconds || 240,
      prompt: test?.part1_context_prompt || 'You are an IELTS Speaking examiner conducting Part 1.',
      firstPrompt:
        test?.part1_example_questions?.[0] || 'Hello! Welcome to your IELTS Speaking test.',
    });
  };

  const startPart3LiveCall = async () => {
    if (!masterSessionId) return;
    let contextBridging = '';
    if (masterSessionId) {
      try {
        const ctx = await ieltsService.getPart3Context(masterSessionId);
        if (ctx?.part2_summary || ctx?.part2_topic) {
          contextBridging = ` Candidate Part 2 context: "${ctx.part2_summary || ctx.part2_topic}". Bridging guideline: Reference their cue card topic in your initial transition into Part 3.`;
        }
      } catch (e) {}
    }

    callStartTimeRef.current = Date.now();
    awaitingPartRef.current = 3;
    navigation.navigate('PracticeScreen', {
      topicId: test?.test_set_id || 'IELTS-P3',
      topicName: `IELTS Speaking Part 3: ${test?.part3_theme || 'Two-Way Discussion'}`,
      ieltsMasterSessionId: masterSessionId,
      ieltsPart: 3,
      targetDurationSeconds: test?.part3_duration_seconds || 240,
      prompt: `${test?.part3_context_prompt || 'You are an IELTS Speaking examiner conducting Part 3.'}${contextBridging ? `\n\n${contextBridging}` : ''}`,
      firstPrompt:
        test?.part3_example_questions?.[0] ||
        'Welcome to Part 3. Let us discuss broader themes connected with your talk.',
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
    if (!recordingRef.current) return;
    setIsRecording(false);
    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      if (uri) {
        setRecordingUri(uri);
        await uploadPart2Audio(uri);
      }
    } catch (err) {
      console.warn('Failed to stop recording', err);
      setUploadError('Failed to save audio recording.');
    }
  };

  const togglePreviewAudio = async () => {
    if (!recordingUri) return;
    try {
      if (playbackSoundRef.current) {
        if (isPlayingPreview) {
          await playbackSoundRef.current.pauseAsync();
          setIsPlayingPreview(false);
        } else {
          await playbackSoundRef.current.playAsync();
          setIsPlayingPreview(true);
        }
      } else {
        const { sound } = await Audio.Sound.createAsync(
          { uri: recordingUri },
          { shouldPlay: true },
          (status) => {
            if (status.isLoaded) {
              if (status.didJustFinish) {
                setIsPlayingPreview(false);
              }
            }
          }
        );
        playbackSoundRef.current = sound;
        setIsPlayingPreview(true);
      }
    } catch {}
  };

  const resetPart2 = () => {
    if (playbackSoundRef.current) {
      playbackSoundRef.current.unloadAsync().catch(() => {});
      playbackSoundRef.current = null;
    }
    setIsPlayingPreview(false);
    setPart2Saved(false);
    setRecordingUri(null);
    setUploadError(null);
    setPrepSecondsLeft(test?.part2_prep_seconds || 60);
    setSpeakingSecondsLeft(test?.part2_speaking_seconds || 120);
  };

  const headerTitle = mode === 'drill' ? 'IELTS Speaking Drill' : 'IELTS Speaking Mock';
  const isFinalizing = isCompleting || waitingPart === 3 || !!completeError;

  const tabs: IeltsTabItem[] = [
    { id: 1, label: 'Part 1', isCompleted: isPartDone(1) },
    { id: 2, label: 'Part 2', isCompleted: isPartDone(2) },
    { id: 3, label: 'Part 3', isCompleted: isPartDone(3) },
  ];

  if (loading || loadError || !test) {
    return (
      <ScreenBackground>
        <SafeAreaView style={styles.centerContainer} edges={['top', 'bottom']}>
          <IeltsHeader title={headerTitle} onBack={() => navigation.goBack()} />
          <View style={styles.stateCenter}>
            {loading ? (
              <>
                <ActivityIndicator size="large" color="#7856FF" />
                <Text style={styles.loadingText}>Loading IELTS Speaking Test...</Text>
              </>
            ) : (
              <>
                <Text style={styles.errorText}>
                  {loadError || 'No IELTS speaking test is available yet.'}
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
        {/* Top Header */}
        <IeltsHeader title={headerTitle} onBack={() => navigation.goBack()} />

        {/* Step Progress Pill Tabs (1 → 2 → 3) */}
        {!isFinalizing && (
          <IeltsPillTabs
            tabs={tabs}
            activeId={currentPart}
            onSelect={(id) => setCurrentPart(id as SpeakingPart)}
          />
        )}

        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.contentBody}
          showsVerticalScrollIndicator={false}
        >
          {/* Finalizing / Scoring State */}
          {isFinalizing && (
            <View style={styles.cardContainer}>
              {isCompleting || waitingPart === 3 ? (
                <View style={styles.finalizingBox}>
                  <ActivityIndicator size="large" color="#7856FF" style={{ marginBottom: 14 }} />
                  <Text style={styles.finalizingHeading}>Finalizing Speaking Test</Text>
                  <Text style={styles.finalizingSub}>
                    {waitingPart === 3
                      ? 'Uploading conversation audio and saving transcripts…'
                      : 'Scoring your test across Fluency, Vocabulary, Grammar & Pronunciation…'}
                  </Text>
                  <Text style={styles.finalizingHint}>
                    You will be automatically redirected to Today's Report momentarily.
                  </Text>
                </View>
              ) : completeError ? (
                <View style={styles.errorBox}>
                  <Feather name="alert-circle" size={s(20)} color="#F87171" style={{ marginBottom: 8 }} />
                  <Text style={styles.errorBoxText}>{completeError}</Text>
                  <View style={styles.errorButtonRow}>
                    <IeltsButton
                      variant="secondary"
                      onPress={() => navigation.goBack()}
                      style={{ flex: 1 }}
                    >
                      Back to Home
                    </IeltsButton>
                    <IeltsButton
                      variant="secondary"
                      onPress={() => {
                        setCompleteError(null);
                        setCurrentPart(3);
                        void startPart3LiveCall();
                      }}
                      style={{ flex: 1 }}
                      icon={<Feather name="rotate-ccw" size={s(14)} color="#FFFFFF" />}
                    >
                      Retake Part 3
                    </IeltsButton>
                    <IeltsButton
                      variant="primary"
                      onPress={() => requestReport(true)}
                      style={{ flex: 1 }}
                      icon={<Feather name="refresh-cw" size={s(14)} color="#FFFFFF" />}
                    >
                      Retry
                    </IeltsButton>
                  </View>
                </View>
              ) : null}
            </View>
          )}

          {/* Part 1 Content Card */}
          {!isFinalizing && currentPart === 1 && (
            <View style={styles.cardContainer}>
              <View style={styles.badgeRow}>
                <View style={styles.badgeTag}>
                  <Feather name="mic" size={s(15)} color="#C55DFE" style={{ marginRight: 6 }} />
                  <Text style={styles.badgeTagText}>PART 1</Text>
                </View>
                <View style={styles.durationPill}>
                  <Text style={styles.durationPillText}>
                    ~{Math.round((test.part1_duration_seconds || 240) / 60)} mins
                  </Text>
                </View>
              </View>

              <Text style={styles.partCardHeading}>Familiar Everyday Topics</Text>
              <Text style={styles.partCardDesc}>
                You will speak with an AI examiner about everyday topics (work, study, hometown,
                hobbies). Answer in 2-3 natural sentences per question.
              </Text>

              {(test.part1_example_questions?.length ?? 0) > 0 && (
                <View style={styles.sampleQuestionsBox}>
                  <Text style={styles.sampleQuestionsLabel}>SAMPLE QUESTIONS</Text>
                  {test.part1_example_questions!.map((q: string, idx: number) => (
                    <View key={idx} style={styles.sampleBulletRow}>
                      <Text style={styles.sampleBulletDot}>•</Text>
                      <Text style={styles.sampleBulletText}>{q}</Text>
                    </View>
                  ))}
                  {!!test.part1_theme && (
                    <Text style={styles.themeNote}>Theme: {test.part1_theme}</Text>
                  )}
                </View>
              )}

              {part1Attempted || ((session as any)?.part1_elapsed_seconds || 0) > 0 ? (
                <View style={styles.actionBtnGroup}>
                  <IeltsButton
                    variant="primary"
                    onPress={startPart1LiveCall}
                    icon={<Feather name="rotate-ccw" size={s(14)} color="#FFFFFF" />}
                  >
                    Retake Part 1
                  </IeltsButton>
                  <TouchableOpacity
                    onPress={() => setCurrentPart(2)}
                    style={styles.continueLink}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.continueLinkText}>Continue to Part 2</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <IeltsButton
                  variant="primary"
                  onPress={startPart1LiveCall}
                  icon={<Feather name="mic" size={s(15)} color="#FFFFFF" />}
                >
                  Start Part 1 Call
                </IeltsButton>
              )}
            </View>
          )}

          {/* Part 2 Cue Card Content Card */}
          {!isFinalizing && currentPart === 2 && (
            <View style={styles.cardContainer}>
              <View style={styles.badgeRow}>
                <View style={styles.badgeTag}>
                  <Feather name="file-text" size={s(15)} color="#C55DFE" style={{ marginRight: 6 }} />
                  <Text style={styles.badgeTagText}>PART 2</Text>
                </View>
                <View style={styles.durationPill}>
                  <Text style={styles.durationPillText}>1m prep + 2m speech</Text>
                </View>
              </View>

              {/* Cue Card Frame */}
              <View style={styles.cueCardBox}>
                <Text style={styles.cueCardTopic}>
                  {test.part2_title || test.part2_cue_card?.topic || 'Describe an important decision'}
                </Text>
                <Text style={styles.cueCardSub}>You should say:</Text>
                {(
                  test.part2_bullet_points ||
                  test.part2_cue_card?.bullets || [
                    'What the decision was',
                    'When you made it',
                    'Why it was difficult',
                    'And explain what you learned from it',
                  ]
                ).map((b: string, idx: number) => (
                  <View key={idx} style={styles.cueBulletRow}>
                    <Text style={styles.cueBulletDot}>•</Text>
                    <Text style={styles.cueBulletText}>{b}</Text>
                  </View>
                ))}
                {!!test.part2_preparation_hint && (
                  <Text style={styles.cueHint}>💡 {test.part2_preparation_hint}</Text>
                )}
              </View>

              {/* Prep & Monologue Box */}
              <View style={styles.timerSection}>
                {isPrepping ? (
                  <View style={styles.prepDisplayBox}>
                    <Text style={styles.timerSubLabel}>Preparation Time Remaining</Text>
                    <Text style={styles.prepDigits}>{prepSecondsLeft}s</Text>
                    <Text style={styles.timerSubHint}>
                      Think of key ideas, examples, and linking words
                    </Text>
                  </View>
                ) : isRecording ? (
                  <View style={styles.recordingDisplayBox}>
                    <View style={styles.recStatusRow}>
                      <View style={styles.redPulsingDot} />
                      <Text style={styles.recordingStatusText}>Recording Your Monologue...</Text>
                    </View>
                    <Text style={styles.recordingDigits}>{speakingSecondsLeft}s</Text>
                    <TouchableOpacity
                      onPress={stopRecording}
                      style={styles.stopRecordingBtn}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.stopRecordingText}>Finish Monologue Early</Text>
                    </TouchableOpacity>
                  </View>
                ) : isUploading ? (
                  <View style={styles.uploadingBox}>
                    <ActivityIndicator size="small" color="#8B5CF6" style={{ marginBottom: 8 }} />
                    <Text style={styles.uploadingText}>Uploading monologue...</Text>
                  </View>
                ) : uploadError ? (
                  <View style={styles.uploadErrorBox}>
                    <Feather name="alert-circle" size={s(16)} color="#F87171" style={{ marginBottom: 6 }} />
                    <Text style={styles.uploadErrorText}>{uploadError}</Text>
                    {recordingUri ? (
                      <IeltsButton
                        variant="primary"
                        onPress={() => uploadPart2Audio(recordingUri)}
                        style={{ marginTop: 10 }}
                        icon={<Feather name="refresh-cw" size={s(14)} color="#FFFFFF" />}
                      >
                        Retry Upload
                      </IeltsButton>
                    ) : null}
                    <TouchableOpacity onPress={resetPart2} style={{ marginTop: 12 }}>
                      <Text style={styles.retakeLinkText}>Retake Part 2</Text>
                    </TouchableOpacity>
                  </View>
                ) : isPartDone(2) ? (
                  <View style={styles.completedBox}>
                    <View style={styles.completedBadgePill}>
                      <Feather name="check-circle" size={s(14)} color="#34D399" style={{ marginRight: 6 }} />
                      <Text style={styles.completedBadgeText}>
                        Part 2 Monologue Recorded & Uploaded
                      </Text>
                    </View>

                    {recordingUri && (
                      <TouchableOpacity
                        onPress={togglePreviewAudio}
                        style={styles.previewAudioCard}
                        activeOpacity={0.8}
                      >
                        <Feather
                          name={isPlayingPreview ? 'pause' : 'volume-2'}
                          size={s(16)}
                          color="#C4B5FD"
                          style={{ marginRight: 8 }}
                        />
                        <Text style={styles.previewAudioText}>
                          {isPlayingPreview ? 'Pause recording preview' : 'Review your recording'}
                        </Text>
                      </TouchableOpacity>
                    )}

                    <View style={styles.part2DoneActionsRow}>
                      <IeltsButton
                        variant="primary"
                        onPress={() => setCurrentPart(3)}
                        style={{ flex: 1.2 }}
                        icon={<Feather name="arrow-right" size={s(16)} color="#FFFFFF" />}
                        iconPosition="right"
                      >
                        Go to Part 3
                      </IeltsButton>
                      <IeltsButton
                        variant="secondary"
                        onPress={resetPart2}
                        style={{ flex: 0.9 }}
                        icon={<Feather name="rotate-ccw" size={s(14)} color="#C4B5FD" />}
                      >
                        Retake Part 2
                      </IeltsButton>
                    </View>
                  </View>
                ) : (
                  <View style={styles.prepActionRow}>
                    <IeltsButton
                      variant="primary"
                      onPress={startPrep}
                      style={{ flex: 1 }}
                    >
                      Start 1-Min Prep
                    </IeltsButton>
                    <IeltsButton
                      variant="secondary"
                      onPress={startRecording}
                      style={{ flex: 1 }}
                    >
                      Skip Prep & Record
                    </IeltsButton>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Part 3 Content Card */}
          {!isFinalizing && currentPart === 3 && (
            <View style={styles.cardContainer}>
              <View style={styles.badgeRow}>
                <View style={styles.badgeTag}>
                  <Feather
                    name="message-circle"
                    size={s(15)}
                    color="#C55DFE"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.badgeTagText}>PART 3</Text>
                </View>
                <View style={styles.durationPill}>
                  <Text style={styles.durationPillText}>
                    ~{Math.round((test.part3_duration_seconds || 240) / 60)} mins
                  </Text>
                </View>
              </View>

              <Text style={styles.partCardHeading}>Abstract & Societal Topics</Text>
              <Text style={styles.partCardDesc}>
                The AI examiner will explore broader, abstract themes connected to the Part 2
                topic. State clear opinions with supporting reasons and examples.
              </Text>

              {part3Attempted || ((session as any)?.part3_elapsed_seconds || 0) > 0 ? (
                <View style={styles.part3ActionsRow}>
                  <IeltsButton
                    variant="secondary"
                    onPress={startPart3LiveCall}
                    style={{ flex: 1 }}
                    icon={<Feather name="rotate-ccw" size={s(14)} color="#C4B5FD" />}
                  >
                    Retake Part 3
                  </IeltsButton>
                  <IeltsButton
                    variant="success"
                    onPress={() => requestReport(false)}
                    style={{ flex: 1 }}
                    icon={<Feather name="arrow-right" size={s(16)} color="#FFFFFF" />}
                    iconPosition="right"
                  >
                    Finish & Score
                  </IeltsButton>
                </View>
              ) : (
                <IeltsButton
                  variant="primary"
                  onPress={startPart3LiveCall}
                  icon={<Feather name="mic" size={s(15)} color="#FFFFFF" />}
                >
                  Start Part 3 Call
                </IeltsButton>
              )}
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
  contentScroll: {
    flex: 1,
  },
  contentBody: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },
  cardContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 18,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  badgeTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeTagText: {
    color: '#C55DFE',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  durationPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 9999,
    backgroundColor: 'rgba(120, 86, 255, 0.2)',
  },
  durationPillText: {
    color: '#C55DFE',
    fontSize: 11,
    fontWeight: '600',
  },
  partCardHeading: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  partCardDesc: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },
  sampleQuestionsBox: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 14,
    marginBottom: 18,
  },
  sampleQuestionsLabel: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  sampleBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  sampleBulletDot: {
    color: '#7856FF',
    fontSize: 14,
    fontWeight: '700',
    marginRight: 8,
    marginTop: -1,
  },
  sampleBulletText: {
    color: '#E5E7EB',
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  themeNote: {
    color: '#C4B5FD',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  actionBtnGroup: {
    gap: 10,
  },
  continueLink: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  continueLinkText: {
    color: '#C4B5FD',
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  cueCardBox: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    padding: 16,
    marginBottom: 16,
  },
  cueCardTopic: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 22,
  },
  cueCardSub: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
  },
  cueBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  cueBulletDot: {
    color: '#7856FF',
    fontSize: 14,
    fontWeight: '700',
    marginRight: 8,
    marginTop: -1,
  },
  cueBulletText: {
    color: '#E5E7EB',
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  cueHint: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 12,
    marginTop: 10,
    lineHeight: 18,
  },
  timerSection: {
    marginTop: 4,
  },
  prepDisplayBox: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(120, 86, 255, 0.4)',
    backgroundColor: 'rgba(120, 86, 255, 0.1)',
  },
  timerSubLabel: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  prepDigits: {
    color: '#C55DFE',
    fontSize: 36,
    fontWeight: '700',
    fontFamily: 'monospace',
    marginVertical: 4,
  },
  timerSubHint: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
  },
  recordingDisplayBox: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  recStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  redPulsingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
  recordingStatusText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '700',
  },
  recordingDigits: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '700',
    fontFamily: 'monospace',
    marginVertical: 4,
  },
  stopRecordingBtn: {
    marginTop: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#DC2626',
  },
  stopRecordingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  uploadingBox: {
    alignItems: 'center',
    padding: 18,
  },
  uploadingText: {
    color: '#C4B5FD',
    fontSize: 13,
    fontWeight: '500',
  },
  uploadErrorBox: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.35)',
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
  },
  uploadErrorText: {
    color: '#FDA4AF',
    fontSize: 13,
    textAlign: 'center',
  },
  retakeLinkText: {
    color: '#C4B5FD',
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  completedBox: {
    alignItems: 'center',
    gap: 12,
  },
  completedBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.35)',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  completedBadgeText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '700',
  },
  previewAudioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  previewAudioText: {
    color: '#E5E7EB',
    fontSize: 13,
    fontWeight: '600',
  },
  part2DoneActionsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 4,
  },
  prepActionRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  part3ActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  finalizingBox: {
    alignItems: 'center',
    paddingVertical: 18,
    textAlign: 'center',
  },
  finalizingHeading: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  finalizingSub: {
    color: '#C4B5FD',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  finalizingHint: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
  },
  errorBox: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  errorBoxText: {
    color: '#F87171',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
  },
  errorButtonRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
});

export default IeltsSpeakingScreen;
