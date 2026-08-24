import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system';
import { playCoachAudioFile, stopCoachAudio } from '@/services/CoachAudio';
import { Ionicons } from '@expo/vector-icons';
import { reviewService } from '@/services/review';
import { progressService } from '@/services/progress';
import type { ReviewItem, ValidationResult } from '@/types/review';
import { validateAnswer } from '@/utils/validation';
import { FigmaPrimaryButton } from '@/components/ui/FigmaPrimaryButton';
import { AppBackground } from '../../components/common/AppBackground';
import GradientButton from '../../components/common/GradientButton';
import { tokens } from '@/theme/tokens';
let ExpoSpeechRecognitionModule: any = null;
let useSpeechRecognitionEvent: any = () => {};
try {
  const speechModule = require('expo-speech-recognition');
  ExpoSpeechRecognitionModule = speechModule.ExpoSpeechRecognitionModule;
  useSpeechRecognitionEvent = speechModule.useSpeechRecognitionEvent;
} catch {
  console.warn('[ReviewScreen] expo-speech-recognition not available');
}

const COACH_AVATAR = 'https://i.ibb.co.com/rGMrg0j3/Teacher.png';
const COACH_IMG = require('../../../assets/figma/coach/alina-intro.png');
const PARTY_POPPER = require('../../../assets/figma/listening/party-popper.png');
const TYPING_SPEED_MS = 50;

/**
 * Play coach audio — matches frontend `playCoachAudio` strategy:
 *
 * 1. Write MP3 base64 to a temp file and play via Android MediaPlayer
 *    (same native decoder used by web `<audio>` on Android).
 * 2. Resolve on completion (or word-count safety timeout).
 * 3. If server audio fails, fall back to device TTS via expo-speech.
 */
async function playBase64Audio(
  audioBase64: string,
  fallbackText?: string
): Promise<void> {
  const TAG = '[ReviewScreen]';

  // —— try server audio ——
  if (audioBase64) {
    try {
      const fileUri = `${FileSystem.cacheDirectory}coach_${Date.now()}.mp3`;
      await FileSystem.writeAsStringAsync(fileUri, audioBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await playCoachAudioFile(fileUri);
      return;
    } catch (err) {
      console.warn(TAG, 'server audio failed:', (err as any)?.message);
    }
  }

  // —— fallback: device TTS ——
  if (fallbackText) {
    return new Promise<void>((resolve) => {
      Speech.speak(fallbackText, {
        language: 'en',
        rate: 0.8,
        pitch: 1.0,
        onDone: () => resolve(),
        onError: () => resolve(),
        onStopped: () => resolve(),
      });
    });
  }
}

function ReviewTopBar({
  onBack,
  title,
  subtitle,
}: {
  onBack: () => void;
  title?: string;
  subtitle?: string;
}) {
  return (
    <View style={rtb.container}>
      <View style={rtb.inner}>
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          style={rtb.backBtn}
        >
          <Ionicons name="chevron-back" size={18} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
        <View style={rtb.headerSpacer} />
        {title || subtitle ? (
          <View style={rtb.titleGroup}>
            {title ? (
              <Text
                style={[rtb.title, subtitle ? rtb.titleWithSub : rtb.titleSolo]}
              >
                {title}
              </Text>
            ) : null}
            {subtitle ? <Text style={rtb.subtitle}>{subtitle}</Text> : null}
          </View>
        ) : null}
        <View style={rtb.headerSpacer} />
      </View>
    </View>
  );
}

const rtb = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 12,
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
  titleGroup: { alignItems: 'center' },
  title: {
    fontSize: 18,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
    color: '#fff',
    textAlign: 'center',
  },
  titleWithSub: { fontSize: 20, lineHeight: 24 },
  titleSolo: { fontSize: 16, letterSpacing: 3.2 },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Poppins',
    lineHeight: 17,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
});

function ReportLoadingCard({
  headline = 'Preparing Your Review',
  totalDurationMs = 40000,
}: {
  headline?: string;
  totalDurationMs?: number;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const tasks = useMemo(
    () => [
      {
        icon: 'chatbubbles-outline' as const,
        label: 'Fetching your latest conversation',
      },
      {
        icon: 'document-text-outline' as const,
        label: 'Identifying grammar mistakes',
      },
      {
        icon: 'book-outline' as const,
        label: 'Spotting vocabulary improvements',
      },
      {
        icon: 'create-outline' as const,
        label: 'Finding sentence improvements',
      },
      { icon: 'layers-outline' as const, label: 'Building your review cards' },
    ],
    []
  );

  useEffect(() => {
    const totalDuration = Math.max(1000, totalDurationMs);
    const stepDuration = totalDuration / tasks.length;
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
        if (prev >= tasks.length - 1) {
          clearInterval(stepTimer);
          return tasks.length - 1;
        }
        return prev + 1;
      });
    }, stepDuration);
    return () => {
      clearInterval(progressTimer);
      clearInterval(stepTimer);
    };
  }, [totalDurationMs, tasks.length]);

  const percent = Math.round(progress);

  return (
    <View style={rlc.container}>
      <View style={rlc.progressRow}>
        <Text style={rlc.progressLabel}>Progress</Text>
        <Text style={rlc.progressValue}>{percent}%</Text>
      </View>
      <View style={rlc.track}>
        <LinearGradient
          colors={['#2a14ff', '#6a4bff', '#c55dfe']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[rlc.fill, { width: `${percent}%` } as any]}
        />
      </View>
      <Text style={rlc.eyebrow}>ANALYSIS</Text>
      <Text style={rlc.headline}>{headline}</Text>
      <View style={rlc.taskList}>
        {tasks.map((task, idx) => {
          const done = idx < currentStep;
          const active = idx === currentStep;
          return (
            <View
              key={idx}
              style={[
                rlc.taskItem,
                active ? rlc.taskItemActive : rlc.taskItemInactive,
              ]}
            >
              <View style={rlc.taskIconWrap}>
                <Ionicons name={task.icon} size={16} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    rlc.taskLabel,
                    done || active
                      ? rlc.taskLabelActive
                      : rlc.taskLabelInactive,
                  ]}
                >
                  {task.label}
                </Text>
                {active ? (
                  <Text style={rlc.taskProcessing}>Processing...</Text>
                ) : null}
              </View>
              {done ? (
                <View style={rlc.taskCheck}>
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

const rlc = StyleSheet.create({
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
  progressLabel: { fontSize: 12, fontFamily: 'Poppins', lineHeight: 17, color: '#c6c6c6' },
  progressValue: { fontSize: 12, fontFamily: 'Poppins', lineHeight: 17, color: '#fff' },
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
    fontFamily: 'Poppins',
    letterSpacing: 2.88,
    textAlign: 'center',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.42)',
  },
  headline: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    lineHeight: 28,
    textAlign: 'center',
    color: '#fff',
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
  taskItemInactive: { backgroundColor: 'rgba(255,255,255,0.03)' },
  taskIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(79,93,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskLabel: { fontSize: 14, fontWeight: '500', fontFamily: 'Poppins-Medium', lineHeight: 19 },
  taskLabelActive: { color: '#fff' },
  taskLabelInactive: { color: 'rgba(255,255,255,0.7)' },
  taskProcessing: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
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

function CoachMessageBubble({
  message,
  isStreaming,
  isOnline = true,
}: {
  message: string;
  isStreaming: boolean;
  isOnline?: boolean;
}) {
  const [displayed, setDisplayed] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const idxRef = useRef(0);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (!message) {
      setDisplayed('');
      idxRef.current = 0;
      return;
    }
    if (!isStreaming) {
      setDisplayed(message);
      idxRef.current = message.length;
      return;
    }
    idxRef.current = 0;
    setDisplayed('');
    timerRef.current = setInterval(() => {
      idxRef.current += 1;
      if (idxRef.current >= message.length) {
        setDisplayed(message);
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        setDisplayed(message.slice(0, idxRef.current));
      }
    }, TYPING_SPEED_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [message, isStreaming]);

  const isTyping = isStreaming && displayed.length < message.length;

  return (
    <View style={cmb.container}>
      <View style={cmb.identityRow}>
        <View style={cmb.avatarWrap}>
          <Image source={{ uri: COACH_AVATAR }} style={cmb.avatar} />
          {isOnline && <View style={cmb.onlineDot} />}
        </View>
        <View>
          <Text style={cmb.coachName}>AI Coach Alina</Text>
          {isOnline && <Text style={cmb.onlineLabel}>ONLINE</Text>}
        </View>
      </View>
      <Text style={cmb.messageText}>
        {displayed}
        {isTyping && <Text style={cmb.cursor}>|</Text>}
      </Text>
    </View>
  );
}

const cmb = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 6,
    borderRadius: 16,
    backgroundColor: '#1e1f3a',
    borderWidth: 1,
    borderColor: 'rgba(100,116,139,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  identityRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatarWrap: { position: 'relative', marginRight: 10 },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  onlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#1e1f3a',
  },
  coachName: { color: '#fff', fontWeight: '600', fontFamily: 'Poppins-SemiBold', fontSize: 13 },
  onlineLabel: {
    color: '#4ade80',
    fontSize: 9,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    letterSpacing: 0.8,
  },
  messageText: { color: '#fff', fontSize: 14, fontFamily: 'Poppins', lineHeight: 21 },
  cursor: { color: '#fff', fontSize: 14, fontFamily: 'Poppins' },
});

function ReviewCardComponent({
  item,
  currentIndex,
  totalCards,
  onTapToSay,
  onClearTranscript,
  isListening,
  transcript,
  isValidating,
  isThinking,
  isCoachSpeaking,
  coachMessage,
}: {
  item: ReviewItem;
  currentIndex: number;
  totalCards: number;
  onTapToSay: () => void;
  onClearTranscript: () => void;
  isListening: boolean;
  transcript: string;
  isValidating: boolean;
  isThinking: boolean;
  isCoachSpeaking: boolean;
  coachMessage: string;
}) {
  const actionLabel = isValidating
    ? 'Checking...'
    : isCoachSpeaking
    ? 'Coach is speaking...'
    : isListening
    ? 'Tap to Stop'
    : 'Tap to Say It';

  return (
    <View style={rcc.outer}>
      <View style={rcc.coachImageWrap}>
        <Image source={COACH_IMG} style={rcc.coachImage} resizeMode="contain" />
      </View>
      <View style={rcc.coachBubble}>
        <Text style={rcc.coachBubbleText}>
          {isThinking
            ? 'Thinking...'
            : coachMessage ||
              `Hey! We found ${totalCards} mistakes from your last conversation. Let's practice them together to improve your English. I'll show you each one.`}
        </Text>
      </View>
      <View style={rcc.progressRow}>
        <Text style={rcc.progressLabel}>Practice {currentIndex + 1}</Text>
        <Text style={rcc.progressLabel}>{totalCards} total cards</Text>
      </View>
      <View style={rcc.cardWrap}>
        <View style={rcc.originalSection}>
          <View style={rcc.iconRed}>
            <Ionicons name="close" size={18} color={tokens.color.state.danger} />
          </View>
          <Text style={rcc.originalText}>{'“'}{item.original}{'”'}</Text>
        </View>
        <View style={rcc.correctedSection}>
          <View style={rcc.iconGreen}>
            <Ionicons name="checkmark" size={18} color={tokens.color.state.success} />
          </View>
          <Text style={rcc.correctedText}>{'“'}{item.corrected}{'”'}</Text>
        </View>
      </View>
      <View style={rcc.explanationSection}>
        <View style={rcc.iconYellow}>
          <Ionicons name="bulb-outline" size={16} color="#facc15" />
        </View>
        <Text style={rcc.explanationText}>{item.explanation}</Text>
      </View>
      {isListening || transcript || isValidating ? (
        <View style={rcc.transcriptBox}>
          <View style={rcc.transcriptHeader}>
            <Text style={rcc.transcriptLabel}>Your attempt</Text>
            {transcript && !isValidating ? (
              <TouchableOpacity
                onPress={onClearTranscript}
                style={rcc.clearBtn}
              >
                <Ionicons
                  name="trash-outline"
                  size={16}
                  color="rgba(255,255,255,0.7)"
                />
              </TouchableOpacity>
            ) : null}
          </View>
          {transcript ? (
            <Text style={rcc.transcriptText}>{'“'}{transcript}{'”'}</Text>
          ) : isListening ? (
            <Text style={rcc.transcriptPlaceholder}>Listening...</Text>
          ) : isValidating ? (
            <Text style={rcc.transcriptPlaceholder}>Checking...</Text>
          ) : null}
        </View>
      ) : null}
      <View style={rcc.bottomBtn}>
        <FigmaPrimaryButton
          onPress={onTapToSay}
          disabled={isValidating || isCoachSpeaking}
          style={{ height: 50, borderRadius: 10, width: '100%' }}
        >
          <Ionicons
            name="mic-outline"
            size={20}
            color="#fff"
            style={{ marginRight: 4 }}
          />
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '500', fontFamily: 'Poppins-Medium' }}>
            {actionLabel}
          </Text>
        </FigmaPrimaryButton>
      </View>
    </View>
  );
}

const rcc = StyleSheet.create({
  outer: { paddingHorizontal: 20, paddingTop: 20 },
  coachImageWrap: {
    // Only the bottom corners are rounded — matches web (`rounded-b-[6px]`).
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    backgroundColor: 'rgba(47,65,145,0.1)',
    overflow: 'hidden',
    height: 180,
  },
  coachImage: { width: '100%', height: '100%' },
  coachBubble: {
    marginTop: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    backgroundColor: 'rgba(16,16,16,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  coachBubbleText: { fontSize: 12, fontFamily: 'Poppins', lineHeight: 17, color: '#fdfdfd' },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 20,
  },
  progressLabel: {
    fontSize: 12,
    fontFamily: 'Poppins',
    letterSpacing: 1.44,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.55)',
  },
  cardWrap: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  originalSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 10,
    paddingVertical: 20,
    backgroundColor: 'rgba(255,35,35,0.04)',
    borderBottomWidth: 1,
    borderBottomColor: '#253034',
  },
  iconRed: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: tokens.color.state.danger,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  originalText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
    lineHeight: 25,
    color: '#fdfdfd',
  },
  correctedSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 10,
    paddingVertical: 20,
    backgroundColor: 'rgba(7,229,0,0.04)',
  },
  iconGreen: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: tokens.color.state.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  correctedText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
    lineHeight: 25,
    color: '#fdfdfd',
  },
  explanationSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  iconYellow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,234,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  explanationText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins',
    lineHeight: 20,
    color: '#c6c6c6',
  },
  transcriptBox: {
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  transcriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  transcriptLabel: {
    fontSize: 11,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
    letterSpacing: 1.54,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.6)',
  },
  clearBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  transcriptText: {
    fontSize: 14,
    fontFamily: 'Poppins',
    lineHeight: 20,
    color: 'rgba(255,255,255,0.9)',
  },
  transcriptPlaceholder: {
    fontSize: 14,
    fontFamily: 'Poppins',
    lineHeight: 20,
    color: 'rgba(255,255,255,0.35)',
    fontStyle: 'italic',
  },
  bottomBtn: {
    marginTop: 16,
    marginBottom: 32,
  },
});

function ReviewCompletionScreen({
  reviewItems,
  onGoHome,
}: {
  reviewItems: ReviewItem[];
  onGoHome: () => void;
}) {
  const total = reviewItems.length;
  const grammarCount = reviewItems.filter((i) => i.type === 'grammar').length;
  const vocabCount = reviewItems.filter((i) => i.type === 'vocabulary').length;
  const sentenceCount = reviewItems.filter((i) => i.type === 'sentence').length;

  return (
    <View style={cs.container}>
      <View style={cs.content}>
        <Image source={PARTY_POPPER} style={cs.popper} resizeMode="contain" />
        <Text style={cs.title}>Congratulations!</Text>
        <Text style={cs.subtitle}>You've reviewed all {total} mistakes!</Text>
        <View style={cs.scoreWrap}>
          <Text style={cs.scoreText}>
            {total}/{total}
          </Text>
          <Text style={cs.scoreLabel}>Completed</Text>
        </View>
        <View style={cs.pillRow}>
          {grammarCount > 0 ? (
            <View style={[cs.pill, cs.pillBlue]}>
              <View style={[cs.pillDot, cs.pillDotBlue]} />
              <Text style={[cs.pillText, cs.pillTextBlue]}>
                Grammar · {grammarCount}
              </Text>
            </View>
          ) : null}
          {vocabCount > 0 ? (
            <View style={[cs.pill, cs.pillPurple]}>
              <View style={[cs.pillDot, cs.pillDotPurple]} />
              <Text style={[cs.pillText, cs.pillTextPurple]}>
                Vocabulary · {vocabCount}
              </Text>
            </View>
          ) : null}
          {sentenceCount > 0 ? (
            <View style={[cs.pill, cs.pillGreen]}>
              <View style={[cs.pillDot, cs.pillDotGreen]} />
              <Text style={[cs.pillText, cs.pillTextGreen]}>
                Sentence · {sentenceCount}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
      <View style={cs.continueWrap}>
        <FigmaPrimaryButton
          onPress={onGoHome}
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
    fontWeight: '500', fontFamily: 'Poppins-Medium',
    lineHeight: 36,
    letterSpacing: -0.72,
    color: '#fff',
  },
  subtitle: {
    marginTop: 16,
    fontSize: 14,
    fontFamily: 'Poppins',
    lineHeight: 20,
    color: '#fff',
  },
  scoreWrap: { alignItems: 'center', marginTop: 64 },
  scoreText: {
    fontSize: 40,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    lineHeight: 48,
    letterSpacing: -0.8,
    color: '#fff',
  },
  scoreLabel: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
    lineHeight: 20,
    color: '#c6c6c6',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillDot: { width: 8, height: 8, borderRadius: 4 },
  pillText: { fontSize: 12, fontWeight: '600', fontFamily: 'Poppins-SemiBold' },
  pillBlue: {
    borderColor: 'rgba(59,130,246,0.3)',
    backgroundColor: 'rgba(59,130,246,0.2)',
  },
  pillDotBlue: { backgroundColor: '#60a5fa' },
  pillTextBlue: { color: '#93c5fd' },
  pillPurple: {
    borderColor: 'rgba(168,85,247,0.3)',
    backgroundColor: 'rgba(168,85,247,0.2)',
  },
  pillDotPurple: { backgroundColor: '#c084fc' },
  pillTextPurple: { color: '#d8b4fe' },
  pillGreen: {
    borderColor: 'rgba(34,197,94,0.3)',
    backgroundColor: 'rgba(34,197,94,0.2)',
  },
  pillDotGreen: { backgroundColor: '#4ade80' },
  pillTextGreen: { color: '#86efac' },
  continueWrap: { marginTop: 28 },
});

export const ReviewScreen: React.FC = () => {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [coachMessage, setCoachMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [greetReady, setGreetReady] = useState(false);
  const [reviewComplete, setReviewComplete] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isCoachSpeaking, setIsCoachSpeaking] = useState(false);

  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const speechSupported = !!ExpoSpeechRecognitionModule;

  const [userActivated, setUserActivated] = useState(false);
  const lastValidatedRef = useRef('');
  const pendingGreetRef = useRef<{ text: string; audioBase64: string } | null>(
    null
  );

  const currentReviewItem = reviewItems[currentCardIndex];

  // `useSpeechRecognitionEvent` is always a function — either the real hook
  // from `expo-speech-recognition` or the no-op fallback declared above —
  // so these must be called unconditionally (React Hooks cannot be gated
  // behind a runtime check without corrupting hook order across renders).
  useSpeechRecognitionEvent('start', () => setListening(true));
  useSpeechRecognitionEvent('end', () => setListening(false));
  useSpeechRecognitionEvent('result', (event: any) => {
    if (event.results && event.results.length > 0) {
      setTranscript(event.results[0].transcript || '');
    }
  });
  useSpeechRecognitionEvent('error', () => setListening(false));

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await reviewService.fetchReviewItems();
        if (!response.success || response.reviewItems.length === 0) {
          throw new Error(response.error || 'Failed to generate review items');
        }
        if (cancelled) return;
        setReviewItems(response.reviewItems);
        try {
          const greetResult = await reviewService.greet(response.reviewItems);
          if (!cancelled) {
            pendingGreetRef.current = {
              text: greetResult.text,
              audioBase64: greetResult.audioBase64,
            };
            setGreetReady(true);
          }
        } catch {
          if (!cancelled) {
            pendingGreetRef.current = {
              text: "Hey there! Let's review your recent mistakes together. Ready? Let's go!",
              audioBase64: '',
            };
            setGreetReady(true);
          }
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Failed to load review items');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const streamMessage = useCallback((text: string) => {
    setIsStreaming(true);
    setCoachMessage(text);
    const dur = text.length * TYPING_SPEED_MS + 300;
    setTimeout(() => setIsStreaming(false), dur);
  }, []);

  const handleStartSession = useCallback(async () => {
    setSessionStarted(true);
    const greet = pendingGreetRef.current;
    if (greet) {
      setIsCoachSpeaking(true);
      streamMessage(greet.text);
      try {
        await playBase64Audio(greet.audioBase64, greet.text);
      } finally {
        setIsCoachSpeaking(false);
      }
    }
  }, [streamMessage]);

  const startListening = useCallback(async () => {
    if (!ExpoSpeechRecognitionModule) return;
    setTranscript('');
    try {
      const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!perm.granted) return;
      ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
      });
    } catch (e) {
      console.error('[ReviewScreen] startListening error:', e);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!ExpoSpeechRecognitionModule) return;
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch {}
  }, []);

  const resetTranscript = useCallback(() => setTranscript(''), []);

  const validate = useCallback(
    (userAnswer: string): ValidationResult => {
      if (!currentReviewItem)
        return { isValid: false, similarity: 0, feedback: 'No review item.' };
      return validateAnswer(userAnswer, currentReviewItem);
    },
    [currentReviewItem]
  );

  const callCoachFeedback = useCallback(
    async (result: ValidationResult, cardIndex: number, totalCards: number) => {
      setCoachMessage('');
      setIsThinking(true);
      try {
        const res = await reviewService.feedback({
          userAnswer: result.userAnswer || '',
          corrected: result.corrected || '',
          original: result.original || '',
          isValid: result.isValid,
          cardIndex,
          totalCards,
        });
        const text = res.text || result.feedback || '';
        setIsThinking(false);
        streamMessage(text);
        setIsCoachSpeaking(true);
        try {
          await playBase64Audio(res.audioBase64, res.text || text);
        } finally {
          setIsCoachSpeaking(false);
        }
        return text;
      } catch {
        const fallback =
          result.feedback ||
          'Try again. Focus on matching the corrected version.';
        setIsThinking(false);
        streamMessage(fallback);
        return fallback;
      }
    },
    [streamMessage]
  );

  const handleValidation = useCallback(
    async (result: ValidationResult) => {
      try {
        setIsValidating(true);
        stopListening();
        await callCoachFeedback(result, currentCardIndex, reviewItems.length);
        if (result.isValid) {
          if (currentCardIndex < reviewItems.length - 1) {
            setTimeout(() => {
              setCurrentCardIndex((p) => p + 1);
              resetTranscript();
              lastValidatedRef.current = '';
              setUserActivated(false);
              setIsValidating(false);
            }, 1500);
          } else {
            resetTranscript();
            setIsValidating(false);
            try {
              await progressService.updateDailyProgress({
                speaking_quiz_completed: true,
                speaking_quiz_score: 100,
              });
            } catch {}
            setTimeout(() => setReviewComplete(true), 2000);
          }
        } else {
          resetTranscript();
          lastValidatedRef.current = '';
          setIsValidating(false);
        }
      } catch {
        resetTranscript();
        setIsValidating(false);
      }
    },
    [
      currentCardIndex,
      reviewItems.length,
      stopListening,
      resetTranscript,
      callCoachFeedback,
    ]
  );

  useEffect(() => {
    if (
      userActivated &&
      !listening &&
      transcript.trim().length > 0 &&
      !isValidating &&
      currentReviewItem &&
      transcript !== lastValidatedRef.current
    ) {
      const timer = setTimeout(() => {
        lastValidatedRef.current = transcript;
        const result = validate(transcript);
        (result as any).userAnswer = transcript;
        (result as any).corrected = currentReviewItem.corrected;
        (result as any).original = currentReviewItem.original;
        handleValidation(result);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [
    userActivated,
    listening,
    transcript,
    isValidating,
    currentReviewItem,
    validate,
    handleValidation,
  ]);

  const handleTapToSay = useCallback(() => {
    if (!speechSupported) return;
    if (!currentReviewItem) return;
    if (listening) {
      stopListening();
      return;
    }
    setUserActivated(true);
    startListening();
  }, [
    speechSupported,
    currentReviewItem,
    listening,
    stopListening,
    startListening,
  ]);

  const handleClearTranscript = useCallback(() => {
    stopListening();
    resetTranscript();
    lastValidatedRef.current = '';
  }, [stopListening, resetTranscript]);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const getReviewTypeLabel = (type: ReviewItem['type']) => {
    switch (type) {
      case 'grammar':
        return 'Grammar';
      case 'vocabulary':
        return 'Vocabulary';
      default:
        return 'Sentence';
    }
  };

  if (loading) {
    return (
      <AppBackground>
        <SafeAreaView style={ss.safe} edges={['top']}>
          <ReviewTopBar onBack={goBack} title="ANALYSIS" />
          <ReportLoadingCard
            headline="Preparing Your Review"
            totalDurationMs={40000}
          />
        </SafeAreaView>
      </AppBackground>
    );
  }

  if (error) {
    return (
      <AppBackground>
        <SafeAreaView style={ss.safe} edges={['top']}>
          <ReviewTopBar onBack={goBack} />
          <View style={ss.centerContent}>
            <View style={ss.errorCard}>
              <Text style={ss.errorTitle}>Error</Text>
              <Text style={ss.errorMsg}>{error}</Text>
              <GradientButton
                onPress={goBack}
                label="Go Back"
                gradientColors={['#2563eb', '#9333ea']}
                size="medium"
                fullWidth={false}
                textStyle={{ fontWeight: '500', fontFamily: 'Poppins-Medium' }}
              />
            </View>
          </View>
        </SafeAreaView>
      </AppBackground>
    );
  }

  if (reviewItems.length === 0) {
    return (
      <AppBackground>
        <SafeAreaView style={ss.safe} edges={['top']}>
          <ReviewTopBar onBack={goBack} />
          <View style={ss.centerContent}>
            <View style={ss.emptyCard}>
              <Text style={ss.emptyTitle}>No Review Items</Text>
              <Text style={ss.emptyMsg}>
                Please complete some speaking sessions first.
              </Text>
              <GradientButton
                onPress={goBack}
                label="Go Back"
                gradientColors={['#2563eb', '#9333ea']}
                size="medium"
                fullWidth={false}
                textStyle={{ fontWeight: '500', fontFamily: 'Poppins-Medium' }}
              />
            </View>
          </View>
        </SafeAreaView>
      </AppBackground>
    );
  }

  if (!sessionStarted) {
    return (
      <AppBackground>
        <SafeAreaView style={ss.safe} edges={['top']}>
          <ReviewTopBar onBack={goBack} />
          <ScrollView
            contentContainerStyle={ss.startScroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={ss.startInner}>
              <Text style={ss.startTitle}>Mistake Review Time!</Text>
              <Text style={ss.startSubtitle}>
                I've identified {reviewItems.length} key areas for improvement.
                {'\n'}
                Let's polish your skills together.
              </Text>
              <View style={ss.previewList}>
                {reviewItems.map((item, index) => (
                  <View key={item.cardId} style={ss.previewCard}>
                    <View style={ss.previewNumber}>
                      <Text style={ss.previewNumberText}>
                        {String(index + 1).padStart(2, '0')}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={ss.previewRow}>
                        <Ionicons
                          name="alert-circle"
                          size={17}
                          color={tokens.color.state.danger}
                          style={{ marginRight: 4 }}
                        />
                        <Text style={ss.previewOriginal} numberOfLines={1}>
                          {item.original}
                        </Text>
                      </View>
                      <View style={[ss.previewRow, { marginTop: 8 }]}>
                        <Ionicons
                          name="checkmark-circle"
                          size={17}
                          color={tokens.color.state.success}
                          style={{ marginRight: 4 }}
                        />
                        <Text style={ss.previewCorrected} numberOfLines={1}>
                          {item.corrected}
                        </Text>
                      </View>
                    </View>
                    <View style={ss.previewBadge}>
                      <Text style={ss.previewBadgeText}>
                        {getReviewTypeLabel(item.type)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
          <View style={ss.startFooter}>
            <View style={ss.startBtnWrap}>
              <FigmaPrimaryButton
                onPress={handleStartSession}
                disabled={!greetReady}
                style={{ height: 42, borderRadius: 6 }}
              >
                <Ionicons
                  name="play"
                  size={16}
                  color="#fff"
                  style={{ marginRight: 4 }}
                />
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500', fontFamily: 'Poppins-Medium' }}>
                  {greetReady ? 'Start Review' : 'Preparing...'}
                </Text>
              </FigmaPrimaryButton>
            </View>
          </View>
        </SafeAreaView>
      </AppBackground>
    );
  }

  if (reviewComplete) {
    return (
      <AppBackground>
        <SafeAreaView style={ss.safe} edges={['top']}>
          <ReviewTopBar onBack={goBack} />
          <ReviewCompletionScreen reviewItems={reviewItems} onGoHome={goBack} />
        </SafeAreaView>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <SafeAreaView style={ss.safe} edges={['top']}>
        <ReviewTopBar
          onBack={goBack}
          title="Mistake Review Time!"
          subtitle="Practice with your AI Coach"
        />
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {currentReviewItem && (
            <ReviewCardComponent
              item={currentReviewItem}
              currentIndex={currentCardIndex}
              totalCards={reviewItems.length}
              onTapToSay={handleTapToSay}
              onClearTranscript={handleClearTranscript}
              isListening={userActivated && listening}
              transcript={userActivated ? transcript : ''}
              isValidating={isValidating}
              isThinking={isThinking || (!coachMessage && isCoachSpeaking)}
              isCoachSpeaking={isCoachSpeaking}
              coachMessage={
                userActivated && listening ? 'Listening...' : coachMessage
              }
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
};
const ss = StyleSheet.create({
  safe: { flex: 1 },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  errorCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(251,113,133,0.2)',
    backgroundColor: 'rgba(245,66,90,0.1)',
    padding: 24,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700', fontFamily: 'Poppins-Bold',
    color: '#fda4af',
    marginBottom: 8,
  },
  errorMsg: {
    fontSize: 14,
    fontFamily: 'Poppins',
    color: 'rgba(255,241,242,0.9)',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700', fontFamily: 'Poppins-Bold',
    color: '#fff',
    marginBottom: 8,
  },
  emptyMsg: {
    fontSize: 14,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    marginBottom: 20,
  },
  startScroll: { paddingTop: 24, paddingBottom: 100 },
  startInner: { maxWidth: 353, alignSelf: 'center' },
  startTitle: {
    fontSize: 28,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
    lineHeight: 34,
    textAlign: 'center',
    color: '#fff',
    letterSpacing: 0.14,
  },
  startSubtitle: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: 'Poppins',
    lineHeight: 17,
    textAlign: 'center',
    color: '#c6c6c6',
  },
  previewList: { marginTop: 32, gap: 16 },
  previewCard: {
    position: 'relative',
    flexDirection: 'row',
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3d3e50',
    backgroundColor: 'rgba(255,255,255,0.10)',
    padding: 16,
  },
  previewNumber: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#636370',
    backgroundColor: '#484960',
    paddingHorizontal: 7,
    paddingVertical: 6,
  },
  previewNumberText: { fontSize: 12, fontFamily: 'Poppins', lineHeight: 17, color: '#fff' },
  previewRow: { flexDirection: 'row', alignItems: 'center' },
  previewOriginal: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Poppins',
    lineHeight: 17,
    color: '#ffacac',
    textDecorationLine: 'line-through',
  },
  previewCorrected: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Poppins',
    lineHeight: 17,
    color: '#fdfdfd',
  },
  previewBadge: {
    position: 'absolute',
    right: 16,
    top: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#636370',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  previewBadgeText: { fontSize: 8, fontFamily: 'Poppins', lineHeight: 11, color: '#fdfdfd' },
  startFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 28,
  },
  startBtnWrap: {
    width: 280,
  },
});
