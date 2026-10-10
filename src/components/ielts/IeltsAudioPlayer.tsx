import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  PanResponder,
  GestureResponderEvent,
} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useResponsive } from '@/theme/responsive';

interface IeltsAudioPlayerProps {
  positionMillis: number;
  durationMillis: number;
  isPlaying: boolean;
  isLoading?: boolean;
  audioError?: boolean;
  playbackRate?: number;
  onTogglePlay: () => void;
  onSeek: (positionMillis: number) => void;
  onSkip: (deltaSeconds: number) => void;
  onCyclePlaybackRate?: () => void;
  onReload?: () => void;
}

export function formatAudioTime(millis: number): string {
  if (!Number.isFinite(millis) || millis < 0) return '00:00';
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export const IeltsAudioPlayer: React.FC<IeltsAudioPlayerProps> = ({
  positionMillis,
  durationMillis,
  isPlaying,
  isLoading = false,
  audioError = false,
  playbackRate = 1,
  onTogglePlay,
  onSeek,
  onSkip,
  onCyclePlaybackRate,
  onReload,
}) => {
  const { s } = useResponsive();
  const trackLayoutRef = useRef<{ x: number; width: number }>({ x: 0, width: 1 });

  const progressRatio = durationMillis > 0 ? Math.min(1, Math.max(0, positionMillis / durationMillis)) : 0;
  const progressPercent = Math.round(progressRatio * 100);

  const handleTrackTouch = (event: GestureResponderEvent) => {
    const { locationX } = event.nativeEvent;
    const width = trackLayoutRef.current.width;
    if (width > 0 && durationMillis > 0) {
      const ratio = Math.max(0, Math.min(1, locationX / width));
      onSeek(ratio * durationMillis);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        handleTrackTouch(evt);
      },
      onPanResponderMove: (evt) => {
        handleTrackTouch(evt);
      },
      onPanResponderRelease: (evt) => {
        handleTrackTouch(evt);
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      {/* Scrubber + Time + Speed Row */}
      <View style={styles.scrubberRow}>
        <Text style={styles.timeText}>{formatAudioTime(positionMillis)}</Text>

        <View
          style={styles.trackContainer}
          onLayout={(e) => {
            trackLayoutRef.current = {
              x: e.nativeEvent.layout.x,
              width: e.nativeEvent.layout.width,
            };
          }}
          {...panResponder.panHandlers}
        >
          <View style={styles.trackBackground}>
            <View style={[styles.trackFill, { width: `${progressPercent}%` }]} />
          </View>
          <View
            style={[
              styles.thumb,
              { left: `${progressPercent}%` },
            ]}
          />
        </View>

        <Text style={styles.timeText}>{formatAudioTime(durationMillis)}</Text>

        {onCyclePlaybackRate && (
          <TouchableOpacity
            onPress={onCyclePlaybackRate}
            style={styles.speedButton}
            activeOpacity={0.7}
            accessibilityLabel={`Playback speed ${playbackRate}x`}
          >
            <Text style={styles.speedText}>{playbackRate}x</Text>
          </TouchableOpacity>
        )}
      </View>

      {audioError && onReload && (
        <TouchableOpacity onPress={onReload} style={styles.errorRow} activeOpacity={0.7}>
          <Feather name="refresh-cw" size={s(12)} color="#FBBF24" style={{ marginRight: 6 }} />
          <Text style={styles.errorText}>Audio couldn't load — tap to reload</Text>
        </TouchableOpacity>
      )}

      {/* Controls Row: Skip -10s, Play/Pause Circle, Skip +10s */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          onPress={() => onSkip(-10)}
          style={styles.skipButton}
          activeOpacity={0.7}
          accessibilityLabel="Skip back 10 seconds"
        >
          <Feather name="rotate-ccw" size={s(19)} color="#FFFFFF" />
          <Text style={styles.skipLabel}>-10s</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onTogglePlay}
          disabled={isLoading}
          style={styles.playButton}
          activeOpacity={0.85}
          accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#151726" />
          ) : (
            <Feather
              name={isPlaying ? 'pause' : 'play'}
              size={s(20)}
              color="#151726"
              style={!isPlaying ? { marginLeft: 2 } : undefined}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onSkip(10)}
          style={styles.skipButton}
          activeOpacity={0.7}
          accessibilityLabel="Skip forward 10 seconds"
        >
          <Feather name="rotate-cw" size={s(19)} color="#FFFFFF" />
          <Text style={styles.skipLabel}>+10s</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingTop: 6,
  },
  scrubberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  timeText: {
    width: 38,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  trackContainer: {
    flex: 1,
    height: 30,
    justifyContent: 'center',
    position: 'relative',
  },
  trackBackground: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    backgroundColor: '#7856FF',
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    marginLeft: -6,
    top: 9,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  speedButton: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  speedText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
    fontWeight: '700',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  errorText: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '600',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 36,
    paddingVertical: 4,
  },
  skipButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  skipLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
  playButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
});

export default IeltsAudioPlayer;
