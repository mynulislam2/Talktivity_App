import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

import { reviewService } from '@/services/review';
import { tokens } from '@/theme/tokens';

/**
 * Plays back the moment in the practice recording where the learner made this
 * mistake, so they hear themselves before practising the correction.
 *
 * Renders nothing unless the card carries offsets and a room. Timings exist
 * only when the agent captured them and the card matched an utterance
 * confidently — anything less and there is no button, because a control that
 * jumps to the wrong moment is worse than none.
 */
export interface MistakePlaybackProps {
  audioStart?: number;
  audioEnd?: number;
  audioRoom?: string;
  /** Suppressed while the coach talks or the mic is live, so nothing overlaps. */
  disabled?: boolean;
}

// Signed URLs are per-room and short-lived; a review session walks several
// cards from the same recording, so fetch once and reuse.
const urlCache = new Map<string, { url: string; fetchedAt: number }>();
const URL_TTL_MS = 4 * 60 * 1000; // server signs for 5 minutes

async function getRecordingUrl(room: string): Promise<string | null> {
  const cached = urlCache.get(room);
  if (cached && Date.now() - cached.fetchedAt < URL_TTL_MS) return cached.url;

  const url = await reviewService.recordingUrl(room);
  if (url) urlCache.set(room, { url, fetchedAt: Date.now() });
  return url;
}

export function MistakePlayback({
  audioStart,
  audioEnd,
  audioRoom,
  disabled = false,
}: MistakePlaybackProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'playing' | 'unavailable'>('idle');
  const soundRef = useRef<Audio.Sound | null>(null);

  const unload = useCallback(async () => {
    const sound = soundRef.current;
    soundRef.current = null;
    if (sound) {
      try {
        await sound.stopAsync();
      } catch {
        // already stopped
      }
      try {
        await sound.unloadAsync();
      } catch {
        // already unloaded
      }
    }
  }, []);

  // Leaving the card, or the screen, must not leave audio playing.
  useEffect(() => {
    return () => {
      void unload();
    };
  }, [unload]);

  const hasClip =
    typeof audioStart === 'number' &&
    typeof audioEnd === 'number' &&
    audioEnd > audioStart &&
    Boolean(audioRoom);

  const onPress = useCallback(async () => {
    if (!hasClip || state === 'loading') return;
    if (state === 'playing') {
      await unload();
      setState('idle');
      return;
    }

    setState('loading');
    try {
      const url = await getRecordingUrl(audioRoom as string);
      if (!url) {
        setState('unavailable');
        return;
      }

      const startMs = Math.round((audioStart as number) * 1000);
      const endMs = Math.round((audioEnd as number) * 1000);

      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true, positionMillis: startMs },
        (status: any) => {
          if (!status?.isLoaded) return;
          // Stop at the end of this utterance rather than playing on into the
          // rest of the conversation.
          if (status.positionMillis >= endMs || status.didJustFinish) {
            void unload();
            setState('idle');
          }
        }
      );
      soundRef.current = sound;
      setState('playing');
    } catch (err: any) {
      console.warn('[MistakePlayback] could not play recording:', err?.message);
      setState('unavailable');
    }
  }, [hasClip, state, audioRoom, audioStart, audioEnd, unload]);

  if (!hasClip || state === 'unavailable') return null;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || state === 'loading'}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={
        state === 'playing' ? 'Stop playback' : 'Hear how you said it during your conversation'
      }
      style={[styles.button, (disabled || state === 'loading') && styles.disabled]}
    >
      {state === 'loading' ? (
        <ActivityIndicator size="small" color="rgba(255,255,255,0.8)" />
      ) : (
        <Ionicons
          name={state === 'playing' ? 'stop' : 'volume-medium-outline'}
          size={14}
          color="rgba(255,255,255,0.8)"
        />
      )}
      <Text style={styles.label}>{state === 'playing' ? 'Stop' : 'Hear how you said it'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  disabled: { opacity: 0.4 },
  label: {
    fontSize: 12,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.8)',
  },
});

export default MistakePlayback;
