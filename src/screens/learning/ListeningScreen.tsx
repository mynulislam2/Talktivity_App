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
  Dimensions,
  Animated,
  PanResponder,
  LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { courseService } from '@/services/course';
import { progressService } from '@/services/progress';
import { AppBackground } from '../../components/common/AppBackground';

const WAVE_BARS = [12, 18, 28, 20, 34, 42, 30, 22, 36, 18, 12];
const COACH_IMG = require('../../../assets/figma/coach/alina-intro.png');
const LISTENING_TOPIC_KEY = 'listeningTopic';

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
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
    2,
    '0'
  )}`;
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
  if (
    withoutSuffix &&
    withoutSuffix.toLowerCase() !== trimmedTitle.toLowerCase()
  ) {
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
          <Ionicons name="chevron-back" size={18} color="rgba(255,255,255,0.8)" />
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
    width: 36,
    height: 36,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: { flex: 1 },
  title: {
    fontSize: 18,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
    color: '#fff',
    textAlign: 'center',
  },
});

function ListeningHeroOrb({ isSpeaking }: { isSpeaking: boolean }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isSpeaking) {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.04,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      anim.start();
      return () => anim.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isSpeaking, pulseAnim]);

  return (
    <Animated.View style={[lho.orb, { transform: [{ scale: pulseAnim }] }]}>
      <Image source={COACH_IMG} style={lho.image} resizeMode="contain" />
    </Animated.View>
  );
}

const lho = StyleSheet.create({
  orb: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: { width: '100%', height: '100%' },
});

function SeekBar({
  currentTime,
  duration,
  onSeek,
}: {
  currentTime: number;
  duration: number;
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
      <Text style={sb.time}>{formatAudioTime(currentTime)}</Text>
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
      <Text style={sb.time}>{formatAudioTime(duration)}</Text>
    </View>
  );
}

const sb = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    width: '100%',
  },
  time: {
    width: 31,
    fontSize: 12,
    lineHeight: 17,
    color: '#fff',
    textAlign: 'left',
    fontVariant: ['tabular-nums'],
  } as any,
  track: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.82)',
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
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#8c6dff',
    marginLeft: -8,
    shadowColor: 'rgba(140,109,255,0.85)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 8,
    elevation: 4,
  },
});

function WaveformBars({ isPlaying }: { isPlaying: boolean }) {
  const animValues = useRef(WAVE_BARS.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    if (isPlaying) {
      const anims = animValues.map((anim, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1.4,
              duration: 400 + i * 90,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.6,
              duration: 400 + i * 90,
              useNativeDriver: true,
            }),
          ])
        )
      );
      Animated.parallel(anims).start();
      return () => {
        animValues.forEach((a) => a.setValue(1));
      };
    } else {
      animValues.forEach((a) => a.setValue(1));
    }
  }, [isPlaying, animValues]);

  return (
    <View style={wf.container}>
      {WAVE_BARS.map((height, index) => {
        const h = Math.max(8, Math.round(height * 0.7));
        return (
          <Animated.View
            key={index}
            style={[
              wf.bar,
              {
                height,
                width: index === 5 ? 4 : 3,
                transform: [{ scaleY: animValues[index] }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const wf = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 38,
  },
  bar: {
    borderRadius: 3,
    backgroundColor: 'transparent',
  },
});

export default function ListeningScreen() {
  const navigation = useNavigation();
  const soundRef = useRef<Audio.Sound | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const activeLineRef = useRef<View>(null);
  const prevActiveLineIdRef = useRef<string | null>(null);

  const [currentTopic, setCurrentTopic] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [audioError, setAudioError] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [playbackCompleted, setPlaybackCompleted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        const stored = await AsyncStorage.getItem(LISTENING_TOPIC_KEY);
        let topic: any = null;
        if (stored) {
          try {
            topic = JSON.parse(stored);
          } catch {}
        }
        if (!topic?.audio) {
          try {
            const courseStatus = await courseService.getCourseStatus();
            topic = courseStatus?.course?.todayListeningTopic || topic;
          } catch {}
        }
        if (topic && !cancelled) {
          await AsyncStorage.setItem(
            LISTENING_TOPIC_KEY,
            JSON.stringify(topic)
          );
          setCurrentTopic(topic);
          if (topic.audio) {
            await setupAudio(resolveAudioUrl(topic.audio));
          } else {
            setAudioError(true);
          }
        }
      } catch {
        if (!cancelled) setAudioError(true);
      }
    };
    init();
    return () => {
      cancelled = true;
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const setupAudio = async (url: string) => {
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
          }
        }
      );
      soundRef.current = sound;
    } catch {
      setAudioError(true);
    }
  };

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
    if (!lineChanged || !activeTranscriptId) return;
    setTimeout(() => {
      activeLineRef.current?.measureInWindow((_x, y) => {
        scrollRef.current?.scrollTo({
          y: Math.max(0, y - 200),
          animated: isPlaying,
        });
      });
    }, 50);
  }, [activeTranscriptId, isPlaying]);

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

  const handleContinue = useCallback(async () => {
    if (!currentTopic || isCompleting) return;
    setIsCompleting(true);
    try {
      await progressService.updateDailyProgress({ listening_completed: true });
      (navigation as any).navigate('ListeningQuizScreen');
    } catch {
      setIsCompleting(false);
    }
  }, [currentTopic, isCompleting, navigation]);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const progressRatio = duration > 0 ? Math.min(1, currentTime / duration) : 0;
  const canContinue = playbackCompleted || audioError;

  if (!currentTopic) {
    return (
      <AppBackground>
        <SafeAreaView style={s.safe} edges={['top']}>
          <View style={s.padded}>
            <ListeningHeader title="Listening" onBack={goBack} />
          </View>
        </SafeAreaView>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={[s.padded, s.topSection]}>
          <ListeningHeader
            title={currentTopic.title || 'Listening'}
            onBack={goBack}
          />
          <View style={s.heroWrap}>
            <ListeningHeroOrb isSpeaking={isPlaying} />
          </View>
          <Text style={s.quote}>&ldquo;{quoteLabel}&rdquo;</Text>
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
                ? '#fff'
                : isPastLine
                ? '#c6c6c6'
                : '#8c8e9c';
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
              <Text style={[s.transcriptText, { color: '#c6c6c6' }]}>
                {audioError
                  ? 'Transcript unavailable.'
                  : hasStarted
                  ? 'Listening in progress...'
                  : 'Press play to begin the listening passage.'}
              </Text>
            </View>
          )}
        </ScrollView>

        <LinearGradient
          colors={[
            'rgba(13,14,25,0)',
            'rgba(13,14,25,0.72)',
            'rgba(13,14,25,0.96)',
          ]}
          locations={[0, 0.28, 1]}
          style={s.playerGradient}
          pointerEvents="box-none"
        >
          <View style={s.playerCard}>
            <WaveformBars isPlaying={isPlaying} />

            <View style={s.controls}>
              <TouchableOpacity
                onPress={() => handleSkip(-10)}
                style={s.controlBtn}
              >
                <Ionicons name="play-skip-back" size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleTogglePlayback}
                style={s.playBtn}
              >
                <Ionicons
                  name={isPlaying ? 'pause-circle' : 'play-circle'}
                  size={30}
                  color="#fff"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleSkip(10)}
                style={s.controlBtn}
              >
                <Ionicons name="play-skip-forward" size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            <SeekBar
              currentTime={currentTime}
              duration={duration}
              onSeek={handleSeek}
            />

            <View style={s.bottomRow}>
              <TouchableOpacity onPress={handleCyclePlaybackRate}>
                <Text style={s.rateText}>
                  {playbackRate
                    .toFixed(playbackRate % 1 === 0 ? 0 : 2)
                    .replace(/\.00$/, '')}
                  x
                </Text>
              </TouchableOpacity>
              <Ionicons
                name="time-outline"
                size={18}
                color="rgba(255,255,255,0.9)"
              />
            </View>

            {audioError && !canContinue ? (
              <View style={s.errorBanner}>
                <Ionicons name="alert-circle" size={16} color="#ffd1d9" />
                <Text style={s.errorBannerText}>
                  Audio could not be loaded. You can continue with the
                  transcript.
                </Text>
              </View>
            ) : null}

            {canContinue ? (
              <TouchableOpacity
                onPress={handleContinue}
                disabled={isCompleting}
                style={s.continueBtn}
              >
                <LinearGradient
                  colors={['#2949ff', '#2949ff']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={s.continueGradient}
                >
                  <Text style={s.continueText}>
                    {isCompleting ? 'Saving progress...' : 'Continue to Quiz'}
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <Text style={s.lockedText}>
                Finish the listening to unlock the quiz.
              </Text>
            )}
          </View>
        </LinearGradient>
      </SafeAreaView>
    </AppBackground>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  padded: { paddingHorizontal: 20 },
  topSection: { paddingTop: 6, flexShrink: 0 },
  heroWrap: { marginTop: 12, alignItems: 'center' },
  quote: {
    marginTop: 8,
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 22,
    textAlign: 'center',
    color: '#fff',
  },
  transcriptScroll: {
    flex: 1,
    marginTop: 16,
    paddingHorizontal: 20,
    minHeight: 0,
  },
  transcriptContent: { paddingBottom: 24 },
  transcriptLine: { marginBottom: 16 },
  transcriptText: {
    fontSize: 17,
    lineHeight: 26,
    paddingHorizontal: 0,
    borderRadius: 12,
  },
  noTranscript: { minHeight: 120, paddingTop: 4 },
  playerGradient: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
  },
  playerCard: {
    borderRadius: 12,
    backgroundColor: 'rgba(16,19,38,0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 42,
  },
  controlBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rateText: { fontSize: 12, lineHeight: 17, color: '#fff' },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#7c4254',
    backgroundColor: 'rgba(46,22,32,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: '#ffd1d9',
    textAlign: 'center',
  },
  continueBtn: { width: '100%', borderRadius: 6, overflow: 'hidden' },
  continueGradient: {
    flexDirection: 'row',
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  continueText: { color: '#fff', fontSize: 16, fontWeight: '500', fontFamily: 'Poppins-Medium' },
  lockedText: {
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
});
