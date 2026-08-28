import { useEffect } from 'react';
import { Platform } from 'react-native';
import { AudioSession, AndroidAudioTypePresets } from '@livekit/react-native';

/**
 * Custom hook to configure LiveKit AudioSession for loudspeaker output.
 * Forces WebRTC call audio (AI voice) to route through the phone's main loudspeaker
 * rather than defaulting to the earpiece call speaker.
 */
export function useLoudspeakerAudioSession(active: boolean = true) {
  useEffect(() => {
    if (!active || Platform.OS === 'web') return;

    let isMounted = true;

    const configureAndStartSession = async () => {
      try {
        await AudioSession.startAudioSession();
        if (isMounted) {
          await AudioSession.configureAudio({
            android: {
              preferredOutputList: ['speaker', 'headset', 'bluetooth', 'earpiece'],
              audioTypeOptions: AndroidAudioTypePresets.communication,
            },
            ios: {
              defaultOutput: 'speaker',
            },
          });
        }
      } catch (err) {
        console.warn('⚠️ [AudioSession] Failed to configure loudspeaker audio session:', err);
      }
    };

    configureAndStartSession();

    return () => {
      isMounted = false;
      AudioSession.stopAudioSession().catch(() => {});
    };
  }, [active]);
}
