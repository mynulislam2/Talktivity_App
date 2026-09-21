import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import Feather from '@expo/vector-icons/Feather';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenBackground from '@/components/common/ScreenBackground';
import { useResponsive } from '@/theme/responsive';
import {
  ieltsService,
  IeltsListeningTest,
  IeltsListeningPart,
  IeltsListeningQuestion,
} from '@/services/ielts';

export const IeltsListeningScreen: React.FC = () => {
  const { s } = useResponsive();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<IeltsListeningTest | null>(null);
  const [activePartIndex, setActivePartIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showAnswers, setShowAnswers] = useState(false);

  // Audio State
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(1);
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  // Load Test Data
  useEffect(() => {
    let isMounted = true;
    async function loadTest() {
      try {
        setLoading(true);
        const tests = await ieltsService.getListeningTests();
        if (tests.length > 0 && isMounted) {
          const selectedTest = tests[0];
          setTest(selectedTest);
        }
      } catch (err) {
        Alert.alert('Error', 'Failed to load IELTS Listening test.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadTest();
    return () => {
      isMounted = false;
    };
  }, []);

  const parts = test?.parts || [];
  const activePart = parts[activePartIndex] || parts[0];
  const activeAudioUrl = activePart?.audio_url || test?.audio_url;

  // Audio Setup & Cleanup synced per part
  useEffect(() => {
    let sound: Audio.Sound | null = null;
    let isCancelled = false;

    async function initAudio() {
      if (!activeAudioUrl) return;
      try {
        setIsAudioLoading(true);
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
          sound = newSound;
          soundRef.current = newSound;
        } else {
          newSound.unloadAsync();
        }
      } catch (e) {
        console.warn('Audio load error:', e);
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
  }, [activeAudioUrl]);

  const switchPart = async (index: number) => {
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

  const seekToQuestion = async (timestampSecs?: number) => {
    if (typeof timestampSecs !== 'number' || !soundRef.current) return;
    try {
      await soundRef.current.setPositionAsync(timestampSecs * 1000);
      if (!isPlaying) {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      }
    } catch (e) {
      console.warn('Seek to question error:', e);
    }
  };

  // Real-time synchronization: identify question currently discussed in audio
  const currentActiveQuestionNumber = React.useMemo(() => {
    if (!activePart?.questions) return null;
    const currentSecs = positionMillis / 1000;
    const qsWithTime = activePart.questions
      .filter((q) => typeof q.timestamp_seconds === 'number' && (q.timestamp_seconds as number) <= currentSecs)
      .sort((a, b) => ((b.timestamp_seconds || 0) as number) - ((a.timestamp_seconds || 0) as number));
    return qsWithTime.length > 0 ? qsWithTime[0].question_number : null;
  }, [activePart, positionMillis]);

  const handleAnswerChange = (questionNumber: number, answer: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionNumber]: answer,
    }));
  };

  const calculateScore = () => {
    if (!test?.parts) return { score: 0, total: 0, band: 0 };
    let correct = 0;
    let total = 0;

    test.parts.forEach((part) => {
      part.questions.forEach((q) => {
        total += 1;
        const userAns = (userAnswers[q.question_number] || '').trim().toLowerCase();
        const correctAns = (q.correct_answer || '').trim().toLowerCase();
        if (userAns && userAns === correctAns) {
          correct += 1;
        }
      });
    });

    // Approximate IELTS Listening Band conversion for 40 questions
    let band = 4.0;
    if (correct >= 39) band = 9.0;
    else if (correct >= 37) band = 8.5;
    else if (correct >= 35) band = 8.0;
    else if (correct >= 32) band = 7.5;
    else if (correct >= 30) band = 7.0;
    else if (correct >= 26) band = 6.5;
    else if (correct >= 23) band = 6.0;
    else if (correct >= 18) band = 5.5;
    else if (correct >= 16) band = 5.0;
    else if (correct >= 13) band = 4.5;

    return { score: correct, total, band };
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const stringAnswers: Record<string, string> = {};
      Object.entries(userAnswers).forEach(([k, v]) => {
        stringAnswers[String(k)] = v;
      });

      const result = await ieltsService.submitListeningTest({
        testSetId: test?.test_code || 'IELTS-L-01',
        answers: stringAnswers,
      });

      setShowAnswers(true);
      Alert.alert(
        'Test Completed & Saved!',
        `Official Score: ${result.score} / ${result.totalQuestions}\nOfficial IELTS Listening Band: ${result.band.toFixed(1)}\n\nYour profile and daily progress have been updated!`,
        [
          { text: 'Review Answers', style: 'default' },
          { text: 'Back to Home', onPress: () => navigation.goBack() },
        ]
      );
    } catch (e: any) {
      // Fallback to local calculation if offline or network error
      const { score, total, band } = calculateScore();
      setShowAnswers(true);
      Alert.alert(
        'Test Completed!',
        `You scored ${score} out of ${total}.\nEstimated IELTS Band: ${band.toFixed(1)}`,
        [
          { text: 'Review Answers', style: 'default' },
          { text: 'Done', onPress: () => navigation.goBack() },
        ]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading || !test) {
    return (
      <ScreenBackground>
        <SafeAreaView style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading IELTS Listening Test...</Text>
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
            <Text style={styles.headerTitle}>{test.title || 'IELTS Listening Test'}</Text>
            <Text style={styles.headerSubtitle}>{test.test_code} • Cambridge Format</Text>
          </View>
          <TouchableOpacity onPress={handleSubmit} style={styles.submitHeaderButton}>
            <Text style={styles.submitHeaderText}>Submit</Text>
          </TouchableOpacity>
        </View>

        {/* Part Switcher Tabs */}
        <View style={styles.partTabsContainer}>
          {parts.map((p, index) => (
            <TouchableOpacity
              key={p.part_number || index}
              onPress={() => switchPart(index)}
              style={[
                styles.partTab,
                activePartIndex === index && styles.partTabActive,
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

        {/* Part Questions Content */}
        <ScrollView style={styles.contentScroll} contentContainerStyle={styles.contentBody}>
          {activePart && (
            <>
              <View style={styles.instructionsCard}>
                <Text style={styles.partTitle}>{activePart.title}</Text>
                <Text style={styles.partInstructions}>{activePart.instructions}</Text>
              </View>

              {activePart.questions?.map((q: IeltsListeningQuestion) => {
                const isCorrect = (userAnswers[q.question_number] || '').trim().toLowerCase() === (q.correct_answer || '').trim().toLowerCase();
                const isQuestionActive = currentActiveQuestionNumber === q.question_number;
                return (
                  <View
                    key={q.question_number}
                    style={[
                      styles.questionCard,
                      isQuestionActive && styles.questionCardActive,
                    ]}
                  >
                    <View style={styles.questionHeader}>
                      <View style={styles.qNumRow}>
                        <View style={[styles.qNumBadge, isQuestionActive && styles.qNumBadgeActive]}>
                          <Text style={styles.qNumText}>{q.question_number}</Text>
                        </View>
                        <Text style={styles.questionText}>{q.question_text}</Text>
                      </View>

                      <View style={styles.qMetaRow}>
                        {q.timestamp_seconds !== undefined && (
                          <TouchableOpacity
                            onPress={() => seekToQuestion(q.timestamp_seconds)}
                            style={styles.timestampButton}
                          >
                            <Feather name="volume-2" size={s(12)} color="#A78BFA" />
                            <Text style={styles.timestampText}>{formatTime(q.timestamp_seconds * 1000)}</Text>
                          </TouchableOpacity>
                        )}
                        {isQuestionActive && (
                          <View style={styles.nowPlayingBadge}>
                            <Text style={styles.nowPlayingText}>Now in Audio</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Multiple Choice Render */}
                    {q.type === 'multiple_choice' && q.options && (
                      <View style={styles.optionsList}>
                        {q.options.map((option, oIdx) => {
                          const isSelected = userAnswers[q.question_number] === option;
                          const isThisCorrect = (q.correct_answer || '').trim() === option;
                          let optionStyle: any = styles.optionItem;
                          if (isSelected) optionStyle = [styles.optionItem, styles.optionItemSelected];
                          if (showAnswers) {
                            if (isThisCorrect) optionStyle = [styles.optionItem, styles.optionItemCorrect];
                            else if (isSelected && !isThisCorrect) optionStyle = [styles.optionItem, styles.optionItemWrong];
                          }

                          return (
                            <TouchableOpacity
                              key={oIdx}
                              onPress={() => handleAnswerChange(q.question_number, option)}
                              style={optionStyle}
                            >
                              <Text
                                style={[
                                  styles.optionText,
                                  isSelected && styles.optionTextSelected,
                                  showAnswers && isThisCorrect && styles.optionTextCorrect,
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
                          placeholder="Type your answer here..."
                          placeholderTextColor="#777"
                          style={[
                            styles.fillBlankInput,
                            showAnswers && (isCorrect ? styles.fillBlankCorrect : styles.fillBlankWrong),
                          ]}
                          autoCapitalize="none"
                        />
                        {showAnswers && (
                          <Text style={styles.correctAnswerHint}>
                            Correct: {q.correct_answer}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
            </>
          )}
          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Persistent Bottom Audio Player */}
        <View style={styles.bottomPlayer}>
          <View style={styles.playerInfoRow}>
            <Text style={styles.playerPartTitle}>Part {activePart.part_number} Audio</Text>
            {currentActiveQuestionNumber && (
              <View style={styles.playerActiveQBadge}>
                <Text style={styles.playerActiveQText}>Playing Q#{currentActiveQuestionNumber}</Text>
              </View>
            )}
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
  questionCardActive: {
    borderColor: 'rgba(139, 92, 246, 0.8)',
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderWidth: 1.5,
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
  qNumBadgeActive: {
    backgroundColor: '#A78BFA',
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
  qMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timestampButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timestampText: {
    color: '#C4B5FD',
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  nowPlayingBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  nowPlayingText: {
    color: '#DDD6FE',
    fontSize: 9,
    fontWeight: '700',
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
  playerActiveQBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  playerActiveQText: {
    color: '#EDE9FE',
    fontSize: 10,
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
});
export default IeltsListeningScreen;
