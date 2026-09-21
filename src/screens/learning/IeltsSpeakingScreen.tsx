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
import { useNavigation, useRoute } from '@react-navigation/native';
import { Audio } from 'expo-av';
import ScreenBackground from '@/components/common/ScreenBackground';
import { useResponsive } from '@/theme/responsive';
import { ieltsService, IeltsSpeakingTest } from '@/services/ielts';

export const IeltsSpeakingScreen: React.FC = () => {
  const { s } = useResponsive();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<IeltsSpeakingTest | null>(null);
  const [currentPart, setCurrentPart] = useState<1 | 2 | 3>(1);

  // Part 2 Prep & Recording States
  const [prepSecondsLeft, setPrepSecondsLeft] = useState(60);
  const [isPrepping, setIsPrepping] = useState(false);
  const [speakingSecondsLeft, setSpeakingSecondsLeft] = useState(120);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [part2Completed, setPart2Completed] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const prepTimerRef = useRef<any>(null);
  const recordingTimerRef = useRef<any>(null);

  const [masterSessionId, setMasterSessionId] = useState<number | null>(null);

  // Handle route params when returning from Part 1/Part 3
  useEffect(() => {
    if (route.params?.initialPart) {
      setCurrentPart(route.params.initialPart as 1 | 2 | 3);
    }
  }, [route.params?.initialPart]);

  // Load Test Data & Initialize Master Session
  useEffect(() => {
    let isMounted = true;
    async function loadTest() {
      try {
        setLoading(true);
        const tests = await ieltsService.getSpeakingTests();
        if (tests.length > 0 && isMounted) {
          const selected = tests[0];
          setTest(selected);
          setPrepSecondsLeft(selected.part2_prep_seconds || 60);
          setSpeakingSecondsLeft(selected.part2_speaking_seconds || 120);

          // Start or resume master test session
          try {
            const sess = await ieltsService.startTestSession({
              testSetId: selected.test_set_id || selected.test_code || 'IELTS-S-01',
              speaking_test_id: selected.id,
              session_type: 'speaking',
            });
            if (sess && sess.id && isMounted) {
              setMasterSessionId(sess.id);
            }
          } catch (sessErr) {
            console.log('Session init fallback:', sessErr);
          }
        }
      } catch (e) {
        Alert.alert('Error', 'Failed to load IELTS Speaking test set.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadTest();
    return () => {
      isMounted = false;
      if (prepTimerRef.current) clearInterval(prepTimerRef.current);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
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
      Alert.alert('Preparation Time Up!', 'Please start your 2-minute monologue now.');
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
      Alert.alert('Time Up!', 'Part 2 monologue completed. Proceeding to Part 3.');
      setCurrentPart(3);
    }
    return () => {
      if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
    };
  }, [isRecording, speakingSecondsLeft]);

  const startPart1LiveCall = () => {
    navigation.navigate('PracticeScreen', {
      topicId: test?.test_code || 'IELTS-P1',
      topicName: `IELTS Speaking Part 1: ${test?.title || 'Everyday Topics'}`,
      ieltsMasterSessionId: masterSessionId,
      ieltsPart: 1,
      targetDurationSeconds: test?.part1_duration_seconds || 240,
      prompt: test?.part1_context_prompt || 'You are an official IELTS Speaking Examiner conducting Part 1.',
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

    navigation.navigate('PracticeScreen', {
      topicId: test?.test_code || 'IELTS-P3',
      topicName: `IELTS Speaking Part 3: ${test?.part3_theme || 'Two-Way Discussion'}`,
      ieltsMasterSessionId: masterSessionId,
      ieltsPart: 3,
      targetDurationSeconds: test?.part3_duration_seconds || 240,
      prompt: `${test?.part3_context_prompt || 'You are an official IELTS Speaking Examiner conducting Part 3.'}${contextBridging ? `\n\n${contextBridging}` : ''}`,
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
      recordingRef.current = recording;
      setIsRecording(true);
    } catch (err) {
      console.warn('Failed to start recording', err);
    }
  };

  const uploadPart2Audio = async (uri: string) => {
    if (!uri) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const { publicUrl } = await ieltsService.uploadAudioToR2(uri, 'audio/m4a', 'ielts-part2-audio');
      if (masterSessionId) {
        await ieltsService.savePart2Submission(masterSessionId, {
          audioUrl: publicUrl,
          summary: `Candidate Part 2 monologue on ${test?.part2_title || test?.part2_cue_card?.topic || 'cue card'}`,
        });
      }
      setPart2Completed(true);
    } catch (uploadErr) {
      console.warn('Direct Cloudflare R2 upload error:', uploadErr);
      setUploadError('Failed to upload recording to cloud storage.');
    } finally {
      setIsUploading(false);
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;
    try {
      setIsRecording(false);
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      setRecordingUri(uri);
      if (uri) {
        await uploadPart2Audio(uri);
      }
    } catch (err) {
      console.warn('Failed to stop recording', err);
    }
  };

  if (loading || !test) {
    return (
      <ScreenBackground>
        <SafeAreaView style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading IELTS Speaking Test...</Text>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="arrow-left" size={s(20)} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{test.title}</Text>
            <Text style={styles.headerSubtitle}>{test.test_set_id || test.test_code} • Full Speaking Test</Text>
          </View>
        </View>

        {/* Step Indicator */}
        <View style={styles.stepperContainer}>
          <TouchableOpacity
            onPress={() => setCurrentPart(1)}
            style={[styles.stepItem, currentPart === 1 && styles.stepItemActive]}
          >
            <Text style={[styles.stepNum, currentPart === 1 && styles.stepNumActive]}>1</Text>
            <Text style={[styles.stepLabel, currentPart === 1 && styles.stepLabelActive]}>Part 1</Text>
          </TouchableOpacity>

          <View style={styles.stepDivider} />

          <TouchableOpacity
            onPress={() => setCurrentPart(2)}
            style={[styles.stepItem, currentPart === 2 && styles.stepItemActive]}
          >
            <Text style={[styles.stepNum, currentPart === 2 && styles.stepNumActive]}>2</Text>
            <Text style={[styles.stepLabel, currentPart === 2 && styles.stepLabelActive]}>Cue Card</Text>
          </TouchableOpacity>

          <View style={styles.stepDivider} />

          <TouchableOpacity
            onPress={() => setCurrentPart(3)}
            style={[styles.stepItem, currentPart === 3 && styles.stepItemActive]}
          >
            <Text style={[styles.stepNum, currentPart === 3 && styles.stepNumActive]}>3</Text>
            <Text style={[styles.stepLabel, currentPart === 3 && styles.stepLabelActive]}>Discussion</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.contentScroll} contentContainerStyle={styles.contentBody}>
          {/* Part 1 Screen */}
          {currentPart === 1 && (
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
                {(test.part1_example_questions ?? test.part1_topics?.map((t) => t.theme) ?? []).map(
                  (q: string, idx: number) => (
                    <View key={idx} style={styles.bulletRow}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={styles.bulletText}>{q}</Text>
                    </View>
                  )
                )}
                {/* Theme label */}
                {!!test.part1_theme && (
                  <Text style={[styles.previewTitle, { marginTop: 8 }]}>Theme: {test.part1_theme}</Text>
                )}
              </View>

              <TouchableOpacity onPress={startPart1LiveCall} style={styles.actionButton}>
                <Feather name="phone-call" size={s(18)} color="#FFFFFF" style={{ marginRight: 8 }} />
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
                <Text style={styles.cueCardTopic}>
                  {test.part2_title || test.part2_cue_card?.topic || 'Cue Card Topic'}
                </Text>
                <Text style={styles.cueCardSubtitle}>You should say:</Text>
                {(test.part2_bullet_points ?? test.part2_cue_card?.bullets ?? []).map(
                  (b: string, idx: number) => (
                    <View key={idx} style={styles.cueBulletRow}>
                      <Text style={styles.cueBulletDot}>-</Text>
                      <Text style={styles.cueBulletText}>{b}</Text>
                    </View>
                  )
                )}
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
                    <Text style={styles.timerLabel}>Uploading to Cloudflare R2...</Text>
                  </View>
                ) : uploadError ? (
                  <View style={styles.timerDisplayBox}>
                    <Text style={[styles.timerLabel, { color: '#F87171' }]}>{uploadError}</Text>
                    <TouchableOpacity
                      onPress={() => recordingUri && uploadPart2Audio(recordingUri)}
                      style={[styles.prepButton, { marginTop: 8 }]}
                    >
                      <Feather name="refresh-cw" size={s(16)} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.actionButtonText}>Retry Cloud Upload</Text>
                    </TouchableOpacity>
                  </View>
                ) : part2Completed ? (
                  <View style={styles.timerDisplayBox}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Feather name="check-circle" size={s(16)} color="#10B981" style={{ marginRight: 6 }} />
                      <Text style={[styles.timerLabel, { color: '#10B981', fontWeight: 'bold' }]}>
                        Monologue Recorded & Uploaded
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setCurrentPart(3)}
                      style={[styles.actionButton, { marginTop: 6 }]}
                    >
                      <Text style={styles.actionButtonText}>Proceed to Part 3 Discussion →</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setPart2Completed(false);
                        setRecordingUri(null);
                        setSpeakingSecondsLeft(test?.part2_speaking_seconds || 120);
                        setPrepSecondsLeft(test?.part2_prep_seconds || 60);
                      }}
                      style={{ marginTop: 10 }}
                    >
                      <Text style={styles.skipPrepText}>Re-record Part 2</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.prepActionRow}>
                    <TouchableOpacity onPress={startPrep} style={styles.prepButton}>
                      <Feather name="clock" size={s(16)} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.actionButtonText}>Start 1-Min Prep</Text>
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
          {currentPart === 3 && (
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
                <Feather name="phone-call" size={s(18)} color="#FFFFFF" style={{ marginRight: 8 }} />
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
  stepItemActive: {},
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
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    borderRadius: 10,
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
    borderRadius: 12,
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
    gap: 12,
  },
  prepButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    borderRadius: 10,
  },
  skipPrepButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipPrepText: {
    color: '#FFFFFF',
    fontSize: 12,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    borderRadius: 10,
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
});
export default IeltsSpeakingScreen;
