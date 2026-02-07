/**
 * useSoundEffect Hook
 *
 * Manages audio playback for UI sound effects throughout the app
 * Uses expo-audio for React Native audio support (fallback to no-op when unavailable)
 */

import { useCallback, useRef } from 'react';

// Gracefully handle missing expo-audio - will be non-functional but won't break the build
let Audio: any = null;
try {
  // Attempt to import expo-audio at runtime
  // This will fail gracefully if the package is not available
  require('expo-audio');
} catch (err) {
  // expo-audio not available, creating mock
  Audio = {
    Sound: class {
      async load() {}
      async play() {}
      async stop() {}
      async unload() {}
      async setVolumeAsync() {}
    },
  };
}

export enum SoundEffect {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  CLICK = 'click',
  NOTIFICATION = 'notification',
  LEVEL_UP = 'level-up',
  SESSION_END = 'session-end',
}

interface UseSoundEffectReturn {
  playSound: (effect: SoundEffect) => Promise<void>;
  stopSound: () => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  isMuted: boolean;
  toggleMute: () => void;
}

/**
 * Hook for playing sound effects
 * Handles audio setup, loading, and playback
 */
export const useSoundEffect = (): UseSoundEffectReturn => {
  const soundRef = useRef<Audio.Sound | null>(null);
  const isMutedRef = useRef(false);

  // Map sound effects to audio files (requires assets/sounds folder)
  const soundFileMap: Record<SoundEffect, any> = {
    [SoundEffect.SUCCESS]: require('../assets/sounds/success.wav'),
    [SoundEffect.ERROR]: require('../assets/sounds/error.wav'),
    [SoundEffect.WARNING]: require('../assets/sounds/warning.wav'),
    [SoundEffect.CLICK]: require('../assets/sounds/click.wav'),
    [SoundEffect.NOTIFICATION]: require('../assets/sounds/notification.wav'),
    [SoundEffect.LEVEL_UP]: require('../assets/sounds/level-up.wav'),
    [SoundEffect.SESSION_END]: require('../assets/sounds/session-end.wav'),
  };

  /**
   * Initialize audio session
   */
  const initializeAudio = useCallback(async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.warn('Failed to initialize audio:', error);
    }
  }, []);

  /**
   * Play a specific sound effect
   */
  const playSound = useCallback(
    async (effect: SoundEffect) => {
      try {
        if (isMutedRef.current) {
          return;
        }

        // Initialize audio if not already done
        await initializeAudio();

        // Stop any currently playing sound
        if (soundRef.current) {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
        }

        // Load and play the sound
        const soundFile = soundFileMap[effect];
        if (!soundFile) {
          console.warn(`Sound effect not found: ${effect}`);
          return;
        }

        const { sound } = await Audio.Sound.createAsync(soundFile);
        soundRef.current = sound;

        await sound.playAsync();

        // Auto-unload after playback completes
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync().catch(console.warn);
          }
        });
      } catch (error) {
        console.error(`Failed to play sound effect ${effect}:`, error);
      }
    },
    [soundFileMap, initializeAudio],
  );

  /**
   * Stop currently playing sound
   */
  const stopSound = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    } catch (error) {
      console.error('Failed to stop sound:', error);
    }
  }, []);

  /**
   * Set playback volume (0.0 to 1.0)
   */
  const setVolume = useCallback(async (volume: number) => {
    try {
      if (soundRef.current) {
        const clampedVolume = Math.max(0, Math.min(1, volume));
        await soundRef.current.setVolumeAsync(clampedVolume);
      }
    } catch (error) {
      console.error('Failed to set volume:', error);
    }
  }, []);

  /**
   * Toggle mute on/off
   */
  const toggleMute = useCallback(() => {
    isMutedRef.current = !isMutedRef.current;
  }, []);

  return {
    playSound,
    stopSound,
    setVolume,
    isMuted: isMutedRef.current,
    toggleMute,
  };
};

export default useSoundEffect;